import { client, sendMessage } from "./bot";
import { encodeAddress, isAddress } from "@polkadot/util-crypto";
import User from "./models/user";
import Ticket, { status } from "./models/ticket";
import logger from "./utils/logger";
import Web3 from "web3";
import { getPriceXRT } from "./utils/tools";

function getRandomFloat(min, max, decimals) {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
}

const commands = {
  async start(roomId) {
    await sendMessage(roomId, "Good morning old version of living organism!");
    return this.addressParachain(roomId);
  },
  async help(roomId) {
    await sendMessage(
      roomId,
      `Доступные команды:
!me - вывести информацию о сохраненых адресах
!tickets - вывести кол-во доступных билетов
!useTicket - запуск процесса использование билета
!exit - завершение выполнения предыдущей команды
      `,
      `Доступные команды:<br />
<code>!me</code> - вывести информацию о сохраненых адресах<br />
<code>!tickets</code> - вывести кол-во доступных билетов<br />
<code>!useTicket</code> - запуск процесса использование билета<br />
<code>!exit</code> - завершение выполнения предыдущей команды
      `
    );
  },
  async addressParachain(roomId) {
    session[roomId] = "addressParachain";
    await sendMessage(
      roomId,
      "Write down your Robonomics parachain account address."
    );
  },
  async addressEthereum(roomId) {
    session[roomId] = "addressEthereum";
    await sendMessage(roomId, "Write down your Ethereum account address.");
  },
  async me(roomId) {
    const user = await User.findOne({ where: { roomId } });
    if (user.addressParachain) {
      await sendMessage(
        roomId,
        `Your Robonomics parachain account address ${encodeAddress(
          user.addressParachain,
          32
        )}`
      );
    }
    if (user.addressEthereum) {
      await sendMessage(
        roomId,
        `Your Ethereum account address ${user.addressEthereum}`
      );
    }
    if (!user.addressParachain) {
      return this.addressParachain(roomId);
    } else if (!user.addressEthereum) {
      return this.addressEthereum(roomId);
    }
  },
  async tickets(roomId, user) {
    const result = await Ticket.findAll({
      where: { userId: user.id, status: status.NEW }
    });
    await sendMessage(roomId, `You have ${result.length} tickets available.`);
  },
  async useTicket(roomId, user) {
    const result = await Ticket.findAll({
      where: { userId: user.id, status: status.NEW }
    });
    if (result.length) {
      session[roomId] = "useTicket";
      await sendMessage(
        roomId,
        `How many months do you work in the Robonomics team?`
      );
    } else {
      await sendMessage(roomId, `You have no available tickets`);
    }
  }
};

client.on("room.message", handleCommand);

const session = {};

async function handleCommand(roomId, event) {
  if (event.content?.msgtype !== "m.text") return;
  if (event.sender === (await client.getUserId())) return;

  const body = event.content.body.trim();

  let user = await User.findOne({ where: { userId: event.sender } });
  if (user === null) {
    user = await User.create({
      userId: event.sender,
      roomId: roomId,
      addressParachain: "",
      addressEthereum: ""
    });
  } else if (user.roomId !== roomId) {
    logger.warn(
      `update ${event.sender}: old roomId ${user.roomId}, new roomId ${roomId}`
    );
    await user.update({ roomId: roomId });
  }

  if (body === "!start") {
    return commands.start(roomId);
  }
  if (body === "!help") {
    return commands.help(roomId);
  }
  if (body === "!addressParachain") {
    return commands.addressParachain(roomId);
  }
  if (body === "!addressEthereum") {
    return commands.addressEthereum(roomId);
  }
  if (body === "!me") {
    return commands.me(roomId);
  }
  if (body === "!tickets") {
    return commands.tickets(roomId, user);
  }
  if (body === "!useTicket") {
    return commands.useTicket(roomId, user);
  }
  if (body === "!exit") {
    return (session[roomId] = null);
  }

  if (session[roomId]) {
    if (session[roomId] === "addressParachain") {
      if (user.addressParachain) {
        await sendMessage(
          roomId,
          `You have already entered your address \`${encodeAddress(
            user.addressParachain,
            32
          )}\``
        );
      } else {
        if (!isAddress(body)) {
          return sendMessage(roomId, "Address entered incorrectly");
        }
        await user.update({ addressParachain: encodeAddress(body) });
        await sendMessage(
          roomId,
          `Your address ${encodeAddress(
            body,
            32
          )} saved. Thanks for cooperation.`
        );
      }
      session[roomId] = null;

      if (!user.addressEthereum) {
        return commands.addressEthereum(roomId);
      }
    } else if (session[roomId] === "addressEthereum") {
      if (user.addressEthereum) {
        await sendMessage(
          roomId,
          `You have already entered your address \`${user.addressEthereum}\``
        );
      } else {
        if (!Web3.utils.isAddress(body)) {
          return sendMessage(roomId, "Address entered incorrectly");
        }
        await user.update({ addressEthereum: body });
        await sendMessage(
          roomId,
          `Your address ${body} saved. Thanks for cooperation.`
        );
      }
      session[roomId] = null;

      if (!user.addressParachain) {
        return commands.addressParachain(roomId);
      }
    } else if (session[roomId] === "useTicket") {
      const months = Number(body);

      let course;
      try {
        course = await getPriceXRT();
      } catch (error) {
        logger.error("get price xrt", error);
        await sendMessage(
          roomId,
          "На данный момент курс токена не доступен. Попробуйте позже."
        );
        session[roomId] = null;
        return;
      }

      const koef = getRandomFloat(0.5, 2, 2);
      const amount = parseFloat((months * course * koef).toFixed(2));
      const ticket = await Ticket.findOne({
        where: { userId: user.id, status: status.NEW }
      });
      await ticket.update({
        months,
        course,
        koef,
        amount,
        status: status.CALC
      });
      await sendMessage(roomId, `Ticket #${ticket.id} for execution.`);
      session[roomId] = null;
    }
  }

  if (!user.addressParachain) {
    return commands.addressParachain(roomId);
  } else if (!user.addressEthereum) {
    return commands.addressEthereum(roomId);
  }
}

client.on("room.join", (roomId) => {
  logger.info(`room.join ${roomId}`);
  commands.start(roomId);
});
