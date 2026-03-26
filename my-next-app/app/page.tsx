"use client";

import { useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  MarkerType,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { agentMembers, type AgentMember } from "./family-tree-data";

const nodes: Node[] = agentMembers.map((member) => ({
  id: member.id,
  position:
    member.id === "supervisor"
      ? { x: 440, y: 40 }
      : {
          x:
            {
              researcher: 60,
              coder: 340,
              tester: 620,
              ops: 900,
            }[member.id] ?? 60,
          y: 300,
        },
  data: member,
  type: "agent",
  sourcePosition: Position.Bottom,
  targetPosition: Position.Top,
}));

const edges: Edge[] = [
  {
    id: "e-supervisor-researcher",
    source: "supervisor",
    target: "researcher",
    type: "simplebezier",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e-supervisor-coder",
    source: "supervisor",
    target: "coder",
    type: "simplebezier",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e-supervisor-tester",
    source: "supervisor",
    target: "tester",
    type: "simplebezier",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e-supervisor-ops",
    source: "supervisor",
    target: "ops",
    type: "simplebezier",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
];

function AgentNode({ data }: NodeProps<AgentMember>) {
  const member = data;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-2 !border-sky-500 !bg-white"
      />
      <div className="group relative min-w-52 rounded-2xl border border-sky-200 bg-white/95 px-4 py-3 text-left text-slate-900 shadow-[0_20px_60px_rgba(56,189,248,0.18)] backdrop-blur">
        <div className="text-[11px] uppercase tracking-[0.24em] text-sky-700">
          {member.role}
        </div>
        <div className="mt-1 text-lg font-semibold text-slate-950">{member.name}</div>
        <div className="mt-1 text-sm text-slate-600">{member.specialty}</div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>{member.model}</span>
          <span>{member.status}</span>
        </div>
        <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 hidden w-72 -translate-x-1/2 rounded-2xl border border-sky-200 bg-white px-4 py-3 text-xs text-slate-700 shadow-2xl group-hover:block">
          <div className="text-[10px] uppercase tracking-[0.22em] text-sky-700">
            Hover preview
          </div>
          <div className="mt-2 text-sm font-medium text-slate-950">{member.summary}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {member.mcpTools.map((tool) => (
              <span
                key={tool}
                className="rounded-full bg-sky-50 px-2 py-1 text-[11px] text-sky-800"
              >
                {tool}
              </span>
            ))}
          </div>
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
  agent: AgentNode,
};

export default function Home() {
  const [selectedMember, setSelectedMember] = useState<AgentMember | null>(null);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#ffffff_0%,#eff6ff_42%,#dbeafe_100%)] text-slate-900">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[size:72px_72px] opacity-60" />
      <section className="relative z-10 flex min-h-screen flex-col">
        <div className="border-b border-sky-200/80 bg-white/50 px-6 py-5 backdrop-blur-sm">
          <h1 className="text-2xl font-semibold tracking-tight">AI Agent Canvas</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Click a node to open the details panel inside the canvas. Hover a node to preview
            its model, MCP tools, and role.
          </p>
        </div>

        <div className="relative flex-1">
          <div className="absolute inset-0">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              defaultEdgeOptions={{
                type: "simplebezier",
                markerEnd: { type: MarkerType.ArrowClosed },
                style: {
                  stroke: "#0284c7",
                  strokeWidth: 3,
                },
              }}
              onNodeClick={(_, node) => setSelectedMember(node.data as AgentMember)}
              proOptions={{ hideAttribution: true }}
            >
              <Background gap={28} color="rgba(96,165,250,0.24)" />
              <Controls />
              <MiniMap
                zoomable
                pannable
                nodeColor="#38bdf8"
                maskColor="rgba(219, 234, 254, 0.65)"
              />
            </ReactFlow>
          </div>

          <aside
            className={`absolute right-0 top-0 z-20 h-full w-full max-w-md border-l border-sky-200 bg-white/90 p-6 shadow-2xl shadow-sky-200/40 backdrop-blur-xl transition-transform duration-300 ${
              selectedMember ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {selectedMember ? (
              <div className="flex h-full flex-col">
                <button
                  type="button"
                  className="self-end rounded-full border border-sky-200 px-3 py-1 text-sm text-slate-700 hover:bg-sky-50"
                  onClick={() => setSelectedMember(null)}
                >
                  Close
                </button>
                <div className="mt-6">
                  <div className="text-xs uppercase tracking-[0.28em] text-sky-700">
                    Node details
                  </div>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                    {selectedMember.name}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">{selectedMember.role}</p>
                </div>

                <div className="mt-8 space-y-4 text-sm text-slate-700">
                  <InfoRow label="Model" value={selectedMember.model} />
                  <InfoRow label="Specialty" value={selectedMember.specialty} />
                  <InfoRow label="Status" value={selectedMember.status} />
                  <InfoRow label="MCP tools" value={selectedMember.mcpTools.join(", ")} />
                </div>

                <div className="mt-8 rounded-2xl border border-sky-200 bg-sky-50 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-sky-700">
                    About
                  </div>
                  <p className="mt-3 leading-6 text-slate-700">{selectedMember.summary}</p>
                  <div className="mt-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-sky-700">
                      Responsibilities
                    </div>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {selectedMember.responsibilities.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-slate-500">
                <div>
                  <p className="text-lg font-medium text-slate-900">Select an agent</p>
                  <p className="mt-2 text-sm">
                    The slide-over will appear here with the full node information.
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6 rounded-xl border border-sky-200 bg-white px-4 py-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-950">{value}</span>
    </div>
  );
}
