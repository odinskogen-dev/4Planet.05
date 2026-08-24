# PAYMENTS LIVE MODEL 01

**STATUS:** FOUNDER-APPROVED MODEL / IMPLEMENTED IN STRIPE LIVE / SITE RELEASE GATED  
**DATE:** 24 AUG 2026  
**RECEIVER / SELLER:** SKOG COMMUNICATIONS AS · org.nr. 923 003 789  
**CURRENT VAT STATE:** not registered in the Norwegian VAT Register; tax/accounting classification remains a human release gate.

## PUBLIC MONEY MODEL

- ME4PLANET / 4PEOPLE participation: FREE. No Stripe product required.
- SUPPORT 4PLANET: NOK 50/month recurring.
- Mission Supporter: NOK 100/month recurring for each of the 16 canonical Missions.
- Project Sponsor: intended NOK 50,000–250,000. Public slider only → enquiry → agreement → reviewed draft Stripe Invoice.
- Mission Sponsor: intended NOK 250,000–750,000. Public slider only → enquiry → agreement → reviewed draft Stripe Invoice.
- Founding Patron: intended NOK 250,000–1,500,000. Primarily private patron/philanthropic/family-office support; public slider only → enquiry → agreement → reviewed draft Stripe Invoice.

## NOT RELEASED

- Separate paid Membership: retired from the launch model; free participation is the account/member layer.
- Generic Sponsor Package: retired; sponsorship must identify Project or Mission and written consideration.
- Paid Pilot / normal pilot: not a public product. Custom B2B work requires exact scope/deliverables before any invoice.
- Tree / Plastic / Coral / Rewild IMPACT: no LIVE payment until real implementation partner, exact unit, economics, delivery conditions, proof, claim policy, no-double-counting, refund/remedy and legal/founder gates are complete.

## LIVE STRIPE OBJECTS

SUPPORT 4PLANET: `4p_support_live` / `price_1U84WtPd4O2xtXFRU60ePdoZ`.

Mission Supporters:
- CLE4N_: `price_1U84X1Pd4O2xtXFRU92oXY75`
- WH4LES_: `price_1U84X9Pd4O2xtXFRJB13EXTC`
- COR4L_: `price_1U84XHPd4O2xtXFRKHhsezW7`
- RE:WILD_ Marine: `price_1U84XOPd4O2xtXFRi5nptElC`
- CLIM4TE_: `price_1U84XXPd4O2xtXFRTNXyT1GR`
- AM4ZONIA_: `price_1U84XhPd4O2xtXFRgXgQsHMp`
- SPECIES_: `price_1U84XpPd4O2xtXFRRJqxLPQk`
- RE:WILD_ Land: `price_1U84XxPd4O2xtXFRU4Sp5Ucz`
- FOOD_: `price_1U84Y5Pd4O2xtXFRAgEC3H96`
- EN4RGY_: `price_1U84YEPd4O2xtXFRPZuyCJLy`
- CIRCULAR CITY_: `price_1U84YMPd4O2xtXFReb5j9CSk`
- F4SHION_: `price_1U84YUPd4O2xtXFRta3M36cH`
- M4GAZINE_: `price_1U84YcPd4O2xtXFRcSbPY6E0`
- 4RT_: `price_1U84YjPd4O2xtXFRVADbljiW`
- 4FILM_: `price_1U84YtPd4O2xtXFRvKXXfeFy`
- 4PLAY_: `price_1U84Z1Pd4O2xtXFRehIgZzg8`

Negotiated LIVE products have no default price and no public Checkout:
- `4p_project_sponsor_live`
- `4p_mission_sponsor_live`
- `4p_founding_patron_live`

## TRUTH / SAFETY LAW

PAYMENT ≠ DELIVERY ≠ EVIDENCE ≠ OUTCOME.

No public price, payment state or Stripe event may become ecological delivery or outcome truth. LIVE checkout remains behind server-side release flags. LIVE financial webhook processing fails closed if the durable ledger is unavailable.

## RELEASE GATES

1. Exact code candidate passes typecheck, build, smoke/contracts, browser/mobile and security gates.
2. Stripe commerce migration + ordered projection function applied and read back on hosted Supabase.
3. Cloudflare has server-only LIVE Stripe + webhook + Supabase secrets; no secret enters client or repository.
4. LIVE Stripe webhook created against the deployed `/api/stripe/webhook` and signed events persist correctly.
5. Stripe Customer Portal configured for subscription cancellation/self-service.
6. Seller/legal pages, recurring terms, privacy and withdrawal information visible on deployed candidate.
7. Accountant confirms bookkeeping/VAT classification for Support, Mission Supporter, Project Sponsor, Mission Sponsor and Founding Patron.
8. Full TEST lifecycle passes: successful subscription, failed payment, cancellation, webhook ledger, invoice draft, refund/dispute handling where applicable.
9. Founder-authorised minimal real-money canary on SUPPORT 4PLANET only; verify payment → webhook → ledger → receipt → cancellation/refund/reconciliation before broader opening.
