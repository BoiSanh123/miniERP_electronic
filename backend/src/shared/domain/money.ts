import Decimal from "decimal.js";

export class Money {
  private constructor(private readonly value: Decimal) {}

  static zero() { return new Money(new Decimal(0)); }
  static from(input: Decimal.Value) { return new Money(new Decimal(input)); }
  add(other: Money) { return new Money(this.value.add(other.value)); }
  sub(other: Money) {
    const next = this.value.sub(other.value);
    if (next.isNegative()) throw new Error("Money cannot be negative");
    return new Money(next);
  }
  mul(input: Decimal.Value) { return new Money(this.value.mul(input)); }
  toString() { return this.value.toFixed(2); }
  toNumber() { return this.value.toNumber(); }
}
