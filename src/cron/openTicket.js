import dayjs from "dayjs";
import Employment from "../models/employment";
import Ticket, { chains, status } from "../models/ticket";
import { getUsers } from "../models/user";

async function addTicket(userId, start) {
  const employment = await Employment.findOne({
    where: { userId: userId }
  });
  if (!employment || Number(employment.employment) <= 0) {
    return;
  }
  return await Ticket.create({
    userId: userId,
    chain: chains.ROB,
    status: status.NEW,
    date: start,
    amount: 0,
    koef: 0,
    employment: employment.employment,
    tx: null
  });
}

async function isTicket(userId, start) {
  return await Ticket.findOne({
    where: { userId: userId, date: start }
  });
}

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

export const isRequireBot = true;

export default async function (bot) {
  const start = getStart();
  const users = await getUsers();
  for (const user of users) {
    if (!(await isTicket(user.id, start))) {
      const t = await addTicket(user.id, start);
      if (t) {
        await bot.sendMessage(
          user.roomId,
          `You got a ticket, to use it run the command !useTicket`
        );
      }
    }
  }
}
