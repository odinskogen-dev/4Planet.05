#!/usr/bin/env python3
import json
from pathlib import Path

PATH = Path('config/cns/corpus-census-activation-v2.json')
data = json.loads(PATH.read_text())
errors = []

def fail(msg):
    errors.append(msg)

if data.get('status') != 'ACTIVATION_ROUTING_CLOSED_FAIL_CLOSED':
    fail('census status is not activation fail-closed')

bootstrap = data.get('bootstrap', {})
required_bootstrap = {
    'entry': '13wCyLsLv0xFHYS1nbAXKqcQux3kz8b48U0pm0bGFhVo',
    'programme_current': '1cK7JK1wXpShtsX0k9FnIqum8lbA98lMppkNK5DJQUO0',
    'knowledge_os_current': '13KGE69cwTP8hm6zjt4xVUgW3ldzfhVxh336QgmBWJVQ',
    'code_current': 'LIVE_GITHUB_ONLY',
}
for k, v in required_bootstrap.items():
    if bootstrap.get(k) != v:
        fail(f'bootstrap {k} expected {v}, got {bootstrap.get(k)}')

objects = data.get('critical_objects', [])
by_id = {}
for obj in objects:
    oid = obj.get('id')
    if not oid:
        fail('critical object missing id')
        continue
    if oid in by_id:
        fail(f'duplicate critical object id {oid}')
    by_id[oid] = obj
    if obj.get('role') in (None, '', 'UNKNOWN'):
        fail(f'critical object {oid} has unknown role')
    if obj.get('sensitivity') not in {'PUBLIC', 'INTERNAL', 'RESTRICTED', 'SECRET'}:
        fail(f'critical object {oid} missing valid sensitivity')

# Exactly one global entry route.
entry = [o for o in objects if o.get('role') == 'CURRENT_ROUTER' and o.get('domain') == 'KNOWLEDGE_OS_ENTRY' and o.get('state') == 'CURRENT']
if len(entry) != 1:
    fail(f'expected exactly one current global entry router, found {len(entry)}')

# Historical CURRENT-labelled surfaces may not be current authority.
for oid in ['14XladRgIy9vCGMCWvuPw37MnCGsa0iJcafyTd2tYKww', '1LROdYfV9tSnYeQ-Q2SYM4QQUutVyL84r7MfaStW4Lbg']:
    obj = by_id.get(oid)
    if not obj:
        fail(f'missing known old current surface {oid}')
    elif obj.get('role') not in {'EXECUTION_HISTORY', 'SUPERSEDED'} or not str(obj.get('state', '')).startswith('SUPERSEDED'):
        fail(f'old current surface {oid} can still compete as current')

# Known supersessions are explicit and point to existing critical object IDs.
for obj in objects:
    nxt = obj.get('superseded_by')
    if nxt and nxt not in by_id:
        fail(f"{obj['id']} supersedes to unknown critical object {nxt}")

old_giga = by_id.get('16bgKXthRS6-RY3ClBK7UVQDI2IKTsWm95sJuMypWavI')
new_giga = by_id.get('14EeZw6XOp4Z-jtlMYI5xx-8TLlyLJMoXr-DypdP7ID8')
if not old_giga or old_giga.get('superseded_by') != '14EeZw6XOp4Z-jtlMYI5xx-8TLlyLJMoXr-DypdP7ID8':
    fail('GIGA v1.0 supersession to v1.1 is not explicit')
if not new_giga or new_giga.get('state') != 'CURRENT_VERSION':
    fail('GIGA v1.1 is not marked current version')

corrupt_atomic = by_id.get('1d5tzqw8YK_v8jiD1WR-bCdiUm9hZVuLLJuNbPRpG4AI')
if not corrupt_atomic or corrupt_atomic.get('state') != 'SUPERSEDED_FAILURE':
    fail('known corrupted Atomic Register is not quarantined as superseded failure')

subtrees = data.get('recursive_subtrees', [])
subtree_ids = set()
for st in subtrees:
    sid = st.get('id')
    if not sid:
        fail('subtree missing id')
        continue
    if sid in subtree_ids:
        fail(f'duplicate subtree id {sid}')
    subtree_ids.add(sid)
    if st.get('role') in (None, '', 'UNKNOWN'):
        fail(f'subtree {sid} has unknown role')
    if not st.get('policy'):
        fail(f'subtree {sid} missing policy')

required_private = {'14ynxxVlEAaDdyl1gRAEOqacHDHbv64Cy', '1xSI2N2Gg4SZY5JIIhLDD8OguQ6o5_ryN', '1WOcCP7zzU-OTJaKIQfuaLrEu1GeawF6D'}
private_ids = {s['id'] for s in subtrees if s.get('role') == 'PRIVATE_RESTRICTED'}
if not required_private.issubset(private_ids):
    fail(f'private/restricted subtree routing incomplete: {sorted(required_private - private_ids)}')

required_nonsemantic = {'1WsG_aNGawEyvXYXn6vokfITPmBhRD7N6', '1MhNsjdS__3xrCOXJTwuqT_OmFIKpxe2P', '1n22pCIJc_NAvtayhN9dJq9S40iPFduUJ', '1ZPvrz8aTTHYshur2EmzoAWqWtHaowOwn'}
for sid in required_nonsemantic:
    st = next((s for s in subtrees if s.get('id') == sid), None)
    if not st or st.get('role') not in {'BACKUP', 'ASSET_CORPUS'}:
        fail(f'non-semantic backup/asset subtree {sid} not quarantined')

# Agent-model output folders are donor/history only.
for sid in ['1PKBCFRGSpgLqN335JbvBV4Onb53ZiNL1','1Ur0j6tfTjoM7odpn5_0PrfFn5z3TGsrG','1ifO_vPtE-yuyyS66z-aNb8Aw-eeuJVe0','11nueBeCFTpNMupNl_AOJICNurBa4dNCx']:
    st = next((s for s in subtrees if s.get('id') == sid), None)
    if not st or st.get('role') != 'DONOR':
        fail(f'agent output subtree {sid} is not fail-closed DONOR')

fallback = data.get('root_fallback', {})
if fallback.get('role') != 'SEMANTIC_QUARANTINE' or fallback.get('authority_competition') != 'FORBIDDEN':
    fail('root fallback is not semantic quarantine with authority forbidden')

# Founder hypotheses must explicitly remain hypotheses, not factual authority.
theses = by_id.get('1F4b-8rYGS4XbgaiSeMq4w76aD4ZioqLsxV4sPvRxMPo')
if not theses or theses.get('truth_rule') != 'HYPOTHESIS_NOT_FACT':
    fail('founder hypotheses register lacks HYPOTHESIS_NOT_FACT rule')

if errors:
    print('CORPUS CENSUS FAIL')
    for e in errors:
        print('-', e)
    raise SystemExit(1)

print('CORPUS CENSUS PASS')
print(f'critical_objects={len(objects)} recursive_subtrees={len(subtrees)} fallback={fallback.get("role")}')
