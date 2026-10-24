const allowedRobots = new Set([
  "capital",
  "procurement",
  "nature-change",
  "source",
  "seo",
  "game-qa",
  "public-rd",
]);

function config() {
  const base = process.env.FOURPLANET_ROBOT_GATEWAY_URL;
  const token = process.env.FOURPLANET_ROBOT_GATEWAY_TOKEN;
  if (!base || !token) {
    throw new Error(
      "ROBOT_GATEWAY_NOT_CONFIGURED: durable worker is intentionally fail-closed until the authenticated 4PLANET execution gateway exists."
    );
  }
  return { base: base.replace(/\/$/, ""), token };
}

async function post(path, body) {
  const { base, token } = config();
  const response = await fetch(base + path, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": "Bearer " + token,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(90_000),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`4PLANET_GATEWAY_${response.status}: ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : null;
}

export async function runRobotStep(input) {
  if (!allowedRobots.has(input?.robot)) throw new Error("ROBOT_NOT_ALLOWLISTED");
  return post(`/v1/robots/${encodeURIComponent(input.robot)}/steps/${encodeURIComponent(input.step)}`, input);
}

export async function writeRobotReceipt(input) {
  if (!allowedRobots.has(input?.robot)) throw new Error("ROBOT_NOT_ALLOWLISTED");
  return post("/v1/robot-receipts", input);
}
