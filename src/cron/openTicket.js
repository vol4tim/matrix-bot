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

function getStart() {
  const currentMonth = Number(dayjs().format("M"));
  let start = dayjs();
  if (currentMonth === 1 || currentMonth === 2) {
    start = start.subtract(1, "year").month(11);
  } else if (currentMonth >= 3 && currentMonth <= 5) {
    start = start.month(2);
  } else if (currentMonth >= 6 && currentMonth <= 8) {
    start = start.month(5);
  } else if (currentMonth >= 9 && currentMonth <= 11) {
    start = start.month(8);
  } else if (currentMonth === 12) {
    start = start.month(11);
  }
  return start.startOf("month").valueOf();
}

export default async function (bot) {
  const start = getStart();
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
