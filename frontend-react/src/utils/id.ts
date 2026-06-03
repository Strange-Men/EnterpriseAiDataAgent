/** Generate a unique ID string. */

export function generateId(): string {
  const webCrypto = globalThis.crypto;
  if (webCrypto?.randomUUID) {
    return webCrypto.randomUUID();
  }
  const random = new Uint32Array(4);
  if (webCrypto?.getRandomValues) {
    webCrypto.getRandomValues(random);
    return Array.from(random, (n) => n.toString(36)).join("-");
  }
  return Math.random().toString(36).slice(2, 12);
}
