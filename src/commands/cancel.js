import { session } from "../session";

export function cancel(roomId) {
  session[roomId] = null;
}
