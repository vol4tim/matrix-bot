import { encodeAddress } from "@polkadot/util-crypto";
import { sendMessage } from "../bot";
import User from "../models/user";

export async function me(roomId) {
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
}
