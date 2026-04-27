export interface User {
  id: string;
  username: string;
  role: 'admin' | 'operator' | 'viewer';
  displayName: string;
  avatar?: string;
}

export interface ScrapingProject {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'paused' | 'completed' | 'error' | 'pending';
  targetUrl: string;
  createdAt: string;
  lastRun: string;
  totalTasks: number;
  completedTasks: number;
  dataCount: number;
  schedule: ScheduleConfig;
  tags: string[];
}

export interface ScheduleConfig {
  type: 'once' | 'interval' | 'cron' | 'manual';
  interval?: number; // minutes
  cronExpression?: string;
  startDate?: string;
  endDate?: string;
  retryOnFail: boolean;
  maxRetries: number;
  timeout: number; // seconds
}

export interface ScrapingTask {
  id: string;
  projectId: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT';
  status: 'pending' | 'running' | 'success' | 'failed' | 'timeout';
  startTime?: string;
  endTime?: string;
  duration?: number;
  dataRows: number;
  config: TaskConfig;
}

export interface TaskConfig {
  depth: number;
  maxPages: number;
  followLinks: boolean;
  respectRobots: boolean;
  userAgent: string;
  proxy: string;
  proxyRotation: boolean;
  requestDelay: { min: number; max: number };
  concurrentRequests: number;
  headers: Record<string, string>;
  cookies: string;
  authType: 'none' | 'basic' | 'bearer' | 'api-key';
  authValue?: string;
  contentType: 'html' | 'json' | 'xml' | 'text';
  encoding: string;
  selectors: SelectorConfig[];
  pagination: PaginationConfig;
  dataProcessing: DataProcessingConfig;
  exportFormat: ('json' | 'csv' | 'xlsx' | 'xml')[];
  notifications: NotificationConfig;
}

export interface SelectorConfig {
  id: string;
  name: string;
  type: 'css' | 'xpath' | 'regex' | 'json-path';
  value: string;
  attribute?: string;
  transform?: 'text' | 'html' | 'href' | 'src' | 'alt';
  required: boolean;
  defaultValue?: string;
}

export interface PaginationConfig {
  enabled: boolean;
  type: 'url-param' | 'click-next' | 'scroll' | 'offset';
  maxPages: number;
  nextSelector?: string;
  urlPattern?: string;
  offsetParam?: string;
  scrollDelay?: number;
}

export interface DataProcessingConfig {
  trimWhitespace: boolean;
  removeDuplicates: boolean;
  regexReplace: { pattern: string; replacement: string }[];
  defaultValue: string;
  validationRules: ValidationRule[];
  transformations: TransformConfig[];
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'regex' | 'min-length' | 'max-length' | 'email' | 'url' | 'number';
  value?: string;
  message: string;
}

export interface TransformConfig {
  field: string;
  type: 'uppercase' | 'lowercase' | 'trim' | 'replace' | 'regex' | 'date-format' | 'number-format';
  params?: Record<string, string>;
}

export interface NotificationConfig {
  onCompletion: boolean;
  onFailure: boolean;
  onDataThreshold: boolean;
  dataThreshold: number;
  channels: ('email' | 'webhook' | 'sms')[];
  emailRecipients: string[];
  webhookUrl?: string;
}

export interface ScrapingResult {
  id: string;
  taskId: string;
  projectName: string;
  url: string;
  timestamp: string;
  status: 'success' | 'partial' | 'failed';
  rows: Record<string, string | number>[];
  fileSize: string;
  format: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  extension: string;
  language: string;
  size: string;
  modifiedAt: string;
  projectId: string;
  content: string;
}

export interface SystemSetting {
  id: string;
  category: 'general' | 'performance' | 'security' | 'proxy' | 'notification' | 'storage';
  key: string;
  label: string;
  value: string | number | boolean;
  type: 'text' | 'number' | 'boolean' | 'select' | 'password';
  options?: { label: string; value: string }[];
  description: string;
}

export type ThemeName = 'cyber-dark' | 'aurora-green' | 'sunset-orange' | 'ocean-blue' | 'rose-pink' | 'minimal-light';

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  description: string;
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    border: string;
    muted: string;
    mutedForeground: string;
    destructive: string;
    success: string;
    warning: string;
    info: string;
    gradient: string;
    glow: string;
  };
}

export type PageType = 'dashboard' | 'projects' | 'tasks' | 'results' | 'files' | 'settings' | 'login';
