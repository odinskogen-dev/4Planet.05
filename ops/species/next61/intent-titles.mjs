/**
 * Hand-authored, intent-aware titles for 61 individual 4SPECIES pages.
 * Only modifies SEO document metadata after the original Claude V53 build,
 * never the visual component, scientific names or other 39 existing pages.
 * Intents are editorial hypotheses, NOT measured keyword volume claims.
 */
import fs from "node:fs";
import path from "node:path";
const intents={
 "red-panda":"Bamboo diet, habitat and forest life",
 "koala":"Eucalyptus diet and life in the wild",
 "quokka":"Why quokkas smile and where they live",
 "capybara":"Size, swimming and social behaviour",
 "snow-leopard":"Mountain habitat and conservation",
 "clouded-leopard":"Tree climbing and rainforest life",
 "red-fox":"Habitat, diet and remarkable adaptability",
 "fennec-fox":"Desert survival and enormous ears",
 "meerkat":"Family groups and sentinel behaviour",
 "ring-tailed-lemur":"Social life and Madagascar habitat",
 "brown-throated-sloth":"Slow movement and rainforest life",
 "giant-anteater":"How its tongue and claws work",
 "chinese-pangolin":"Scales, diet and conservation",
 "giant-otter":"Amazon rivers and family life",
 "sea-otter":"Tool use, kelp forests and survival",
 "walrus":"Tusks, whiskers and Arctic habitat",
 "narwhal":"The spiral tusk and Arctic life",
 "beluga-whale":"Communication and Arctic habitats",
 "dugong":"Seagrass diet and coastal conservation",
 "west-indian-manatee":"Habitat, diet and threats in the wild",
 "platypus":"Eggs, venom and electroreception",
 "common-wombat":"Burrows and cube-shaped droppings",
 "tasmanian-devil":"Conservation and facial tumour disease",
 "snowy-owl":"Arctic habitat, hunting and migration",
 "common-kingfisher":"Diving, fish and river habitats",
 "secretary-bird":"How it hunts snakes in grasslands",
 "toco-toucan":"The enormous beak and forest life",
 "scarlet-macaw":"Colourful plumage and rainforest life",
 "peregrine-falcon":"Fast diving and aerial hunting",
 "indian-peafowl":"Why peacocks spread their feathers",
 "greater-flamingo":"Why flamingos are pink",
 "axolotl":"Regeneration and its wild habitat",
 "komodo-dragon":"Size, hunting and Indonesian islands",
 "king-cobra":"Snake-hunting and forest habitat",
 "reticulated-python":"Length, constriction and habitat",
 "saltwater-crocodile":"Size, hunting and coastal life",
 "panther-chameleon":"Colour change and Madagascar habitat",
 "leopard-gecko":"Spotted skin, tail and natural habitat",
 "golden-poison-frog":"How poison defence works in the wild",
 "western-santa-cruz-tortoise":"Life on the Galápagos Islands",
 "ocellaris-clownfish":"The fish–anemone partnership",
 "ocean-sunfish":"Size, strange shape and ocean life",
 "great-hammerhead":"Why hammerhead sharks have wide heads",
 "giant-manta-ray":"Size, feeding and ocean migrations",
 "electric-eel":"How electric fish generate shocks",
 "tiger-shark":"Diet, striped skin and ocean habitat",
 "long-snouted-seahorse":"Why male seahorses carry young",
 "zebrafish":"Striped freshwater fish and science",
 "greater-blue-ringed-octopus":"Blue rings, venom and reef habitat",
 "giant-pacific-octopus":"Intelligence, camouflage and size",
 "coconut-crab":"Giant claws and island ecology",
 "japanese-spider-crab":"Enormous leg span and deep-sea life",
 "peacock-mantis-shrimp":"Powerful strikes and extraordinary eyes",
 "atlas-moth":"Giant wings and tropical life",
 "orchid-mantis":"Flower mimicry and ambush hunting",
 "peacock-spider":"Colourful dancing and courtship",
 "emperor-scorpion":"Body armour and rainforest habitat",
 "venus-flytrap":"How its traps catch insects",
 "titan-arum":"Why the corpse flower smells",
 "giant-sequoia":"Size, age and fire ecology",
 "dragon-blood-tree":"Socotra habitat and red resin"
};
const root=process.env.SPECIES_DIST||"dist";
const seedDir=process.env.SPECIES_DATA_DIR||"public/species-data/v1";
const release=process.env.SPECIES_REPORT_DIR||"reports/species-next61";
const esc=s=>s.replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;");
const stats={expected:61,updated:0,skippedMissing:[],titles:[],errors:[]};
for(const [slug,intent] of Object.entries(intents)){
 const htmlFile=path.join(root,slug,"index.html");
 const dataFile=path.join(seedDir,slug+".json");
 if(!fs.existsSync(htmlFile)||!fs.existsSync(dataFile)){stats.skippedMissing.push(slug);continue;}
 const p=JSON.parse(fs.readFileSync(dataFile,"utf8"));
 if(p.slug!==slug)throw Error("Incorrect species ID "+slug);
 const rawTitle=p.identity.commonName+": "+intent+" | SPECIES";
 const title=esc(rawTitle);
 if(rawTitle.length>78)stats.errors.push({slug,issue:"Long editorial title",length:rawTitle.length});
 let html=fs.readFileSync(htmlFile,"utf8");
 if((html.match(/<title[^>]*>/gi)||[]).length!==1)throw Error("Multiple or missing title "+slug);
 html=html.replace(/<title[^>]*>[^<]*<\/title>/i,"<title>"+title+"</title>");
 // Leave metadata supplied by the canonical Claude renderer alone unless
 // directly traceable to this editorial title.
 html=html.replace(/(<meta[^>]*property=["']og:title["'][^>]*content=["'])[^"']*(["'][^>]*>)/i,
  (whole,one,two)=>one+title+two);
 fs.writeFileSync(htmlFile,html);
 stats.updated++;
 stats.titles.push({slug,title:rawTitle});
}
if(new Set(stats.titles.map(t=>t.title.toLowerCase())).size!==stats.updated)stats.errors.push({issue:"Duplicate keyword titles"});
fs.mkdirSync(release,{recursive:true});
fs.writeFileSync(path.join(release,"search-intent-titles.json"),JSON.stringify(stats,null,2));
console.log("SPECIES61_INTENT_TITLES "+JSON.stringify({updated:stats.updated,blocked:stats.skippedMissing.length,errors:stats.errors}));
if(stats.updated+stats.skippedMissing.length!==61||stats.errors.length)process.exitCode=1;
