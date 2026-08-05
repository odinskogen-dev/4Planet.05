// The controlled Vite browser target supports String.prototype.replaceAll at runtime.
// This declaration keeps the existing ES2020 TypeScript lib boundary unchanged.
interface String {
  replaceAll(searchValue: string | RegExp, replaceValue: string): string;
}
