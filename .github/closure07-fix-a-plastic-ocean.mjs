import fs from 'node:fs';
const path='src/content/magazineFilms.ts';
let s=fs.readFileSync(path,'utf8');
const old='watchUrl: "https://aplasticocean.movie/", trailerId: "6zrn4-FfbXw", sourceUrl: "https://aplasticocean.movie/", sourceLabel: "A PLASTIC OCEAN / OFFICIAL"';
const next='watchUrl: "https://aplasticocean.movie/", trailerId: "gd9ZFVgoQ68", imageVideoId: "gd9ZFVgoQ68", sourceUrl: "https://aplasticocean.movie/", sourceLabel: "A PLASTIC OCEAN / OFFICIAL"';
if(!s.includes(old)) throw new Error('A Plastic Ocean canonical anchor missing');
s=s.replace(old,next);
fs.writeFileSync(path,s);
console.log('A Plastic Ocean now uses Plastic Oceans International official trailer artwork.');
