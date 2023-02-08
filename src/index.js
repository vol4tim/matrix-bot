import { run, sendMessage } from "./bot";
import db from "./models/db";
import { IpcServer } from "./utils/ipc/server";

import "./chat";

const ipc = new IpcServer(2000);
ipc.on("sendMessage", (message, reply) => {
  if (message.roomId && message.text) {
    sendMessage(message.roomId, message.text, message.html)
      .then(() => {
        reply(
          {
            id: message.id,
            result: true
          },
          "sendMessageResponse"
        );
      })
      .catch((e) => {
        reply(
          {
            id: message.id,
            error: e.message
          },
          "sendMessageResponse"
        );
      });
  }
});

(async function () {
  await db.sequelize.sync();
  await run();
})();
