import { sendMessage } from "../bot";
import Ticket from "../models/ticket";

export async function tickets(roomId, user) {
  const result = await Ticket.findAll({
    where: { userId: user.id, status: status.NEW }
  });
  await sendMessage(roomId, `You have ${result.length} tickets available.`);
}
