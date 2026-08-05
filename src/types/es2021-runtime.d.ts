// The current controlled Vite browser target provides String.prototype.replaceAll.
// This declaration avoids widening the repository-wide ES2020 compilation target.
interface String {
  replaceAll(searchValue: string | RegExp, replaceValue: string): string;
}
