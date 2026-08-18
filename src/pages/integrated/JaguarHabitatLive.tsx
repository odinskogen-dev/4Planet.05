import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { speciesBySlug } from "@/data/species";
import { useFollows } from "@/planet/follow";
import { contextHref } from "@/product/ProductNav";
import { withReturnTo } from "@/product/productContext";
import "@/styles/jaguar-habitat.css";

type Node = { id:string; name:string; sci:string; type:string; text:string; boundary:string };

const facts = [
  ["COMMON NAME","Jaguar","Panthera onca"],
  ["FAMILY","Felidae","Genus Panthera · Order Carnivora"],
  ["CONSERVATION","Near Threatened","IUCN global assessment · decreasing trend"],
  ["POPULATION","No single global count","Fragmented and unevenly known"],
  ["RANGE","Mexico → northern Argentina","Large strongholds remain in connected landscapes"],
  ["HABITAT","Forest · wetland · savanna","Often associated with water and dense cover"],
  ["WEIGHT","≈36–158 kg","Reference range; sex and geography matter"],
  ["HEAD–BODY","≈1.1–1.85 m","Reference range; individuals vary"],
  ["LIFESPAN","≈12–15 years wild","Approximate reference range"],
  ["ROLE","Apex predator","Part of diverse local food webs"],
] as const;

const nodes: Node[] = [
  { id:"capybara", name:"Capybara", sci:"Hydrochoerus hydrochaeris", type:"PREY · SPECIES NODE", text:"A large semi-aquatic rodent around rivers and wetlands. Jaguars hunt capybara in some landscapes.", boundary:"Its importance as prey varies by place, season and individual jaguar." },
  { id:"peccary", name:"Peccaries", sci:"Tayassuidae", type:"PREY · GROUP NODE", text:"Forest and woodland mammals that can form an important part of jaguar diets where they occur.", boundary:"A prey-group relationship, not a statement about every jaguar population." },
  { id:"caiman", name:"Caiman", sci:"Caiman spp.", type:"PREY · GROUP NODE", text:"Jaguars are unusually comfortable around water and can prey on caimans in wetland and river systems.", boundary:"Species and frequency vary geographically; not a universal diet statement." },
  { id:"habitat", name:"Connected habitat", sci:"Forest · wetland · corridors", type:"HABITAT DEPENDENCY", text:"Large connected habitats can support movement, prey access and gene flow across jaguar populations.", boundary:"Connectivity needs are landscape-specific and require local evidence." },
];

const pressures = [
  ["KNOWN PRESSURE FAMILY","Habitat loss & fragmentation","Conversion and fragmentation can reduce connected habitat, isolate populations and increase edge conflict."],
  ["KNOWN PRESSURE FAMILY","Prey depletion","Loss of wild prey can weaken local food webs and increase encounters with livestock."],
  ["KNOWN PRESSURE FAMILY","Conflict & retaliatory killing","Jaguars may be killed after livestock losses or perceived risk; intensity varies strongly by place."],
  ["RESPONSE FAMILY · NOT 4PLANET DELIVERY","Connectivity + coexistence","Potential responses include connected habitat, prey protection, lower livestock vulnerability, monitoring and effective enforcement."],
] as const;

export function JaguarHabitatLivePage(){
  const profile=speciesBySlug("jaguar");
  const location=useLocation();
  const {following,toggle}=useFollows();
  const [node,setNode]=useState<Node>(nodes[0]);
  const [shareState,setShareState]=useState("SHARE");
  useEffect(()=>{document.body.classList.add("jaguar-habitat-active");return()=>document.body.classList.remove("jaguar-habitat-active")},[]);
  if(!profile) return null;
  const watched=following(profile.id);
  const atlas=contextHref("/atlas",location.search,{entity:profile.id,journey:"amazonia"});
  const living=withReturnTo("/living-systems",location.search);
  async function share(){try{const url=window.location.href;if(navigator.share)await navigator.share({title:"Jaguar — 4PLANET SPECIES_",text:"Explore the jaguar inside its living system.",url});else{await navigator.clipboard.writeText(url);setShareState("LINK COPIED");setTimeout(()=>setShareState("SHARE"),1800)}}catch{setShareState("SHARE")}}
  return <PublicShell><main className="jaguar-world">
    <section className="jg-hero" aria-labelledby="jaguar-title">
      <img className="jg-hero__image" src="/assets/species/jaguar/SP-005.jpg" alt="A wild jaguar in the Pantanal" fetchPriority="high"/>
      <div className="jg-hero__veil"/><div className="jg-hero__scan"/>
      <nav className="jg-rail jg-mono" aria-label="Jaguar lenses"><Link to={atlas}>SEE / ATLAS →</Link><span className="active">MEET / SPECIES</span><Link to={living}>UNDERSTAND / WEB →</Link><Link to="/missions/am4zonia">ACT / AM4ZONIA →</Link></nav>
      <div className="jg-hero__content"><div>
        <div className="jg-kicker jg-mono">4PLANET SPECIES_ · E4RTH_ · HABITAT MODE 01</div>
        <h1 id="jaguar-title">Jaguar</h1><div className="jg-latin">Panthera onca</div>
        <p className="jg-lede">Meet the largest cat native to the Americas inside the habitats, prey relationships and pressures that shape its life.</p>
        <div className="jg-actions"><a className="jg-action primary jg-mono" href="#identity">ENTER SPECIES WORLD ↓</a><a className="jg-action jg-mono" href="#food-web">OPEN FOOD WEB ↓</a><button className="jg-action subtle jg-mono" type="button" title="Rights-verified video is queued for lazy-loaded hero mode" disabled>SEE IT MOVE · NEXT</button></div>
      </div><aside className="jg-hero__meta jg-mono"><div className="jg-meta-row"><span>WORLD</span><b>E4RTH_</b></div><div className="jg-meta-row"><span>SYSTEM</span><b>TROPICAL FOREST / WETLAND</b></div><div className="jg-meta-row"><span>TAXON</span><b>GBIF 5219426 · ACCEPTED</b></div><div className="jg-meta-row"><span>MEDIA</span><b>STILL 01 · VIDEO QUEUED</b></div><div className="jg-meta-row"><span>TRUTH MODE</span><b>SOURCES + BOUNDARIES</b></div></aside></div>
      <div className="jg-hero__credit jg-mono">WILD PANTANAL JAGUAR · FLICKR / WIKIMEDIA COMMONS · CC BY 2.0 · ILLUSTRATIVE SPECIES MEDIA, NOT AMAZON OCCURRENCE EVIDENCE</div>
    </section>

    <section className="jg-section" id="identity"><div className="jg-wrap"><div className="jg-eyebrow jg-mono">01 · IDENTITY / SPECIES CARD EXPANDED</div><h2>Know the animal before the abstraction.</h2><p className="jg-standfirst">A modern species profile should answer the basic human questions immediately, then let a researcher, teacher or curious visitor move deeper into taxonomy, evidence, place and relationships without losing the animal itself.</p><div className="jg-facts">{facts.map(([k,v,n])=><article className="jg-fact" key={k}><div className="jg-fact__k jg-mono">{k}</div><div className="jg-fact__v">{v}</div><div className="jg-fact__note jg-mono">{n}</div></article>)}</div><p className="jg-source jg-mono">REFERENCE LAYER · TAXON IDENTITY: <a href="https://www.gbif.org/species/5219426" target="_blank" rel="noreferrer">GBIF ↗</a> · CONSERVATION / RANGE CONTEXT: IUCN / PANTHERA · SIZE AND LIFESPAN ARE GENERAL REFERENCE RANGES, NOT VALUES FOR EVERY INDIVIDUAL.</p></div></section>

    <section className="jg-habitat"><img src="/assets/missions/am4zonia/hero.jpg" alt="Dense tropical rainforest and water in the AM4ZONIA visual world" loading="lazy"/><div className="jg-habitat__veil"/><div className="jg-habitat__copy"><div className="jg-eyebrow jg-mono">02 · HABITAT / AMAZONIA</div><h2>Do not show a species without its world.</h2><p className="jg-standfirst">The Amazon is only one part of the jaguar’s range, but it holds some of the largest remaining connected habitat. Forest structure, water, prey and landscape connectivity matter together.</p><p className="jg-source jg-mono">4PLANET AM4ZONIA_ HABITAT ASSET · ILLUSTRATIVE HABITAT CONTEXT · NOT A JAGUAR OCCURRENCE RECORD.</p></div></section>

    <section className="jg-section" id="food-web"><div className="jg-wrap"><div className="jg-eyebrow jg-mono">03 · LIVING SYSTEMS / FOOD WEB PROTOTYPE</div><h2>A predator is a network of relationships.</h2><p className="jg-standfirst">Click a node to understand the relationship. This is the first human-facing preview of a traversable Species × Living Systems model: a valid prey node can later open a Species Card, a complete profile, Atlas context and the next links in the food web.</p><div className="jg-web-layout"><div className="jg-web" aria-label="Jaguar food web preview"><span className="jg-link jg-link--1"/><span className="jg-link jg-link--2"/><span className="jg-link jg-link--3"/><span className="jg-link jg-link--4"/><div className="jg-node jg-node--center"><strong>Jaguar</strong><small className="jg-mono">PANTHERA ONCA · PREDATOR</small></div>{nodes.map((n,i)=><button key={n.id} type="button" className={`jg-node jg-node--${["a","b","c","d"][i]} ${node.id===n.id?"active":""}`} onClick={()=>setNode(n)}><strong>{n.name}</strong><small className="jg-mono">{n.type}</small></button>)}</div><aside className="jg-node-card" aria-live="polite"><div className="jg-node-card__type jg-mono">{node.type}</div><h3>{node.name}</h3><em>{node.sci}</em><p>{node.text}</p><p className="jg-source jg-mono">BOUNDARY · {node.boundary}</p><div className="jg-node-card__next jg-mono">NEXT · NODE → SPECIES CARD → FULL PROFILE → ATLAS → FOLLOW / SAVE / SHARE</div></aside></div></div></section>

    <section className="jg-animal-scene"><div className="jg-animal-scene__image"><img src="/assets/species/jaguar/SP-005.jpg" alt="Wild jaguar — alternate crop for close study" loading="lazy"/></div><div className="jg-animal-scene__copy"><div className="jg-eyebrow jg-mono">04 · SEE THE ANIMAL / MEDIA LAYER</div><h2>Seeing is part of learning.</h2><p className="jg-standfirst">Study the animal as an animal — build, markings, posture and habitat — then open sound and video only when requested. Rich media should deepen understanding without making the page heavy.</p><p className="jg-source jg-mono">SAME RIGHTS-VERIFIED JAGUAR AS HERO · ALTERNATE CROP · VIDEO HOOK IS RESERVED FOR A VERIFIED, LAZY-LOADED ASSET IN THE NEXT MEDIA PASS.</p></div></section>

    <section className="jg-section"><div className="jg-wrap"><div className="jg-eyebrow jg-mono">05 · PRESSURES → RESPONSE FAMILIES</div><h2>Understanding should lead somewhere.</h2><p className="jg-standfirst">Pressure should connect an ecological mechanism to places, actors and possible responses — without turning uncertainty into a generic warning.</p><div className="jg-pressure-grid">{pressures.map(([s,t,x])=><article className="jg-pressure" key={t}><div className="jg-pressure__state jg-mono">{s}</div><h3>{t}</h3><p>{x}</p></article>)}</div><p className="jg-source jg-mono">TRUTH BOUNDARY · GENERAL PRESSURE / RESPONSE FAMILIES. NOT A 4PLANET DELIVERY CLAIM, UNIVERSAL JAGUAR DIAGNOSIS OR LOCAL MANAGEMENT PRESCRIPTION.</p></div></section>

    <section className="jg-section"><div className="jg-wrap"><div className="jg-eyebrow jg-mono">06 · CONTINUE THROUGH ONE INTERFACE</div><h2>The animal is an entry point, not a dead end.</h2><div className="jg-lenses"><Link to={atlas}><small className="jg-mono">SEE / EXPLORE</small><strong>Find the jaguar in ATLAS →</strong></Link><Link to={living}><small className="jg-mono">UNDERSTAND</small><strong>Follow its Living Systems web →</strong></Link><Link to="/missions/am4zonia"><small className="jg-mono">ACT / LEARN</small><strong>Enter AM4ZONIA_ →</strong></Link></div><div className="jg-actions"><button className={`jg-action ${watched?"primary":""} jg-mono`} type="button" onClick={()=>toggle({id:profile.id,type:"TAXON",label:profile.commonName,sub:profile.scientificName})}>{watched?"FOLLOWING JAGUAR":"FOLLOW JAGUAR"}</button><button className="jg-action subtle jg-mono" type="button" onClick={share}>{shareState}</button><Link className="jg-action subtle jg-mono" to={contextHref("/species",location.search)}>BACK TO SPECIES INDEX</Link></div></div></section>
    <footer className="jg-footer jg-mono"><span>4PLANET SPECIES_ · JAGUAR · PANTHERA ONCA · E4RTH_ HABITAT WORLD v1</span><span>PUBLIC PROTOTYPE · SOURCES / LIMITS VISIBLE · NO DELIVERY OR IMPACT CLAIM</span></footer>
  </main></PublicShell>
}
