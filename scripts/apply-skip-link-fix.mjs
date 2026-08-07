import fs from "node:fs";

const path = "src/components/layout/PublicShell.tsx";
let text = fs.readFileSync(path, "utf8");
const before = '.skip-to-main{position:fixed;top:8px;left:8px;z-index:1000;padding:10px 14px;background:#fff;color:#0a0a0a;border:2px solid #2e2eff;font-family:${T.mono};font-size:12px;letter-spacing:.08em;text-decoration:none;transform:translateY(-160%);transition:transform .15s ease}.skip-to-main:focus{transform:translateY(0)}';
const after = '.skip-to-main{position:fixed;top:72px;left:12px;z-index:1000;max-width:calc(100vw - 24px);padding:10px 14px;background:#fff;color:#0a0a0a;border:2px solid #2e2eff;font-family:${T.mono};font-size:12px;letter-spacing:.08em;text-decoration:none;transform:translateY(calc(-100% - 80px));transition:transform .15s ease}.skip-to-main:focus{transform:translateY(0)}';
if (!text.includes(before)) throw new Error("Expected skip-link style not found");
text = text.replace(before, after);
fs.writeFileSync(path, text);
