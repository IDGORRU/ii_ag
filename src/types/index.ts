export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  type?: 'text' | 'code' | 'file';
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
}

export interface Integration {
  id: string;
  name: string;
  type: 'webhook' | 'api' | 'plugin';
  status: 'active' | 'inactive' | 'error';
  config: Record<string, any>;
  lastSync?: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  agentId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}