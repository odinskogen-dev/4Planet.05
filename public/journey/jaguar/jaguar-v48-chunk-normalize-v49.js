(() => {
  'use strict';
  const data = window.__JAGUAR_LOCAL_V48;
  if (!data) return;

  // V48 stores one gzip byte stream as independently Base64-encoded chunks.
  // Joining the Base64 text directly is invalid when chunks carry their own
  // padding. Decode each chunk to compressed bytes first, preserve byte order,
  // then encode the reconstructed gzip stream once for the existing decoder.
  function rebuildBase64(chunks) {
    if (!Array.isArray(chunks)) return chunks;
    const decoded = chunks.map((chunk) => {
      const raw = atob(chunk);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      return bytes;
    });
    const total = decoded.reduce((sum, bytes) => sum + bytes.byteLength, 0);
    const joined = new Uint8Array(total);
    let offset = 0;
    for (const bytes of decoded) {
      joined.set(bytes, offset);
      offset += bytes.byteLength;
    }
    let binary = '';
    const step = 0x8000;
    for (let i = 0; i < joined.length; i += step) {
      const slice = joined.subarray(i, Math.min(joined.length, i + step));
      binary += String.fromCharCode(...slice);
    }
    return btoa(binary);
  }

  for (const key of ['posGzipB64', 'idxGzipB64']) {
    const chunks = data[key];
    if (!Array.isArray(chunks)) continue;
    const rebuilt = rebuildBase64(chunks);
    chunks.splice(0, chunks.length, rebuilt);
  }

  window.__JAGUAR_LOCAL_V49_TRANSPORT = Object.freeze({
    method: 'BASE64_CHUNKS_DECODED_TO_BYTES_CONCATENATED_THEN_REENCODED_V50',
    sourceGeometry: 'UNCHANGED',
    masterSha256: data.masterSha256
  });
})();
