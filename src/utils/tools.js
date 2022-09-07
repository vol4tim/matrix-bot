import Decimal from "decimal.js-light";
import axios from "axios";

Decimal.set({
  toExpNeg: -31,
  toExpPos: 31
});

export function fromUnit(v, decimals = 0) {
  return new Decimal(v.toString())
    .div(new Decimal(10).pow(decimals.toString()))
    .toString();
}

export function toUnit(v, decimals = 0) {
  return new Decimal(v.toString().replaceAll(",", ".").replaceAll(" ", ""))
    .mul(new Decimal(10).pow(decimals.toString()))
    .toString();
}

export async function getPriceXRT() {
  const result = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=robonomics-network"
  );
  return result.data["robonomics-network"].usd;
}
