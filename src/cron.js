import fs from "fs";
import path from "path";
import db from "./models/db";
import { IpcClient } from "./utils/ipc/client";
import logger from "./utils/logger";

(async function () {
  if (process.argv[2]) {
    const file = `./cron/${process.argv[2]}.js`;
    if (!fs.existsSync(path.resolve(__dirname, file))) {
      logger.error(`command not found ${path.resolve(__dirname, file)}`);
      process.exit(0);
    }
    const command = require(file);
    let bot;
    if (command.isRequireBot) {
      const cbs = {};
      const ipc = new IpcClient(2000);
      ipc.on("sendMessageResponse", (data) => {
        if (cbs[data.id]) {
          cbs[data.id](data);
        }
      });
      bot = {
        sendMessage(roomId, text, html, cb) {
          const id = `${roomId}-${Date.now()}`;
          cbs[id] = cb;
          ipc.send("sendMessage", {
            id: id,
            roomId,
            text,
            html
          });
        }
      };
    }
    await db.sequelize.sync();
    await command.default(bot);
  } else {
    process.exit(0);
  }
})();
