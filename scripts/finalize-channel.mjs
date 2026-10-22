import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const [binaryPath] = process.argv.slice(2);
if (!binaryPath) throw new Error("Usage: node scripts/finalize-channel.mjs <windows-binary>");

const channelPath = path.resolve("build/site/channel.json");
const channel = JSON.parse(await readFile(channelPath, "utf8"));
const bytes = await readFile(binaryPath);
const repository = process.env.GITHUB_REPOSITORY || "OWNER/REPOSITORY";
const assetName = path.basename(binaryPath);
const version = process.env.GITHUB_SHA?.slice(0, 12) || channel.version;
channel.cli = {
  version,
  downloads: {
    "windows-amd64": {
      // The continuous asset is replaced each release; give caches a unique key.
      url: `https://github.com/${repository}/releases/download/continuous/${assetName}?v=${encodeURIComponent(version)}`,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    },
  },
};
await writeFile(channelPath, `${JSON.stringify(channel, null, 2)}\n`);

