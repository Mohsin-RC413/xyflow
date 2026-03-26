export type ConnectorBinding = {
  id: string;
  name: string;
  platform: string;
  connected: boolean;
  purpose: string;
};

export type McpBinding = {
  id: string;
  name: string;
  server: string;
  connected: boolean;
  scope: string;
  targetApp?: {
    id: string;
    name: string;
    summary: string;
  };
};

export type LlmBinding = {
  connected: boolean;
  model: string;
  provider: string;
  purpose: string;
};

export type AgentMember = {
  id: string;
  name: string;
  kind: "chatops" | "supervisor" | "subagent";
  role: string;
  model: string;
  specialty: string;
  status: string;
  summary: string;
  responsibilities: string[];
  llm: LlmBinding | null;
  mcps: McpBinding[];
  connectors: ConnectorBinding[];
};

export const agentMembers: AgentMember[] = [
  {
    id: "chatops",
    name: "Pulse ChatOps",
    kind: "chatops",
    role: "ChatOps Gateway",
    model: "Event Router",
    specialty: "Routes incoming chat commands",
    status: "Online",
    summary: "Entry point for chat-driven operations.",
    responsibilities: [
      "Capture chat commands from users",
      "Normalize request context and metadata",
      "Send approved tasks to the supervisor agent",
    ],
    llm: null,
    mcps: [],
    connectors: [],
  },
  {
    id: "supervisor",
    name: "Orion Supervisor",
    kind: "supervisor",
    role: "Supervisor Agent",
    model: "GPT-5.1",
    specialty: "Orchestrates the sub-agents",
    status: "Active",
    summary: "Breaks work into tasks and delegates execution.",
    responsibilities: [
      "Clarify intent and constraints",
      "Assign work to specialized sub-agents",
      "Review outputs before responding",
    ],
    llm: null,
    mcps: [],
    connectors: [],
  },
  {
    id: "researcher",
    name: "Nova Researcher",
    kind: "subagent",
    role: "Sub-Agent",
    model: "GPT-5.1-mini",
    specialty: "Search and evidence gathering",
    status: "Active",
    summary: "Collects facts and supporting evidence.",
    responsibilities: [
      "Find relevant facts and sources",
      "Summarize supporting evidence",
      "Flag uncertainty or missing context",
    ],
    llm: {
      connected: true,
      model: "gpt-5.1-mini",
      provider: "OpenAI",
      purpose: "Research and synthesis",
    },
    mcps: [
      {
        id: "researcher-web-mcp",
        name: "Web Search MCP",
        server: "mcp://web-search",
        connected: true,
        scope: "Live web and document discovery",
      },
    ],
    connectors: [
      {
        id: "researcher-jira",
        name: "Jira Connector",
        platform: "Jira",
        connected: true,
        purpose: "Reads ticket context",
      },
    ],
  },
  {
    id: "coder",
    name: "Atlas Coder",
    kind: "subagent",
    role: "Sub-Agent",
    model: "GPT-5.1-codex",
    specialty: "Code changes and refactoring",
    status: "Active",
    summary: "Edits source code and prepares changes.",
    responsibilities: [
      "Patch source files",
      "Preserve existing conventions",
      "Report changed file list",
    ],
    llm: {
      connected: true,
      model: "gpt-5.1-codex",
      provider: "OpenAI",
      purpose: "Coding assistance",
    },
    mcps: [],
    connectors: [
      {
        id: "coder-git",
        name: "Git Connector",
        platform: "Git",
        connected: true,
        purpose: "Reads repository history",
      },
    ],
  },
  {
    id: "tester",
    name: "Helix Tester",
    kind: "subagent",
    role: "Sub-Agent",
    model: "GPT-5.1-mini",
    specialty: "Checks behavior and regressions",
    status: "Active",
    summary: "Validates behavior and flags regressions.",
    responsibilities: [
      "Check UI behavior",
      "Spot layout or runtime issues",
      "Confirm task completion",
    ],
    llm: null,
    mcps: [
      {
        id: "tester-diagnostics-mcp",
        name: "Diagnostics MCP",
        server: "mcp://diagnostics",
        connected: true,
        scope: "Health checks and logs",
      },
    ],
    connectors: [],
  },
  {
    id: "ops",
    name: "Mira Ops",
    kind: "subagent",
    role: "Sub-Agent",
    model: "GPT-5.2",
    specialty: "Environment and MCP operations",
    status: "Standby",
    summary: "Maintains tools and runtime operations.",
    responsibilities: [
      "Maintain tool availability",
      "Coordinate environment access",
      "Assist with deployment steps",
    ],
    llm: {
      connected: true,
      model: "gpt-5.2",
      provider: "OpenAI",
      purpose: "Operations support",
    },
    mcps: [
      {
        id: "ops-registry-mcp",
        name: "MCP Registry",
        server: "mcp://registry",
        connected: true,
        scope: "Tool discovery and registration",
        targetApp: {
          id: "sharepoint",
          name: "SharePoint",
          summary: "Publishes operational documents and runbooks.",
        },
      },
    ],
    connectors: [],
  },
];
