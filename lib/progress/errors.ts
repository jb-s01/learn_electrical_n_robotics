export class InvalidProgressInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidProgressInputError";
  }
}
