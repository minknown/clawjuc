import { User, ScrapingProject, ScrapingTask, ScrapingResult, ProjectFile, SystemSetting, ThemeConfig } from './types';

export const HARDCODED_USERS: (User & { password: string })[] = [
  { id: 'u1', username: 'admin', password: 'admin123', role: 'admin', displayName: '系统管理员' },
  { id: 'u2', username: 'operator', password: 'oper123', role: 'operator', displayName: '采集操作员' },
  { id: 'u3', username: 'viewer', password: 'view123', role: 'viewer', displayName: '数据查看者' },
];

export const MOCK_PROJECTS: ScrapingProject[] = [
  {
    id: 'p1', name: '电商平台商品采集', description: '采集主流电商平台商品信息，包括价格、销量、评价等数据',
    status: 'running', targetUrl: 'https://example-shop.com/products',
    createdAt: '2026-03-15 09:30:00', lastRun: '2026-04-27 06:00:00',
    totalTasks: 24, completedTasks: 18, dataCount: 45680,
    schedule: { type: 'interval', interval: 30, retryOnFail: true, maxRetries: 3, timeout: 60 },
    tags: ['电商', '商品', '价格'],
  },
  {
    id: 'p2', name: '新闻资讯聚合采集', description: '实时采集各大新闻门户网站的热点新闻和头条资讯',
    status: 'running', targetUrl: 'https://news-portal.com/headlines',
    createdAt: '2026-03-20 14:00:00', lastRun: '2026-04-27 05:45:00',
    totalTasks: 12, completedTasks: 12, dataCount: 128950,
    schedule: { type: 'cron', cronExpression: '*/15 * * * *', retryOnFail: true, maxRetries: 5, timeout: 30 },
    tags: ['新闻', '资讯', '实时'],
  },
  {
    id: 'p3', name: '社交媒体舆情监控', description: '监控社交媒体平台的用户讨论和舆情数据',
    status: 'paused', targetUrl: 'https://social-media.com/topics',
    createdAt: '2026-04-01 10:15:00', lastRun: '2026-04-26 22:30:00',
    totalTasks: 8, completedTasks: 5, dataCount: 23400,
    schedule: { type: 'interval', interval: 60, retryOnFail: false, maxRetries: 2, timeout: 120 },
    tags: ['社交', '舆情', '监控'],
  },
  {
    id: 'p4', name: '房产信息采集', description: '采集各房产平台的新房、二手房价格和房源信息',
    status: 'completed', targetUrl: 'https://real-estate.com/listings',
    createdAt: '2026-02-10 08:00:00', lastRun: '2026-04-25 18:00:00',
    totalTasks: 36, completedTasks: 36, dataCount: 89230,
    schedule: { type: 'cron', cronExpression: '0 6,18 * * *', retryOnFail: true, maxRetries: 3, timeout: 90 },
    tags: ['房产', '价格', '房源'],
  },
  {
    id: 'p5', name: '学术论文元数据采集', description: '采集学术数据库中的论文标题、作者、摘要和引用信息',
    status: 'error', targetUrl: 'https://scholar.example.edu/papers',
    createdAt: '2026-04-05 16:20:00', lastRun: '2026-04-27 03:15:00',
    totalTasks: 20, completedTasks: 7, dataCount: 15600,
    schedule: { type: 'interval', interval: 120, retryOnFail: true, maxRetries: 5, timeout: 180 },
    tags: ['学术', '论文', '元数据'],
  },
  {
    id: 'p6', name: '招聘信息采集', description: '采集各大招聘平台的职位信息、薪资范围和公司信息',
    status: 'pending', targetUrl: 'https://job-board.com/search',
    createdAt: '2026-04-20 11:00:00', lastRun: '',
    totalTasks: 15, completedTasks: 0, dataCount: 0,
    schedule: { type: 'cron', cronExpression: '0 */4 * * *', retryOnFail: true, maxRetries: 3, timeout: 60 },
    tags: ['招聘', '职位', '薪资'],
  },
  {
    id: 'p7', name: '天气数据采集', description: '采集全国各城市天气数据，包括温度、湿度、风力等',
    status: 'running', targetUrl: 'https://weather-api.example.com/data',
    createdAt: '2026-01-05 07:00:00', lastRun: '2026-04-27 06:05:00',
    totalTasks: 10, completedTasks: 10, dataCount: 234500,
    schedule: { type: 'interval', interval: 10, retryOnFail: true, maxRetries: 10, timeout: 30 },
    tags: ['天气', '气象', '环境'],
  },
  {
    id: 'p8', name: '股票行情数据采集', description: '实时采集A股、港股、美股行情数据',
    status: 'running', targetUrl: 'https://stock-market.example.com/api',
    createdAt: '2026-01-10 09:00:00', lastRun: '2026-04-27 06:08:00',
    totalTasks: 30, completedTasks: 28, dataCount: 567800,
    schedule: { type: 'interval', interval: 5, retryOnFail: true, maxRetries: 999, timeout: 15 },
    tags: ['股票', '金融', '行情'],
  },
];

export const MOCK_TASKS: ScrapingTask[] = [
  {
    id: 't1', projectId: 'p1', name: '商品列表页采集', url: 'https://example-shop.com/products?page=1',
    method: 'GET', status: 'success', startTime: '2026-04-27 06:00:00', endTime: '2026-04-27 06:00:15',
    duration: 15, dataRows: 2400,
    config: {
      depth: 2, maxPages: 100, followLinks: true, respectRobots: true,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      proxy: '', proxyRotation: false, requestDelay: { min: 500, max: 2000 },
      concurrentRequests: 5, headers: { 'Accept-Language': 'zh-CN,zh;q=0.9' }, cookies: '',
      authType: 'none', contentType: 'html', encoding: 'utf-8',
      selectors: [
        { id: 's1', name: '商品名称', type: 'css', value: '.product-name', transform: 'text', required: true },
        { id: 's2', name: '商品价格', type: 'css', value: '.price', transform: 'text', required: true },
        { id: 's3', name: '商品图片', type: 'css', value: '.product-img img', transform: 'src', required: false },
      ],
      pagination: { enabled: true, type: 'url-param', maxPages: 100, urlPattern: '?page={page}', offsetParam: 'page' },
      dataProcessing: {
        trimWhitespace: true, removeDuplicates: true,
        regexReplace: [{ pattern: '[\\r\\n]', replacement: '' }],
        defaultValue: 'N/A',
        validationRules: [{ field: '商品名称', type: 'required', message: '商品名称不能为空' }],
        transformations: [{ field: '商品价格', type: 'number-format' }],
      },
      exportFormat: ['json', 'csv'],
      notifications: { onCompletion: true, onFailure: true, onDataThreshold: true, dataThreshold: 10000, channels: ['email', 'webhook'], emailRecipients: ['admin@example.com'], webhookUrl: 'https://hooks.example.com/notify' },
    },
  },
  {
    id: 't2', projectId: 'p1', name: '商品详情页采集', url: 'https://example-shop.com/product/12345',
    method: 'GET', status: 'running', startTime: '2026-04-27 06:00:16',
    dataRows: 0,
    config: {
      depth: 1, maxPages: 50, followLinks: false, respectRobots: true,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      proxy: 'proxy.example.com:8080', proxyRotation: true, requestDelay: { min: 1000, max: 3000 },
      concurrentRequests: 3, headers: { 'Accept': 'text/html' }, cookies: 'session=abc123',
      authType: 'bearer', authValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      contentType: 'html', encoding: 'utf-8',
      selectors: [
        { id: 's1', name: '描述', type: 'css', value: '.description', transform: 'html', required: false },
        { id: 's2', name: '规格', type: 'xpath', value: '//table[@class="specs"]//tr', transform: 'text', required: false },
      ],
      pagination: { enabled: false, type: 'url-param', maxPages: 1 },
      dataProcessing: { trimWhitespace: true, removeDuplicates: true, regexReplace: [], defaultValue: '', validationRules: [], transformations: [] },
      exportFormat: ['json'],
      notifications: { onCompletion: false, onFailure: true, onDataThreshold: false, dataThreshold: 0, channels: ['email'], emailRecipients: [], webhookUrl: '' },
    },
  },
  {
    id: 't3', projectId: 'p2', name: '头条新闻采集', url: 'https://news-portal.com/api/headlines',
    method: 'GET', status: 'success', startTime: '2026-04-27 05:45:00', endTime: '2026-04-27 05:45:08',
    duration: 8, dataRows: 150,
    config: {
      depth: 1, maxPages: 10, followLinks: false, respectRobots: true,
      userAgent: 'DataCollector/2.0', proxy: '', proxyRotation: false,
      requestDelay: { min: 200, max: 500 }, concurrentRequests: 10,
      headers: { 'Accept': 'application/json' }, cookies: '', authType: 'api-key', authValue: 'sk-xxx',
      contentType: 'json', encoding: 'utf-8',
      selectors: [
        { id: 's1', name: '标题', type: 'json-path', value: '$.data[*].title', transform: 'text', required: true },
        { id: 's2', name: '内容', type: 'json-path', value: '$.data[*].content', transform: 'text', required: false },
        { id: 's3', name: '发布时间', type: 'json-path', value: '$.data[*].publishedAt', transform: 'text', required: true },
      ],
      pagination: { enabled: true, type: 'offset', maxPages: 10, offsetParam: 'offset' },
      dataProcessing: { trimWhitespace: true, removeDuplicates: true, regexReplace: [], defaultValue: '', validationRules: [], transformations: [{ field: '发布时间', type: 'date-format', params: { from: 'ISO', to: 'YYYY-MM-DD HH:mm:ss' } }] },
      exportFormat: ['json', 'csv', 'xlsx'],
      notifications: { onCompletion: true, onFailure: true, onDataThreshold: true, dataThreshold: 1000, channels: ['webhook'], emailRecipients: [], webhookUrl: 'https://hooks.example.com/news' },
    },
  },
  {
    id: 't4', projectId: 'p5', name: '论文元数据采集', url: 'https://scholar.example.edu/search?q=AI',
    method: 'GET', status: 'failed', startTime: '2026-04-27 03:15:00', endTime: '2026-04-27 03:18:00',
    duration: 180, dataRows: 0,
    config: {
      depth: 3, maxPages: 200, followLinks: true, respectRobots: true,
      userAgent: 'Mozilla/5.0', proxy: '', proxyRotation: false,
      requestDelay: { min: 2000, max: 5000 }, concurrentRequests: 2,
      headers: {}, cookies: '', authType: 'none', contentType: 'html', encoding: 'utf-8',
      selectors: [
        { id: 's1', name: '论文标题', type: 'css', value: 'h3.gs_rt', transform: 'text', required: true },
        { id: 's2', name: '作者', type: 'css', value: '.gs_a', transform: 'text', required: false },
      ],
      pagination: { enabled: true, type: 'click-next', maxPages: 200, nextSelector: '.gs_ico_nav_next' },
      dataProcessing: { trimWhitespace: true, removeDuplicates: true, regexReplace: [], defaultValue: 'N/A', validationRules: [], transformations: [] },
      exportFormat: ['json', 'csv'],
      notifications: { onCompletion: true, onFailure: true, onDataThreshold: false, dataThreshold: 0, channels: ['email'], emailRecipients: ['researcher@example.edu'], webhookUrl: '' },
    },
  },
];

export const MOCK_RESULTS: ScrapingResult[] = [
  {
    id: 'r1', taskId: 't1', projectName: '电商平台商品采集', url: 'https://example-shop.com/products?page=1',
    timestamp: '2026-04-27 06:00:15', status: 'success', fileSize: '2.4 MB', format: 'JSON',
    rows: [
      { id: 1, name: '智能手表 Pro Max', price: '¥1,299.00', category: '数码电子', rating: '4.8', reviews: 2340, stock: 156, seller: '官方旗舰店' },
      { id: 2, name: '无线蓝牙耳机 X5', price: '¥299.00', category: '数码电子', rating: '4.6', reviews: 8920, stock: 432, seller: '旗舰店直营' },
      { id: 3, name: '机械键盘 RGB版', price: '¥459.00', category: '电脑外设', rating: '4.7', reviews: 5670, stock: 89, seller: '品牌授权店' },
      { id: 4, name: '超薄笔记本 Air15', price: '¥4,999.00', category: '笔记本电脑', rating: '4.9', reviews: 1200, stock: 45, seller: '官方自营' },
      { id: 5, name: '4K高清显示器 27寸', price: '¥2,199.00', category: '显示器', rating: '4.5', reviews: 3400, stock: 200, seller: '品牌直营' },
      { id: 6, name: '智能家居套装', price: '¥899.00', category: '智能家居', rating: '4.4', reviews: 1560, stock: 310, seller: '智联旗舰店' },
      { id: 7, name: '运动手环 Fit3', price: '¥199.00', category: '数码电子', rating: '4.3', reviews: 12400, stock: 560, seller: '官方店' },
      { id: 8, name: 'Type-C扩展坞', price: '¥159.00', category: '电脑外设', rating: '4.6', reviews: 6780, stock: 890, seller: '数码专营' },
    ],
  },
  {
    id: 'r2', taskId: 't3', projectName: '新闻资讯聚合采集', url: 'https://news-portal.com/api/headlines',
    timestamp: '2026-04-27 05:45:08', status: 'success', fileSize: '156 KB', format: 'JSON',
    rows: [
      { id: 1, title: '人工智能再突破：新一代大模型性能超越人类基准', source: '科技日报', category: '科技', publishedAt: '2026-04-27 05:30:00', views: 125000 },
      { id: 2, title: '全球经济展望：2026年GDP增长预测上调至3.8%', source: '财经周刊', category: '财经', publishedAt: '2026-04-27 04:15:00', views: 89000 },
      { id: 3, title: '新能源汽车销量再创新高，市场渗透率达45%', source: '汽车资讯', category: '汽车', publishedAt: '2026-04-27 03:45:00', views: 67000 },
      { id: 4, title: '量子计算里程碑：首次实现百万量子比特纠错', source: '科学探索', category: '科技', publishedAt: '2026-04-27 02:20:00', views: 234000 },
      { id: 5, title: '国际空间站新实验：太空种植成功收获水稻', source: '航天新闻', category: '航天', publishedAt: '2026-04-27 01:10:00', views: 156000 },
    ],
  },
];

const FILE_CONTENTS: Record<string, string> = {
  'ScraperEngine.java': `package com.crawler.engine;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import java.io.IOException;
import java.util.concurrent.*;

/**
 * 核心采集引擎 - 负责页面抓取和数据提取
 * @author Admin
 * @version 2.1.0
 */
public class ScraperEngine {
    private final ExecutorService executor;
    private final HttpClient httpClient;
    private final DataParser parser;
    private volatile boolean isRunning = false;
    
    public ScraperEngine(int poolSize) {
        this.executor = Executors.newFixedThreadPool(poolSize);
        this.httpClient = new HttpClient();
        this.parser = new DataParser();
    }
    
    public CompletableFuture<ScrapingResult> scrape(ScrapingTask task) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                Document doc = Jsoup.connect(task.getUrl())
                    .userAgent(task.getUserAgent())
                    .timeout(task.getTimeout())
                    .get();
                Elements elements = doc.select(task.getSelector());
                return parser.parse(elements, task.getConfig());
            } catch (IOException e) {
                throw new ScrapingException("采集失败: " + e.getMessage(), e);
            }
        }, executor);
    }
    
    public void shutdown() {
        isRunning = false;
        executor.shutdown();
    }
}`,
  'data_processor.py': `"""
数据处理模块 - 负责数据清洗、转换和验证
Author: DataTeam
Version: 3.2.1
"""

import re
import json
import pandas as pd
from typing import List, Dict, Optional, Any
from datetime import datetime
from dataclasses import dataclass, field


@dataclass
class ProcessingRule:
    """数据处理规则定义"""
    field_name: str
    rule_type: str
    pattern: Optional[str] = None
    replacement: Optional[str] = None
    default_value: Optional[str] = None


class DataProcessor:
    """数据处理器"""
    
    def __init__(self, rules: List[ProcessingRule] = None):
        self.rules = rules or []
        self._compiled_patterns = {}
    
    def process(self, data: List[Dict[str, Any]]) -> pd.DataFrame:
        """处理原始数据"""
        df = pd.DataFrame(data)
        
        for rule in self.rules:
            if rule.rule_type == 'trim':
                df[rule.field_name] = df[rule.field_name].str.strip()
            elif rule.rule_type == 'regex_replace':
                pattern = self._compile_pattern(rule.pattern)
                df[rule.field_name] = df[rule.field_name].apply(
                    lambda x: pattern.sub(rule.replacement, str(x))
                )
            elif rule.rule_type == 'default':
                df[rule.field_name] = df[rule.field_name].fillna(rule.default_value)
        
        return df.drop_duplicates()
    
    def validate(self, df: pd.DataFrame) -> Dict[str, Any]:
        """验证数据完整性"""
        report = {
            'total_rows': len(df),
            'null_counts': df.isnull().sum().to_dict(),
            'duplicate_count': df.duplicated().sum(),
            'timestamp': datetime.now().isoformat()
        }
        return report
    
    def _compile_pattern(self, pattern: str) -> re.Pattern:
        if pattern not in self._compiled_patterns:
            self._compiled_patterns[pattern] = re.compile(pattern)
        return self._compiled_patterns[pattern]`,
  'api_handler.php': `<?php
/**
 * API处理器 - 处理采集任务调度和结果查询
 * Version: 2.5.0
 */

namespace App\\Handlers;

use App\\Models\\Task;
use App\\Services\\QueueService;
use Illuminate\\Http\\Request;
use Illuminate\\Http\\JsonResponse;

class ApiHandler
{
    private QueueService $queue;
    
    public function __construct(QueueService $queue)
    {
        $this->queue = $queue;
    }
    
    /**
     * 创建新的采集任务
     */
    public function createTask(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|uuid',
            'name' => 'required|string|max:255',
            'url' => 'required|url',
            'config' => 'required|array',
            'schedule' => 'nullable|array'
        ]);
        
        $task = Task::create([
            'id' => Str::uuid(),
            'project_id' => $validated['project_id'],
            'name' => $validated['name'],
            'url' => $validated['url'],
            'status' => 'pending',
            'config' => json_encode($validated['config']),
        ]);
        
        $this->queue->dispatch($task);
        
        return response()->json([
            'success' => true,
            'task_id' => $task->id,
            'message' => '采集任务已创建并加入队列'
        ], 201);
    }
    
    /**
     * 获取任务状态
     */
    public function getTaskStatus(string $taskId): JsonResponse
    {
        $task = Task::findOrFail($taskId);
        
        return response()->json([
            'id' => $task->id,
            'status' => $task->status,
            'progress' => $task->progress,
            'data_count' => $task->data_count,
            'error_message' => $task->error_message
        ]);
    }
}`,
  'styles_dark.css': `/* 暗黑主题样式 - Cyber Dark Theme */
:root {
    --neon-cyan: #00f0ff;
    --neon-purple: #b000ff;
    --neon-pink: #ff00aa;
    --bg-dark: #0a0a1a;
    --bg-card: #12122a;
    --border-glow: rgba(0, 240, 255, 0.3);
}

.cyber-grid {
    background-image: 
        linear-gradient(rgba(0, 240, 255, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 240, 255, 0.05) 1px, transparent 1px);
    background-size: 50px 50px;
}

.neon-text {
    text-shadow: 0 0 10px var(--neon-cyan),
                 0 0 20px var(--neon-cyan),
                 0 0 40px var(--neon-cyan);
}

.glow-border {
    border: 1px solid var(--border-glow);
    box-shadow: 0 0 15px rgba(0, 240, 255, 0.15),
                inset 0 0 15px rgba(0, 240, 255, 0.05);
}

@keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 5px var(--neon-cyan); }
    50% { box-shadow: 0 0 20px var(--neon-cyan), 0 0 40px var(--neon-purple); }
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    animation: pulse-glow 2s infinite;
}

.status-dot.running { background: #00ff88; }
.status-dot.paused { background: #ffaa00; }
.status-dot.error { background: #ff0044; }`,
  'scheduler.js': `/**
 * 任务调度器 - 管理采集任务的定时执行
 * Version: 2.0.0
 */

const cron = require('cron-parser');
const EventEmitter = require('events');

class TaskScheduler extends EventEmitter {
  constructor(options = {}) {
    super();
    this.tasks = new Map();
    this.running = false;
    this.maxConcurrent = options.maxConcurrent || 10;
    this.activeCount = 0;
  }

  addTask(taskId, schedule, handler) {
    const interval = cron.parseExpression(schedule);
    this.tasks.set(taskId, {
      id: taskId,
      schedule,
      interval,
      handler,
      nextRun: interval.next().toDate(),
      lastRun: null,
      runCount: 0,
      status: 'idle'
    });
    this.emit('task:added', { taskId, nextRun: this.tasks.get(taskId).nextRun });
  }

  removeTask(taskId) {
    this.tasks.delete(taskId);
    this.emit('task:removed', { taskId });
  }

  start() {
    if (this.running) return;
    this.running = true;
    this._tick();
    this.emit('scheduler:started');
  }

  stop() {
    this.running = false;
    this.emit('scheduler:stopped');
  }

  async _tick() {
    while (this.running) {
      const now = new Date();
      for (const [taskId, task] of this.tasks) {
        if (now >= task.nextRun && this.activeCount < this.maxConcurrent) {
          this._executeTask(task);
        }
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  async _executeTask(task) {
    this.activeCount++;
    task.status = 'running';
    this.emit('task:started', { taskId: task.id });
    try {
      await task.handler(task.id);
      task.status = 'success';
      task.runCount++;
    } catch (error) {
      task.status = 'failed';
      this.emit('task:error', { taskId: task.id, error: error.message });
    } finally {
      task.lastRun = new Date();
      task.nextRun = task.interval.next().toDate();
      this.activeCount--;
      this.emit('task:completed', { taskId: task.id });
    }
  }
}

module.exports = TaskScheduler;`,
  'config.yaml': `# 采集系统全局配置
version: "2.1.0"

server:
  host: 0.0.0.0
  port: 8080
  workers: 4

database:
  type: mongodb
  host: localhost
  port: 27017
  name: crawler_db
  pool_size: 20

scheduler:
  max_concurrent_tasks: 50
  default_timeout: 300
  retry_max: 3
  retry_delay: 5

proxy:
  enabled: true
  pool_size: 100
  rotation_strategy: round-robin
  health_check_interval: 60
  providers:
    - name: provider_a
      api_url: http://proxy-a.example.com/api
      max_connections: 50
    - name: provider_b
      api_url: http://proxy-b.example.com/api
      max_connections: 30

logging:
  level: info
  file: /var/log/crawler/app.log
  max_size: 100MB
  backup_count: 10
  format: "%(timestamp)s [%(level)s] %(message)s"

notification:
  enabled: true
  email:
    smtp_host: smtp.example.com
    smtp_port: 587
    from: noreply@example.com
  webhook:
    url: https://hooks.example.com/crawler
    secret: "your-webhook-secret"`,
  'proxy_pool.go': `package proxy

import (
        "context"
        "fmt"
        "net/http"
        "net/url"
        "sync"
        "time"
)

// ProxyPool 代理池管理器
type ProxyPool struct {
        mu          sync.RWMutex
        proxies     []*Proxy
        activeIndex int
        healthCheck *HealthChecker
        config      *PoolConfig
}

// Proxy 代理节点
type Proxy struct {
        URL         *url.URL
        Protocol    string
        Region      string
        Speed       time.Duration
        SuccessRate float64
        LastChecked time.Time
        Alive       bool
}

// PoolConfig 代理池配置
type PoolConfig struct {
        MaxSize         int
        Rotation        string // round-robin, random, least-used, fastest
        HealthInterval  time.Duration
        Timeout         time.Duration
        RemoveThreshold float64
}

// NewProxyPool 创建新的代理池
func NewProxyPool(config *PoolConfig) *ProxyPool {
        pool := &ProxyPool{
                proxies:     make([]*Proxy, 0, config.MaxSize),
                config:      config,
                healthCheck: NewHealthChecker(config),
        }
        go pool.startHealthCheck()
        return pool
}

// Get 获取一个可用代理
func (p *ProxyPool) Get(ctx context.Context) (*Proxy, error) {
        p.mu.RLock()
        defer p.mu.RUnlock()
        
        alive := p.getAliveProxies()
        if len(alive) == 0 {
                return nil, fmt.Errorf("没有可用的代理节点")
        }
        
        switch p.config.Rotation {
        case "fastest":
                return p.getFastest(alive), nil
        case "random":
                return p.getRandom(alive), nil
        default:
                return p.roundRobin(alive), nil
        }
}

// Add 添加代理到池中
func (p *ProxyPool) Add(rawURL string) error {
        u, err := url.Parse(rawURL)
        if err != nil {
                return fmt.Errorf("无效的代理URL: %w", err)
        }
        
        p.mu.Lock()
        defer p.mu.Unlock()
        
        if len(p.proxies) >= p.config.MaxSize {
                return fmt.Errorf("代理池已满")
        }
        
        proxy := &Proxy{
                URL:      u,
                Protocol: u.Scheme,
                Alive:    true,
        }
        p.proxies = append(p.proxies, proxy)
        return nil
}

func (p *ProxyPool) getAliveProxies() []*Proxy {
        result := make([]*Proxy, 0)
        for _, proxy := range p.proxies {
                if proxy.Alive {
                        result = append(result, proxy)
                }
        }
        return result
}`,
  'README.md': `# 数据采集管理系统 (DataCrawler Pro)

## 项目概述
高性能分布式数据采集管理平台，支持多种采集模式和数据源配置。

## 技术栈
- 后端: Java Spring Boot + Python FastAPI
- 前端: React + TypeScript + TailwindCSS
- 数据库: MongoDB + Redis
- 消息队列: RabbitMQ
- 任务调度: 自研调度引擎

## 功能特性
- 多源采集: HTML/JSON/XML/API
- 智能调度: Cron/间隔/手动
- 代理管理: 自动轮换和健康检查
- 数据处理: 清洗、转换、验证
- 实时监控: 任务状态和性能指标
- 导出格式: JSON/CSV/Excel/XML

## 快速开始
\`\`\`bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
\`\`\`

## 许可证
MIT License
`,
  'Dockerfile': `FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build

FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY src/ ./src/

EXPOSE 8080
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8080", "src.main:app"]`,
  'docker-compose.yml': `version: '3.8'

services:
  crawler-api:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=mongodb
      - REDIS_HOST=redis
      - LOG_LEVEL=info
    depends_on:
      - mongodb
      - redis
    restart: unless-stopped

  mongodb:
    image: mongo:7.0
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  scheduler:
    build: .
    command: python -m src.scheduler
    environment:
      - DB_HOST=mongodb
      - REDIS_HOST=redis
    depends_on:
      - mongodb
      - redis

volumes:
  mongo_data:
  redis_data:`,
  'pipeline.rs': `use tokio::sync::mpsc;
use serde::{Deserialize, Serialize};
use anyhow::Result;

/// 数据处理管线
#[derive(Debug, Clone)]
pub struct Pipeline {
    stages: Vec<Box<dyn Stage + Send + Sync>>,
    buffer_size: usize,
}

/// 管线阶段特征
pub trait Stage {
    fn process(&self, data: PipelineData) -> Result<PipelineData>;
    fn name(&self) -> &str;
}

/// 管线数据
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PipelineData {
    pub id: u64,
    pub content: String,
    pub metadata: std::collections::HashMap<String, String>,
    pub status: DataStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DataStatus {
    Raw,
    Cleaned,
    Transformed,
    Validated,
    Exported,
}

impl Pipeline {
    pub fn new(buffer_size: usize) -> Self {
        Pipeline {
            stages: Vec::new(),
            buffer_size,
        }
    }

    pub fn add_stage(mut self, stage: Box<dyn Stage + Send + Sync>) -> Self {
        self.stages.push(stage);
        self
    }

    pub async fn run(&self, mut rx: mpsc::Receiver<PipelineData>) -> mpsc::Sender<PipelineData> {
        let (tx, mut next_rx) = mpsc::channel(self.buffer_size);
        
        for stage in &self.stages {
            let (out_tx, out_rx) = mpsc::channel(self.buffer_size);
            let stage = stage.clone();
            
            tokio::spawn(async move {
                while let Some(data) = rx.recv().await {
                    match stage.process(data) {
                        Ok(processed) => {
                            let _ = out_tx.send(processed).await;
                        }
                        Err(e) => {
                            eprintln!("Stage {} error: {}", stage.name(), e);
                        }
                    }
                }
            });
            
            rx = out_rx;
        }
        
        tx
    }
}`,
  'error_handler.ts': `/**
 * 全局错误处理模块
 */

export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  PROXY_ERROR = 'PROXY_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: unknown;
  timestamp: Date;
  stack?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];
  
  private constructor() {}
  
  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }
  
  handleError(error: unknown): AppError {
    const appError: AppError = {
      code: this.detectErrorCode(error),
      message: this.getErrorMessage(error),
      timestamp: new Date(),
    };
    
    this.errorLog.push(appError);
    this.log(appError);
    return appError;
  }
  
  private detectErrorCode(error: unknown): ErrorCode {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return ErrorCode.NETWORK_ERROR;
    }
    if (error instanceof SyntaxError) {
      return ErrorCode.PARSE_ERROR;
    }
    return ErrorCode.UNKNOWN;
  }
  
  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
  
  private log(error: AppError): void {
    console.error(\`[\${error.timestamp.toISOString()}] \${error.code}: \${error.message}\`);
  }
}`,
  'CrawlResult.kt': 'package com.crawler.model\n\nimport java.time.LocalDateTime\nimport java.util.UUID\n\n/**\n * \u91C7\u96C6\u7ED3\u679C\u6570\u636E\u6A21\u578B\n */\ndata class CrawlResult(\n    val id: String = UUID.randomUUID().toString(),\n    val taskId: String,\n    val url: String,\n    val statusCode: Int,\n    val responseTime: Long,\n    val dataSize: Long,\n    val extractedFields: Map<String, List<String>>,\n    val status: ResultStatus,\n    val timestamp: LocalDateTime = LocalDateTime.now(),\n    val errorMessage: String? = null\n) {\n    enum class ResultStatus {\n        SUCCESS, PARTIAL, FAILED, TIMEOUT\n    }\n\n    fun isSuccess(): Boolean = status == ResultStatus.SUCCESS\n\n    fun getFieldValues(fieldName: String): List<String> {\n        return extractedFields[fieldName] ?: emptyList()\n    }\n\n    fun getTotalFields(): Int = extractedFields.size\n\n    private fun formatDataSize(bytes: Long): String {\n        return when {\n            bytes < 1024 -> "${bytes}B"\n            bytes < 1024 * 1024 -> "${bytes / 1024}KB"\n            else -> "${bytes / (1024 * 1024)}MB"\n        }\n    }\n}',
  'requirements.txt': `requests>=2.31.0
beautifulsoup4>=4.12.0
lxml>=4.9.0
selenium>=4.15.0
playwright>=1.40.0
scrapy>=2.11.0
pandas>=2.1.0
numpy>=1.26.0
aiohttp>=3.9.0
redis>=5.0.0
pymongo>=4.6.0
celery>=5.3.0
pydantic>=2.5.0
fastapi>=0.104.0
uvicorn>=0.24.0
loguru>=0.7.0
fake-useragent>=1.4.0
proxy-pool>=0.3.0
python-dotenv>=1.0.0
schedule>=1.2.0
tenacity>=8.2.0`,
  'gradle.properties': `org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
org.gradle.parallel=true
org.gradle.caching=true
org.gradle.daemon=true

# Project
project.group=com.crawler
project.version=2.1.0
project.description=High Performance Web Crawler Engine

# Kotlin
kotlin.code.style=official
kotlin.incremental=true

# Dependencies
springBootVersion=3.2.0
kotlinVersion=1.9.20
coroutinesVersion=1.7.3`,
  'Cargo.toml': `[package]
name = "crawler-engine"
version = "2.1.0"
edition = "2021"
authors = ["Crawler Team"]

[dependencies]
tokio = { version = "1.35", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
reqwest = { version = "0.11", features = ["json", "stream"] }
scraper = "0.18"
select = "0.6"
anyhow = "1.0"
thiserror = "1.0"
tracing = "0.1"
tracing-subscriber = "0.3"
redis = { version = "0.23", features = ["tokio-comp"] }
sqlx = { version = "0.7", features = ["runtime-tokio", "postgres"] }
chrono = { version = "0.4", features = ["serde"] }
futures = "0.3"

[profile.release]
opt-level = 3
lto = true`,
};

export const MOCK_FILES: ProjectFile[] = [
  { id: 'f1', name: 'ScraperEngine.java', extension: '.java', language: 'Java', size: '2.8 KB', modifiedAt: '2026-04-26 14:30:00', projectId: 'p1', content: FILE_CONTENTS['ScraperEngine.java'] },
  { id: 'f2', name: 'data_processor.py', extension: '.py', language: 'Python', size: '1.9 KB', modifiedAt: '2026-04-26 15:20:00', projectId: 'p1', content: FILE_CONTENTS['data_processor.py'] },
  { id: 'f3', name: 'api_handler.php', extension: '.php', language: 'PHP', size: '1.5 KB', modifiedAt: '2026-04-25 10:00:00', projectId: 'p2', content: FILE_CONTENTS['api_handler.php'] },
  { id: 'f4', name: 'styles_dark.css', extension: '.css', language: 'CSS', size: '1.1 KB', modifiedAt: '2026-04-26 16:45:00', projectId: 'p1', content: FILE_CONTENTS['styles_dark.css'] },
  { id: 'f5', name: 'scheduler.js', extension: '.js', language: 'JavaScript', size: '2.2 KB', modifiedAt: '2026-04-26 09:15:00', projectId: 'p1', content: FILE_CONTENTS['scheduler.js'] },
  { id: 'f6', name: 'config.yaml', extension: '.yaml', language: 'YAML', size: '0.9 KB', modifiedAt: '2026-04-24 18:00:00', projectId: 'p1', content: FILE_CONTENTS['config.yaml'] },
  { id: 'f7', name: 'proxy_pool.go', extension: '.go', language: 'Go', size: '2.5 KB', modifiedAt: '2026-04-26 11:30:00', projectId: 'p1', content: FILE_CONTENTS['proxy_pool.go'] },
  { id: 'f8', name: 'README.md', extension: '.md', language: 'Markdown', size: '1.0 KB', modifiedAt: '2026-04-20 08:00:00', projectId: 'p1', content: FILE_CONTENTS['README.md'] },
  { id: 'f9', name: 'Dockerfile', extension: '', language: 'Docker', size: '0.4 KB', modifiedAt: '2026-04-22 12:00:00', projectId: 'p1', content: FILE_CONTENTS['Dockerfile'] },
  { id: 'f10', name: 'docker-compose.yml', extension: '.yml', language: 'YAML', size: '0.7 KB', modifiedAt: '2026-04-22 12:00:00', projectId: 'p1', content: FILE_CONTENTS['docker-compose.yml'] },
  { id: 'f11', name: 'pipeline.rs', extension: '.rs', language: 'Rust', size: '1.8 KB', modifiedAt: '2026-04-26 13:00:00', projectId: 'p1', content: FILE_CONTENTS['pipeline.rs'] },
  { id: 'f12', name: 'error_handler.ts', extension: '.ts', language: 'TypeScript', size: '1.2 KB', modifiedAt: '2026-04-26 10:45:00', projectId: 'p1', content: FILE_CONTENTS['error_handler.ts'] },
  { id: 'f13', name: 'CrawlResult.kt', extension: '.kt', language: 'Kotlin', size: '1.3 KB', modifiedAt: '2026-04-25 16:00:00', projectId: 'p1', content: FILE_CONTENTS['CrawlResult.kt'] },
  { id: 'f14', name: 'requirements.txt', extension: '.txt', language: 'Text', size: '0.5 KB', modifiedAt: '2026-04-20 08:00:00', projectId: 'p1', content: FILE_CONTENTS['requirements.txt'] },
  { id: 'f15', name: 'gradle.properties', extension: '.properties', language: 'Properties', size: '0.3 KB', modifiedAt: '2026-04-20 08:00:00', projectId: 'p1', content: FILE_CONTENTS['gradle.properties'] },
  { id: 'f16', name: 'Cargo.toml', extension: '.toml', language: 'TOML', size: '0.4 KB', modifiedAt: '2026-04-20 08:00:00', projectId: 'p1', content: FILE_CONTENTS['Cargo.toml'] },
];

export const SYSTEM_SETTINGS: SystemSetting[] = [
  { id: 's1', category: 'general', key: 'app_name', label: '系统名称', value: 'DataCrawler Pro', type: 'text', description: '系统显示名称' },
  { id: 's2', category: 'general', key: 'language', label: '系统语言', value: 'zh-CN', type: 'select', options: [{ label: '简体中文', value: 'zh-CN' }, { label: 'English', value: 'en-US' }], description: '界面显示语言' },
  { id: 's3', category: 'general', key: 'timezone', label: '系统时区', value: 'Asia/Shanghai', type: 'select', options: [{ label: 'Asia/Shanghai', value: 'Asia/Shanghai' }, { label: 'UTC', value: 'UTC' }], description: '时间显示时区' },
  { id: 's4', category: 'performance', key: 'max_concurrent', label: '最大并发数', value: 50, type: 'number', description: '同时运行的最大任务数' },
  { id: 's5', category: 'performance', key: 'request_timeout', label: '请求超时(秒)', value: 60, type: 'number', description: '单个HTTP请求超时时间' },
  { id: 's6', category: 'performance', key: 'max_memory', label: '内存限制(MB)', value: 2048, type: 'number', description: '系统最大内存使用限制' },
  { id: 's7', category: 'security', key: 'ssl_verify', label: 'SSL验证', value: true, type: 'boolean', description: '是否验证SSL证书' },
  { id: 's8', category: 'security', key: 'rate_limit', label: '速率限制', value: true, type: 'boolean', description: '启用请求速率限制' },
  { id: 's9', category: 'security', key: 'api_key', label: 'API密钥', value: 'sk-xxxx-xxxx-xxxx', type: 'password', description: '外部API访问密钥' },
  { id: 's10', category: 'proxy', key: 'proxy_enabled', label: '启用代理', value: true, type: 'boolean', description: '全局启用代理服务器' },
  { id: 's11', category: 'proxy', key: 'proxy_pool_size', label: '代理池大小', value: 100, type: 'number', description: '代理池中保持的代理数量' },
  { id: 's12', category: 'proxy', key: 'proxy_rotation', label: '代理轮换策略', value: 'round-robin', type: 'select', options: [{ label: '轮询', value: 'round-robin' }, { label: '随机', value: 'random' }, { label: '最快', value: 'fastest' }, { label: '最少使用', value: 'least-used' }], description: '代理IP轮换策略' },
  { id: 's13', category: 'notification', key: 'email_enabled', label: '邮件通知', value: true, type: 'boolean', description: '启用邮件通知' },
  { id: 's14', category: 'notification', key: 'smtp_host', label: 'SMTP服务器', value: 'smtp.example.com', type: 'text', description: 'SMTP服务器地址' },
  { id: 's15', category: 'notification', key: 'webhook_enabled', label: 'Webhook通知', value: false, type: 'boolean', description: '启用Webhook推送通知' },
  { id: 's16', category: 'storage', key: 'data_retention', label: '数据保留天数', value: 90, type: 'number', description: '采集数据保留天数' },
  { id: 's17', category: 'storage', key: 'auto_export', label: '自动导出', value: false, type: 'boolean', description: '自动导出采集数据' },
  { id: 's18', category: 'storage', key: 'export_path', label: '导出路径', value: '/data/exports/', type: 'text', description: '数据导出目录路径' },
];

export const THEME_CONFIGS: ThemeConfig[] = [
  {
    name: 'cyber-dark',
    label: '赛博暗黑',
    description: '深邃暗夜搭配霓虹色彩，科技感十足',
    colors: {
      primary: '#00f0ff', primaryForeground: '#0a0a1a',
      secondary: '#1a1a3e', secondaryForeground: '#e0e0ff',
      accent: '#b000ff', accentForeground: '#ffffff',
      background: '#0a0a1a', foreground: '#e0e0ff',
      card: '#12122a', cardForeground: '#e0e0ff',
      border: 'rgba(0, 240, 255, 0.15)', muted: '#1a1a3e', mutedForeground: '#8888aa',
      destructive: '#ff0044', success: '#00ff88', warning: '#ffaa00', info: '#00aaff',
      gradient: 'linear-gradient(135deg, #00f0ff 0%, #b000ff 100%)',
      glow: '0 0 20px rgba(0, 240, 255, 0.3)',
    },
  },
  {
    name: 'aurora-green',
    label: '极光翠绿',
    description: '灵感来自北极光，清新的绿色调',
    colors: {
      primary: '#00e676', primaryForeground: '#0a1a0a',
      secondary: '#1a2e1a', secondaryForeground: '#c0e8c0',
      accent: '#00bfa5', accentForeground: '#ffffff',
      background: '#0a1a0f', foreground: '#c0e8c0',
      card: '#0f2a18', cardForeground: '#c0e8c0',
      border: 'rgba(0, 230, 118, 0.15)', muted: '#1a2e1a', mutedForeground: '#6a9a6a',
      destructive: '#ff4444', success: '#00e676', warning: '#ffc107', info: '#00bcd4',
      gradient: 'linear-gradient(135deg, #00e676 0%, #00bfa5 50%, #00bcd4 100%)',
      glow: '0 0 20px rgba(0, 230, 118, 0.3)',
    },
  },
  {
    name: 'sunset-orange',
    label: '日落橙光',
    description: '温暖活力的日落色彩，充满能量',
    colors: {
      primary: '#ff6b35', primaryForeground: '#1a0a00',
      secondary: '#2a1a0a', secondaryForeground: '#ffe0c0',
      accent: '#ff2d55', accentForeground: '#ffffff',
      background: '#1a0e08', foreground: '#ffe0c0',
      card: '#251508', cardForeground: '#ffe0c0',
      border: 'rgba(255, 107, 53, 0.15)', muted: '#2a1a0a', mutedForeground: '#aa7a50',
      destructive: '#ff2d55', success: '#34c759', warning: '#ff9f0a', info: '#64d2ff',
      gradient: 'linear-gradient(135deg, #ff6b35 0%, #ff2d55 50%, #ff9f0a 100%)',
      glow: '0 0 20px rgba(255, 107, 53, 0.3)',
    },
  },
  {
    name: 'ocean-blue',
    label: '深海蓝韵',
    description: '深海般的蓝色调，沉稳而深邃',
    colors: {
      primary: '#2196f3', primaryForeground: '#ffffff',
      secondary: '#0d2137', secondaryForeground: '#b0d0f0',
      accent: '#00bcd4', accentForeground: '#ffffff',
      background: '#060d18', foreground: '#b0d0f0',
      card: '#0d1f35', cardForeground: '#b0d0f0',
      border: 'rgba(33, 150, 243, 0.15)', muted: '#0d2137', mutedForeground: '#5a8ab0',
      destructive: '#f44336', success: '#4caf50', warning: '#ff9800', info: '#2196f3',
      gradient: 'linear-gradient(135deg, #1565c0 0%, #00bcd4 50%, #2196f3 100%)',
      glow: '0 0 20px rgba(33, 150, 243, 0.3)',
    },
  },
  {
    name: 'rose-pink',
    label: '玫瑰粉彩',
    description: '优雅的玫瑰色系，时尚而柔和',
    colors: {
      primary: '#e91e8c', primaryForeground: '#ffffff',
      secondary: '#2a0d1e', secondaryForeground: '#f0c0d8',
      accent: '#ff6090', accentForeground: '#ffffff',
      background: '#180810', foreground: '#f0c0d8',
      card: '#220d18', cardForeground: '#f0c0d8',
      border: 'rgba(233, 30, 140, 0.15)', muted: '#2a0d1e', mutedForeground: '#aa5080',
      destructive: '#ff1744', success: '#00e676', warning: '#ffab00', info: '#448aff',
      gradient: 'linear-gradient(135deg, #e91e8c 0%, #ff6090 50%, #aa00ff 100%)',
      glow: '0 0 20px rgba(233, 30, 140, 0.3)',
    },
  },
  {
    name: 'minimal-light',
    label: '极简亮白',
    description: '清爽明亮的浅色主题，简约高效',
    colors: {
      primary: '#2563eb', primaryForeground: '#ffffff',
      secondary: '#f1f5f9', secondaryForeground: '#334155',
      accent: '#7c3aed', accentForeground: '#ffffff',
      background: '#f8fafc', foreground: '#0f172a',
      card: '#ffffff', cardForeground: '#0f172a',
      border: '#e2e8f0', muted: '#f1f5f9', mutedForeground: '#64748b',
      destructive: '#ef4444', success: '#22c55e', warning: '#f59e0b', info: '#3b82f6',
      gradient: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
      glow: '0 1px 3px rgba(0,0,0,0.1)',
    },
  },
];

export const DASHBOARD_CHART_DATA = {
  hourlyData: Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    requests: Math.floor(Math.random() * 5000) + 1000,
    success: Math.floor(Math.random() * 4000) + 800,
    failed: Math.floor(Math.random() * 500) + 50,
  })),
  weeklyData: [
    { day: '周一', tasks: 45, data: 12000 },
    { day: '周二', tasks: 52, data: 15000 },
    { day: '周三', tasks: 38, data: 9800 },
    { day: '周四', tasks: 61, data: 18000 },
    { day: '周五', tasks: 55, data: 16000 },
    { day: '周六', tasks: 28, data: 7200 },
    { day: '周日', tasks: 20, data: 5400 },
  ],
  projectDistribution: [
    { name: '电商', value: 45680, color: '#00f0ff' },
    { name: '新闻', value: 128950, color: '#b000ff' },
    { name: '社交', value: 23400, color: '#00ff88' },
    { name: '房产', value: 89230, color: '#ff6b35' },
    { name: '学术', value: 15600, color: '#e91e8c' },
    { name: '招聘', value: 0, color: '#ffc107' },
    { name: '天气', value: 234500, color: '#2196f3' },
    { name: '股票', value: 567800, color: '#00e676' },
  ],
};

export const ACTIVITY_LOG = [
  { id: 'a1', time: '06:08:32', action: '任务启动', detail: '股票行情数据采集 #T30 开始执行', type: 'info' },
  { id: 'a2', time: '06:05:01', action: '数据入库', detail: '天气数据采集写入 2,340 条记录', type: 'success' },
  { id: 'a3', time: '06:00:15', action: '任务完成', detail: '电商平台商品采集 #T1 成功，采集 2,400 条', type: 'success' },
  { id: 'a4', time: '05:58:22', action: '代理切换', detail: '代理IP 192.168.1.100 响应超时，已切换备用', type: 'warning' },
  { id: 'a5', time: '05:45:08', action: '任务完成', detail: '新闻资讯聚合 #T3 成功，采集 150 条', type: 'success' },
  { id: 'a6', time: '03:18:00', action: '任务失败', detail: '学术论文元数据采集 #T4 超时失败', type: 'error' },
  { id: 'a7', time: '02:30:00', action: '系统通知', detail: '磁盘使用率达到 78%，请及时清理', type: 'warning' },
  { id: 'a8', time: '01:15:00', action: '计划任务', detail: '房产信息采集按计划启动', type: 'info' },
  { id: 'a9', time: '00:00:00', action: '日志轮转', detail: '系统日志已完成日切割', type: 'info' },
  { id: 'a10', time: '23:45:00', action: '数据导出', detail: '电商平台数据已导出为 CSV 格式 (15.6MB)', type: 'success' },
];
