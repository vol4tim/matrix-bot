import { run, sendMessage } from "./bot";
import db from "./models/db";
import { IpcServer } from "./utils/ipc/server";

import "./chat";

const ipc = new IpcServer(2000);
ipc.on("sendMessage", (message) => {
  if (message.roomId && message.text) {
    sendMessage(message.roomId, message.text, message.html);
  }
});

(async function () {
  await db.sequelize.sync();
  await run();
})();
