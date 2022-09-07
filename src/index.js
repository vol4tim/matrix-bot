import db from "./models/db";
import { run, sendMessage } from "./bot";
import "./chat";

import { IpcServer } from "./utils/ipc/server";

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
