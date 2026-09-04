import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const SOURCE_SHA = "d27c841d3f15f26bf4feb7de3916a6a5fffe1795";
const EXPECTED = {
  "public/magazine/live-round-01.txt": "07dd90acdab7c05b72b0f9f6716e275569adc3f7",
  "public/magazine/live-round-02.txt": "612df5b66c53cad03bfea9bc3be9a80a532479bd",
  "public/magazine/live-round-03.txt": "56c566bf0bac34fb1421299a3a129cdd9651d710",
  "public/magazine/live-round-04.txt": "d5faa6f54b6e077462182c839ff8ff378611ada0",
  "public/magazine/live-round-05.txt": "04a910c858abac13be3f9fb8be82d54313c87bc3",
  "public/magazine/live-round-06.txt": "a514f37c2db87a9583fbf57f926c72ed8fc6a9a4",
  "public/magazine/public-launch-gold-01.txt": "fd890c787b8a9184bc9a632d192b004b15affb3d",
  "scripts/magazine-content.mjs": "a5e314bffd7c228e96d303491084a9c065650429",
  "scripts/magazine-public-launch-gate.mjs": "22578e46014adf4e90192d88fd3c0627226dc4b4",
  "scripts/magazine-quality-gate.mjs": "16075dac3a3d960f8cb45811378527e0aa0f8155",
  "scripts/magazine-seo-contract.test.mjs": "df3f2c497dceae3f0754d94894b74779138f2d7d",
  "scripts/magazine-world-class-contract.test.mjs": "a5ca0bc74b94f15d5d5a8a92c2f2ff3aee216850",
  "scripts/prerender-magazine-seo.mjs": "dd0111066fc67cf022fa9755a0440512a4db955a",
  "src/components/magazine/MagazineShell.tsx": "2d5ecde7a9dd7a868bd106f0287b3cc3b522b072",
  "src/content/magazineDistribution.ts": "46038cf0694785156130725e41e45fd2589dbe59",
  "src/content/magazineEditorial.ts": "b43344d61dff6c4bec867484249e98308afb976d",
  "src/content/magazineEngine.ts": "c3f17d563d8d82170acf5f34301daa3113f0d6b3",
  "src/content/magazineEvidenceOverlays.ts": "cbd2d00682d96eee6696308d15dc29258d80590e",
  "src/content/magazineExperience.ts": "2c1ec0182380e9cedebbdc3d9e4ae0d975fee2c5",
  "src/content/magazineFeatureTypes.ts": "0e046b6a9b097db06a7d2de937baa37157925b9f",
  "src/content/magazineFeatures.ts": "846248a73fb05bb2599f5c87c8edd79c1f945243",
  "src/content/magazineFeaturesExplainers.ts": "a7a5f99f8d56fff29aeb375928d03af225f41b9c",
  "src/content/magazineFeaturesReported.ts": "1074802287d8af9fadba7514bab3419f2f7cd39d",
  "src/content/magazineLaunchQueue.ts": "1b7808eda73f36a042d7612d6eeb9a2c0e504b82",
  "src/content/magazineOperating.ts": "5b8c126f56e9bbcde54ea0f3b0a74b67d4263acd",
  "src/content/magazinePublication.ts": "cda012d17a7e9601bd191d8a7f4d09dd93e61d7a",
  "src/content/magazineReader.ts": "b48fe6687c753032988f1087e5cc8fdde19536a5",
  "src/content/magazineSignals.ts": "e4cebe68897b58e4f0e08c4e7622524702c745a1",
  "src/content/magazineStandfirsts.ts": "e6e98dd16ed546d0d19d3eee4526019418b71048",
  "src/content/magazineVisuals.ts": "59b1807f2d0a81a50948ffd9398e7609f63bda80",
  "src/content/stories.ts": "042c4ed17973b8e46a16fe17167e85e591de15de",
  "src/pages/v5/Magazine.tsx": "67ef9130e3e02380e4a325cedb69422c1d32f8fb",
  "src/pages/v5/MagazineAtlas.tsx": "a5203ffe58f23f70b74650e19ecb5c4c93ea1d6b",
  "src/pages/v5/MagazineHub.tsx": "c08d69f38f15fc16fb6830103aae19a6b7e77b73",
  "src/pages/v5/MagazineInfo.tsx": "6e62be177b0565150a61f56bc2b60c4b066da0e2",
  "src/pages/v5/MagazineLibrary.tsx": "8eabae6e8b1e64fa0b31a01e458e215ad9d4ca11",
  "src/pages/v5/MagazineSignal.tsx": "78b131e8aaf82a5960dc05619aa7abbbf83d3c1b",
  "src/pages/v5/MagazineStoryRecord.tsx": "a8910e5a6ac5fb2922edf26183135a412870edb8",
  "src/pages/v5/StoryArticle.tsx": "5f4111acf1fff34bf042377e4a79897320446951",
  "src/styles/magazine-article-gold.css": "c37b49893287c75ca4732c2f05014210653d7ede",
  "src/styles/magazine-article-modes.css": "8f6639066635813afe419c1a19ac6f0b1f157528",
  "src/styles/magazine-article-premium-reader.css": "467c32678ddc556d5d08761c408989997c415326",
  "src/styles/magazine-article-round-06.css": "7c9e0a6e906733478259e0935ecff5e29fdeff2d",
  "src/styles/magazine-article.css": "3aac0c29fb9f7e9d83e3e83d457698f6e3411e5b",
  "src/styles/magazine-atlas-public.css": "6f69b778c9dab9b824b0a03baa60b7b8dea35b99",
  "src/styles/magazine-brand-typography.css": "900a52d2aff99985db5f467a5c9532dc67949acf",
  "src/styles/magazine-gold-02-fixes.css": "bd47bd47a458014520baef00d5f30f5ce74e7a4d",
  "src/styles/magazine-gold-02.css": "0f733345997cebd82233a44ab97d2b1b3d00e236",
  "src/styles/magazine-home-closure.css": "f14acbbd59b80ac0a73385450f31351ec1f2b1c7",
  "src/styles/magazine-home.css": "b57c3bc1b7213b0b1e94997be5e1bb197b081daa",
  "src/styles/magazine-hub-gold-01.css": "96594b1ee7948af8648008968dfa5a409bfc5328",
  "src/styles/magazine-hub.css": "31be90ffdddcf80fe5a716ae1cb9698c47611175",
  "src/styles/magazine-library.css": "88a7ad751a3920be67d6c19ef64a5eb77b24f39c",
  "src/styles/magazine-live-round-01.css": "c6d373a76ecafaebc4908000485f60a586f2e3d9",
  "src/styles/magazine-live-round-02.css": "ace1eeb8cd62c2909b301b9fb3aaa43806b1c674",
  "src/styles/magazine-live-round-04.css": "903b43b0970b2c8d1b062b99e08a22d9ebcfb051",
  "src/styles/magazine-live-round-05.css": "e40483239c8519bef7b5a236677ad3da870d5b37",
  "src/styles/magazine-maze.css": "da1b6ceddca8f1af1a0f89e669267ec706c656c9",
  "src/styles/magazine-mobile-round-03.css": "6af818831b3aa5a6b24dff44cd11157ef526b7d7",
  "src/styles/magazine-public-launch.css": "e2baecb000a699f3cf794889beb3b60d7fbf5cb1",
  "src/styles/magazine-reader-polish.css": "fe1b706695563ab2ddef1099c2e3968f4936f4e5",
  "src/styles/magazine-signal-round-06.css": "38d2daa7d3b21bd27cb77de106bbdff7917c1551",
  "src/styles/magazine-signal.css": "9709c4d3e357e79c5ce1727ac5ebe408ab9c527f",
  "src/styles/magazine-world-polish.css": "c566a6e554727466a1ed9aa7ec49299c178ad8b3",
  "src/styles/magazine-world.css": "33d2eef6f066c4e41ba6ca0d3b0033e727527746",
  "src/styles/magazine.css": "e029806ac5be14e11da7d93774354c324f9508a8"
};

function gitBlobSha(buffer) {
  return createHash("sha1")
    .update(`blob ${buffer.length}\0`)
    .update(buffer)
    .digest("hex");
}

const failures = [];

for (const [path, expectedSha] of Object.entries(EXPECTED)) {
  let buffer;
  try {
    buffer = readFileSync(path);
  } catch {
    failures.push(`${path}: missing (expected ${expectedSha})`);
    continue;
  }

  const actualSha = gitBlobSha(buffer);
  if (actualSha !== expectedSha) {
    failures.push(`${path}: ${actualSha} (expected ${expectedSha})`);
  }
}

if (failures.length > 0) {
  console.error(`MAGAZINE_LIVE_LOCK_FAIL source=${SOURCE_SHA}`);
  for (const failure of failures) console.error(`- ${failure}`);
  console.error("Deployment refused. Promote a new exact candidate by intentionally updating this lock.");
  process.exit(1);
}

console.log(`MAGAZINE_LIVE_LOCK_OK source=${SOURCE_SHA} files=${Object.keys(EXPECTED).length}`);
