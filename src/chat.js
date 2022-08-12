import {
  MatrixClient,
  SimpleFsStorageProvider,
  AutojoinRoomsMixin
} from "matrix-bot-sdk";
import { encodeAddress, isAddress } from "@polkadot/util-crypto";
import User from "./models/user";
import logger from "./utils/logger";
import config from "./config";

const storage = new SimpleFsStorageProvider(config.storage);

const client = new MatrixClient(config.serverUrl, config.accessToken, storage);
AutojoinRoomsMixin.setupOnClient(client);

export default async function () {
  client
    .start()
    .then(() => logger.info("Bot started!"))
    .catch((e) => {
      logger.error("Start", e);
    });
}

function sendMessage(roomId, text) {
  return client.sendMessage(roomId, {
    msgtype: "m.text",
    body: text
  });
}

const commands = {
  start(roomId) {
    session[roomId] = "start";
    return sendMessage(
      roomId,
      "Good morning old version of living organism! Write down your Robonomics account address (if you want to try a golden rain on your skin)"
    );
  },
  update(roomId) {
    session[roomId] = "update";
    return sendMessage(roomId, "Write down your Robonomics account address.");
  },
  async me(roomId) {
    const user = await User.findOne({ where: { roomId } });
    if (user.address) {
      return sendMessage(
        roomId,
        `Ваш адрес ${encodeAddress(user.address, 32)}`
      );
    } else {
      await sendMessage(roomId, "You haven't entered your address yet");
      this.update(roomId);
      session[roomId] = "start";
    }
  }
};

client.on("room.message", handleCommand);

const session = {};

async function handleCommand(roomId, event) {
  if (event.content?.msgtype !== "m.text") return;
  if (event.sender === (await client.getUserId())) return;

  const body = event.content.body;

  let user = await User.findOne({ where: { userId: event.sender } });
  if (user === null) {
    user = await User.create({
      userId: event.sender,
      roomId: roomId,
      address: ""
    });
  } else if (user.roomId !== roomId) {
    logger.warn(
      `update ${event.sender}: old roomId ${user.roomId}, new roomId ${roomId}`
    );
    user.update({ roomId: roomId });
  }

  if (body === "!start") {
    return commands.start(roomId);
  }
  if (body === "!update") {
    return commands.update(roomId);
  }
  if (body === "!me") {
    return commands.me(roomId);
  }

  if (session[roomId]) {
    if (session[roomId] === "start" && user.address) {
      session[roomId] = null;
      return sendMessage(
        roomId,
        `You have already entered your address \`${user.address}\``
      );
    }

    if (!isAddress(body)) {
      return sendMessage(roomId, "Address entered incorrectly");
    }

    User.update(
      { address: encodeAddress(body) },
      { where: { roomId: roomId } }
    );
    sendMessage(
      roomId,
      `Your address ${encodeAddress(body, 32)} saved. Thanks for cooperation.`
    );
    session[roomId] = null;
  }
}

client.on("room.join", (roomId) => {
  logger.info(`room.join ${roomId}`);
  commands.start(roomId);
});
