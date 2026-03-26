"use client";

import { useEffect, useState } from "react";
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
  type OnConnect,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { agentMembers, type AgentMember } from "./family-tree-data";
import sharePointLogo from "../img/SharePoint-Symbol.png";

type GraphKind = "chatops" | "supervisor" | "subagent" | "connector" | "mcp" | "llm" | "endpoint";

type GraphNodeData = {
  id: string;
  kind: GraphKind;
  name: string;
  role: string;
  status: string;
  summary: string;
  tags: string[];
  detailItems: Array<{ label: string; value: string }>;
  responsibilities: string[];
  imageSrc?: typeof sharePointLogo;
};

const primaryPositions: Record<string, { x: number; y: number }> = {
  chatops: { x: 520, y: -220 },
  supervisor: { x: 520, y: 20 },
  researcher: { x: 80, y: 320 },
  coder: { x: 420, y: 320 },
  tester: { x: 760, y: 320 },
  ops: { x: 1100, y: 320 },
};

function createGraph(members: AgentMember[]) {
  const nodes: Node<GraphNodeData>[] = [];
  const edges: Edge[] = [];

  for (const member of members) {
    const position = primaryPositions[member.id] ?? { x: 0, y: 0 };

    nodes.push({
      id: member.id,
      type: "entity",
      position,
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      data: {
        id: member.id,
        kind: member.kind,
        name: member.name,
        role: member.role,
        status: member.status,
        summary: member.specialty,
        tags: [
          member.model,
          member.status,
        ],
        detailItems: [
          { label: "Model", value: member.model },
          { label: "Specialty", value: member.specialty },
          { label: "Status", value: member.status },
        ],
        responsibilities: member.responsibilities,
      },
    });

    if (member.id === "chatops") {
      edges.push(linkEdge("chatops", "supervisor"));
    }

    if (member.id !== "chatops" && member.id !== "supervisor") {
      edges.push(linkEdge("supervisor", member.id));
    }

    if (member.kind !== "subagent") {
      continue;
    }

    const selection = pickResourceSelection();

    if (selection.connector) {
      member.connectors.forEach((connector, index) => {
        const nodeId = `${member.id}-${connector.id}`;
        nodes.push({
          id: nodeId,
          type: "resource",
          position: {
            x: position.x - 60 + index * 120,
            y: position.y + 210,
          },
          targetPosition: Position.Top,
          sourcePosition: Position.Bottom,
          data: {
            id: nodeId,
            kind: "connector",
            name: connector.name,
            role: connector.platform,
            status: connector.connected ? "Connected" : "Disconnected",
            summary: connector.purpose,
            tags: [connector.platform],
            detailItems: [
              { label: "Platform", value: connector.platform },
              { label: "Connected", value: connector.connected ? "True" : "False" },
            ],
            responsibilities: [`Purpose: ${connector.purpose}`],
          },
        });
        edges.push(linkEdge(member.id, nodeId, "#f97316"));
      });
    }

    if (selection.mcp) {
      member.mcps.forEach((mcp, index) => {
        const nodeId = `${member.id}-${mcp.id}`;
        nodes.push({
          id: nodeId,
          type: "resource",
          position: {
            x: position.x + 100 + index * 120,
            y: position.y + 210,
          },
          targetPosition: Position.Top,
          sourcePosition: Position.Bottom,
          data: {
            id: nodeId,
            kind: "mcp",
            name: mcp.name,
            role: "MCP Server",
            status: mcp.connected ? "Connected" : "Disconnected",
            summary: mcp.scope,
            tags: [mcp.name],
            detailItems: [
              { label: "Server", value: mcp.server },
              { label: "Connected", value: mcp.connected ? "True" : "False" },
            ],
            responsibilities: [`Scope: ${mcp.scope}`],
          },
        });
        edges.push(linkEdge(member.id, nodeId, "#8b5cf6"));

        if (mcp.targetApp) {
          const endpointNodeId = `${nodeId}-${mcp.targetApp.id}`;
          nodes.push({
            id: endpointNodeId,
            type: "resource",
            position: {
              x: position.x + 300 + index * 140,
              y: position.y + 210,
            },
            targetPosition: Position.Left,
            sourcePosition: Position.Right,
            data: {
              id: endpointNodeId,
              kind: "endpoint",
              name: mcp.targetApp.name,
              role: "Connected app",
              status: "Available",
              summary: mcp.targetApp.summary,
              tags: ["SharePoint"],
              detailItems: [
                { label: "Type", value: "Endpoint app" },
                { label: "Linked by", value: mcp.name },
              ],
              responsibilities: ["Stores runbooks and operational documents."],
              imageSrc: sharePointLogo,
            },
          });
          edges.push(linkEdge(nodeId, endpointNodeId, "#2563eb"));
        }
      });
    }

    if (member.llm?.connected && selection.llm) {
      const nodeId = `${member.id}-llm`;
      nodes.push({
        id: nodeId,
        type: "resource",
        position: {
          x: position.x + 260,
          y: position.y + 210,
        },
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
        data: {
          id: nodeId,
          kind: "llm",
          name: member.llm.model,
          role: member.llm.provider,
          status: "Connected",
          summary: member.llm.purpose,
          tags: [member.llm.provider],
          detailItems: [
            { label: "Model", value: member.llm.model },
            { label: "Provider", value: member.llm.provider },
          ],
          responsibilities: [`Purpose: ${member.llm.purpose}`],
        },
      });
      edges.push(linkEdge(member.id, nodeId, "#0ea5e9"));
    }
  }

  return { nodes, edges };
}

function pickResourceSelection() {
  return {
    connector: Math.random() >= 0.5,
    mcp: Math.random() >= 0.5,
    llm: Math.random() >= 0.5,
  };
}

function linkEdge(source: string, target: string, stroke = "#0284c7"): Edge {
  return {
    id: `e-${source}-${target}`,
    source,
    target,
    type: "simplebezier",
    markerEnd: { type: MarkerType.ArrowClosed, color: stroke },
    style: {
      stroke,
      strokeWidth: 3,
    },
  };
}

function EntityNode({ data }: NodeProps<Node<GraphNodeData>["data"]>) {
  if (!data) {
    return null;
  }

  const isResource =
    data.kind === "connector" || data.kind === "mcp" || data.kind === "llm" || data.kind === "endpoint";

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-2 !border-sky-500 !bg-white"
      />
      <div
        className={`group relative text-left backdrop-blur ${
          isResource
            ? "min-w-44 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-[0_18px_45px_rgba(148,163,184,0.18)]"
            : "min-w-56 rounded-3xl border border-sky-200 bg-white/95 px-4 py-4 shadow-[0_20px_60px_rgba(56,189,248,0.18)]"
        }`}
      >
        <div className="flex items-start gap-3">
          {data.kind === "endpoint" && data.imageSrc ? (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-sky-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.imageSrc.src}
                alt={`${data.name} logo`}
                className="h-7 w-7 object-contain"
              />
            </div>
          ) : (
            <NodeLogo kind={data.kind} />
          )}
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.24em] text-sky-700">{data.role}</div>
            <div className="mt-1 text-lg font-semibold text-slate-950">{data.name}</div>
            <div className="mt-1 text-sm text-slate-600">{data.summary}</div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>{data.kind.toUpperCase()}</span>
          <span>{data.status}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {data.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-sky-50 px-2 py-1 text-[11px] text-sky-800"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 hidden w-72 -translate-x-1/2 rounded-2xl border border-sky-200 bg-white px-4 py-3 text-xs text-slate-700 shadow-2xl group-hover:block">
          <div className="text-[10px] uppercase tracking-[0.22em] text-sky-700">Hover preview</div>
          <div className="mt-2 text-sm font-medium text-slate-950">{data.name}</div>
          <div className="mt-2 leading-5 text-slate-600">{data.summary}</div>
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
  entity: EntityNode,
  resource: EntityNode,
};

export default function Home() {
  const [selectedNode, setSelectedNode] = useState<GraphNodeData | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<GraphNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    const graph = createGraph(agentMembers);
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
          <h1 className="text-2xl font-semibold tracking-tight">AI Agent Canvas</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Click a node to inspect details. Only sub-agents are linked to LLM, MCP, and connector
            resources.
          </p>
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
            className={`absolute right-0 top-0 z-20 h-full w-full max-w-md border-l border-sky-200 bg-white/92 p-6 shadow-2xl shadow-sky-200/40 backdrop-blur-xl transition-transform duration-300 ${
              selectedNode ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {selectedNode ? (
              <div className="flex h-full flex-col">
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
                  <p className="mt-3 leading-6 text-slate-700">{selectedNode.summary}</p>
                  {selectedNode.responsibilities.length > 0 ? (
                    <>
                      <div className="mt-4 text-xs uppercase tracking-[0.24em] text-sky-700">
                        Responsibilities
                      </div>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                        {selectedNode.responsibilities.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-slate-500">
                <div>
                  <p className="text-lg font-medium text-slate-900">Select a node</p>
                  <p className="mt-2 text-sm">
                    The side panel shows agent, LLM, MCP, and connector metadata.
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
    chatops: "from-sky-500 to-cyan-400",
    supervisor: "from-indigo-500 to-sky-500",
    subagent: "from-emerald-500 to-teal-400",
    connector: "from-orange-500 to-amber-400",
    mcp: "from-violet-500 to-fuchsia-400",
    llm: "from-cyan-500 to-blue-500",
    endpoint: "from-blue-500 to-sky-400",
  }[kind];

  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${palette} text-white shadow-lg`}
    >
      {kind === "chatops" ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]">
          <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H11l-4 4v-4H6.5A2.5 2.5 0 0 1 4 13.5Z" />
          <path d="M8 9h8M8 12h5" />
        </svg>
      ) : null}
      {kind === "supervisor" ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]">
          <path d="M12 3l7 3v5c0 5-3.2 8.3-7 10-3.8-1.7-7-5-7-10V6z" />
          <path d="M9.5 11.5l1.8 1.8 3.7-4.3" />
        </svg>
      ) : null}
      {kind === "subagent" ? (
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
      {kind === "llm" ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]">
          <path d="M12 4a4 4 0 0 1 4 4v1h1a3 3 0 1 1 0 6h-1v1a4 4 0 1 1-8 0v-1H7a3 3 0 1 1 0-6h1V8a4 4 0 0 1 4-4Z" />
          <path d="M10 10h4M10 14h4" />
        </svg>
      ) : null}
    </div>
  );
}

function miniMapColor(kind?: GraphKind) {
  switch (kind) {
    case "chatops":
      return "#0ea5e9";
    case "supervisor":
      return "#4f46e5";
    case "subagent":
      return "#10b981";
    case "connector":
      return "#f97316";
    case "mcp":
      return "#8b5cf6";
    case "llm":
      return "#06b6d4";
    case "endpoint":
      return "#2563eb";
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
