export class InventoryDto {
  constructor(
    public id: number,
    public name: string,
    public price: number,
    public stock: number,
    public imageName: string,
  ) {}
}
