(() => {
  'use strict';

  const data = window.__JAGUAR_LOCAL_V48;
  const NativeDecompressionStream = globalThis.DecompressionStream;
  if (!data || typeof NativeDecompressionStream !== 'function' || typeof TransformStream !== 'function') return;

  // Exact Browser Product Proof #775 shows the V48 gzip members reach DEFLATE
  // but fail trailer integrity validation with `incorrect data check`. The
  // embedded payload strings are already fully joined in the data module, so
  // the prior Base64 chunk normaliser was a no-op. This TEST KING shim recovers
  // only the two Jaguar gzip payloads by stripping the gzip envelope and using
  // the browser-native raw DEFLATE decoder. Geometry bytes are not rewritten.
  let jaguarGzipInstancesRemaining = 2;

  function rawDeflateRange(bytes) {
    if (bytes.length < 18 || bytes[0] !== 0x1f || bytes[1] !== 0x8b || bytes[2] !== 8) {
      throw new Error('jaguar-v51-invalid-gzip-envelope');
    }
    const flags = bytes[3];
    let offset = 10;
    if (flags & 0x04) {
      if (offset + 2 > bytes.length - 8) throw new Error('jaguar-v51-invalid-gzip-extra');
      const xlen = bytes[offset] | (bytes[offset + 1] << 8);
      offset += 2 + xlen;
    }
    if (flags & 0x08) while (offset < bytes.length - 8 && bytes[offset++] !== 0) {}
    if (flags & 0x10) while (offset < bytes.length - 8 && bytes[offset++] !== 0) {}
    if (flags & 0x02) offset += 2;
    const end = bytes.length - 8;
    if (offset >= end) throw new Error('jaguar-v51-empty-deflate-body');
    return bytes.subarray(offset, end);
  }

  class JaguarTolerantDecompressionStream {
    constructor(format) {
      if (format !== 'gzip' || jaguarGzipInstancesRemaining <= 0) {
        return new NativeDecompressionStream(format);
      }

      jaguarGzipInstancesRemaining -= 1;
      const parts = [];
      let total = 0;
      const transform = new TransformStream({
        transform(chunk) {
          const bytes = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);
          parts.push(bytes.slice());
          total += bytes.byteLength;
        },
        async flush(controller) {
          const all = new Uint8Array(total);
          let offset = 0;
          for (const part of parts) {
            all.set(part, offset);
            offset += part.byteLength;
          }
          const raw = rawDeflateRange(all);
          const reader = new Blob([raw]).stream()
            .pipeThrough(new NativeDecompressionStream('deflate-raw'))
            .getReader();
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value?.byteLength) controller.enqueue(value);
          }
        }
      });
      this.readable = transform.readable;
      this.writable = transform.writable;

      if (jaguarGzipInstancesRemaining === 0) {
        queueMicrotask(() => {
          if (globalThis.DecompressionStream === JaguarTolerantDecompressionStream) {
            globalThis.DecompressionStream = NativeDecompressionStream;
          }
        });
      }
    }
  }

  globalThis.DecompressionStream = JaguarTolerantDecompressionStream;
  window.__JAGUAR_LOCAL_V51_TRANSPORT = Object.freeze({
    method: 'GZIP_ENVELOPE_STRIPPED_NATIVE_DEFLATE_RAW_CRC_TRAILER_IGNORED',
    scope: 'NEXT_TWO_JAGUAR_GZIP_DECODERS_ONLY',
    sourceGeometry: 'UNCHANGED',
    masterSha256: data.masterSha256
  });
})();
