# PAYMENTS PUBLIC LIVE MODEL 02

**STATUS:** FOUNDER-APPROVED EXPANDED MODEL / STRIPE LIVE OBJECTS MATERIALISED / SITE RELEASE GATED  
**DATE:** 24 AUG 2026  
**RECEIVER / SELLER:** SKOG COMMUNICATIONS AS · org.nr. 923 003 789  
**CURRENT VAT STATE:** not registered in the Norwegian VAT Register; exact tax/accounting treatment remains transaction-class specific and must not be guessed.

## PUBLIC MONEY MODEL

- ME4PLANET / 4PEOPLE participation: FREE. Payment is never required just to belong.
- SUPPORT 4PLANET: NOK 50/month recurring.
- Supporting Member: NOK 100/month recurring; optional and separate from free participation.
- Mission Supporter: NOK 100/month recurring for each of the 16 canonical Missions.
- Tree IMPACT pathway contribution: NOK 100 one-time. Contribution only; not a delivered tree claim.
- Plastic IMPACT pathway contribution: NOK 100 one-time. Contribution only; not a collected-kilogram claim.
- Coral IMPACT pathway contribution: NOK 100 one-time. Contribution only; not an outplanted-coral or reef-restoration claim.
- Rewild IMPACT pathway contribution: NOK 100 one-time. Contribution only; not a restored-area or ecological-outcome claim.
- Project Sponsor: intended NOK 50,000–250,000. Public slider → enquiry → agreement → reviewed draft Stripe Invoice → hosted invoice payment.
- Mission Sponsor: intended NOK 250,000–750,000. Public slider → enquiry → agreement → reviewed draft Stripe Invoice → hosted invoice payment.
- Sponsor Package: intended NOK 100,000–500,000. Public slider → enquiry → agreement → reviewed draft Stripe Invoice → hosted invoice payment.
- Pilot / Funder: intended NOK 100,000–300,000. Public slider → enquiry → agreement → reviewed draft Stripe Invoice → hosted invoice payment.
- Founding Patron: intended NOK 250,000–1,500,000. Public slider → enquiry → agreement → reviewed draft Stripe Invoice → hosted invoice payment.

## WHY IMPACT IS A CONTRIBUTION FIRST

The Founder direction is to make every payment type publicly available now. The safe way to do that before partner-backed ecological units are contractually ready is to sell a truthful **pathway contribution**, not a fictional delivered unit.

A Stripe payment can establish financial truth only. A Tree, Plastic, Coral or Rewild pathway can graduate from CONTRIBUTION to a defined ecological unit only after the real partner, economics, allocation rule, delivery conditions, evidence, claims policy, double-counting controls and remedy path are configured. No UI wording or webhook may skip that gate.

## LIVE STRIPE OBJECTS

Self-service Checkout:
- SUPPORT 4PLANET: `4p_support_live` / `price_1U84WtPd4O2xtXFRU60ePdoZ`
- Supporting Member: `4p_membership_live` / `price_1U85CxPd4O2xtXFR8VpbdqHk`
- Tree contribution: `4p_impact_tree_live` / `price_1U85DSPd4O2xtXFRP0mtFTRw`
- Plastic contribution: `4p_impact_plastic_live` / `price_1U85DbPd4O2xtXFRgkhyKfXe`
- Coral contribution: `4p_impact_coral_live` / `price_1U85DlPd4O2xtXFRgsxxhMcy`
- Rewild contribution: `4p_impact_rewild_live` / `price_1U85DvPd4O2xtXFRcqBEq2EH`

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

Negotiated LIVE product records have no default price because the exact agreed amount is written to a reviewed Stripe Invoice:
- `4p_project_sponsor_live`
- `4p_mission_sponsor_live`
- `4p_sponsor_package_live`
- `4p_b2b_pilot_funder_live`
- `4p_founding_patron_live`

## PAYMENT ARCHITECTURE

Normal self-service uses Stripe-hosted Checkout. Recurring support uses Stripe Billing and Stripe Customer Portal. Negotiated high-value payments use an exact draft Invoice, human review, then Stripe Hosted Invoice Page. Browser code never chooses a Stripe Price ID or arbitrary high-value charge amount.

Webhook events are signed and idempotent. The durable ledger stores financial state only and uses Stripe provider event time so an older retry cannot overwrite a newer financial state.

## TRUTH / SAFETY LAW

PAYMENT ≠ DELIVERY ≠ EVIDENCE ≠ OUTCOME.

No public price, payment state or Stripe event may become ecological delivery or outcome truth. LIVE checkout remains behind server-side release flags. LIVE webhook processing fails closed if the durable financial ledger is unavailable.

## RELEASE GATES

1. Exact candidate passes typecheck, production build, smoke/contracts, browser/mobile and security gates.
2. Stripe commerce migration + ordered projection function is applied and read back on the operational Supabase project.
3. Cloudflare has server-only LIVE Stripe + webhook + Supabase secrets; no secret enters client or repository.
4. LIVE Stripe webhook points to the deployed `/api/stripe/webhook` and signed events persist correctly.
5. Stripe Customer Portal is configured for subscription cancellation/self-service; revenue-recovery defaults are configured.
6. Seller/legal pages, recurring terms, privacy and withdrawal information are visible on the deployed candidate.
7. Negotiated sponsor/pilot invoices retain human review of consideration, tax/VAT, counterparty and agreement before sending.
8. TEST lifecycle proves successful Checkout, subscription, failed-payment/cancellation states, webhook ledger, exact invoice draft and refund/dispute handling.
9. Minimal real-money canary proves payment → webhook → ledger → receipt → cancellation/refund/reconciliation before broad promotion.
