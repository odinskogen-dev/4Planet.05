(() => {
  'use strict';
  const data = window.__JAGUAR_LOCAL_V48;
  if (!data) return;

  // V48 stores large gzip payloads as arrays of Base64 chunks for source readability.
  // The runtime decoder receives each property directly; Array#toString inserts commas,
  // which corrupts Base64 before gzip decode. Collapse each mutable chunk array to one
  // exact string in-place before the frozen V48 object is consumed.
  for (const key of ['posGzipB64', 'idxGzipB64']) {
    const chunks = data[key];
    if (!Array.isArray(chunks)) continue;
    const joined = chunks.join('');
    chunks.splice(0, chunks.length, joined);
  }

  window.__JAGUAR_LOCAL_V49_TRANSPORT = Object.freeze({
    method: 'BASE64_CHUNKS_JOINED_BEFORE_GZIP_DECODE',
    sourceGeometry: 'UNCHANGED',
    masterSha256: data.masterSha256
  });
})();
