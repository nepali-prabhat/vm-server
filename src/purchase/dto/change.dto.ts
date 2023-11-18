export class Change {
  constructor(
    public coin: number,
    public cash: number,
  ) {}

  public getTotalChange() {
    return this.coin + this.cash;
  }
}
