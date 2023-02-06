import { sendMessage } from "../bot";
import Ticket, { status } from "../models/ticket";
import { session } from "../session";
import logger from "../utils/logger";
import { calcBonus, getPriceXRT } from "../utils/tools";

export async function useTicket(roomId, user) {
  const result = await Ticket.findAll({
    where: { userId: user.id, status: status.NEW }
  });
  if (result.length) {
    session[roomId] = "useTicketHandle";
    await sendMessage(
      roomId,
      `How many months do you work in the Robonomics team?`
    );
  } else {
    await sendMessage(roomId, `You have no available tickets`);
  }
}

export async function useTicketHandle(roomId, user, body) {
  let months = Number(body);
  if (months > 36) {
    months = 36;
  }

  let course;
  try {
    course = await getPriceXRT();
  } catch (error) {
    logger.error("get price xrt", error);
    await sendMessage(
      roomId,
      "Current XRT price is not available at the moment. Try later."
    );
    session[roomId] = null;
    return;
  }
  const ticket = await Ticket.findOne({
    where: { userId: user.id, status: status.NEW }
  });
  const { koef, amount } = calcBonus(months, ticket.employment, course);
  await ticket.update({
    months,
    course,
    koef,
    amount,
    status: status.CALC
  });
  await sendMessage(
    roomId,
    `Ticket #${ticket.id} for execution. Wait for your tokens. Thank you.`
  );
  session[roomId] = null;
}
