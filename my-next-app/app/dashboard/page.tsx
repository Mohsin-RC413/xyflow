"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addEdge,
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
  type OnConnect,
} from "@xyflow/react";
import {
  visualizerResponse,
  type VisualizerAgent,
  type VisualizerConnector,
  type VisualizerMcp,
  type VisualizerNode,
} from "../family-tree-data";

type GraphKind = "agent" | "connector" | "mcp";

type GraphNodeData = {
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
};

function createGraph() {
  const nodeMap = new Map(visualizerResponse.nodes.map((node) => [node.id, node]));
  const outgoing = new Map<string, string[]>();

  for (const edge of visualizerResponse.edges) {
    const items = outgoing.get(edge.source) ?? [];
    items.push(edge.target);
    outgoing.set(edge.source, items);
  }

  const supervisorIds = visualizerResponse.nodes
    .filter((node) => node.type === "agent" && node.data.agent?.sub_agents.length)
    .map((node) => node.id);

  const supervisorChildren = supervisorIds.flatMap((id) => outgoing.get(id) ?? []);
  const childAgentIds = supervisorChildren.filter((id) => nodeMap.get(id)?.type === "agent");

  const standaloneAgentIds = visualizerResponse.nodes
    .filter((node) => node.type === "agent")
    .map((node) => node.id)
    .filter((id) => !supervisorIds.includes(id) && !childAgentIds.includes(id));

  const positionMap = new Map<string, { x: number; y: number }>();

  supervisorIds.forEach((id, index) => {
    positionMap.set(id, { x: 520 + index * 320, y: 20 });
  });

  childAgentIds.forEach((id, index) => {
    positionMap.set(id, { x: 80 + index * 330, y: 300 });
  });

  standaloneAgentIds.forEach((id, index) => {
    positionMap.set(id, { x: 80 + index * 330, y: 620 });
  });

  const nodes: Node<GraphNodeData>[] = visualizerResponse.nodes.map((node) => {
    const fallbackIndex = visualizerResponse.nodes.findIndex((item) => item.id === node.id);
    const position = positionMap.get(node.id) ?? { x: 80 + fallbackIndex * 280, y: 940 };

    return {
      id: node.id,
      type: "visualizer",
      position,
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      data: buildNodeData(node),
    };
  });

  for (const [sourceId, targets] of outgoing.entries()) {
    const sourcePosition = positionMap.get(sourceId);
    if (!sourcePosition) {
      continue;
    }

    const resourceTargets = targets.filter((targetId) => {
      const targetNode = nodeMap.get(targetId);
      return targetNode?.type === "connector" || targetNode?.type === "mcp";
    });

    resourceTargets.forEach((targetId, index) => {
      const relativeX = (index - (resourceTargets.length - 1) / 2) * 220;
      positionMap.set(targetId, {
        x: sourcePosition.x + relativeX,
        y: sourcePosition.y + 240,
      });
    });
  }

  nodes.forEach((node) => {
    const position = positionMap.get(node.id);
    if (position) {
      node.position = position;
    }
  });

  const edges: Edge[] = visualizerResponse.edges.map((edge) => {
    const targetType = nodeMap.get(edge.target)?.type;
    const color =
      targetType === "connector" ? "#f97316" : targetType === "mcp" ? "#8b5cf6" : "#0284c7";

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: "simplebezier",
      markerEnd: { type: MarkerType.ArrowClosed, color },
      style: { stroke: color, strokeWidth: 3 },
    };
  });

  return { nodes, edges };
}

function buildNodeData(node: VisualizerNode): GraphNodeData {
  if (node.type === "agent" && node.data.agent) {
    return buildAgentNodeData(node.data.agent);
  }

  if (node.type === "connector" && node.data.connector) {
    return buildConnectorNodeData(node.data.connector);
  }

  if (node.type === "mcp" && node.data.mcp) {
    return buildMcpNodeData(node.data.mcp);
  }

  return {
    id: node.id,
    kind: "agent",
    name: node.id,
    role: node.type,
    status: "unknown",
    summary: "Unknown node payload",
    hoverTitle: node.id,
    hoverText: "No additional metadata available.",
    tags: [node.type],
    detailItems: [{ label: "Node id", value: node.id }],
    longText: "No additional metadata available.",
    listItems: [],
  };
}

function buildAgentNodeData(agent: VisualizerAgent): GraphNodeData {
  const linkedItems = [
    ...agent.sub_agents.map((item) => `Sub-agent: ${item}`),
    ...agent.connector_config_ids.map((item) => `Connector: ${item}`),
    ...agent.mcp_servers.map((item) => `MCP: ${item}`),
  ];

  return {
    id: agent.agent_id,
    kind: "agent",
    name: agent.name,
    role: `${agent.type} · ${agent.model.provider}`,
    status: agent.status,
    summary: agent.description,
    hoverTitle: agent.name,
    hoverText:
      agent.instruction.length > 160
        ? `${agent.instruction.slice(0, 160)}...`
        : agent.instruction,
    tags: [agent.model.name, `${linkedItems.length} links`],
    detailItems: [
      { label: "Provider", value: agent.model.provider },
      { label: "Model", value: agent.model.name },
      { label: "Status", value: agent.status },
      { label: "Enabled", value: agent.isEnabled ? "True" : "False" },
      { label: "Webhooks", value: `${agent.webhooks.length}` },
    ],
    longText: agent.instruction,
    listLabel: linkedItems.length > 0 ? "Relationships" : undefined,
    listItems: linkedItems,
  };
}

function buildConnectorNodeData(connector: VisualizerConnector): GraphNodeData {
  const configKeys = connector.config.map((item) => item.name);

  return {
    id: connector.connector_config_id,
    kind: "connector",
    name: connector.name,
    role: connector.connector_id,
    status: "configured",
    summary: connector.description ?? `${connector.config.length} config values`,
    hoverTitle: connector.name,
    hoverText: `${connector.connector_id} with ${connector.config.length} config entries.`,
    tags: [connector.connector_id, `${connector.config.length} keys`],
    detailItems: [
      { label: "Connector id", value: connector.connector_id },
      { label: "Config keys", value: `${connector.config.length}` },
      { label: "Created", value: formatDate(connector.created_at) },
      { label: "Updated", value: formatDate(connector.updated_at) },
    ],
    longText:
      connector.description ??
      "Connector configuration used by the linked agent to call an external platform.",
    listLabel: "Config keys",
    listItems: configKeys,
  };
}

function buildMcpNodeData(mcp: VisualizerMcp): GraphNodeData {
  return {
    id: mcp.url,
    kind: "mcp",
    name: formatMcpName(mcp.url),
    role: "MCP Server",
    status: "linked",
    summary: mcp.url,
    hoverTitle: formatMcpName(mcp.url),
    hoverText: mcp.url,
    tags: ["MCP", new URL(mcp.url).hostname],
    detailItems: [
      { label: "URL", value: mcp.url },
      { label: "Host", value: new URL(mcp.url).hostname },
      { label: "Protocol", value: new URL(mcp.url).protocol.replace(":", "") },
    ],
    longText: "Model Context Protocol server linked to an agent through the visualizer response.",
    listItems: [],
  };
}

function formatMcpName(url: string) {
  const parsed = new URL(url);
  return parsed.hostname.replace(/^www\./, "");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function VisualizerNodeCard({ data }: NodeProps<Node<GraphNodeData>["data"]>) {
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

const nodeTypes = {
  visualizer: VisualizerNodeCard,
};

export default function DashboardPage() {
  const router = useRouter();
  const [selectedNode, setSelectedNode] = useState<GraphNodeData | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<GraphNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    const graph = createGraph();
    setNodes(graph.nodes);
    setEdges(graph.edges);
  }, [setEdges, setNodes]);

  const onConnect: OnConnect = (connection) => {
    setEdges((currentEdges) =>
      addEdge(
        {
          ...connection,
          type: "simplebezier",
          markerEnd: { type: MarkerType.ArrowClosed },
        },
        currentEdges,
      ),
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#ffffff_0%,#eff6ff_42%,#dbeafe_100%)] text-slate-900">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[size:72px_72px] opacity-60" />
      <section className="relative z-10 flex min-h-screen flex-col">
        <div className="border-b border-sky-200/80 bg-white/50 px-6 py-5 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Visualizer Graph</h1>
              <p className="mt-1 max-w-3xl text-sm text-slate-600">
                Static visualization derived from the provided `/visualizer/` response payload.
              </p>
            </div>
            <button
              type="button"
              className="rounded-2xl border border-sky-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-sky-50"
              onClick={() => router.push("/login")}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="relative flex-1">
          <div className="absolute inset-0">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodesDraggable
              nodesConnectable
              elementsSelectable
              defaultEdgeOptions={{
                type: "simplebezier",
                markerEnd: { type: MarkerType.ArrowClosed },
                style: {
                  stroke: "#0284c7",
                  strokeWidth: 3,
                },
              }}
              onNodeClick={(_, node) => setSelectedNode(node.data)}
              proOptions={{ hideAttribution: true }}
            >
              <Background gap={28} color="rgba(96,165,250,0.24)" />
              <Controls />
              <MiniMap
                zoomable
                pannable
                nodeColor={(node) => miniMapColor(node.data?.kind)}
                maskColor="rgba(219, 234, 254, 0.65)"
              />
            </ReactFlow>
          </div>

          <aside
            className={`absolute right-0 top-0 z-20 h-full w-full max-w-md overflow-hidden border-l border-sky-200 bg-white/92 shadow-2xl shadow-sky-200/40 backdrop-blur-xl transition-transform duration-300 ${
              selectedNode ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {selectedNode ? (
              <div className="flex h-full flex-col overflow-y-auto px-6 py-6">
                <button
                  type="button"
                  className="self-end rounded-full border border-sky-200 px-3 py-1 text-sm text-slate-700 hover:bg-sky-50"
                  onClick={() => setSelectedNode(null)}
                >
                  Close
                </button>
                <div className="mt-6 flex items-start gap-3">
                  <NodeLogo kind={selectedNode.kind} />
                  <div>
                    <div className="text-xs uppercase tracking-[0.28em] text-sky-700">
                      Node details
                    </div>
                    <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                      {selectedNode.name}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">{selectedNode.role}</p>
                  </div>
                </div>

                <div className="mt-8 space-y-4 text-sm text-slate-700">
                  {selectedNode.detailItems.map((item) => (
                    <InfoRow key={item.label} label={item.label} value={item.value} />
                  ))}
                </div>

                <div className="mt-8 rounded-2xl border border-sky-200 bg-sky-50 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-sky-700">About</div>
                  <p className="mt-3 leading-6 text-slate-700">{selectedNode.longText}</p>
                  {selectedNode.listItems.length > 0 && selectedNode.listLabel ? (
                    <>
                      <div className="mt-4 text-xs uppercase tracking-[0.24em] text-sky-700">
                        {selectedNode.listLabel}
                      </div>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                        {selectedNode.listItems.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center px-6 py-6 text-center text-slate-500">
                <div>
                  <p className="text-lg font-medium text-slate-900">Select a node</p>
                  <p className="mt-2 text-sm">
                    The side panel shows the rich metadata derived from the visualizer API data.
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
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

function miniMapColor(kind?: GraphKind) {
  switch (kind) {
    case "agent":
      return "#10b981";
    case "connector":
      return "#f97316";
    case "mcp":
      return "#8b5cf6";
    default:
      return "#38bdf8";
  }
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6 rounded-xl border border-sky-200 bg-white px-4 py-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-950">{value}</span>
    </div>
  );
}
