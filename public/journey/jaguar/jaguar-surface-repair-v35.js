(()=>{
'use strict';
// TEST KING recovery bridge.
// The current v33 position transport is fail-closed as corrupt (+217 encoded
// characters versus its declared byte contract). Do not trim or pad that data.
// Load the previously preserved Ear.Rodriguez-derived v29 payloads and rebuild
// topology through v36 instead. This keeps source/licence custody intact while
// separating runtime recovery from the corrupt transport.
const scripts=[
 '/journey/jaguar/jaguar-data-meta-v29.js',
 '/journey/jaguar/jaguar-data-pos-v29.js',
 '/journey/jaguar/jaguar-data-nrm-v29.js',
 '/journey/jaguar/jaguar-data-col-v29.js',
 '/journey/jaguar/jaguar-surface-recovery-v36.js'
];
for(const src of scripts)document.write(`<script src="${src}"><\/script>`);
})();