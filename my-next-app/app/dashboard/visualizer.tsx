import {
  Handle,
  MarkerType,
  Position,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { APP_URLS } from "../config/urls";
import {
  type VisualizerAgent,
  type VisualizerConnector,
  type VisualizerMcp,
  type VisualizerResponse,
  type VisualizerNode,
} from "../family-tree-data";

export type GraphKind = "agent" | "connector" | "mcp";

export type GraphNodeData = {
  id: string;
  kind: GraphKind;
  name: string;
  role: string;
  status: string;
  summary: string;
  hoverTitle: string;
  hoverText: string;
  tags: string[];
  detailItems: Array<{ label: string; value: string }>;
  longText: string;
  listLabel?: string;
  listItems: string[];
  sections?: Array<{ title: string; items: string[] }>;
};

export const VISUALIZER_SOURCE_URL = APP_URLS.visualizer;

export function createVisualizerGraph(response: VisualizerResponse) {
  const nodeMap = new Map(response.nodes.map((node) => [node.id, node]));
  const outgoing = buildOutgoingEdges(response);
  const positionMap = createPositionMap(response, nodeMap, outgoing);

  const nodes: Node<GraphNodeData>[] = response.nodes.map((node, index) => ({
    id: node.id,
    type: "visualizer",
    position: positionMap.get(node.id) ?? fallbackPosition(index),
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    data: buildNodeData(node),
  }));

  const edges: Edge[] = response.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "simplebezier",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: getEdgeColor(nodeMap.get(edge.target)?.type),
    },
    style: {
      stroke: getEdgeColor(nodeMap.get(edge.target)?.type),
      strokeWidth: 3,
    },
  }));

  return { nodes, edges };
}

function buildOutgoingEdges(response: VisualizerResponse) {
  const outgoing = new Map<string, string[]>();

  for (const edge of response.edges) {
    const targets = outgoing.get(edge.source) ?? [];
    targets.push(edge.target);
    outgoing.set(edge.source, targets);
  }

  return outgoing;
}

function createPositionMap(
  response: VisualizerResponse,
  nodeMap: Map<string, VisualizerNode>,
  outgoing: Map<string, string[]>,
) {
  const positionMap = new Map<string, { x: number; y: number }>();

  const supervisorIds = response.nodes
    .filter((node) => node.type === "agent" && node.data.agent.sub_agents.length > 0)
    .map((node) => node.id);

  const childAgentIds = supervisorIds
    .flatMap((id) => outgoing.get(id) ?? [])
    .filter((id) => nodeMap.get(id)?.type === "agent");

  const standaloneAgentIds = response.nodes
    .filter((node) => node.type === "agent")
    .map((node) => node.id)
    .filter((id) => !supervisorIds.includes(id) && !childAgentIds.includes(id));

  supervisorIds.forEach((id, index) => {
    positionMap.set(id, { x: 520 + index * 320, y: 20 });
  });

  childAgentIds.forEach((id, index) => {
    positionMap.set(id, { x: 80 + index * 330, y: 300 });
  });

  standaloneAgentIds.forEach((id, index) => {
    positionMap.set(id, { x: 80 + index * 330, y: 620 });
  });

  for (const [sourceId, targets] of outgoing.entries()) {
    const sourcePosition = positionMap.get(sourceId);
    if (!sourcePosition) {
      continue;
    }

    const resourceTargets = targets.filter((targetId) => {
      const type = nodeMap.get(targetId)?.type;
      return type === "connector" || type === "mcp";
    });

    resourceTargets.forEach((targetId, index) => {
      const offset = (index - (resourceTargets.length - 1) / 2) * 220;
      positionMap.set(targetId, {
        x: sourcePosition.x + offset,
        y: sourcePosition.y + 240,
      });
    });
  }

  return positionMap;
}

function fallbackPosition(index: number) {
  return { x: 80 + index * 280, y: 940 };
}

function buildNodeData(node: VisualizerNode): GraphNodeData {
  switch (node.type) {
    case "agent":
      return buildAgentNodeData(node.data.agent);
    case "connector":
      return buildConnectorNodeData(node.data.connector);
    case "mcp":
      return buildMcpNodeData(node.data.mcp);
  }
}

function buildAgentNodeData(agent: VisualizerAgent): GraphNodeData {
  const relationships = [
    ...agent.sub_agents.map((item) => `Sub-agent: ${item}`),
    ...agent.connector_config_ids.map((item) => `Connector: ${item}`),
    ...agent.mcp_servers.map((item) => `MCP: ${item}`),
  ];

  return {
    id: agent.agent_id,
    kind: "agent",
    name: agent.name,
    role: `${agent.type} | ${agent.model.provider}`,
    status: agent.status,
    summary: agent.description,
    hoverTitle: agent.name,
    hoverText: truncate(agent.instruction, 160),
    tags: [agent.model.name, `${relationships.length} links`],
    detailItems: [
      { label: "Agent id", value: agent.agent_id },
      { label: "Type", value: agent.type },
      { label: "Provider", value: agent.model.provider },
      { label: "Model", value: agent.model.name },
      { label: "Status", value: agent.status },
      { label: "Enabled", value: agent.isEnabled ? "True" : "False" },
      { label: "Webhooks", value: `${agent.webhooks.length}` },
    ],
    longText: agent.instruction,
    listLabel: relationships.length > 0 ? "Relationships" : undefined,
    listItems: relationships,
    sections: [
      {
        title: "Sub-agents",
        items: agent.sub_agents,
      },
      {
        title: "Connector ids",
        items: agent.connector_config_ids,
      },
      {
        title: "MCP servers",
        items: agent.mcp_servers,
      },
      {
        title: "Webhook prompts",
        items: agent.webhooks.map((item) => item.prompt),
      },
    ].filter((section) => section.items.length > 0),
  };
}

function buildConnectorNodeData(connector: VisualizerConnector): GraphNodeData {
  return {
    id: connector.connector_config_id,
    kind: "connector",
    name: connector.name,
    role: connector.connector_id,
    status: "configured",
    summary: connector.description ?? `${connector.config.length} config keys`,
    hoverTitle: connector.name,
    hoverText: `${connector.connector_id} with ${connector.config.length} config keys.`,
    tags: [connector.connector_id, `${connector.config.length} keys`],
    detailItems: [
      { label: "Connector id", value: connector.connector_id },
      { label: "Config id", value: connector.connector_config_id },
      { label: "Config keys", value: `${connector.config.length}` },
      { label: "Created", value: formatDate(connector.created_at) },
      { label: "Updated", value: formatDate(connector.updated_at) },
    ],
    longText:
      connector.description ??
      "Connector configuration used by the linked agent to call an external platform.",
    listLabel: "Config keys",
    listItems: connector.config.map((item) => item.name),
    sections: [
      {
        title: "Config entries",
        items: connector.config.map((item) => item.name),
      },
    ],
  };
}

function buildMcpNodeData(mcp: VisualizerMcp): GraphNodeData {
  const parsedUrl = new URL(mcp.url);

  return {
    id: mcp.url,
    kind: "mcp",
    name: mcp.name,
    role: "MCP Server",
    status: "linked",
    summary: mcp.url,
    hoverTitle: mcp.name,
    hoverText: mcp.url,
    tags: ["MCP", parsedUrl.hostname],
    detailItems: [
      { label: "Name", value: mcp.name },
      { label: "URL", value: mcp.url },
      { label: "Host", value: parsedUrl.hostname },
      { label: "Protocol", value: parsedUrl.protocol.replace(":", "") },
    ],
    longText: "Model Context Protocol server linked to an agent in the visualizer response.",
    listItems: [],
    sections: [
      {
        title: "Endpoint",
        items: [mcp.url],
      },
    ],
  };
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getEdgeColor(nodeType?: VisualizerNode["type"]) {
  if (nodeType === "connector") {
    return "#f97316";
  }
  if (nodeType === "mcp") {
    return "#8b5cf6";
  }
  return "#0284c7";
}

export function VisualizerNodeCard({ data }: NodeProps<Node<GraphNodeData>["data"]>) {
  if (!data) {
    return null;
  }

  const isAgent = data.kind === "agent";

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-2 !border-sky-500 !bg-white"
      />
      <div
        className={`group relative border bg-white text-left shadow-[0_20px_60px_rgba(56,189,248,0.12)] backdrop-blur ${
          isAgent
            ? "min-w-64 rounded-3xl border-sky-200 px-4 py-4"
            : "min-w-48 rounded-2xl border-slate-200 px-3 py-3"
        }`}
      >
        <div className="flex items-start gap-3">
          <NodeLogo kind={data.kind} />
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.24em] text-sky-700">{data.role}</div>
            <div className="mt-1 text-lg font-semibold text-slate-950">{data.name}</div>
            <div className="mt-1 text-sm leading-5 text-slate-600">{data.summary}</div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>{data.kind.toUpperCase()}</span>
          <span>{data.status}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {data.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-sky-50 px-2 py-1 text-[11px] text-sky-800">
              {tag}
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 hidden w-80 -translate-x-1/2 rounded-2xl border border-sky-200 bg-white px-4 py-3 text-xs text-slate-700 shadow-2xl group-hover:block">
          <div className="text-[10px] uppercase tracking-[0.22em] text-sky-700">Hover preview</div>
          <div className="mt-2 text-sm font-medium text-slate-950">{data.hoverTitle}</div>
          <div className="mt-2 leading-5 text-slate-600">{data.hoverText}</div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border-2 !border-sky-500 !bg-white"
      />
    </>
  );
}

export const visualizerNodeTypes = {
  visualizer: VisualizerNodeCard,
};

export function getMiniMapColor(kind?: GraphKind) {
  if (kind === "agent") {
    return "#10b981";
  }
  if (kind === "connector") {
    return "#f97316";
  }
  if (kind === "mcp") {
    return "#8b5cf6";
  }
  return "#38bdf8";
}

function NodeLogo({ kind }: { kind: GraphKind }) {
  const palette = {
    agent: "from-emerald-500 to-teal-400",
    connector: "from-orange-500 to-amber-400",
    mcp: "from-violet-500 to-fuchsia-400",
  }[kind];

  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${palette} text-white shadow-lg`}
    >
      {kind === "agent" ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]">
          <rect x="5" y="5" width="14" height="14" rx="4" />
          <path d="M9 12h6M12 9v6" />
        </svg>
      ) : null}
      {kind === "connector" ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]">
          <path d="M10 7H7a4 4 0 0 0 0 8h3" />
          <path d="M14 7h3a4 4 0 0 1 0 8h-3" />
          <path d="M8 12h8" />
        </svg>
      ) : null}
      {kind === "mcp" ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]">
          <path d="M9 8V5H7v3H5v2h2v3h2v-3h2V8Z" />
          <path d="M15 11h4M17 9v4" />
          <path d="M5 17h14" />
        </svg>
      ) : null}
    </div>
  );
}
