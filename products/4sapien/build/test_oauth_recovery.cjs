// Execute exact generated handler bytes with no network or real auth.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const file = process.argv[2] || 'products/4sapien/site/app/food/index.html';
const html = fs.readFileSync(file, 'utf8');
const lines = html.split('\n').filter(l => l.trim().startsWith('const google=async'));
assert.equal(lines.length, 1, 'exactly one generated OAuth handler required');
async function scenario(label, results, expectations) {
  let busy = false, message = '', calls = 0;
  const handler = vm.runInNewContext(lines[0] + ';google', {
    setBusy: v => { busy = v; },
    setMsg: v => { message = v; },
    SB: { auth: { signInWithOAuth: async input => {
      assert.equal(JSON.stringify(input), JSON.stringify({
        provider: 'google', options: { redirectTo: 'https://4sapien.com/app/food/' }
      }), 'provider/callback unchanged');
      const result = results[calls++];
      if (result.reject) throw result.reject;
      return result.value;
    } } }
  });
  for (const expected of expectations) {
    await assert.doesNotReject(handler, label);
    assert.equal(busy, expected.busy, label + ' busy');
    assert.equal(message, expected.message, label + ' message');
  }
  assert.equal(calls, expectations.length);
  console.log('PASS OAuth recovery: ' + label);
}
(async () => {
  await scenario('returned error', [{value:{error:{message:'returned error'}}}],
    [{busy:false,message:'returned error'}]);
  await scenario('rejected promise', [{reject:new Error('rejected call')}],
    [{busy:false,message:'rejected call'}]);
  await scenario('fallback error', [{reject:{}}],
    [{busy:false,message:'Google-innlogging er ikke tilgjengelig.'}]);
  await scenario('success preserves navigation busy state', [{value:{error:null}}],
    [{busy:true,message:''}]);
  await scenario('retry after rejection', [{reject:new Error('first')},{value:{error:null}}],
    [{busy:false,message:'first'},{busy:true,message:''}]);
  console.log('SYNTHETIC ONLY: no browser navigation, real login, attribution or network verified.');
})().catch(e => { console.error(e); process.exitCode = 1; });
