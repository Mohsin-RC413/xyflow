export type VisualizerAgent = {
  agent_id: string;
  name: string;
  type: string;
  status: string;
  isEnabled: boolean;
  description: string;
  instruction: string;
  connector_config_ids: string[];
  mcp_servers: string[];
  sub_agents: string[];
  model: {
    provider: string;
    name: string;
  };
  webhooks: Array<{
    webhook_id: string;
    prompt: string;
  }>;
};

export type VisualizerConnector = {
  connector_config_id: string;
  connector_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  config: Array<{ name: string }>;
};

export type VisualizerMcp = {
  name: string;
  url: string;
};

export type VisualizerNode =
  | { id: string; type: "agent"; data: { agent: VisualizerAgent } }
  | { id: string; type: "connector"; data: { connector: VisualizerConnector } }
  | { id: string; type: "mcp"; data: { mcp: VisualizerMcp } };

export type VisualizerEdge = {
  id: string;
  source: string;
  target: string;
};

export type VisualizerResponse = {
  nodes: VisualizerNode[];
  edges: VisualizerEdge[];
};

export const visualizerResponse: VisualizerResponse = {
  nodes: [
    {
      id: "supervisor",
      type: "agent",
      data: {
        agent: {
          agent_id: "supervisor",
          name: "Supervisor Agent",
          type: "agent",
          status: "active",
          isEnabled: true,
          description: "Coordinates specialized sub-agents and merges final output.",
          instruction:
            "You are a Supervisor Agent responsible for coordinating multiple specialized sub-agents to complete complex tasks efficiently and accurately. Understand requests, split them into subtasks, delegate correctly, track dependencies, validate outputs, and integrate the final response.",
          connector_config_ids: [],
          mcp_servers: [],
          sub_agents: ["datadog_agent", "servicenow_agent", "mq_agent"],
          model: {
            provider: "anthropic",
            name: "claude-haiku-4-5-20251001",
          },
          webhooks: [],
        },
      },
    },
    {
      id: "cloudflare_agent",
      type: "agent",
      data: {
        agent: {
          agent_id: "cloudflare_agent",
          name: "Cloudflare Agent",
          type: "agent",
          status: "active",
          isEnabled: true,
          description: "Specialized for Cloudflare tooling and documentation lookup.",
          instruction:
            "You are cloudflare agent. You have access to cloudflare tools documentations.",
          connector_config_ids: [],
          mcp_servers: ["https://docs.mcp.cloudflare.com/mcp"],
          sub_agents: [],
          model: {
            provider: "openai",
            name: "gpt-5.4",
          },
          webhooks: [],
        },
      },
    },
    {
      id: "mq_agent",
      type: "agent",
      data: {
        agent: {
          agent_id: "mq_agent",
          name: "MQ Agent",
          type: "agent",
          status: "active",
          isEnabled: true,
          description: "Investigates IBM MQ queues, brokers, channels, and logs.",
          instruction:
            "You are an MQ agent and have access to tools. Use the available tools to investigate MQ issues, perform relevant operations, and provide clear operational guidance.",
          connector_config_ids: [],
          mcp_servers: ["https://ibm-mq-mcp-428716175586.us-central1.run.app/mcp"],
          sub_agents: [],
          model: {
            provider: "google",
            name: "gemini-3-flash-preview",
          },
          webhooks: [],
        },
      },
    },
    {
      id: "test_agent",
      type: "agent",
      data: {
        agent: {
          agent_id: "test_agent",
          name: "Test Agent",
          type: "automation",
          status: "active",
          isEnabled: true,
          description: "Automation test agent.",
          instruction: "You are an automation agent.",
          connector_config_ids: [],
          mcp_servers: [],
          sub_agents: [],
          model: {
            provider: "google",
            name: "gemini-3-flash-preview",
          },
          webhooks: [
            {
              webhook_id: "4303ef22-9621-439c-9666-80aa9e4ebb37",
              prompt:
                "Check MQ QManager Status if this is down. Create a ServiceNow ticket with relevant details.",
            },
          ],
        },
      },
    },
    {
      id: "datadog_agent",
      type: "agent",
      data: {
        agent: {
          agent_id: "datadog_agent",
          name: "DataDog Agent",
          type: "agent",
          status: "active",
          isEnabled: true,
          description: "Observability agent for logs, dashboards, alerts, and metrics.",
          instruction:
            "You are a DataDog agent and have access to tools. Use the available tools to inspect and analyze logs.",
          connector_config_ids: ["2c2326a7-d2f3-4fdf-be68-e74883026ce6"],
          mcp_servers: [],
          sub_agents: [],
          model: {
            provider: "anthropic",
            name: "claude-sonnet-4-6",
          },
          webhooks: [],
        },
      },
    },
    {
      id: "servicenow_agent",
      type: "agent",
      data: {
        agent: {
          agent_id: "servicenow_agent",
          name: "ServiceNow Agent",
          type: "agent",
          status: "active",
          isEnabled: true,
          description: "Handles incidents, tickets, and workflow updates in ServiceNow.",
          instruction:
            "You are a ServiceNow agent and have access to tools. Use the available tools to review incidents, perform ticket-related actions, and respond with clear operational updates.",
          connector_config_ids: ["bbeab06e-bc46-4435-9868-3aa1f846cc2b"],
          mcp_servers: [],
          sub_agents: [],
          model: {
            provider: "google",
            name: "gemini-3-flash-preview",
          },
          webhooks: [],
        },
      },
    },
    {
      id: "demo_agent",
      type: "agent",
      data: {
        agent: {
          agent_id: "demo_agent",
          name: "Demo Agent",
          type: "agent",
          status: "active",
          isEnabled: true,
          description: "General demo agent used for sample visualization.",
          instruction: "This is a demo agent.",
          connector_config_ids: [],
          mcp_servers: ["https://localhost:8001/mcp"],
          sub_agents: [],
          model: {
            provider: "google",
            name: "gemini-2.5-pro",
          },
          webhooks: [],
        },
      },
    },
    {
      id: "2c2326a7-d2f3-4fdf-be68-e74883026ce6",
      type: "connector",
      data: {
        connector: {
          connector_config_id: "2c2326a7-d2f3-4fdf-be68-e74883026ce6",
          connector_id: "datadog_connector",
          name: "Datadog Connector for Mule",
          description: null,
          created_at: "2026-03-25T12:31:07.991423",
          updated_at: "2026-03-25T12:31:07.991434",
          config: [
            { name: "DD_API_KEY" },
            { name: "DD_APP_KEY" },
            { name: "DD_SITE" },
            { name: "prefix" },
          ],
        },
      },
    },
    {
      id: "bbeab06e-bc46-4435-9868-3aa1f846cc2b",
      type: "connector",
      data: {
        connector: {
          connector_config_id: "bbeab06e-bc46-4435-9868-3aa1f846cc2b",
          connector_id: "servicenow_connector",
          name: "Servicenow Connector",
          description: null,
          created_at: "2026-03-25T12:55:07.356743",
          updated_at: "2026-03-25T12:55:07.356753",
          config: [
            { name: "SERVICENOW_INSTANCE_URL" },
            { name: "SERVICENOW_USERNAME" },
            { name: "SERVICENOW_PASSWORD" },
            { name: "SERVICENOW_AUTH_TYPE" },
            { name: "prefix" },
          ],
        },
      },
    },
    {
      id: "https://ibm-mq-mcp-428716175586.us-central1.run.app/mcp",
      type: "mcp",
      data: {
        mcp: {
          name: "IBM MQ MCP",
          url: "https://ibm-mq-mcp-428716175586.us-central1.run.app/mcp",
        },
      },
    },
    {
      id: "https://localhost:8001/mcp",
      type: "mcp",
      data: {
        mcp: {
          name: "Localhost MCP",
          url: "https://localhost:8001/mcp",
        },
      },
    },
    {
      id: "https://docs.mcp.cloudflare.com/mcp",
      type: "mcp",
      data: {
        mcp: {
          name: "Cloudflare Docs MCP",
          url: "https://docs.mcp.cloudflare.com/mcp",
        },
      },
    },
  ],
  edges: [
    { id: "e-supervisor-datadog_agent", source: "supervisor", target: "datadog_agent" },
    { id: "e-supervisor-servicenow_agent", source: "supervisor", target: "servicenow_agent" },
    { id: "e-supervisor-mq_agent", source: "supervisor", target: "mq_agent" },
    {
      id: "e-cloudflare_agent-https://docs.mcp.cloudflare.com/mcp",
      source: "cloudflare_agent",
      target: "https://docs.mcp.cloudflare.com/mcp",
    },
    {
      id: "e-mq_agent-https://ibm-mq-mcp-428716175586.us-central1.run.app/mcp",
      source: "mq_agent",
      target: "https://ibm-mq-mcp-428716175586.us-central1.run.app/mcp",
    },
    {
      id: "e-datadog_agent-2c2326a7-d2f3-4fdf-be68-e74883026ce6",
      source: "datadog_agent",
      target: "2c2326a7-d2f3-4fdf-be68-e74883026ce6",
    },
    {
      id: "e-servicenow_agent-bbeab06e-bc46-4435-9868-3aa1f846cc2b",
      source: "servicenow_agent",
      target: "bbeab06e-bc46-4435-9868-3aa1f846cc2b",
    },
    {
      id: "e-demo_agent-https://localhost:8001/mcp",
      source: "demo_agent",
      target: "https://localhost:8001/mcp",
    },
  ],
};
