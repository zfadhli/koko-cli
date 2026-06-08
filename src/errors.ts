export class CliToolkitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CliToolkitError";
  }
}
