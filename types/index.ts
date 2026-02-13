export interface DailyLog {
  date: string;
  title: string;
  summary: string;
  content: string;
  tasks: Task[];
  learnings: Learning[];
  tokenUsage: TokenUsage;
  tags: string[];
  mood: 'productive' | 'challenging' | 'learning' | 'routine';
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  description: string;
  category: 'development' | 'research' | 'learning' | 'communication' | 'planning';
  status: 'completed' | 'in-progress' | 'blocked';
  timeSpent?: number;
}

export interface Learning {
  topic: string;
  insight: string;
  source?: string;
}

export interface TokenUsage {
  date: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  modelBreakdown: ModelBreakdown[];
}

export interface ModelBreakdown {
  model: string;
  requests: number;
  cost: number;
}

export interface Stats {
  lastUpdated: Date;
  totalDays: number;
  totalTasks: number;
  totalLearnings: number;
  totalCost: number;
  averageDailyCost: number;
  categoryDistribution: Record<string, number>;
}
