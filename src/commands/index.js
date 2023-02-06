import { addressEthereum, addressEthereumHandle } from "./addressEthereum";
import { addressParachain, addressParachainHandle } from "./addressParachain";
import { cancel } from "./cancel";
import { getCurrentCourseXRT } from "./getCurrentCourseXRT";
import { help } from "./help";
import { me } from "./me";
import { start } from "./start";
import { tickets } from "./tickets";
import { useTicket, useTicketHandle } from "./useTicket";

export const commands = {
  start,
  help,
  addressParachain,
  addressParachainHandle,
  addressEthereum,
  addressEthereumHandle,
  me,
  tickets,
  useTicket,
  useTicketHandle,
  getCurrentCourseXRT,
  cancel
};
