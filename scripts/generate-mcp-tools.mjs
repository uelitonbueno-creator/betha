import fs from "node:fs";

const workerPath = new URL("../backend/worker.js", import.meta.url);
const mappingPath = new URL("../config/page-mapping.json", import.meta.url);
const outputPath = new URL("../config/mcp-tools.generated.json", import.meta.url);

const worker = fs.readFileSync(workerPath, "utf8");
const pageMapping = JSON.parse(fs.readFileSync(mappingPath, "utf8"));

const blockMatch = worker.match(/const\s+builders\s*=\s*\{([\s\S]*?)\n\s*\};/);
if (!blockMatch) throw new Error("DASHBOARD_BUILDERS_BLOCK_NOT_FOUND");

const panelIds = [];
const keyRe = /(?:^|\n)\s*(?:"([^"]+)"|'([^']+)'|([a-zA-Z0-9_-]+))\s*:\s*build[A-Za-z0-9_]+/g;
let m;
while ((m = keyRe.exec(blockMatch[1])) !== null) {
  panelIds.push(m[1] || m[2] || m[3]);
}
if (!panelIds.length) throw new Error("NO_DASHBOARD_BUILDERS_FOUND");

const constraints = (pageMapping[0] && pageMapping[0].constraints) || [];
const permissionFor = (panelId) => {
  const needle = `/api/dashboard/${panelId}`;
  const found = constraints.find(c =>
    Array.isArray(c.resources) &&
    c.resources.some(r => String(r.urlPattern || "").includes(needle))
  );
  return found ? found.id : null;
};

const labelMap = {
  "visao-geral":"Visão geral",
  arrecadacao:"Arrecadação",
  debitos:"Lançamentos e débitos",
  divida:"Dívida ativa",
  parcelamentos:"Parcelamentos",
  economicos:"Econômicos e ISS",
  imobiliario:"Imobiliário e IPTU",
  itbi:"Transferências e ITBI",
  contribuintes:"Contribuintes",
  encerramento:"Encerramento mensal",
  obras:"Obras",
  qualidade:"Qualidade e auditoria",
  "receitas-creditos":"Receitas e créditos",
  guias:"Guias e documentos",
  indexadores:"Indexadores",
  territorio:"Território cadastral"
};

const toolName = (panelId) => "get_" + panelId
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-zA-Z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "")
  .toLowerCase();

const tools = [...new Set(panelIds)].sort().map(panelId => ({
  name: toolName(panelId),
  panel: panelId,
  title: labelMap[panelId] || panelId,
  description: `Consulta somente leitura do painel ${labelMap[panelId] || panelId} do BI Tributário.`,
  permission: permissionFor(panelId),
  upstream: `/api/dashboard/${panelId}`,
  readOnly: true,
  tenantIsolation: ["database","entity"],
  inputSchema: {
    type: "object",
    additionalProperties: false,
    properties: {
      tenant_id: {
        type: "string",
        description: "Opcional. Só pode selecionar um tenant já autorizado ao usuário autenticado."
      },
      data_inicial: { type: "string", description: "Data inicial no formato YYYY-MM-DD." },
      data_final: { type: "string", description: "Data final no formato YYYY-MM-DD." },
      exercicio: { type: "integer", minimum: 1900, maximum: 2200 },
      comparar_periodo_anterior: { type: "boolean", default: false }
    }
  }
}));

const missingPermissions = tools.filter(t => !t.permission).map(t => t.panel);

const manifest = {
  schemaVersion: 1,
  generatedFrom: ["backend/worker.js","config/page-mapping.json"],
  mode: "read-only",
  auth: "oauth2.1",
  transport: "streamable-http",
  tenantIsolation: ["database","entity"],
  toolCount: tools.length,
  missingPermissions,
  tools
};

fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Generated ${tools.length} MCP tools`);
if (missingPermissions.length) {
  console.error("Panels without Page Mapping permission:", missingPermissions.join(", "));
  process.exitCode = 2;
}
