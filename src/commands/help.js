import { sendMessage } from "../bot";

export async function help(roomId) {
  await sendMessage(
    roomId,
    `Доступные команды:
!me - вывести информацию о сохраненых адресах
!tickets - вывести кол-во доступных билетов
!useTicket - запуск процесса использование билета
!cancel - завершение выполнения предыдущей команды
      `,
    `Доступные команды:<br />
<code>!me</code> - вывести информацию о сохраненых адресах<br />
<code>!tickets</code> - вывести кол-во доступных билетов<br />
<code>!useTicket</code> - запуск процесса использование билета<br />
<code>!cancel</code> - завершение выполнения предыдущей команды
      `
  );
}
