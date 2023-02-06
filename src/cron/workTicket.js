import { bnToBn } from "@polkadot/util";
import Ticket, { chains, status } from "../models/ticket";
import User from "../models/user";
import logger from "../utils/logger";
import {
  chain,
  getBalance,
  getSender,
  sendToVesting
} from "../utils/parachain";
import { toUnit } from "../utils/tools";

export const isRequireBot = true;

export default async function (bot) {
  await chain();
  const sender = getSender();
  const tickets = await Ticket.findAll({ where: { status: status.CALC } });
  for (const ticket of tickets) {
    const user = await User.findOne({ where: { id: ticket.userId } });
    await ticket.update({ status: status.PROCCESS });
    if (ticket.chain === chains.ROB) {
      const amount = bnToBn(toUnit(ticket.amount, 9));
      let balance;
      try {
        balance = await getBalance(sender);
      } catch (error) {
        logger.error(`update status #${ticket.id}`, error);
      }
      logger.info(`send to vesting ${user.addressParachain} ${ticket.amount}`);
      if (balance && balance.gte(amount)) {
        let tx;
        try {
          tx = await sendToVesting(user.addressParachain, amount);
          await ticket.update({
            status: status.SUCCESS,
            tx: `${tx.blockNumber}-${tx.txIndex}`
          });
          logger.info(`tx: ${tx.blockNumber}-${tx.txIndex}`);
        } catch (error) {
          logger.error(`send from ticket #${ticket.id}`, error);
          await ticket.update({ status: status.FAIL });
        }
      } else {
        logger.error(
          `low balance ${balance.toString()} require ${amount.toString()}`
        );
      }
    }
    if (ticket.tx) {
      await bot.sendMessage(
        user.roomId,
        `Ticket executed: https://robonomics.subscan.io/extrinsic/${ticket.tx}`,
        `Ticket executed: <a href="https://robonomics.subscan.io/extrinsic/${ticket.tx}">view explorer</a>`
      );
    }
  }
}
