import User from "../models/user";
import Ticket, { chains, status } from "../models/ticket";
import { getSender, getBalanceXrt, transferXrt } from "../utils/web3";
import Web3 from "web3";
import { toUnit } from "../utils/tools";
import logger from "../utils/logger";

// function timeout(sec) {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve();
//     }, sec);
//   });
// }

export const isRequireBot = true;

export default async function (bot) {
  const sender = getSender();
  const tickets = await Ticket.findAll({ where: { status: status.CALC } });
  for (const ticket of tickets) {
    const user = await User.findOne({ where: { id: ticket.userId } });
    await ticket.update({ status: status.PROCCESS });
    try {
      if (ticket.chain === chains.ETH) {
        const amount = Web3.utils.toBN(toUnit(ticket.amount, 9));
        const balance = Web3.utils.toBN(await getBalanceXrt(sender));
        logger.info(`send eth ${user.addressEthereum} ${ticket.amount}`);
        if (balance.gte(amount)) {
          const tx = await transferXrt(user.addressEthereum, amount);
          await ticket.update({ status: status.SUCCESS, tx: tx });
          logger.info(`tx: ${tx}`);
        } else {
          logger.error(
            `low balance ${balance.toString()} require ${amount.toString()}`
          );
        }
      } else {
        // console.log("send para", user.addressParachain, ticket.amount);
        // await timeout(3000);
        // await ticket.update({ status: status.SUCCESS, tx: "txp.1233" });
      }
    } catch (error) {
      logger.error(`send from ticket #${ticket.id}`, error);
      await ticket.update({ status: status.CALC });
    }
    if (ticket.tx) {
      await bot.sendMessage(
        user.roomId,
        `Ticket executed: https://etherscan.io/tx/${ticket.tx}`,
        `Ticket executed: <a href="https://etherscan.io/tx/${ticket.tx}">view explorer</a>`
      );
    }
  }
}
