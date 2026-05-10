import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";
import { db, pool } from "@/db/client";
import type { MetricKey, Review, Teacher } from "@/lib/types";
import {
  applyStatsToTeacher,
  createPublicReview,
  resetTeachersRuntimeData,
  type TeacherStats,
} from "@/lib/teacher-model";

type TeacherReviewRow = {
  id: string;
  teacher_id: string;
  user_id: string | null;
  author_name: string | null;
  anonymous_number: string | number | null;
  knowledge: string | null;
  communication: string | null;
  leniency: string | null;
  fairness: string | null;
  vibe: string | null;
  overall: string | null;
  comment: string;
  liked: string;
  difficult: string;
  exam_process: string;
  advice: string;
  anonymous: boolean;
  created_at: Date | string;
  like_count: string | number | null;
  liked_by_me: boolean | null;
};

type TeacherStatsRow = {
  teacher_id: string;
  review_count: string | number;
  comment_count: string | number;
  knowledge: string | null;
  communication: string | null;
  leniency: string | null;
  fairness: string | null;
  vibe: string | null;
  overall: string | null;
};

export type ReviewSortKey = "newest" | "highest" | "lowest";

type ReviewPage = {
  reviews: Review[];
  total: number;
};

let initialized = false;
let initializationPromise: Promise<void> | null = null;
const TEACHER_STATS_CACHE_MS = 10_000;
let teacherStatsCache:
  | {
      expiresAt: number;
      promise: Promise<Map<string, TeacherStats>>;
    }
  | null = null;

export async function ensureTeacherRuntimeTables() {
  if (initialized) return;

  initializationPromise ??= initializeTeacherRuntimeTables().catch((error) => {
    initializationPromise = null;
    throw error;
  });

  await initializationPromise;
}

async function initializeTeacherRuntimeTables() {
  if (initialized) return;

  await db.execute(sql`
    create table if not exists teacher_reviews (
      id text primary key,
      teacher_id text not null,
      user_id text references "user"(id) on delete cascade,
      author_name text,
      knowledge numeric(3, 1),
      communication numeric(3, 1),
      leniency numeric(3, 1),
      fairness numeric(3, 1),
      vibe numeric(3, 1),
      overall numeric(3, 1),
      comment text not null default '',
      liked text not null default '',
      difficult text not null default '',
      exam_process text not null default '',
      advice text not null default '',
      anonymous boolean not null default false,
      anonymous_number integer,
      status text not null default 'approved',
      created_at timestamp not null default now()
    )
  `);
  await db.execute(sql`
    alter table teacher_reviews
      add column if not exists anonymous_number integer
  `);
  await db.execute(sql`
    alter table teacher_reviews
      add column if not exists comment text not null default ''
  `);
  await ensureTeacherReviewScoreConstraints();
  await db.execute(sql`
    create index if not exists teacher_reviews_teacher_id_idx
      on teacher_reviews (teacher_id)
  `);
  await db.execute(sql`
    create index if not exists teacher_reviews_teacher_status_created_idx
      on teacher_reviews (teacher_id, status, created_at desc)
  `);
  await db.execute(sql`
    create index if not exists teacher_reviews_status_teacher_idx
      on teacher_reviews (status, teacher_id)
  `);
  await db.execute(sql`
    create index if not exists teacher_reviews_user_id_idx
      on teacher_reviews (user_id)
  `);
  await db.execute(sql`
    create index if not exists teacher_reviews_user_teacher_status_idx
      on teacher_reviews (user_id, teacher_id, status)
      where user_id is not null
  `);
  await db.execute(sql`
    create index if not exists teacher_reviews_anonymous_number_idx
      on teacher_reviews (teacher_id, anonymous_number)
      where user_id is null and anonymous = true
  `);
  const uniqueIndexResult = await db.execute(sql`
    select to_regclass('public.teacher_reviews_user_teacher_idx') as index_name
  `);
  const [{ index_name: uniqueIndexName } = { index_name: null }] =
    uniqueIndexResult.rows as { index_name: string | null }[];

  if (!uniqueIndexName) {
    await db.execute(sql`
      delete from teacher_reviews older
      using teacher_reviews newer
      where older.user_id is not null
        and newer.user_id is not null
        and older.user_id = newer.user_id
        and older.teacher_id = newer.teacher_id
        and (
          older.created_at < newer.created_at
          or (older.created_at = newer.created_at and older.id < newer.id)
        )
    `);
  }
  await db.execute(sql`
    create unique index if not exists teacher_reviews_user_teacher_idx
      on teacher_reviews (user_id, teacher_id)
      where user_id is not null
  `);
  await db.execute(sql`
    create table if not exists teacher_favorites (
      user_id text not null references "user"(id) on delete cascade,
      teacher_id text not null,
      created_at timestamp not null default now(),
      primary key (user_id, teacher_id)
    )
  `);
  await db.execute(sql`
    create table if not exists teacher_review_likes (
      review_id text not null references teacher_reviews(id) on delete cascade,
      user_id text not null references "user"(id) on delete cascade,
      created_at timestamp not null default now(),
      primary key (review_id, user_id)
    )
  `);
  await db.execute(sql`
    create index if not exists teacher_review_likes_review_id_idx
      on teacher_review_likes (review_id)
  `);
  await db.execute(sql`
    create index if not exists teacher_review_likes_user_id_idx
      on teacher_review_likes (user_id)
  `);

  initialized = true;
}

async function ensureTeacherReviewScoreConstraints() {
  const scoreColumns = [
    "knowledge",
    "communication",
    "leniency",
    "fairness",
    "vibe",
    "overall",
  ] as const;

  for (const column of scoreColumns) {
    await db.execute(sql.raw(`
      do $$
      begin
        if not exists (
          select 1
          from pg_constraint
          where conname = 'teacher_reviews_${column}_range_check'
        ) then
          alter table teacher_reviews
            add constraint teacher_reviews_${column}_range_check
            check (${column} is null or (${column} >= 1 and ${column} <= 5));
        end if;
      end
      $$;
    `));
  }
}

export async function getTeachersWithStats(
  baseTeachers: Teacher[],
  userId?: string,
) {
  await ensureTeacherRuntimeTables();

  const stats = await getTeacherStats();
  const favoriteIds = userId ? await getFavoriteTeacherIds(userId) : new Set<string>();

  return resetTeachersRuntimeData(baseTeachers).map((teacher) =>
    applyStatsToTeacher(teacher, stats.get(teacher.id), favoriteIds.has(teacher.id)),
  );
}

export async function getTeacherStats() {
  const now = Date.now();

  if (teacherStatsCache && teacherStatsCache.expiresAt > now) {
    return teacherStatsCache.promise;
  }

  const nextPromise = readTeacherStats().catch((error) => {
    if (teacherStatsCache?.promise === nextPromise) {
      teacherStatsCache = null;
    }
    throw error;
  });
  teacherStatsCache = {
    expiresAt: now + TEACHER_STATS_CACHE_MS,
    promise: nextPromise,
  };

  return nextPromise;
}

async function readTeacherStats() {
  await ensureTeacherRuntimeTables();

  const result = await db.execute(sql`
    select
      teacher_id,
      count(*) filter (
        where knowledge is not null
          or communication is not null
          or leniency is not null
          or fairness is not null
          or vibe is not null
          or overall is not null
      ) as review_count,
      count(*) filter (
        where length(trim(comment || liked || difficult || exam_process || advice)) > 0
      ) as comment_count,
      avg(knowledge) as knowledge,
      avg(communication) as communication,
      avg(leniency) as leniency,
      avg(fairness) as fairness,
      avg(vibe) as vibe,
      avg(overall) as overall
    from teacher_reviews
    where status = 'approved'
    group by teacher_id
  `);
  const rows = result.rows as TeacherStatsRow[];

  return new Map(
    rows.map((row) => [
      row.teacher_id,
      {
        teacherId: row.teacher_id,
        reviewCount: Number(row.review_count),
        commentCount: Number(row.comment_count),
        scores: {
          knowledge: parseScore(row.knowledge),
          communication: parseScore(row.communication),
          leniency: parseScore(row.leniency),
          fairness: parseScore(row.fairness),
          vibe: parseScore(row.vibe),
          overall: parseScore(row.overall),
        },
      } satisfies TeacherStats,
    ]),
  );
}

export async function getPublicReviews(
  teacherId: string,
  userId?: string,
  options: {
    limit?: number;
    offset?: number;
    sort?: ReviewSortKey;
  } = {},
) {
  const page = await getPublicReviewsPage({
    teacherId,
    userId,
    limit: options.limit ?? 50,
    offset: options.offset ?? 0,
    sort: options.sort ?? "newest",
  });

  return page.reviews;
}

export async function getPublicReviewsPage(input: {
  teacherId: string;
  userId?: string;
  limit: number;
  offset: number;
  sort: ReviewSortKey;
}): Promise<ReviewPage> {
  await ensureTeacherRuntimeTables();

  const limit = Math.min(50, Math.max(1, input.limit));
  const offset = Math.max(0, input.offset);
  const [result, countResult] = await Promise.all([
    getPublicReviewsPageRows(input.teacherId, input.userId, limit, offset, input.sort),
    db.execute(sql`
      select count(*) as total
      from teacher_reviews
      where teacher_id = ${input.teacherId}
        and status = 'approved'
        and length(trim(comment || liked || difficult || exam_process || advice)) > 0
    `),
  ]);
  const [countRow] = countResult.rows as { total: string | number }[];

  return {
    reviews: (result.rows as TeacherReviewRow[])
      .map((row) => rowToPublicReview(row, row.user_id === input.userId))
      .filter((review) => review.body.length > 0),
    total: Number(countRow?.total ?? 0),
  };
}

function getPublicReviewsPageRows(
  teacherId: string,
  userId: string | undefined,
  limit: number,
  offset: number,
  sort: ReviewSortKey,
) {
  if (sort === "highest") {
    return db.execute(sql`
      select
        review.*,
        coalesce(likes.like_count, 0) as like_count,
        case
          when ${userId ?? null}::text is null then false
          else exists (
            select 1
            from teacher_review_likes own_like
            where own_like.review_id = review.id
              and own_like.user_id = ${userId ?? null}
          )
        end as liked_by_me
      from teacher_reviews review
      left join lateral (
        select count(*) as like_count
        from teacher_review_likes review_like
        where review_like.review_id = review.id
      ) likes on true
      where review.teacher_id = ${teacherId}
        and review.status = 'approved'
        and length(trim(review.comment || review.liked || review.difficult || review.exam_process || review.advice)) > 0
      order by
        case when (
          review.knowledge is not null
          or review.communication is not null
          or review.leniency is not null
          or review.fairness is not null
          or review.vibe is not null
          or review.overall is not null
        ) then 0 else 1 end,
        (
          coalesce(review.knowledge, 0)
          + coalesce(review.communication, 0)
          + coalesce(review.leniency, 0)
          + coalesce(review.fairness, 0)
          + coalesce(review.vibe, 0)
          + coalesce(review.overall, 0)
        ) / nullif(
          (case when review.knowledge is not null then 1 else 0 end)
          + (case when review.communication is not null then 1 else 0 end)
          + (case when review.leniency is not null then 1 else 0 end)
          + (case when review.fairness is not null then 1 else 0 end)
          + (case when review.vibe is not null then 1 else 0 end)
          + (case when review.overall is not null then 1 else 0 end),
          0
        ) desc nulls last,
        review.created_at desc
      limit ${limit}
      offset ${offset}
    `);
  }

  if (sort === "lowest") {
    return db.execute(sql`
      select
        review.*,
        coalesce(likes.like_count, 0) as like_count,
        case
          when ${userId ?? null}::text is null then false
          else exists (
            select 1
            from teacher_review_likes own_like
            where own_like.review_id = review.id
              and own_like.user_id = ${userId ?? null}
          )
        end as liked_by_me
      from teacher_reviews review
      left join lateral (
        select count(*) as like_count
        from teacher_review_likes review_like
        where review_like.review_id = review.id
      ) likes on true
      where review.teacher_id = ${teacherId}
        and review.status = 'approved'
        and length(trim(review.comment || review.liked || review.difficult || review.exam_process || review.advice)) > 0
      order by
        case when (
          review.knowledge is not null
          or review.communication is not null
          or review.leniency is not null
          or review.fairness is not null
          or review.vibe is not null
          or review.overall is not null
        ) then 0 else 1 end,
        (
          coalesce(review.knowledge, 0)
          + coalesce(review.communication, 0)
          + coalesce(review.leniency, 0)
          + coalesce(review.fairness, 0)
          + coalesce(review.vibe, 0)
          + coalesce(review.overall, 0)
        ) / nullif(
          (case when review.knowledge is not null then 1 else 0 end)
          + (case when review.communication is not null then 1 else 0 end)
          + (case when review.leniency is not null then 1 else 0 end)
          + (case when review.fairness is not null then 1 else 0 end)
          + (case when review.vibe is not null then 1 else 0 end)
          + (case when review.overall is not null then 1 else 0 end),
          0
        ) asc nulls last,
        review.created_at desc
      limit ${limit}
      offset ${offset}
    `);
  }

  return db.execute(sql`
    select
      review.*,
      coalesce(likes.like_count, 0) as like_count,
      case
        when ${userId ?? null}::text is null then false
        else exists (
          select 1
          from teacher_review_likes own_like
          where own_like.review_id = review.id
            and own_like.user_id = ${userId ?? null}
        )
      end as liked_by_me
    from teacher_reviews review
    left join lateral (
      select count(*) as like_count
      from teacher_review_likes review_like
      where review_like.review_id = review.id
    ) likes on true
    where review.teacher_id = ${teacherId}
      and review.status = 'approved'
      and length(trim(review.comment || review.liked || review.difficult || review.exam_process || review.advice)) > 0
    order by review.created_at desc
    limit ${limit}
    offset ${offset}
  `);
}

export async function getOwnReview(teacherId: string, userId: string) {
  await ensureTeacherRuntimeTables();

  const result = await db.execute(sql`
    select
      review.*,
      coalesce(likes.like_count, 0) as like_count,
      exists (
        select 1
        from teacher_review_likes own_like
        where own_like.review_id = review.id
          and own_like.user_id = ${userId}
      ) as liked_by_me
    from teacher_reviews review
    left join lateral (
      select count(*) as like_count
      from teacher_review_likes review_like
      where review_like.review_id = review.id
    ) likes on true
    where review.teacher_id = ${teacherId}
      and review.user_id = ${userId}
      and review.status = 'approved'
    limit 1
  `);
  const [row] = result.rows as TeacherReviewRow[];

  return row ? rowToPublicReview(row, true) : null;
}

export async function createTeacherReview(input: {
  teacherId: string;
  userId: string | null;
  authorName: string | null;
  scores: Partial<Record<MetricKey, number>>;
  comment: string;
  liked: string;
  difficult: string;
  examProcess: string;
  advice: string;
  anonymous: boolean;
}) {
  await ensureTeacherRuntimeTables();

  const score = normalizeScores(input.scores);
  const id = randomUUID();
  const client = await pool.connect();

  try {
    await client.query("begin");

    let anonymousNumber: number | null = null;

    if (input.userId === null && input.anonymous) {
      await client.query("select pg_advisory_xact_lock(hashtext($1))", [
        input.teacherId,
      ]);
      const nextNumber = await client.query<{
        next_number: string | number | null;
      }>(
        `
          select coalesce(max(anonymous_number), 0) + 1 as next_number
          from teacher_reviews
          where teacher_id = $1
            and user_id is null
            and anonymous = true
        `,
        [input.teacherId],
      );
      anonymousNumber = Number(nextNumber.rows[0]?.next_number ?? 1);
    }

    await client.query(
      `
        insert into teacher_reviews (
          id,
          teacher_id,
          user_id,
          author_name,
          knowledge,
          communication,
          leniency,
          fairness,
          vibe,
          overall,
          comment,
          liked,
          difficult,
          exam_process,
          advice,
          anonymous,
          anonymous_number,
          status
        )
        values (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12, $13, $14, $15, $16, $17, 'pending'
        )
      `,
      [
        id,
        input.teacherId,
        input.userId,
        input.authorName,
        score.knowledge,
        score.communication,
        score.leniency,
        score.fairness,
        score.vibe,
        score.overall,
        input.comment,
        input.liked,
        input.difficult,
        input.examProcess,
        input.advice,
        input.anonymous,
        anonymousNumber,
      ],
    );
    await client.query("commit");
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }

  invalidateTeacherStatsCache();

  return id;
}

export async function updateTeacherReview(input: {
  teacherId: string;
  userId: string;
  authorName: string | null;
  scores: Partial<Record<MetricKey, number>>;
  comment: string;
  liked: string;
  difficult: string;
  examProcess: string;
  advice: string;
  anonymous: boolean;
}) {
  await ensureTeacherRuntimeTables();

  const score = normalizeScores(input.scores);
  const result = await db.execute(sql`
    update teacher_reviews
    set
      author_name = ${input.authorName},
      knowledge = ${score.knowledge},
      communication = ${score.communication},
      leniency = ${score.leniency},
      fairness = ${score.fairness},
      vibe = ${score.vibe},
      overall = ${score.overall},
      comment = ${input.comment},
      liked = ${input.liked},
      difficult = ${input.difficult},
      exam_process = ${input.examProcess},
      advice = ${input.advice},
      anonymous = ${input.anonymous}
    where teacher_id = ${input.teacherId}
      and user_id = ${input.userId}
    returning id
  `);

  const updated = result.rows.length > 0;

  if (updated) invalidateTeacherStatsCache();

  return updated;
}

export async function deleteTeacherReview(teacherId: string, userId: string) {
  await ensureTeacherRuntimeTables();

  const result = await db.execute(sql`
    delete from teacher_reviews
    where teacher_id = ${teacherId}
      and user_id = ${userId}
    returning id
  `);

  const deleted = result.rows.length > 0;

  if (deleted) invalidateTeacherStatsCache();

  return deleted;
}

export async function getFavoriteTeacherIds(userId: string) {
  await ensureTeacherRuntimeTables();

  const result = await db.execute(sql`
    select teacher_id from teacher_favorites where user_id = ${userId}
  `);

  return new Set(result.rows.map((row) => String(row.teacher_id)));
}

export async function addFavoriteTeacher(userId: string, teacherId: string) {
  await ensureTeacherRuntimeTables();

  await db.execute(sql`
    insert into teacher_favorites (user_id, teacher_id)
    values (${userId}, ${teacherId})
    on conflict (user_id, teacher_id) do nothing
  `);
}

export async function removeFavoriteTeacher(userId: string, teacherId: string) {
  await ensureTeacherRuntimeTables();

  await db.execute(sql`
    delete from teacher_favorites
    where user_id = ${userId} and teacher_id = ${teacherId}
  `);
}

export async function getUserTeacherActivitySummary(userId: string) {
  await ensureTeacherRuntimeTables();

  const result = await db.execute(sql`
    select
      (
        select count(*)
        from teacher_reviews
        where user_id = ${userId}
          and (
            knowledge is not null
            or communication is not null
            or leniency is not null
            or fairness is not null
            or vibe is not null
            or overall is not null
          )
      ) as review_count,
      (
        select count(*)
        from teacher_reviews
        where user_id = ${userId}
          and length(trim(comment || liked || difficult || exam_process || advice)) > 0
      ) as comment_count,
      (
        select count(*)
        from teacher_favorites
        where user_id = ${userId}
      ) as favorite_count,
      (
        select max(created_at)
        from teacher_reviews
        where user_id = ${userId}
      ) as last_review_at
  `);
  const [row] = result.rows as {
    review_count: string | number;
    comment_count: string | number;
    favorite_count: string | number;
    last_review_at: Date | string | null;
  }[];

  return {
    reviewCount: Number(row?.review_count ?? 0),
    commentCount: Number(row?.comment_count ?? 0),
    favoriteCount: Number(row?.favorite_count ?? 0),
    lastReviewAt: row?.last_review_at
      ? new Date(row.last_review_at).toISOString()
      : null,
  };
}

export async function setTeacherReviewLike(
  reviewId: string,
  userId: string,
  liked: boolean,
) {
  await ensureTeacherRuntimeTables();

  const reviewResult = await db.execute(sql`
    select id
    from teacher_reviews
    where id = ${reviewId} and status = 'approved'
    limit 1
  `);

  if (!reviewResult.rows.length) return null;

  if (liked) {
    await db.execute(sql`
      insert into teacher_review_likes (review_id, user_id)
      values (${reviewId}, ${userId})
      on conflict (review_id, user_id) do nothing
    `);
  } else {
    await db.execute(sql`
      delete from teacher_review_likes
      where review_id = ${reviewId} and user_id = ${userId}
    `);
  }

  const result = await db.execute(sql`
    select
      count(*) as like_count,
      exists (
        select 1
        from teacher_review_likes
        where review_id = ${reviewId} and user_id = ${userId}
      ) as liked_by_me
    from teacher_review_likes
    where review_id = ${reviewId}
  `);
  const [row] = result.rows as {
    like_count: string | number;
    liked_by_me: boolean;
  }[];

  return {
    likeCount: Number(row?.like_count ?? 0),
    likedByMe: Boolean(row?.liked_by_me),
  };
}

function rowToPublicReview(row: TeacherReviewRow, canEdit = false): Review {
  const createdAt = new Date(row.created_at).toISOString();
  const hasRating = hasReviewRating(row);
  const scores = {
    knowledge: row.knowledge == null ? undefined : Number(row.knowledge),
    communication:
      row.communication == null ? undefined : Number(row.communication),
    leniency: row.leniency == null ? undefined : Number(row.leniency),
    fairness: row.fairness == null ? undefined : Number(row.fairness),
    vibe: row.vibe == null ? undefined : Number(row.vibe),
    overall: row.overall == null ? undefined : Number(row.overall),
  };

  return createPublicReview({
    id: row.id,
    teacherId: row.teacher_id,
    author: row.author_name ?? "Студент",
    course: "Общая оценка преподавателя",
    createdAt,
    rating: getReviewRating(row),
    hasRating,
    body:
      row.comment.trim() ||
      [row.liked, row.difficult, row.exam_process, row.advice]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(" "),
    anonymous: row.anonymous,
    anonymousNumber:
      row.anonymous_number == null ? undefined : Number(row.anonymous_number),
    scores,
    comment: row.comment,
    liked: row.liked,
    difficult: row.difficult,
    examProcess: row.exam_process,
    advice: row.advice,
    likeCount: Number(row.like_count ?? 0),
    likedByMe: Boolean(row.liked_by_me),
    canEdit,
  });
}

function hasReviewRating(row: TeacherReviewRow) {
  return [
    row.knowledge,
    row.communication,
    row.leniency,
    row.fairness,
    row.vibe,
    row.overall,
  ].some((value) => value != null);
}

function getReviewRating(row: TeacherReviewRow) {
  const values = [
    row.knowledge,
    row.communication,
    row.leniency,
    row.fairness,
    row.vibe,
    row.overall,
  ]
    .map((value) => (value == null ? null : Number(value)))
    .filter((value): value is number => value != null && Number.isFinite(value));

  if (!values.length) return 0;

  return Math.round(
    (values.reduce((sum, value) => sum + value, 0) / values.length) * 100,
  ) / 100;
}

function normalizeScores(scores: Partial<Record<MetricKey, number>>) {
  return {
    knowledge: toNullableScore(scores.knowledge),
    communication: toNullableScore(scores.communication),
    leniency: toNullableScore(scores.leniency),
    fairness: toNullableScore(scores.fairness),
    vibe: toNullableScore(scores.vibe),
    overall: toNullableScore(scores.overall),
  };
}

function toNullableScore(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : null;
}

function parseScore(value: string | null) {
  if (value == null) return 0;
  return Math.round(Number(value) * 100) / 100;
}

function invalidateTeacherStatsCache() {
  teacherStatsCache = null;
}
