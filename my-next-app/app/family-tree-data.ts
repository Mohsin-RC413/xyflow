export type VisualizerAgentModel = {
  provider: string;
  model_id: string;
  api_key: string;
  updated_at: string;
  description: string;
  created_at: string;
  name: string;
  isEnabled: boolean;
};

export type VisualizerWebhook = {
  created_at: string;
  agent_id: string;
  prompt: string;
  webhook_id: string;
  updated_at: string;
};

export type VisualizerAgent = {
  description: string;
  agent_id: string;
  instruction: string;
  model_id: string;
  tools: string | null;
  isEnabled: boolean;
  created_at: string;
  updated_at: string;
  status: string;
  type: string;
  name: string;
  connector_config_ids: string[];
  mcp_servers: string[];
  tags: string[] | null;
  sub_agents: string[];
  model: VisualizerAgentModel;
  webhooks: VisualizerWebhook[];
  jobs: unknown[];
};

export type VisualizerConnector = {
  name: string;
  connector_config_id: string;
  description: string | null;
  updated_at: string;
  created_at: string;
  config: Array<{ name: string; value: string }>;
  connector_id: string;
};

export type VisualizerMcp = {
  name: string;
  url: string;
};

export type VisualizerNode = {
  id: string;
  type: "agent" | "connector" | "mcp";
  data: {
    agent?: VisualizerAgent;
    connector?: VisualizerConnector;
    mcp?: VisualizerMcp;
  };
};

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
          description: "This is Supervisor Agent",
          agent_id: "supervisor",
          instruction:
            "You are a Supervisor Agent responsible for coordinating multiple specialized sub-agents to complete complex tasks efficiently and accurately.\n\n## Your Responsibilities\n1. Understand the user’s request clearly.\n2. Break the task into smaller, well-defined subtasks.\n3. Assign each subtask to the most appropriate sub-agent.\n4. Provide clear instructions and context to each sub-agent.\n5. Track progress and handle dependencies between subtasks.\n6. Validate and integrate outputs from sub-agents into a final response.\n7. Resolve conflicts, inconsistencies, or missing information.\n8. Ensure the final output meets quality, accuracy, and completeness standards.\n\nIf the user asks about TR1-app check datadog logs and servicenow incidents",
          model_id: "anthropic_claude_haiku_4_5_20251001",
          tools: "",
          isEnabled: true,
          created_at: "2026-03-25T13:32:16.202534",
          updated_at: "2026-03-25T13:32:16.202542",
          status: "active",
          type: "agent",
          name: "Supervisor Agent",
          connector_config_ids: [],
          mcp_servers: [],
          tags: null,
          sub_agents: ["datadog_agent", "servicenow_agent", "mq_agent"],
          model: {
            provider: "anthropic",
            model_id: "anthropic_claude_haiku_4_5_20251001",
            api_key: "***",
            updated_at: "2026-03-25T11:59:30.761277",
            description: "Claude Haiku",
            created_at: "2026-03-25T11:59:30.761269",
            name: "claude-haiku-4-5-20251001",
            isEnabled: true,
          },
          webhooks: [],
          jobs: [],
        },
      },
    },
    {
      id: "cloudflare_agent",
      type: "agent",
      data: {
        agent: {
          description: "You are Cloudflare Agent",
          agent_id: "cloudflare_agent",
          instruction:
            "You are cloudflare agent. You have access to cloudflare tools documentations.",
          model_id: "openai_gpt_5_4",
          tools: "",
          isEnabled: true,
          created_at: "2026-03-25T14:00:27.541754",
          updated_at: "2026-03-25T14:00:27.541765",
          status: "active",
          type: "agent",
          name: "Cloudflare Agent",
          connector_config_ids: [],
          mcp_servers: ["https://docs.mcp.cloudflare.com/mcp"],
          tags: null,
          sub_agents: [],
          model: {
            provider: "openai",
            model_id: "openai_gpt_5_4",
            api_key: "***",
            updated_at: "2026-03-25T13:56:12.165813",
            description: "GPT 5.4 from OpenAI",
            created_at: "2026-03-25T13:56:12.165805",
            name: "gpt-5.4",
            isEnabled: true,
          },
          webhooks: [],
          jobs: [],
        },
      },
    },
    {
      id: "mq_agent",
      type: "agent",
      data: {
        agent: {
          description:
            "MQ operations agent with access to tools for investigating queue, message flow, and broker issues.",
          agent_id: "mq_agent",
          instruction:
            "You are an MQ agent and have access to tools. Use the available tools to investigate MQ issues, perform relevant operations, and provide clear operational guidance.",
          model_id: "google_gemini_3_flash_preview",
          tools: "",
          isEnabled: true,
          created_at: "2026-03-25T13:10:30.761287",
          updated_at: "2026-03-25T13:10:30.761298",
          status: "active",
          type: "agent",
          name: "MQ Agent",
          connector_config_ids: [],
          mcp_servers: [
            "https://ibm-mq-mcp-428716175586.us-central1.run.app/mcp",
          ],
          tags: null,
          sub_agents: [],
          model: {
            provider: "google",
            model_id: "google_gemini_3_flash_preview",
            api_key: "***",
            updated_at: "2026-03-18T16:27:56.365099",
            description: "Test Large Language Model LLM.",
            created_at: "2026-03-18T16:27:56.365092",
            name: "gemini-3-flash-preview",
            isEnabled: true,
          },
          webhooks: [],
          jobs: [],
        },
      },
    },
    {
      id: "test_agent",
      type: "agent",
      data: {
        agent: {
          description: "Automation test agent",
          agent_id: "test_agent",
          instruction: "You are an automation agent.",
          model_id: "google_gemini_3_flash_preview",
          tools: null,
          isEnabled: true,
          created_at: "2026-03-25T10:31:04.052923",
          updated_at: "2026-03-25T10:31:04.052934",
          status: "active",
          type: "automation",
          name: "Test Agent",
          connector_config_ids: [],
          mcp_servers: [],
          tags: null,
          sub_agents: [],
          model: {
            provider: "google",
            model_id: "google_gemini_3_flash_preview",
            api_key: "***",
            updated_at: "2026-03-18T16:27:56.365099",
            description: "Test Large Language Model LLM.",
            created_at: "2026-03-18T16:27:56.365092",
            name: "gemini-3-flash-preview",
            isEnabled: true,
          },
          webhooks: [
            {
              created_at: "2026-03-25T14:38:35.068964",
              agent_id: "test_agent",
              prompt:
                "Check MQ QManager Status if this is down: Create a ticket on Servicenow with all the relevant description and details.",
              webhook_id: "4303ef22-9621-439c-9666-80aa9e4ebb37",
              updated_at: "2026-03-25T14:38:35.069825",
            },
          ],
          jobs: [],
        },
      },
    },
    {
      id: "datadog_agent",
      type: "agent",
      data: {
        agent: {
          description:
            "DataDog observability agent with access to tools for alerts, dashboards, metrics, and troubleshooting workflows.",
          agent_id: "datadog_agent",
          instruction:
            "You are a DataDog agent and have access to tools. Use the available tools to inspect and analyze logs.",
          model_id: "anthropic_claude_sonnet_4_6",
          tools: "",
          isEnabled: true,
          created_at: "2026-03-25T12:26:40.180228",
          updated_at: "2026-03-25T12:26:40.180237",
          status: "active",
          type: "agent",
          name: "DataDog Agent",
          connector_config_ids: ["2c2326a7-d2f3-4fdf-be68-e74883026ce6"],
          mcp_servers: [],
          tags: null,
          sub_agents: [],
          model: {
            provider: "anthropic",
            model_id: "anthropic_claude_sonnet_4_6",
            api_key: "***",
            updated_at: "2026-03-25T12:03:53.540512",
            description: "Claude Sonnet 4.6",
            created_at: "2026-03-25T12:03:53.540506",
            name: "claude-sonnet-4-6",
            isEnabled: true,
          },
          webhooks: [],
          jobs: [],
        },
      },
    },
    {
      id: "servicenow_agent",
      type: "agent",
      data: {
        agent: {
          description:
            "ServiceNow operations agent with access to tools for ticket handling, incident review, and workflow actions.",
          agent_id: "servicenow_agent",
          instruction:
            "You are a ServiceNow agent and have access to tools. Use the available tools to review incidents, perform ticket-related actions, and respond with clear operational updates.",
          model_id: "google_gemini_3_flash_preview",
          tools: "",
          isEnabled: true,
          created_at: "2026-03-25T12:56:40.274989",
          updated_at: "2026-03-25T12:56:40.275000",
          status: "active",
          type: "agent",
          name: "ServiceNow Agent",
          connector_config_ids: ["bbeab06e-bc46-4435-9868-3aa1f846cc2b"],
          mcp_servers: [],
          tags: null,
          sub_agents: [],
          model: {
            provider: "google",
            model_id: "google_gemini_3_flash_preview",
            api_key: "***",
            updated_at: "2026-03-18T16:27:56.365099",
            description: "Test Large Language Model LLM.",
            created_at: "2026-03-18T16:27:56.365092",
            name: "gemini-3-flash-preview",
            isEnabled: true,
          },
          webhooks: [],
          jobs: [],
        },
      },
    },
    {
      id: "demo_agent",
      type: "agent",
      data: {
        agent: {
          description: "This is demo agent",
          agent_id: "demo_agent",
          instruction: "this is demo agent",
          model_id: "google_gemini_2_5_pro",
          tools: "",
          isEnabled: true,
          created_at: "2026-03-27T12:41:04.448223",
          updated_at: "2026-03-27T12:41:04.448233",
          status: "active",
          type: "agent",
          name: "Demo Agent",
          connector_config_ids: [],
          mcp_servers: ["https://localhost:8001/mcp"],
          tags: null,
          sub_agents: [],
          model: {
            provider: "google",
            model_id: "google_gemini_2_5_pro",
            api_key: "***",
            updated_at: "2026-03-25T11:51:58.352929",
            description: "Gemini 2.5 Pro",
            created_at: "2026-03-25T11:51:58.352921",
            name: "gemini-2.5-pro",
            isEnabled: true,
          },
          webhooks: [],
          jobs: [],
        },
      },
    },
    {
      id: "2c2326a7-d2f3-4fdf-be68-e74883026ce6",
      type: "connector",
      data: {
        connector: {
          name: "Datadog Connector for Mule",
          connector_config_id: "2c2326a7-d2f3-4fdf-be68-e74883026ce6",
          description: null,
          updated_at: "2026-03-25T12:31:07.991434",
          created_at: "2026-03-25T12:31:07.991423",
          config: [
            { name: "DD_API_KEY", value: "***" },
            { name: "DD_APP_KEY", value: "***" },
            { name: "DD_SITE", value: "***" },
            { name: "prefix", value: "***" },
          ],
          connector_id: "datadog_connector",
        },
      },
    },
    {
      id: "bbeab06e-bc46-4435-9868-3aa1f846cc2b",
      type: "connector",
      data: {
        connector: {
          name: "Servicenow Connector",
          connector_config_id: "bbeab06e-bc46-4435-9868-3aa1f846cc2b",
          description: null,
          updated_at: "2026-03-25T12:55:07.356753",
          created_at: "2026-03-25T12:55:07.356743",
          config: [
            { name: "SERVICENOW_INSTANCE_URL", value: "***" },
            { name: "SERVICENOW_USERNAME", value: "***" },
            { name: "SERVICENOW_PASSWORD", value: "***" },
            { name: "SERVICENOW_AUTH_TYPE", value: "***" },
            { name: "prefix", value: "***" },
          ],
          connector_id: "servicenow_connector",
        },
      },
    },
    {
      id: "https://ibm-mq-mcp-428716175586.us-central1.run.app/mcp",
      type: "mcp",
      data: {
        mcp: {
          name: "https://ibm-mq-mcp-428716175586.us-central1.run.app/mcp",
          url: "https://ibm-mq-mcp-428716175586.us-central1.run.app/mcp",
        },
      },
    },
    {
      id: "https://localhost:8001/mcp",
      type: "mcp",
      data: {
        mcp: {
          name: "https://localhost:8001/mcp",
          url: "https://localhost:8001/mcp",
        },
      },
    },
    {
      id: "https://docs.mcp.cloudflare.com/mcp",
      type: "mcp",
      data: {
        mcp: {
          name: "https://docs.mcp.cloudflare.com/mcp",
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
