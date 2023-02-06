import { ApiPromise, WsProvider } from "@polkadot/api";
import { Keyring } from "@polkadot/keyring";
import { bnToBn } from "@polkadot/util";
import { encodeAddress } from "@polkadot/util-crypto";
import config from "../config";
import logger from "./logger";
import { toUnit } from "./tools";

let provider;
let api;
let k;
let account;
export async function chain() {
  if (api) {
    return { provider, api };
  }
  provider = new WsProvider(config.parachain.endpoint);
  api = await ApiPromise.create({
    provider: provider
    // ...config
  });
  k = new Keyring({ type: "sr25519" });
  account = k.addFromUri(config.parachain.key);

  return { provider, api };
}

export function getAccounts() {
  const pairs = k.getPairs();
  const accounts = pairs.map((pair) => {
    return {
      ...pair,
      address: encodeAddress(pair.address, api.registry.chainSS58)
    };
  });
  return accounts;
}

export function getSender() {
  return account.address;
}

export async function getCurentBlock() {
  return (await api.rpc.chain.getBlock()).block.header.number.toString();
}

export async function signAndSend(account, tx, options = {}) {
  return new Promise((resolve, reject) => {
    tx.signAndSend(account, options, (result) => {
      if (result.status.isInBlock) {
        result.events.forEach(async (events) => {
          const {
            event: { data, method, section },
            phase
          } = events;
          if (section === "system" && method === "ExtrinsicFailed") {
            let message = "Error";
            if (data[0].isModule) {
              const mod = data[0].asModule;
              // const mod = result.dispatchError.asModule;
              const { docs, name, section } = mod.registry.findMetaError(mod);
              console.log(name, section, docs);
              message = docs.join(", ");
            }
            return reject(new Error(message));
          } else if (section === "system" && method === "ExtrinsicSuccess") {
            const block = await api.rpc.chain.getBlock(
              result.status.asInBlock.toString()
            );
            resolve({
              block: result.status.asInBlock.toString(),
              blockNumber: block.block.header.number.toNumber(),
              // const index = phase.value.toNumber();
              txIndex: phase.asApplyExtrinsic.toHuman(),
              tx: tx.hash.toString()
            });
          }
        });
      }
    }).catch(reject);
  });
}

export async function getBalance(address) {
  const { data } = await api.query.system.account(address);
  return data.free.sub(data.miscFrozen);
}

export async function transfer(address, amount) {
  logger.info(`transfer ${address} ${amount}`);
  const balance = await getBalance(account.address);
  if (balance.lte(bnToBn(amount))) {
    throw new Error("Insufficient funds");
  }
  const transfer = api.tx.balances.transfer(address, amount);
  const result = await signAndSend(account, transfer);
  logger.info(JSON.stringify(result, null, 2));
  return result;
}

export async function sendToVesting(address, value) {
  logger.info(`send to vesting ${address} ${value}`);
  const balance = await getBalance(account.address);
  if (balance.lte(bnToBn(value))) {
    throw new Error("Insufficient funds");
  }
  const currentBlock = await getCurentBlock();
  const transfer = api.tx.vesting.vestedTransfer(address, {
    locked: value,
    perBlock: bnToBn(toUnit(config.parachain.vestingPerBlock, 9)),
    startingBlock: currentBlock
  });
  const result = await signAndSend(account, transfer);
  logger.info(JSON.stringify(result, null, 2));
  return result;
}
