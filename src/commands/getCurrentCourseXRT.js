import { sendMessage } from "../bot";
import { getPriceXRT } from "../utils/tools";

export async function getCurrentCourseXRT(roomId) {
  const course = await getPriceXRT();
  await sendMessage(roomId, `${course} USD`);
}
