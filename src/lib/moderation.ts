const MODERATOR_IDENTITIES = [
  {
    email: "st075512@student.spbu.ru",
    login: "st075512",
  },
] as const;

type SessionUserLike = {
  email?: string | null;
  login?: string | null;
};

function normalizeIdentity(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function isModeratorUser(user: SessionUserLike | null | undefined) {
  const email = normalizeIdentity(user?.email);
  const login = normalizeIdentity(user?.login);

  return MODERATOR_IDENTITIES.some(
    (identity) => email === identity.email || login === identity.login,
  );
}
