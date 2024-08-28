export default class ChainString {
  constructor() {
    this.stringArray = [];
  }

  error(text) {
    this.stringArray.push(`Error: ${text}`);
    return this;
  }

  info(text) {
    this.stringArray.push(`Info: ${text}`);
    return this;
  }

  debug(text) {
    this.stringArray.push(`Debug: ${text}`);
    return this;
  }

  getValue() {
    return this.stringArray.join('|');
  }

  clear() {
    this.stringArray = [];
    return this;
  }
}
