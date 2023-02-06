import HDWalletProvider from "@truffle/hdwallet-provider";
import Web3 from "web3";
import abiVesting from "../../abi/vesting.json";
import abiXrt from "../../abi/xrt.json";
import config from "../config";

const provider = new HDWalletProvider({
  mnemonic: {
    phrase: config.ethereum.mnemonic
  },
  providerOrUrl: config.ethereum.endpoint,
  addressIndex: 0,
  numberOfAddresses: 1
});
const web3 = new Web3(provider);

export function getSender() {
  return provider.getAddress();
}
export function xrtContract() {
  return new web3.eth.Contract(abiXrt, config.ethereum.xrt);
}
export function vestingContract() {
  return new web3.eth.Contract(abiVesting, config.ethereum.vesting);
}
export async function getBalance(address) {
  return await web3.eth.getBalance(address);
}
export async function transfer(address, value) {
  const receipt = await web3.eth.sendTransaction({
    from: getSender(),
    to: address,
    value: value
  });
  return receipt.transactionHash;
}
export async function transferXrt(address, value) {
  const receipt = await xrtContract()
    .methods.transfer(address, value)
    .send({ from: getSender() });
  return receipt.transactionHash;
}
export async function sendToVestingXrt(address, value) {
  const receipt = await vestingContract()
    .methods.addTokenGrant(address, 0, value, 365, 0)
    .send({ from: getSender() });
  return receipt.transactionHash;
}
export async function getBalanceXrt(address) {
  return await xrtContract().methods.balanceOf(address).call();
}
