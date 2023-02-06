import Web3 from "web3";
import { sendMessage } from "../bot";
import { session } from "../session";
import { addressParachain } from "./addressParachain";

export async function addressEthereum(roomId) {
  session[roomId] = "addressEthereumHandle";
  await sendMessage(roomId, "Write down your Ethereum account address.");
}

export async function addressEthereumHandle(roomId, user, body) {
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
    return addressParachain(roomId);
  }
}
