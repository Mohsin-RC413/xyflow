"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from "@xyflow/react";
import {
  VISUALIZER_SOURCE_URL,
  createVisualizerGraph,
  getMiniMapColor,
  visualizerNodeTypes,
  type GraphNodeData,
} from "./visualizer";

export default function DashboardPage() {
  const router = useRouter();
  const [selectedNode, setSelectedNode] = useState<GraphNodeData | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<GraphNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    const graph = createVisualizerGraph();
    setNodes(graph.nodes);
    setEdges(graph.edges);
  }, [setEdges, setNodes]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#ffffff_0%,#eff6ff_42%,#dbeafe_100%)] text-slate-900">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[size:72px_72px] opacity-60" />
      <section className="relative z-10 flex min-h-screen flex-col">
        <header className="border-b border-sky-200/80 bg-white/50 px-6 py-5 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Visualizer Graph</h1>
              <p className="mt-1 max-w-3xl text-sm text-slate-600">
                Static visualization derived from the visualizer payload for
                ` {VISUALIZER_SOURCE_URL}`.
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
        </header>

        <div className="relative flex-1">
          <div className="absolute inset-0">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={visualizerNodeTypes}
              fitView
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodesDraggable
              nodesConnectable={false}
              elementsSelectable
              defaultEdgeOptions={{
                type: "simplebezier",
                style: {
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
                nodeColor={(node) => getMiniMapColor(node.data?.kind)}
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

                <div className="mt-6">
                  <div className="text-xs uppercase tracking-[0.28em] text-sky-700">
                    Node details
                  </div>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                    {selectedNode.name}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">{selectedNode.role}</p>
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
                    The side panel shows the key metadata derived from the visualizer data.
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
