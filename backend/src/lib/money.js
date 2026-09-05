import Decimal from 'decimal.js';

export function money(value) {
  try {
    return new Decimal(value ?? 0);
  } catch {
    return new Decimal(0);
  }
}

export function moneyStr(value) {
  return money(value).toFixed(2);
}

export function isPositive(value) {
  return money(value).greaterThan(0);
}

export function isNegative(value) {
  return money(value).lessThan(0);
}

export default { money, moneyStr, isPositive, isNegative };
