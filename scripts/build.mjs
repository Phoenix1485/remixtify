import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { build } from "esbuild";

const root = process.cwd();
const outDir = path.join(root, "build", "site");
const embeddedDir = path.join(root, "internal", "bundle", "dist");
const release = process.argv.includes("--release");
const watch = process.argv.includes("--watch");
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const registry = JSON.parse(await readFile(path.join(root, "web", "registry.json"), "utf8"));
const themeRegistry = JSON.parse(await readFile(path.join(root, "web", "themes", "registry.json"), "utf8"));
const version = process.env.GITHUB_SHA?.slice(0, 12) || packageJson.version;

function integrity(buffer) {
  return `sha384-${createHash("sha384").update(buffer).digest("base64")}`;
}

async function bundle(entry, outfile) {
  await build({
    entryPoints: [path.join(root, entry)],
    outfile: path.join(outDir, outfile),
    bundle: true,
    platform: "browser",
    format: "iife",
    target: ["chrome110"],
    minify: release,
    sourcemap: release ? false : "linked",
    loader: { ".css": "text" },
    legalComments: "none",
  });
}

async function generate() {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(path.join(outDir, "packages"), { recursive: true });
  await mkdir(path.join(outDir, "themes"), { recursive: true });

  await Promise.all([
    bundle("web/src/bootstrap.ts", "bootstrap.js"),
    bundle("web/src/core.ts", "core.js"),
    ...registry.packages.map((definition) =>
      bundle(`web/packages/${definition.id}.ts`, definition.entry),
    ),
  ]);

  const coreBytes = await readFile(path.join(outDir, "core.js"));
  const packages = [];
  for (const definition of registry.packages) {
    const bytes = await readFile(path.join(outDir, definition.entry));
    packages.push({ ...definition, integrity: integrity(bytes) });
  }
  const themes = [];
  for (const definition of themeRegistry.themes) {
    const sourcePath = path.join(root, "web", definition.entry);
    const outputPath = path.join(outDir, definition.entry);
    const bytes = await readFile(sourcePath);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, bytes);
    themes.push({ ...definition, integrity: integrity(bytes) });
  }

  const channel = {
    schemaVersion: 1,
    version,
    publishedAt: new Date().toISOString(),
    core: { entry: "core.js", integrity: integrity(coreBytes) },
    packages,
    themes,
  };
  await writeFile(path.join(outDir, "channel.json"), `${JSON.stringify(channel, null, 2)}\n`);

  await rm(embeddedDir, { recursive: true, force: true });
  await mkdir(embeddedDir, { recursive: true });
  await cp(outDir, embeddedDir, { recursive: true });
  process.stdout.write(`Built browser runtime ${version}\n`);
}

await generate();

if (watch) {
  process.stdout.write("Watch mode rebuilds when the command is restarted; use your editor task for rapid iteration.\n");
}
