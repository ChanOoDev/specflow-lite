#!/usr/bin/env node

// src/hooks/claude.ts
import { spawn } from "child_process";

// src/hooks/marker-state.ts
import crypto from "crypto";
import fs from "fs/promises";
import os from "os";
import path from "path";
function markerState(cwd, agentKey) {
  const hash = crypto.createHash("sha256").update(cwd).digest("hex");
  const dir = path.join(os.tmpdir(), "swarmvault-agent-hooks", agentKey, hash);
  return {
    dir,
    markerPath: path.join(dir, "report-read")
  };
}
function flagPath(cwd, agentKey, name) {
  const safeName = name.replaceAll(/[^a-z0-9-]/gi, "-");
  return path.join(markerState(cwd, agentKey).dir, safeName);
}
async function markFlag(cwd, agentKey, name) {
  const target = flagPath(cwd, agentKey, name);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, "seen\n", "utf8");
}
async function hasFlag(cwd, agentKey, name) {
  try {
    await fs.access(flagPath(cwd, agentKey, name));
    return true;
  } catch {
    return false;
  }
}
function isReportPath(value, cwd) {
  if (typeof value !== "string" || value.length === 0) {
    return false;
  }
  const reportSuffix = path.join("wiki", "graph", "report.md");
  const normalized = value.replaceAll("\\", "/");
  const reportNormalized = reportSuffix.replaceAll("\\", "/");
  if (normalized.endsWith(reportNormalized)) {
    return true;
  }
  return path.resolve(cwd, value) === reportPath(cwd);
}
function collectCandidatePaths(node, acc = []) {
  if (typeof node === "string") {
    acc.push(node);
    return acc;
  }
  if (!node || typeof node !== "object") {
    return acc;
  }
  if (Array.isArray(node)) {
    for (const item of node) {
      collectCandidatePaths(item, acc);
    }
    return acc;
  }
  for (const [key, value] of Object.entries(node)) {
    if (["path", "filePath", "file_path", "paths", "target", "targets"].includes(key)) {
      collectCandidatePaths(value, acc);
      continue;
    }
    collectCandidatePaths(value, acc);
  }
  return acc;
}
function resolveInputCwd(input) {
  const shaped = input ?? {};
  const candidate = typeof shaped.cwd === "string" && shaped.cwd || typeof shaped.directory === "string" && shaped.directory || typeof shaped.workspace?.cwd === "string" && shaped.workspace.cwd || typeof shaped.toolInput?.cwd === "string" && shaped.toolInput.cwd || process.cwd();
  return path.resolve(candidate);
}
function resolveToolName(input) {
  const shaped = input ?? {};
  return String(shaped.toolName ?? shaped.tool_name ?? shaped.tool?.name ?? shaped.name ?? "");
}
function resolveToolInput(input) {
  const shaped = input ?? {};
  return shaped.toolInput ?? shaped.tool_input ?? {};
}
async function hasReport(cwd) {
  try {
    await fs.access(reportPath(cwd));
    return true;
  } catch {
    return false;
  }
}
function artifactRootDir(cwd) {
  const override = process.env.SWARMVAULT_OUT?.trim();
  if (!override) {
    return path.resolve(cwd);
  }
  return path.isAbsolute(override) ? path.resolve(override) : path.resolve(cwd, override);
}
function reportPath(cwd) {
  return path.join(artifactRootDir(cwd), "wiki", "graph", "report.md");
}
async function markReportRead(cwd, agentKey) {
  const state = markerState(cwd, agentKey);
  await fs.mkdir(state.dir, { recursive: true });
  await fs.writeFile(state.markerPath, "seen\n", "utf8");
}
async function hasSeenReport(cwd, agentKey) {
  const state = markerState(cwd, agentKey);
  try {
    await fs.access(state.markerPath);
    return true;
  } catch {
    return false;
  }
}
async function resetSession(cwd, agentKey) {
  const state = markerState(cwd, agentKey);
  await fs.rm(state.dir, { recursive: true, force: true });
}
function isBroadSearchTool(toolName) {
  return /grep|glob|search|find/i.test(toolName);
}
function collectCommandCandidates(node, acc = []) {
  if (!node || typeof node !== "object") {
    return acc;
  }
  if (Array.isArray(node)) {
    for (const item of node) {
      collectCommandCandidates(item, acc);
    }
    return acc;
  }
  for (const [key, value] of Object.entries(node)) {
    if (["command", "cmd", "script", "bash", "shell"].includes(key) && typeof value === "string") {
      acc.push(value);
      continue;
    }
    collectCommandCandidates(value, acc);
  }
  return acc;
}
function commandLooksLikeBroadSearch(command) {
  const statements = command.split(/;|&&|\|\|/);
  for (const statement of statements) {
    const firstStage = statement.split("|")[0] ?? "";
    const tokens = firstStage.replace(/[()]/g, " ").split(/\s+/).map((token) => path.basename(token.replace(/^['"]|['"]$/g, ""))).filter(Boolean);
    const leading = tokens.find((token) => !token.includes("=") && !token.startsWith("-"));
    if (!leading) {
      continue;
    }
    if (["rg", "grep", "find", "fd", "ag", "ack"].includes(leading)) {
      return true;
    }
    if (leading === "git" && tokens[tokens.indexOf(leading) + 1] === "grep") {
      return true;
    }
  }
  return false;
}
function isBroadSearchInput(input) {
  const toolName = resolveToolName(input);
  if (isBroadSearchTool(toolName)) {
    return true;
  }
  return collectCommandCandidates(input).some(commandLooksLikeBroadSearch);
}
var VAULT_ARTIFACT_SEGMENTS = ["wiki", "raw", "state", "agent", "inbox"];
function isVaultArtifactSearch(input, cwd) {
  const artifactRoot = artifactRootDir(cwd);
  const candidates = [...collectCandidatePaths(input), ...collectCommandCandidates(input)];
  return candidates.some((candidate) => {
    if (typeof candidate !== "string" || candidate.length === 0) {
      return false;
    }
    const normalized = candidate.replaceAll("\\", "/");
    if (VAULT_ARTIFACT_SEGMENTS.some(
      (segment) => normalized.includes(`${segment}/`) && normalized.match(new RegExp(`(^|[\\s'"=/])${segment}/`))
    )) {
      return true;
    }
    const resolved = path.resolve(cwd, candidate);
    return VAULT_ARTIFACT_SEGMENTS.some(
      (segment) => resolved.startsWith(path.join(artifactRoot, segment) + path.sep) || resolved === path.join(artifactRoot, segment)
    );
  });
}
async function isNarrowSearch(input) {
  const toolInput = resolveToolInput(input);
  const candidate = toolInput?.path;
  if (typeof candidate !== "string" || candidate.length === 0) {
    return false;
  }
  try {
    const stats = await fs.stat(candidate);
    return stats.isFile();
  } catch {
    return false;
  }
}
async function resolveGraphFirstMode(cwd) {
  const fromEnv = process.env.SWARMVAULT_GRAPH_FIRST?.trim().toLowerCase();
  if (fromEnv === "deny" || fromEnv === "context" || fromEnv === "off") {
    return fromEnv;
  }
  try {
    const raw = await fs.readFile(path.join(cwd, "swarmvault.config.json"), "utf8");
    const parsed = JSON.parse(raw);
    const fromConfig = typeof parsed?.hooks?.graphFirst === "string" ? parsed.hooks.graphFirst.toLowerCase() : "";
    if (fromConfig === "deny" || fromConfig === "context" || fromConfig === "off") {
      return fromConfig;
    }
  } catch {
  }
  return "context";
}
async function readWatchStaleness(cwd) {
  const watchDir = path.join(artifactRootDir(cwd), "state", "watch");
  let lastRunAt;
  let lastRunSuccess;
  let pendingCount = 0;
  let found = false;
  try {
    const raw = await fs.readFile(path.join(watchDir, "status.json"), "utf8");
    const parsed = JSON.parse(raw);
    lastRunAt = typeof parsed?.lastRun?.finishedAt === "string" ? parsed.lastRun.finishedAt : void 0;
    lastRunSuccess = typeof parsed?.lastRun?.success === "boolean" ? parsed.lastRun.success : void 0;
    found = true;
  } catch {
  }
  try {
    const raw = await fs.readFile(path.join(watchDir, "pending-semantic-refresh.json"), "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      pendingCount = parsed.length;
      found = true;
    }
  } catch {
  }
  if (!found) {
    return null;
  }
  return { lastRunAt, lastRunSuccess, pendingSemanticRefreshCount: pendingCount };
}
function collectEditedFilePaths(input, cwd) {
  const toolInput = resolveToolInput(input);
  const candidates = [];
  for (const key of ["file_path", "filePath", "path", "notebook_path", "notebookPath"]) {
    const value = toolInput?.[key];
    if (typeof value === "string" && value.length > 0) {
      candidates.push(value);
    }
  }
  const artifactRoot = artifactRootDir(cwd);
  const resolved = candidates.map((candidate) => path.resolve(cwd, candidate)).filter(
    (absolutePath) => !VAULT_ARTIFACT_SEGMENTS.some(
      (segment) => absolutePath === path.join(artifactRoot, segment) || absolutePath.startsWith(path.join(artifactRoot, segment) + path.sep)
    )
  );
  return [...new Set(resolved)];
}
async function readHookInput() {
  let body = "";
  for await (const chunk of process.stdin) {
    body += chunk;
  }
  if (!body.trim()) {
    return {};
  }
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}
var GRAPH_FIRST_COMMANDS = [
  '- `swarmvault graph query "<seed>"` \u2014 top matches with page paths plus an inline excerpt of the best page; usually answers where-is/what-calls in one command',
  '- `swarmvault graph explain "<node>"` \u2014 compact node summary with neighbors and its wiki page',
  '- `swarmvault graph callers "<symbol>"` \u2014 exact caller list with file:line call sites; use for who-calls/impact questions instead of grep',
  "- `swarmvault graph blast <target>` \u2014 reverse-import impact analysis for change-impact questions",
  "- `wiki/graph/report.md` \u2014 orientation report (architecture, communities, key nodes)",
  "Do not add `--json` to these \u2014 the plain output is far smaller and already structured.",
  "Trust the graph/wiki answer for orientation questions; verify in source only when you are about to edit or the evidence conflicts. Answer directly in chat \u2014 do not write answer files unless asked for a durable artifact."
];
function buildGraphFirstNote(staleness) {
  const lines = [
    "This repo has a SwarmVault code graph. To save tokens, answer code-understanding questions (where is X, what calls Y, how is Z structured, impact of changing W) from the graph instead of reading or grepping source files:",
    ...GRAPH_FIRST_COMMANDS,
    "Read source files directly only when you are about to edit them, or when the graph lacks the detail you need.",
    "After your edits the SwarmVault hook refreshes the graph automatically."
  ];
  if (staleness?.pendingSemanticRefreshCount) {
    lines.push(
      `Note: ${staleness.pendingSemanticRefreshCount} non-code change(s) await semantic refresh \u2014 run \`swarmvault compile\` when convenient.`
    );
  }
  if (staleness?.lastRunSuccess === false) {
    lines.push(
      "Note: the last graph refresh failed \u2014 run `swarmvault graph status` then `swarmvault graph update` before relying on the graph."
    );
  }
  return lines.join("\n");
}
function extractSearchTerm(input) {
  const toolInput = resolveToolInput(input);
  for (const key of ["pattern", "query", "regex"]) {
    const value = toolInput?.[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }
  return "<your term>";
}
function buildDenyReason(toolName, input) {
  const term = extractSearchTerm(input).slice(0, 120);
  return [
    `SwarmVault graph-first: this repo has a compiled code graph that answers structure questions in far fewer tokens than ${toolName || "broad search"}.`,
    `Run: swarmvault graph query "${term}" \u2014 it prints the top matches with page paths plus an inline excerpt of the best page, which usually answers the question without reading source. For who-calls/impact questions run swarmvault graph callers "${term}" (exact file:line call sites). Do not add --json (much larger output).`,
    "Trust that answer for orientation questions instead of re-verifying in source files.",
    "If the graph does not answer, repeat this exact search \u2014 it will be allowed for the rest of the session."
  ].join(" ");
}

// src/hooks/claude.ts
var AGENT_KEY = "claude";
function emit(value) {
  process.stdout.write(`${JSON.stringify(value)}
`);
}
function denyFlagName(toolName) {
  return `deny-search-${(toolName || "unknown").toLowerCase()}`;
}
async function handleSessionStart(cwd) {
  await resetSession(cwd, AGENT_KEY);
  const staleness = await readWatchStaleness(cwd);
  emit({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: buildGraphFirstNote(staleness)
    }
  });
}
async function handlePostEdit(cwd, input) {
  const editedPaths = collectEditedFilePaths(input, cwd);
  if (editedPaths.length > 0) {
    try {
      const child = spawn("swarmvault", ["graph", "update", ...editedPaths.flatMap((p) => ["--file", p]), "--json"], {
        cwd,
        detached: true,
        stdio: "ignore"
      });
      child.unref();
    } catch {
    }
  }
  emit({});
}
async function handlePreToolUse(cwd, input) {
  if (collectCandidatePaths(input).some((value) => isReportPath(value, cwd))) {
    await markReportRead(cwd, AGENT_KEY);
    emit({});
    return;
  }
  const mode = await resolveGraphFirstMode(cwd);
  if (mode === "off" || !isBroadSearchInput(input)) {
    emit({});
    return;
  }
  if (isVaultArtifactSearch(input, cwd) || await isNarrowSearch(input)) {
    emit({});
    return;
  }
  const toolName = resolveToolName(input);
  const flag = denyFlagName(toolName);
  if (mode === "deny" && !await hasFlag(cwd, AGENT_KEY, flag)) {
    await markFlag(cwd, AGENT_KEY, flag);
    emit({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: buildDenyReason(toolName, input)
      }
    });
    return;
  }
  if (!await hasSeenReport(cwd, AGENT_KEY)) {
    await markReportRead(cwd, AGENT_KEY);
    emit({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "allow",
        additionalContext: buildDenyReason(toolName, input)
      }
    });
    return;
  }
  emit({});
}
async function main() {
  const mode = process.argv[2] ?? "";
  const input = await readHookInput();
  const cwd = resolveInputCwd(input);
  if (!await hasReport(cwd) || await resolveGraphFirstMode(cwd) === "off") {
    emit({});
    process.exit(0);
  }
  if (mode === "session-start") {
    await handleSessionStart(cwd);
    process.exit(0);
  }
  if (mode === "post-edit") {
    await handlePostEdit(cwd, input);
    process.exit(0);
  }
  await handlePreToolUse(cwd, input);
  process.exit(0);
}
await main();
