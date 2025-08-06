declare module 'aes-js' {
  export class AES {
    constructor(key: Uint8Array)
    encrypt(plaintext: Uint8Array): Uint8Array
    decrypt(ciphertext: Uint8Array): Uint8Array
  }

  export namespace ModeOfOperation {
    class ctr {
      constructor(key: Uint8Array, counter?: Uint8Array)
      encrypt(plaintext: Uint8Array): Uint8Array
      decrypt(ciphertext: Uint8Array): Uint8Array
    }

    class cbc {
      constructor(key: Uint8Array, iv: Uint8Array)
      encrypt(plaintext: Uint8Array): Uint8Array
      decrypt(ciphertext: Uint8Array): Uint8Array
    }

    class cfb {
      constructor(key: Uint8Array, iv: Uint8Array, segmentSize?: number)
      encrypt(plaintext: Uint8Array): Uint8Array
      decrypt(ciphertext: Uint8Array): Uint8Array
    }

    class ofb {
      constructor(key: Uint8Array, iv: Uint8Array)
      encrypt(plaintext: Uint8Array): Uint8Array
      decrypt(ciphertext: Uint8Array): Uint8Array
    }

    class ecb {
      constructor(key: Uint8Array)
      encrypt(plaintext: Uint8Array): Uint8Array
      decrypt(ciphertext: Uint8Array): Uint8Array
    }
  }

  export namespace utils {
    export namespace utf8 {
      export function toBytes(text: string): Uint8Array
      export function fromBytes(bytes: Uint8Array): string
    }

    export namespace hex {
      export function toBytes(hex: string): Uint8Array
      export function fromBytes(bytes: Uint8Array): string
    }
  }

  export namespace padding {
    export namespace pkcs7 {
      export function pad(data: Uint8Array): Uint8Array
      export function strip(data: Uint8Array): Uint8Array
    }
  }
}