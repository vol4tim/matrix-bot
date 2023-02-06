import { sendMessage } from "../bot";
import { addressParachain } from "./addressParachain";

export async function start(roomId) {
  await sendMessage(roomId, "Good morning old version of living organism!");
  return addressParachain(roomId);
}
