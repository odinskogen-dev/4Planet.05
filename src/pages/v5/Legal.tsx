import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import { Section } from "@/components/ui";
import { Reveal } from "@/components/Cinematic";
import { T } from "@/styles/tokens";
import { LEGAL_VERSION, OPERATOR } from "@/legal/legal";

const display: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.025em" };
const eyebrow: React.CSSProperties = { fontFamily: T.mono, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", color: T.blue };
const copy: React.CSSProperties = { fontSize: "clamp(15px,1.2vw,17px)", color: T.ink, lineHeight: 1.68 };

function Frame({ title, label, children, path }: { title: string; label: string; children: React.ReactNode; path: string }) {
  return (
    <PublicShell>
      <Seo title={`${title} | 4PLANET`} description={`${title} for 4PLANET services operated by ${OPERATOR.legalName}.`} path={path} />
      <Section pad="clamp(56px,8vw,110px)">
        <Reveal>
          <div style={{ ...eyebrow, marginBottom: 20 }}>{label}</div>
          <h1 style={{ ...display, color: T.ink, fontSize: "clamp(32px,4.4vw,58px)", lineHeight: 1.02, maxWidth: 780 }}>{title}</h1>
          <p style={{ ...copy, marginTop: 20, maxWidth: 760, opacity: .74 }}>
            Gjelder fra {LEGAL_VERSION}. Selger og behandlingsansvarlig for betalingstjenestene er {OPERATOR.legalName}, org.nr. {OPERATOR.orgNumber}, {OPERATOR.address}.
          </p>
        </Reveal>
        <div style={{ marginTop: "clamp(42px,6vw,72px)", maxWidth: 820 }}>{children}</div>
        <div style={{ marginTop: 48, display: "flex", gap: 18, flexWrap: "wrap" }}>
          <Link to="/privacy" className="link" style={{ color: T.blue }}>Personvern</Link>
          <Link to="/legal/payments" className="link" style={{ color: T.blue }}>Betaling og angrerett</Link>
          <Link to="/me" className="link" style={{ color: T.blue }}>ME4PLANET</Link>
        </div>
      </Section>
    </PublicShell>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <section style={{ borderTop: `1px solid ${T.line}`, padding: "20px 0 34px" }}>
        <div style={eyebrow}>{title}</div>
        <div style={{ ...copy, marginTop: 12 }}>{children}</div>
      </section>
    </Reveal>
  );
}

export function Terms() {
  return (
    <Frame title="Vilkår for 4PLANET" label="LEGAL · TERMS" path="/legal/terms">
      <Block title="1 · Hvem du handler med">
        <p>{OPERATOR.legalName}, org.nr. {OPERATOR.orgNumber}, {OPERATOR.address}. Kontakt: <a href={`mailto:${OPERATOR.email}`} className="link">{OPERATOR.email}</a>.</p>
        <p>4PLANET er produkt- og merkenavnet som brukes i tjenesten. Avtalen inngås med selskapet over med mindre en konkret avtale uttrykkelig oppgir en annen juridisk part.</p>
      </Block>
      <Block title="2 · Pris og MVA">
        <p>Prisen som vises umiddelbart før betaling er totalprisen for den aktuelle bestillingen. {OPERATOR.legalName} er per denne versjonen ikke registrert i Merverdiavgiftsregisteret. Dersom avgiftsstatus eller avgiftsbehandling endres, skal tilbudet og prisinformasjonen oppdateres før berørte kjøp åpnes.</p>
      </Block>
      <Block title="3 · Hva en betaling betyr">
        <p>Betalingstyper holdes juridisk og faktisk adskilt. Support, medlemskap, Mission Supporter, sponsoravtaler og IMPACT-bidrag er ikke det samme produktet.</p>
        <p>For IMPACT gjelder en særlig sannhetsgrense: betaling dokumenterer en økonomisk contribution. Betaling alene dokumenterer aldri partnerleveranse, bevis eller økologisk resultat. Disse vises som separate tilstander når de faktisk foreligger.</p>
      </Block>
      <Block title="4 · Gjentakende betalinger">
        <p>For medlemskap og andre gjentakende avtaler skal beløp, intervall og at avtalen fornyes vises tydelig før bestilling. Du kan stoppe fremtidige fornyelser via ME4PLANET/Stripe Customer Portal når dette er aktivert, eller ved å kontakte oss. Oppsigelse skal ikke gjøres unødvendig vanskelig.</p>
      </Block>
      <Block title="5 · Betalingsleverandør">
        <p>Kort- og betalingsopplysninger behandles av Stripe i Stripes betalingsflate. 4PLANET skal ikke motta eller lagre fullstendige kortopplysninger. 4PLANET lagrer den økonomiske statusen som er nødvendig for kvittering, medlemskap, bokføring, kundeservice og eventuell IMPACT-oppfølging.</p>
      </Block>
      <Block title="6 · Feil, refusjon og tvist">
        <p>Hvis en betaling er duplisert, feilbelastet eller ikke kan leveres i henhold til vilkårene, skal saken undersøkes og korrigeres. Refusjon endrer ikke historikken ved å slette den opprinnelige transaksjonen; status registreres separat for etterprøvbarhet.</p>
      </Block>
      <Block title="7 · Ufravikelige rettigheter">
        <p>Disse vilkårene begrenser ikke rettigheter du har etter ufravikelig norsk forbrukerlovgivning. Der en konkret produktside eller avtale gir bedre rettigheter enn disse generelle vilkårene, gjelder den bedre retten.</p>
      </Block>
    </Frame>
  );
}

export function PaymentRights() {
  return (
    <Frame title="Betaling, oppsigelse og angrerett" label="LEGAL · CONSUMER" path="/legal/payments">
      <Block title="Før du betaler">
        <p>Umiddelbart før en forbrukerbetaling skal 4PLANET vise hva du kjøper eller støtter, total pris, om betalingen gjentas, hvem avtalen inngås med, relevant leveringstid, oppsigelse/refusjon og opplysninger om angrerett. Betalingsknappen skal tydelig angi at bestillingen medfører betalingsplikt.</p>
      </Block>
      <Block title="14 dagers sikkerhetsregel">
        <p>For forbrukertransaksjoner anvender 4PLANET som utgangspunkt en 14 dagers kansellerings-/refusjonsperiode der ikke andre ufravikelige regler gir en annen rett. Vi skal ikke basere oss på bortfall av angrerett ved tidlig levering med mindre du i den konkrete transaksjonen uttrykkelig ber om tidlig oppstart og erkjenner den rettslige virkningen.</p>
      </Block>
      <Block title="IMPACT">
        <p>Et IMPACT-kjøp er først en økonomisk contribution. Partner delivery, evidence og ecological outcome er egne steg. Der en partnerallokering kan bli irreversibel, skal vilkårene for tidspunkt og refusjon være avklart før det aktuelle produktet åpnes for publikum.</p>
      </Block>
      <Block title="Medlemskap og Mission Supporter">
        <p>Du skal se gjentakende pris og betalingsintervall før bestilling. Du kan stoppe fremtidige fornyelser uten unødvendige hindre. Oppsigelse av fremtidige trekk er noe annet enn eventuell angrerett/refusjon for en betaling som allerede er gjennomført.</p>
      </Block>
      <Block title="Slik bruker du rettighetene dine">
        <p>Bruk ME4PLANET når selvbetjeningen er aktiv, eller kontakt <a href={`mailto:${OPERATOR.email}`} className="link">{OPERATOR.email}</a>. Oppgi e-postadressen som ble brukt ved kjøpet og nok informasjon til at vi kan finne transaksjonen. Ikke send kortnummer eller sikkerhetskode.</p>
      </Block>
      <Block title="Standard angreskjema">
        <p>Du kan også gi en entydig melding om at du ønsker å gå fra avtalen. Vi vil før offentlig forbrukerlansering gjøre standard angreskjema tilgjengelig sammen med avtaleinformasjonen på varig medium.</p>
      </Block>
    </Frame>
  );
}
