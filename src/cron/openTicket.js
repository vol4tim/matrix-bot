import { getUsers } from "../models/user";
import Ticket, { chains, status } from "../models/ticket";
import dayjs from "dayjs";

async function addTicket(userId, start) {
  return await Ticket.create({
    userId: userId,
    chain: chains.ETH,
    status: status.NEW,
    date: start,
    amount: 0,
    koef: 0,
    tx: null
  });
}

async function isTicket(userId, start) {
  return await Ticket.findOne({
    where: { userId: userId, date: start }
  });
}

export const isRequireBot = true;

export default async function (bot) {
  const start = dayjs().startOf("month").valueOf();
  // const start = dayjs("01-07-2022", "MM-DD-YYYY").valueOf();
  const users = await getUsers();
  for (const user of users) {
    if (!(await isTicket(user.id, start))) {
      await addTicket(user.id, start);
      await bot.sendMessage(
        user.roomId,
        `You got a ticket, to use it run the command !useTicket`
      );
    }
  }
}
