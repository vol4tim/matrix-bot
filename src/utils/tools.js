import axios from "axios";
import Decimal from "decimal.js-light";

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

export function getRandomFloat(min, max, decimals) {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
}

export function calcBonus(months, employment, priceXRT) {
  if (months > 36) {
    months = 36;
  }
  if (employment < 100 && months > 12) {
    months = 12;
  }
  let maxKoef = 1 + months * 0.05;
  if (maxKoef > 2.4) {
    maxKoef = 2.4;
  }
  const koef = getRandomFloat(1, maxKoef, 2);
  const bonus = months * (100 / priceXRT) * koef;
  const amount = parseFloat(((bonus * employment) / 100).toFixed(2));
  return {
    koef,
    amount
  };
}
