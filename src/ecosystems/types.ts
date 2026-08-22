export type EcosystemNodeKind = "HABITAT" | "SPECIES" | "FUNCTION" | "HUMAN" | "PRESSURE" | "ACTOR" | "SOLUTION" | "EVIDENCE";
export type EcosystemNode = { id:string; label:string; kicker:string; detail:string; kind:EcosystemNodeKind; x:number; y:number; href?:string; relation?:string };
export type EcosystemChapter = { id:string; number:string; kicker:string; title:string; body:string };
export type EcosystemSource = { label:string; authority:string; href:string; establishes:string; limitation:string };
export type EcosystemLink = { label:string; href:string; meta?:string };
export type EcosystemProfile = {
  id:string; slug:string; name:string; eyebrow:string; lead:string; body:string; accent:string; background:string;
  hero:{src:string;srcMobile?:string;alt:string;objectPosition?:string}; geographyNote:string; centreLabel:string;
  nodes:EcosystemNode[]; chapters:EcosystemChapter[]; species:EcosystemLink[]; actors:EcosystemLink[]; sources:EcosystemSource[]; primaryActions:EcosystemLink[];
};
