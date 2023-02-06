import { encodeAddress, isAddress } from "@polkadot/util-crypto";
import { sendMessage } from "../bot";
import { session } from "../session";
import { addressEthereum } from "./addressEthereum";

export async function addressParachain(roomId) {
  session[roomId] = "addressParachainHandle";
  await sendMessage(
    roomId,
    "Write down your Robonomics parachain account address."
  );
}

export async function addressParachainHandle(roomId, user, body) {
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
      `Your address ${encodeAddress(body, 32)} saved. Thanks for cooperation.`
    );
  }
  session[roomId] = null;

  if (!user.addressEthereum) {
    return addressEthereum(roomId);
  }
}
