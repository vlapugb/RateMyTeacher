import type { Metadata } from "next";
import { LEGAL_CONFIG } from "@/lib/app-config";

export const metadata: Metadata = {
  title: "Контакты администратора — StudRadar",
};

export default function ContactsPage() {
  return (
    <div className="prose prose-slate prose-sm max-w-none">
      <h1 className="text-2xl font900">Контакты администратора</h1>

      <h2>Администратор сайта</h2>
      <p>
        Ответственное лицо за обработку персональных данных, модерацию контента
        и взаимодействие с пользователями.
      </p>

      <table className="w-full border-collapse text-sm">
        <tbody>
          <tr className="border-b border-line">
            <td className="py-2 pr-4 font800 text-slate-600">
              Наименование
            </td>
            <td className="py-2">{LEGAL_CONFIG.adminName}</td>
          </tr>
          <tr className="border-b border-line">
            <td className="py-2 pr-4 font800 text-slate-600">
              Электронная почта
            </td>
            <td className="py-2">
              <a href={`mailto:${LEGAL_CONFIG.adminEmail}`}>
                {LEGAL_CONFIG.adminEmail}
              </a>
            </td>
          </tr>
          <tr className="border-b border-line">
            <td className="py-2 pr-4 font800 text-slate-600">
              Юридический адрес
            </td>
            <td className="py-2">{LEGAL_CONFIG.orgAddress}</td>
          </tr>
        </tbody>
      </table>

      <h2>Вопросы и обращения</h2>
      <ul>
        <li>
          По вопросам работы Сайта, модерации, удаления отзывов — пишите на
          электронную почту администратора.
        </li>
        <li>
          Для жалоб на отзывы используйте форму на странице{" "}
          <a href="/legal/complaint">Жалоба на отзыв</a>.
        </li>
        <li>
          Для отзыва согласия на обработку персональных данных — направьте
          запрос с той же почты, с которой зарегистрирован аккаунт.
        </li>
        <li>
          Официальные запросы от государственных органов просим направлять на
          электронную почту администратора.
        </li>
      </ul>

      <h2>Сроки ответа</h2>
      <p>
        Администратор отвечает на обращения в течение 10 рабочих дней. По
        вопросам, требующим юридической проверки (жалобы на клевету, нарушения
        152-ФЗ), срок может быть продлён до 30 дней.
      </p>
    </div>
  );
}
