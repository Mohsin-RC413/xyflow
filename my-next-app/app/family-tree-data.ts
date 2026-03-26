export type AgentMember = {
  id: string;
  name: string;
  role: string;
  model: string;
  specialty: string;
  mcpTools: string[];
  status: string;
  summary: string;
  responsibilities: string[];
};

export const agentMembers: AgentMember[] = [
  {
    id: "supervisor",
    name: "Orion Supervisor",
    role: "Supervisor Agent",
    model: "GPT-5.1",
    specialty: "Task routing, policy checks, and orchestration",
    mcpTools: ["Calendar MCP", "Docs MCP", "Tickets MCP"],
    status: "Active",
    summary:
      "Receives the user request, breaks it into workstreams, delegates to sub-agents, and merges the final answer.",
    responsibilities: [
      "Clarify intent and constraints",
      "Assign work to specialized sub-agents",
      "Review outputs before responding",
    ],
  },
  {
    id: "researcher",
    name: "Nova Researcher",
    role: "Sub-Agent",
    model: "GPT-5.1-mini",
    specialty: "Search, extraction, and source checking",
    mcpTools: ["Web Search MCP", "Docs MCP"],
    status: "Active",
    summary:
      "Collects facts, checks references, and prepares concise evidence for the supervisor.",
    responsibilities: [
      "Find relevant facts and sources",
      "Summarize supporting evidence",
      "Flag uncertainty or missing context",
    ],
  },
  {
    id: "coder",
    name: "Atlas Coder",
    role: "Sub-Agent",
    model: "GPT-5.1-codex",
    specialty: "Implementation and refactoring",
    mcpTools: ["Git MCP", "Filesystem MCP"],
    status: "Active",
    summary:
      "Implements code changes, edits files, and keeps changes aligned with the task scope.",
    responsibilities: [
      "Patch source files",
      "Preserve existing conventions",
      "Report changed file list",
    ],
  },
  {
    id: "tester",
    name: "Helix Tester",
    role: "Sub-Agent",
    model: "GPT-5.1-mini",
    specialty: "Verification and regression checks",
    mcpTools: ["Test Runner MCP", "Diagnostics MCP"],
    status: "Active",
    summary:
      "Runs lightweight validation, looks for regressions, and reports confidence levels.",
    responsibilities: [
      "Check UI behavior",
      "Spot layout or runtime issues",
      "Confirm task completion",
    ],
  },
  {
    id: "ops",
    name: "Mira Ops",
    role: "Sub-Agent",
    model: "GPT-5.1",
    specialty: "MCP integration and environment operations",
    mcpTools: ["MCP Registry", "Secrets MCP", "Deploy MCP"],
    status: "Standby",
    summary:
      "Keeps MCP tools available, manages environment assumptions, and supports operational tasks.",
    responsibilities: [
      "Maintain tool availability",
      "Coordinate environment access",
      "Assist with deployment steps",
    ],
  },
];

