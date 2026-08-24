import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import { resetAnalyticsConsent } from "@/analytics/Analytics";
import { Section } from "@/components/ui";
import { Reveal } from "@/components/Cinematic";
import { LEGAL_VERSION, OPERATOR } from "@/legal/legal";

const display: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.025em" };
const h: React.CSSProperties = { fontFamily: T.mono, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", color: T.blue };
const copy: React.CSSProperties = { fontSize: "clamp(15px,1.2vw,17px)", color: T.ink, lineHeight: 1.68 };

const SECTIONS: [string, React.ReactNode][] = [
  ["Behandlingsansvarlig", <>{OPERATOR.legalName}, org.nr. {OPERATOR.orgNumber}, {OPERATOR.address}. Kontakt: <a href={`mailto:${OPERATOR.email}`} className="link">{OPERATOR.email}</a>. 4PLANET er produktnavnet som brukes i tjenesten.</>],
  ["Hvilke opplysninger vi behandler", <>Avhengig av hvordan du bruker 4PLANET kan vi behandle konto-ID, e-post, valgfritt navn, land/språk og medlemsrolle; innstillinger og samtykker; Stripe-kunde- og transaksjonsreferanser, beløp, valuta og betalingsstatus; medlemskap og Mission Supporter-status; IMPACT contribution-status og senere partner delivery/evidence/outcome-referanser; henvendelser til support; samt sikkerhets- og revisjonshendelser. 4PLANET skal ikke lagre fullstendige kortnumre eller CVC.</>],
  ["Formål og behandlingsgrunnlag", <><strong>Konto, innlogging, betaling, medlemskap og levering av den tjenesten du ber om:</strong> nødvendig for å inngå eller oppfylle avtale. <strong>Bokføring, skatt og annen lovpålagt dokumentasjon:</strong> nødvendig for å oppfylle rettslige plikter. <strong>Sikkerhet, misbruksforebygging, feilsøking og dokumentasjon av systemintegritet:</strong> vår berettigede interesse i å drive en sikker og etterprøvbar tjeneste, vurdert mot dine rettigheter. <strong>Valgfri produktanalyse og markedsføring:</strong> samtykke der samtykke er påkrevd. Markedsføringssamtykke holdes separat fra konto, betaling og tjenestelevering.</>],
  ["IMPACT og personlig historikk", <>ME4PLANET kan vise hva du har støttet og hva som senere er rapportert om levering og evidens. Økonomisk betaling er en egen sannhetstilstand. Den blir ikke automatisk behandlet eller vist som verifisert økologisk resultat. Personopplysninger skal ikke kopieres inn i økologiske kunnskapsdata når det ikke er nødvendig.</>],
  ["Leverandører og mottakere", <>Vi bruker eller planlegger å bruke Stripe til betaling og fakturering, Supabase til identitet/database, Cloudflare til hosting/sikkerhet og e-postleverandør til autentiseringsmeldinger. Google Analytics kan brukes til valgfri produktanalyse bare etter samtykke. Andre feltpartnere mottar ikke konto- eller betalingsopplysninger med mindre det er nødvendig for den konkrete tjenesten og rettslig/kontraktsmessig avklart. Vi selger ikke personopplysninger til annonsører.</>],
  ["Overføring utenfor EØS", <>Noen leverandører kan behandle data utenfor EØS. Der dette skjer skal overføringen ha et gyldig overføringsgrunnlag, for eksempel beslutning om tilstrekkelig beskyttelsesnivå eller standard personvernbestemmelser, og 4PLANET skal vurdere leverandørens aktuelle behandlings- og underleverandøroppsett før produksjonsbruk.</>],
  ["Hvor lenge vi beholder data", <>Kontoprofil og preferanser beholdes mens kontoen er aktiv og slettes eller anonymiseres når kontoen slettes, med mindre vi har et annet lovlig behov. Support- og sikkerhetsdata skal ikke beholdes lenger enn nødvendig for formålet. Regnskapsmateriale som omfattes av bokføringsreglene beholdes i den lovpålagte perioden; sentralt regnskapsmateriale kan måtte oppbevares i fem år etter regnskapsårets slutt. Samtykkehistorikk beholdes så lenge det er nødvendig for å dokumentere valget og håndtere tilbaketrekking. Valgfri analyse skal ha en definert, begrenset leverandørretensjon før offentlig account/payment launch.</>],
  ["Dine rettigheter", <>Du kan be om innsyn, retting, sletting, begrensning, dataportabilitet der vilkårene er oppfylt, og protestere mot behandling som bygger på berettiget interesse. Du kan trekke tilbake samtykke uten at det påvirker lovligheten av tidligere behandling. Konto-sletting betyr ikke nødvendigvis at lovpålagt regnskapsdokumentasjon kan slettes; slike poster begrenses til det som må beholdes og koblingen til den aktive profilen fjernes eller pseudonymiseres der det er mulig.</>],
  ["Personvernvalg", <><button type="button" onClick={resetAnalyticsConsent} style={{ border: `1px solid ${T.ink}`, background: "transparent", color: T.ink, padding: "9px 12px", cursor: "pointer", font: "inherit" }}>RESET ANALYTICS CHOICE</button><span style={{ display: "block", marginTop: 10, opacity: .72 }}>Valgfri analyse skal ikke lastes før et positivt valg. Avslag og aksept skal presenteres med sammenlignbar visuell vekt. Markedsføring får et eget valg i ME4PLANET.</span></>],
  ["Eksport, sletting og andre forespørsler", <>ME4PLANET bygges med egen privacy centre for eksport, retting og sletting. Inntil selvbetjeningen er aktiv kan du kontakte <a href={`mailto:${OPERATOR.email}`} className="link">{OPERATOR.email}</a>. Ikke send kortnummer, CVC eller passord i e-post.</>],
  ["Sikkerhet og brudd", <>Vi bruker tilgangskontroll, server-side secrets, database Row Level Security, signerte betalingshendelser og revisjonsspor som del av sikkerhetsmodellen. Ved et personvernbrudd vurderer vi risiko, varsling til berørte og melding til Datatilsynet innen lovens frister når vilkårene er oppfylt.</>],
  ["Klage", <>Du kan kontakte oss først for å få saken løst. Du har også rett til å klage til Datatilsynet dersom du mener behandlingen av personopplysningene dine er i strid med personvernregelverket.</>],
  ["Endringer", <>Denne erklæringen har versjon {LEGAL_VERSION}. Vesentlige endringer som påvirker en konto eller løpende avtale skal kommuniseres på en egnet måte. Vi skal ikke bruke allerede innsamlede opplysninger til et uforenlig nytt formål uten nytt rettslig grunnlag.</>],
];

export default function Privacy() {
  return (
    <PublicShell>
      <Seo title="Personvern | 4PLANET" description="Hvordan 4PLANET behandler konto-, betalings-, medlemskaps- og produktdata." path="/privacy" />
      <Section pad="clamp(56px,8vw,110px)">
        <Reveal>
          <div style={{ ...h, marginBottom: 20 }}>PRIVACY · GDPR</div>
          <h1 style={{ ...display, color: T.ink, fontSize: "clamp(30px,4.4vw,56px)", lineHeight: 1.02, maxWidth: 760 }}>Personvern som del av produktet.</h1>
          <p style={{ ...copy, marginTop: 20, maxWidth: 720, opacity: .72 }}>Vi samler bare det som trengs for den funksjonen du bruker, holder betaling adskilt fra økologisk resultat, og bygger ME4PLANET slik at du kan se og styre dine egne data.</p>
        </Reveal>
        <div style={{ marginTop: "clamp(40px,6vw,72px)", display: "grid", gap: "clamp(28px,4vw,44px)", maxWidth: 820 }}>
          {SECTIONS.map(([title, body]) => (
            <Reveal key={title}>
              <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 18 }}>
                <div style={h}>{title}</div>
                <div style={{ ...copy, marginTop: 12 }}>{body}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <div style={{ marginTop: "clamp(40px,5vw,64px)", display: "flex", gap: 18, flexWrap: "wrap" }}>
          <Link to="/legal/terms" className="link" style={{ fontSize: 14, color: T.blue }}>Vilkår</Link>
          <Link to="/legal/payments" className="link" style={{ fontSize: 14, color: T.blue }}>Betaling og angrerett</Link>
          <Link to="/me" className="link" style={{ fontSize: 14, color: T.blue }}>ME4PLANET</Link>
        </div>
      </Section>
    </PublicShell>
  );
}
