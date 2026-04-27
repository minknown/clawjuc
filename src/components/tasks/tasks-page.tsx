'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Play,
  Eye,
  Trash2,
  Globe,
  Clock,
  Database,
  ChevronRight,
  GripVertical,
  X,
  Settings,
  Zap,
  Code2,
  KeyRound,
  Shield,
  Layers,
  FileDown,
  Bell,
} from 'lucide-react';

import { MOCK_TASKS, MOCK_PROJECTS } from '@/lib/mock-data';
import type {
  ScrapingTask,
  TaskConfig,
  SelectorConfig,
  PaginationConfig,
  DataProcessingConfig,
  ValidationRule,
  TransformConfig,
  NotificationConfig,
} from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/* -------------------------------------------------------------------------- */
/*  Helpers & Constants                                                       */
/* -------------------------------------------------------------------------- */

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  POST: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
  PUT: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
};

const STATUS_CONFIG: Record<string, { color: string; label: string; dot: string }> = {
  pending: { color: 'bg-zinc-500/15 text-zinc-500 dark:text-zinc-400 border-zinc-500/30', label: '待执行', dot: 'bg-zinc-400' },
  running: { color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', label: '运行中', dot: 'bg-emerald-500 animate-pulse' },
  success: { color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', label: '成功', dot: 'bg-emerald-500' },
  failed: { color: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30', label: '失败', dot: 'bg-red-500' },
  timeout: { color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30', label: '超时', dot: 'bg-amber-500' },
};

const USER_AGENT_PRESETS: Record<string, string> = {
  Chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
  Safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
};

const uid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 10);

const DEFAULT_CONFIG: TaskConfig = {
  depth: 1,
  maxPages: 10,
  followLinks: false,
  respectRobots: true,
  userAgent: USER_AGENT_PRESETS.Chrome,
  proxy: '',
  proxyRotation: false,
  requestDelay: { min: 500, max: 2000 },
  concurrentRequests: 5,
  headers: {},
  cookies: '',
  authType: 'none',
  contentType: 'html',
  encoding: 'utf-8',
  selectors: [],
  pagination: { enabled: false, type: 'url-param', maxPages: 10 },
  dataProcessing: {
    trimWhitespace: true,
    removeDuplicates: true,
    regexReplace: [],
    defaultValue: '',
    validationRules: [],
    transformations: [],
  },
  exportFormat: ['json', 'csv'],
  notifications: {
    onCompletion: true,
    onFailure: true,
    onDataThreshold: false,
    dataThreshold: 10000,
    channels: ['email'],
    emailRecipients: [],
    webhookUrl: '',
  },
};

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n) + '...' : str;
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('zh-CN').format(n);
}

/* -------------------------------------------------------------------------- */
/*  Card animation variants                                                    */
/* -------------------------------------------------------------------------- */

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
  exit: { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.2 } },
};

/* -------------------------------------------------------------------------- */
/*  Selector Row Sub-component                                                 */
/* -------------------------------------------------------------------------- */

function SelectorRow({
  selector,
  index,
  onChange,
  onRemove,
}: {
  selector: SelectorConfig;
  index: number;
  onChange: (idx: number, s: SelectorConfig) => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/30 p-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          <GripVertical className="mr-1 inline-block size-3" />
          选择器 #{index + 1}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(index)}
        >
          <X className="size-3.5" />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <Label className="text-xs">字段名称</Label>
          <Input
            className="h-8 text-sm"
            placeholder="例：商品标题"
            value={selector.name}
            onChange={(e) => onChange(index, { ...selector, name: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">类型</Label>
          <Select
            value={selector.type}
            onValueChange={(v) => onChange(index, { ...selector, type: v as SelectorConfig['type'] })}
          >
            <SelectTrigger className="h-8 text-sm w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="css">CSS</SelectItem>
              <SelectItem value="xpath">XPath</SelectItem>
              <SelectItem value="regex">Regex</SelectItem>
              <SelectItem value="json-path">JSONPath</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">选择器值</Label>
          <Input
            className="h-8 text-sm font-mono"
            placeholder=".class 或 //div"
            value={selector.value}
            onChange={(e) => onChange(index, { ...selector, value: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">属性提取</Label>
          <Select
            value={selector.transform ?? 'text'}
            onValueChange={(v) => onChange(index, { ...selector, transform: v as SelectorConfig['transform'] })}
          >
            <SelectTrigger className="h-8 text-sm w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">text</SelectItem>
              <SelectItem value="html">html</SelectItem>
              <SelectItem value="href">href</SelectItem>
              <SelectItem value="src">src</SelectItem>
              <SelectItem value="alt">alt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Checkbox
            id={`req-${selector.id}`}
            checked={selector.required}
            onCheckedChange={(v) => onChange(index, { ...selector, required: !!v })}
          />
          <Label htmlFor={`req-${selector.id}`} className="text-xs cursor-pointer">
            必填
          </Label>
        </div>
        <div className="flex-1 space-y-1">
          <Label className="text-xs">默认值</Label>
          <Input
            className="h-7 text-xs"
            placeholder="默认值"
            value={selector.defaultValue ?? ''}
            onChange={(e) => onChange(index, { ...selector, defaultValue: e.target.value })}
          />
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Key-Value Row Sub-component                                                */
/* -------------------------------------------------------------------------- */

function KeyValueRow({
  label,
  keyVal,
  valueVal,
  onKeyChange,
  onValueChange,
  onRemove,
  placeholderKey = 'Key',
  placeholderValue = 'Value',
}: {
  label?: string;
  keyVal: string;
  valueVal: string;
  onKeyChange: (v: string) => void;
  onValueChange: (v: string) => void;
  onRemove: () => void;
  placeholderKey?: string;
  placeholderValue?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-muted-foreground w-16 shrink-0">{label}</span>}
      <Input className="h-8 text-sm flex-1" placeholder={placeholderKey} value={keyVal} onChange={(e) => onKeyChange(e.target.value)} />
      <span className="text-muted-foreground text-xs">:</span>
      <Input className="h-8 text-sm flex-1" placeholder={placeholderValue} value={valueVal} onChange={(e) => onValueChange(e.target.value)} />
      <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive shrink-0" onClick={onRemove}>
        <X className="size-3.5" />
      </Button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Task Configuration Dialog                                                  */
/* -------------------------------------------------------------------------- */

interface TaskConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: ScrapingTask | null;
  onSave: (task: ScrapingTask) => void;
}

function TaskConfigDialog({ open, onOpenChange, task, onSave }: TaskConfigDialogProps) {
  const isNew = !task;

  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT'>('GET');
  const [contentType, setContentType] = useState<'html' | 'json' | 'xml' | 'text'>('html');
  const [depth, setDepth] = useState(1);
  const [maxPages, setMaxPages] = useState(10);
  const [followLinks, setFollowLinks] = useState(false);
  const [respectRobots, setRespectRobots] = useState(true);
  const [selectors, setSelectors] = useState<SelectorConfig[]>([]);
  const [userAgent, setUserAgent] = useState(USER_AGENT_PRESETS.Chrome);
  const [uaPreset, setUaPreset] = useState('Chrome');
  const [requestDelay, setRequestDelay] = useState<[number, number]>([500, 2000]);
  const [concurrentRequests, setConcurrentRequests] = useState(5);
  const [customHeaders, setCustomHeaders] = useState<{ key: string; value: string }[]>([]);
  const [cookies, setCookies] = useState('');
  const [timeout, setTimeout_] = useState(60);
  const [authType, setAuthType] = useState<'none' | 'basic' | 'bearer' | 'api-key'>('none');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [proxy, setProxy] = useState('');
  const [proxyRotation, setProxyRotation] = useState(false);
  const [paginationEnabled, setPaginationEnabled] = useState(false);
  const [paginationType, setPaginationType] = useState<PaginationConfig['type']>('url-param');
  const [paginationMaxPages, setPaginationMaxPages] = useState(10);
  const [nextSelector, setNextSelector] = useState('');
  const [urlPattern, setUrlPattern] = useState('');
  const [scrollDelay, setScrollDelay] = useState(1000);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [regexReplace, setRegexReplace] = useState<{ pattern: string; replacement: string }[]>([]);
  const [defaultValue, setDefaultValue] = useState('');
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);
  const [transformations, setTransformations] = useState<TransformConfig[]>([]);
  const [exportFormats, setExportFormats] = useState<('json' | 'csv' | 'xlsx' | 'xml')[]>(['json', 'csv']);
  const [notifOnCompletion, setNotifOnCompletion] = useState(true);
  const [notifOnFailure, setNotifOnFailure] = useState(true);
  const [notifOnDataThreshold, setNotifOnDataThreshold] = useState(false);
  const [dataThreshold, setDataThreshold] = useState(10000);
  const [notifChannels, setNotifChannels] = useState<('email' | 'webhook' | 'sms')[]>(['email']);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  /* Populate form when editing */
  const populateForm = useCallback((t: ScrapingTask) => {
    setName(t.name);
    setProjectId(t.projectId);
    setUrl(t.url);
    setMethod(t.method);
    setContentType(t.config.contentType);
    setDepth(t.config.depth);
    setMaxPages(t.config.maxPages);
    setFollowLinks(t.config.followLinks);
    setRespectRobots(t.config.respectRobots);
    setSelectors([...t.config.selectors]);
    setUserAgent(t.config.userAgent);
    setRequestDelay([t.config.requestDelay.min, t.config.requestDelay.max]);
    setConcurrentRequests(t.config.concurrentRequests);
    setCustomHeaders(Object.entries(t.config.headers).map(([key, value]) => ({ key, value })));
    setCookies(t.config.cookies);
    setTimeout_(t.config.pagination.maxPages > 0 ? 60 : 60);
    setAuthType(t.config.authType);
    setAuthToken(t.config.authValue ?? '');
    setProxy(t.config.proxy);
    setProxyRotation(t.config.proxyRotation);
    setPaginationEnabled(t.config.pagination.enabled);
    setPaginationType(t.config.pagination.type);
    setPaginationMaxPages(t.config.pagination.maxPages);
    setNextSelector(t.config.pagination.nextSelector ?? '');
    setUrlPattern(t.config.pagination.urlPattern ?? '');
    setScrollDelay(t.config.pagination.scrollDelay ?? 1000);
    setTrimWhitespace(t.config.dataProcessing.trimWhitespace);
    setRemoveDuplicates(t.config.dataProcessing.removeDuplicates);
    setRegexReplace([...t.config.dataProcessing.regexReplace]);
    setDefaultValue(t.config.dataProcessing.defaultValue);
    setValidationRules([...t.config.dataProcessing.validationRules]);
    setTransformations([...t.config.dataProcessing.transformations]);
    setExportFormats([...t.config.exportFormat]);
    setNotifOnCompletion(t.config.notifications.onCompletion);
    setNotifOnFailure(t.config.notifications.onFailure);
    setNotifOnDataThreshold(t.config.notifications.onDataThreshold);
    setDataThreshold(t.config.notifications.dataThreshold);
    setNotifChannels([...t.config.notifications.channels]);
    setEmailRecipients(t.config.notifications.emailRecipients.join(', '));
    setWebhookUrl(t.config.notifications.webhookUrl ?? '');
  }, []);

  const resetForm = useCallback(() => {
    setName('');
    setProjectId('');
    setUrl('');
    setMethod('GET');
    setContentType('html');
    setDepth(1);
    setMaxPages(10);
    setFollowLinks(false);
    setRespectRobots(true);
    setSelectors([]);
    setUserAgent(USER_AGENT_PRESETS.Chrome);
    setUaPreset('Chrome');
    setRequestDelay([500, 2000]);
    setConcurrentRequests(5);
    setCustomHeaders([]);
    setCookies('');
    setTimeout_(60);
    setAuthType('none');
    setAuthUsername('');
    setAuthPassword('');
    setAuthToken('');
    setApiKey('');
    setProxy('');
    setProxyRotation(false);
    setPaginationEnabled(false);
    setPaginationType('url-param');
    setPaginationMaxPages(10);
    setNextSelector('');
    setUrlPattern('');
    setScrollDelay(1000);
    setTrimWhitespace(true);
    setRemoveDuplicates(true);
    setRegexReplace([]);
    setDefaultValue('');
    setValidationRules([]);
    setTransformations([]);
    setExportFormats(['json', 'csv']);
    setNotifOnCompletion(true);
    setNotifOnFailure(true);
    setNotifOnDataThreshold(false);
    setDataThreshold(10000);
    setNotifChannels(['email']);
    setEmailRecipients('');
    setWebhookUrl('');
  }, []);

  /* Sync when task changes */
  useState(() => {
    if (task) populateForm(task);
    else resetForm();
  });

  /* Build config & save */
  const handleSave = () => {
    if (!name.trim()) { toast.error('请输入任务名称'); return; }
    if (!url.trim()) { toast.error('请输入URL'); return; }
    if (!projectId) { toast.error('请选择项目'); return; }

    const headersObj: Record<string, string> = {};
    customHeaders.forEach((h) => { if (h.key.trim()) headersObj[h.key.trim()] = h.value; });

    const cfg: TaskConfig = {
      depth,
      maxPages,
      followLinks,
      respectRobots,
      userAgent,
      proxy,
      proxyRotation,
      requestDelay: { min: requestDelay[0], max: requestDelay[1] },
      concurrentRequests,
      headers: headersObj,
      cookies,
      authType,
      authValue: authType === 'bearer' ? authToken : authType === 'api-key' ? apiKey : authType === 'basic' ? btoa(`${authUsername}:${authPassword}`) : undefined,
      contentType,
      encoding: 'utf-8',
      selectors,
      pagination: { enabled: paginationEnabled, type: paginationType, maxPages: paginationMaxPages, nextSelector: nextSelector || undefined, urlPattern: urlPattern || undefined, scrollDelay },
      dataProcessing: { trimWhitespace, removeDuplicates, regexReplace, defaultValue, validationRules, transformations },
      exportFormat: exportFormats,
      notifications: {
        onCompletion: notifOnCompletion,
        onFailure: notifOnFailure,
        onDataThreshold: notifOnDataThreshold,
        dataThreshold,
        channels: notifChannels,
        emailRecipients: emailRecipients.split(',').map((s) => s.trim()).filter(Boolean),
        webhookUrl: webhookUrl || undefined,
      },
    };

    const saved: ScrapingTask = task
      ? { ...task, name, projectId, url, method, config: cfg }
      : {
          id: `t${uid()}`,
          projectId,
          name,
          url,
          method,
          status: 'pending',
          dataRows: 0,
          config: cfg,
        };

    onSave(saved);
    toast.success(isNew ? '任务创建成功' : '任务配置已更新');
    onOpenChange(false);
  };

  /* Toggle export format */
  const toggleExportFormat = (fmt: 'json' | 'csv' | 'xlsx' | 'xml') => {
    setExportFormats((prev) => prev.includes(fmt) ? prev.filter((f) => f !== fmt) : [...prev, fmt]);
  };

  /* Toggle notification channel */
  const toggleChannel = (ch: 'email' | 'webhook' | 'sms') => {
    setNotifChannels((prev) => prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]);
  };

  /* Shared field style helper */
  const field = 'space-y-1.5';
  const fieldLabel = 'text-xs font-medium text-muted-foreground';
  const fieldInput = 'h-8 text-sm';
  const sectionTitle = 'text-sm font-semibold mb-3 flex items-center gap-2';
  const sectionDesc = 'text-xs text-muted-foreground mb-4';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col sm:max-w-4xl">
        <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
          <DialogTitle className="text-xl">
            {isNew ? '新建采集任务' : '编辑任务配置'}
          </DialogTitle>
          <DialogDescription>
            {isNew ? '配置一个新的数据采集任务，包括采集规则、请求参数、数据处理等' : `编辑任务「${task?.name}」的详细配置`}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="flex flex-col flex-1 min-h-0">
          {/* Scrollable tabs list */}
          <div className="px-6 pt-4 shrink-0 overflow-x-auto">
            <TabsList className="flex w-max min-w-0 gap-0.5">
              <TabsTrigger value="basic" className="text-xs px-2.5"><Settings className="size-3.5 mr-1" />基本设置</TabsTrigger>
              <TabsTrigger value="rules" className="text-xs px-2.5"><Zap className="size-3.5 mr-1" />采集规则</TabsTrigger>
              <TabsTrigger value="selectors" className="text-xs px-2.5"><Code2 className="size-3.5 mr-1" />选择器</TabsTrigger>
              <TabsTrigger value="request" className="text-xs px-2.5"><Globe className="size-3.5 mr-1" />请求配置</TabsTrigger>
              <TabsTrigger value="auth" className="text-xs px-2.5"><KeyRound className="size-3.5 mr-1" />认证配置</TabsTrigger>
              <TabsTrigger value="proxy" className="text-xs px-2.5"><Shield className="size-3.5 mr-1" />代理设置</TabsTrigger>
              <TabsTrigger value="pagination" className="text-xs px-2.5"><Layers className="size-3.5 mr-1" />分页配置</TabsTrigger>
              <TabsTrigger value="dataproc" className="text-xs px-2.5"><Database className="size-3.5 mr-1" />数据处理</TabsTrigger>
              <TabsTrigger value="export" className="text-xs px-2.5"><Bell className="size-3.5 mr-1" />导出通知</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 py-4">
              {/* -------- Tab 1: 基本设置 -------- */}
              <TabsContent value="basic" className="mt-0 space-y-4">
                <div className={field}>
                  <Label className={fieldLabel}>任务名称 *</Label>
                  <Input className={fieldInput} placeholder="例：首页商品列表采集" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className={field}>
                  <Label className={fieldLabel}>所属项目 *</Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="选择项目" /></SelectTrigger>
                    <SelectContent>
                      {MOCK_PROJECTS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className={field}>
                  <Label className={fieldLabel}>采集URL *</Label>
                  <Input className={fieldInput} placeholder="https://example.com/data" value={url} onChange={(e) => setUrl(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className={field}>
                    <Label className={fieldLabel}>HTTP 方法</Label>
                    <Select value={method} onValueChange={(v) => setMethod(v as 'GET' | 'POST' | 'PUT')}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className={field}>
                    <Label className={fieldLabel}>内容类型</Label>
                    <Select value={contentType} onValueChange={(v) => setContentType(v as 'html' | 'json' | 'xml' | 'text')}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="html">HTML</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="xml">XML</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* -------- Tab 2: 采集规则 -------- */}
              <TabsContent value="rules" className="mt-0 space-y-5">
                <p className={sectionDesc}>配置爬取深度、页面限制和链接跟踪行为</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className={field}>
                    <Label className={fieldLabel}>爬取深度</Label>
                    <div className="flex items-center gap-3">
                      <Slider value={[depth]} min={1} max={10} step={1} onValueChange={([v]) => setDepth(v)} className="flex-1" />
                      <span className="text-sm font-medium w-6 text-center">{depth}</span>
                    </div>
                  </div>
                  <div className={field}>
                    <Label className={fieldLabel}>最大页数</Label>
                    <Input type="number" className={fieldInput} min={1} max={10000} value={maxPages} onChange={(e) => setMaxPages(Number(e.target.value))} />
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">跟随链接</Label>
                    <p className="text-xs text-muted-foreground">自动发现并跟踪页面中的链接</p>
                  </div>
                  <Switch checked={followLinks} onCheckedChange={setFollowLinks} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">遵守 robots.txt</Label>
                    <p className="text-xs text-muted-foreground">尊重目标网站的爬取规则</p>
                  </div>
                  <Switch checked={respectRobots} onCheckedChange={setRespectRobots} />
                </div>
              </TabsContent>

              {/* -------- Tab 3: 选择器配置 -------- */}
              <TabsContent value="selectors" className="mt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={sectionTitle}><Code2 className="size-4" />字段选择器</h4>
                    <p className={sectionDesc}>配置要提取的数据字段及其CSS/XPath/Regex选择器</p>
                  </div>
                  <Button
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => setSelectors((prev) => [...prev, { id: uid(), name: '', type: 'css', value: '', transform: 'text', required: false }])}
                  >
                    <Plus className="size-3" />添加选择器
                  </Button>
                </div>

                {selectors.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/20 py-10 text-muted-foreground">
                    <Code2 className="size-8 mb-2 opacity-40" />
                    <span className="text-sm">暂无选择器</span>
                    <span className="text-xs">点击上方按钮添加数据提取规则</span>
                  </div>
                )}

                <AnimatePresence>
                  <div className="space-y-3">
                    {selectors.map((s, i) => (
                      <SelectorRow
                        key={s.id}
                        selector={s}
                        index={i}
                        onChange={(idx, updated) => {
                          setSelectors((prev) => prev.map((s, si) => si === idx ? updated : s));
                        }}
                        onRemove={(idx) => setSelectors((prev) => prev.filter((_, si) => si !== idx))}
                      />
                    ))}
                  </div>
                </AnimatePresence>
              </TabsContent>

              {/* -------- Tab 4: 请求配置 -------- */}
              <TabsContent value="request" className="mt-0 space-y-5">
                <div className={field}>
                  <Label className={fieldLabel}>User-Agent</Label>
                  <div className="flex items-center gap-2">
                    <Select value={uaPreset} onValueChange={(v) => { setUaPreset(v); if (USER_AGENT_PRESETS[v]) setUserAgent(USER_AGENT_PRESETS[v]); }}>
                      <SelectTrigger className="w-32 shrink-0"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Chrome">Chrome</SelectItem>
                        <SelectItem value="Firefox">Firefox</SelectItem>
                        <SelectItem value="Safari">Safari</SelectItem>
                        <SelectItem value="Custom">自定义</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      className="flex-1 h-8 text-xs font-mono"
                      placeholder="自定义 User-Agent"
                      value={userAgent}
                      onChange={(e) => { setUserAgent(e.target.value); setUaPreset('Custom'); }}
                    />
                  </div>
                </div>

                <div className={field}>
                  <Label className={fieldLabel}>请求延迟范围 (ms)</Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={requestDelay}
                      min={100}
                      max={10000}
                      step={100}
                      onValueChange={(v) => setRequestDelay(v as [number, number])}
                      className="flex-1"
                    />
                    <span className="text-xs font-mono text-muted-foreground w-28 text-right">
                      {requestDelay[0]} - {requestDelay[1]} ms
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className={field}>
                    <Label className={fieldLabel}>并发请求数</Label>
                    <div className="flex items-center gap-3">
                      <Slider value={[concurrentRequests]} min={1} max={50} step={1} onValueChange={([v]) => setConcurrentRequests(v)} className="flex-1" />
                      <span className="text-sm font-medium w-6 text-center">{concurrentRequests}</span>
                    </div>
                  </div>
                  <div className={field}>
                    <Label className={fieldLabel}>超时时间 (秒)</Label>
                    <Input type="number" className={fieldInput} min={5} max={600} value={timeout} onChange={(e) => setTimeout_(Number(e.target.value))} />
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className={fieldLabel}>自定义请求头</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                      onClick={() => setCustomHeaders((prev) => [...prev, { key: '', value: '' }])}
                    >
                      <Plus className="size-3" />添加
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {customHeaders.map((h, i) => (
                      <KeyValueRow
                        key={i}
                        keyVal={h.key}
                        valueVal={h.value}
                        onKeyChange={(v) => setCustomHeaders((prev) => prev.map((x, xi) => xi === i ? { ...x, key: v } : x))}
                        onValueChange={(v) => setCustomHeaders((prev) => prev.map((x, xi) => xi === i ? { ...x, value: v } : x))}
                        onRemove={() => setCustomHeaders((prev) => prev.filter((_, xi) => xi !== i))}
                        placeholderKey="Header名称"
                        placeholderValue="Header值"
                      />
                    ))}
                  </div>
                </div>

                <div className={field}>
                  <Label className={fieldLabel}>Cookies</Label>
                  <Textarea
                    className="text-xs font-mono min-h-[60px]"
                    placeholder="session=abc123; token=xyz"
                    value={cookies}
                    onChange={(e) => setCookies(e.target.value)}
                  />
                </div>
              </TabsContent>

              {/* -------- Tab 5: 认证配置 -------- */}
              <TabsContent value="auth" className="mt-0 space-y-5">
                <div className={field}>
                  <Label className={fieldLabel}>认证方式</Label>
                  <Select value={authType} onValueChange={(v) => setAuthType(v as 'none' | 'basic' | 'bearer' | 'api-key')}>
                    <SelectTrigger className="w-full max-w-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">无认证</SelectItem>
                      <SelectItem value="basic">Basic Auth</SelectItem>
                      <SelectItem value="bearer">Bearer Token</SelectItem>
                      <SelectItem value="api-key">API Key</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {authType === 'none' && (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/20 py-10 text-muted-foreground">
                    <KeyRound className="size-8 mb-2 opacity-40" />
                    <span className="text-sm">当前无需认证</span>
                    <span className="text-xs">选择认证方式以配置凭据</span>
                  </div>
                )}

                {authType === 'basic' && (
                  <div className="space-y-4 rounded-lg border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs text-muted-foreground">使用 HTTP Basic 认证，凭据将以 Base64 编码发送</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className={field}>
                        <Label className={fieldLabel}>用户名</Label>
                        <Input className={fieldInput} placeholder="username" value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} />
                      </div>
                      <div className={field}>
                        <Label className={fieldLabel}>密码</Label>
                        <Input type="password" className={fieldInput} placeholder="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                {authType === 'bearer' && (
                  <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs text-muted-foreground">在请求头中添加 Authorization: Bearer &lt;token&gt;</p>
                    <div className={field}>
                      <Label className={fieldLabel}>Token</Label>
                      <Input className={`${fieldInput} font-mono`} placeholder="eyJhbGciOiJIUzI1NiIs..." value={authToken} onChange={(e) => setAuthToken(e.target.value)} />
                    </div>
                  </div>
                )}

                {authType === 'api-key' && (
                  <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs text-muted-foreground">在请求头中添加 X-API-Key: &lt;key&gt;</p>
                    <div className={field}>
                      <Label className={fieldLabel}>API Key</Label>
                      <Input className={`${fieldInput} font-mono`} placeholder="sk-xxxxxxxx" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* -------- Tab 6: 代理设置 -------- */}
              <TabsContent value="proxy" className="mt-0 space-y-5">
                <div className={field}>
                  <Label className={fieldLabel}>代理服务器地址</Label>
                  <Input className={`${fieldInput} font-mono`} placeholder="http://proxy.example.com:8080" value={proxy} onChange={(e) => setProxy(e.target.value)} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">代理轮换</Label>
                    <p className="text-xs text-muted-foreground">自动轮换代理IP以避免被封</p>
                  </div>
                  <Switch checked={proxyRotation} onCheckedChange={setProxyRotation} />
                </div>
                {proxyRotation && (
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10">
                        <Shield className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">代理池状态</p>
                        <p className="text-xs text-muted-foreground">当前代理池大小: <span className="text-primary font-semibold">100</span> 个可用节点</p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      <div className="text-center rounded-md bg-background p-2">
                        <p className="text-lg font-bold text-emerald-500">87</p>
                        <p className="text-xs text-muted-foreground">健康节点</p>
                      </div>
                      <div className="text-center rounded-md bg-background p-2">
                        <p className="text-lg font-bold text-amber-500">10</p>
                        <p className="text-xs text-muted-foreground">检测中</p>
                      </div>
                      <div className="text-center rounded-md bg-background p-2">
                        <p className="text-lg font-bold text-red-500">3</p>
                        <p className="text-xs text-muted-foreground">已失效</p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* -------- Tab 7: 分页配置 -------- */}
              <TabsContent value="pagination" className="mt-0 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">启用分页</Label>
                    <p className="text-xs text-muted-foreground">自动翻页采集多页数据</p>
                  </div>
                  <Switch checked={paginationEnabled} onCheckedChange={setPaginationEnabled} />
                </div>

                {paginationEnabled && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className={field}>
                        <Label className={fieldLabel}>分页类型</Label>
                        <Select value={paginationType} onValueChange={(v) => setPaginationType(v as PaginationConfig['type'])}>
                          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="url-param">URL参数</SelectItem>
                            <SelectItem value="click-next">点击下一页</SelectItem>
                            <SelectItem value="scroll">滚动加载</SelectItem>
                            <SelectItem value="offset">偏移量</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className={field}>
                        <Label className={fieldLabel}>最大页数</Label>
                        <Input type="number" className={fieldInput} min={1} max={10000} value={paginationMaxPages} onChange={(e) => setPaginationMaxPages(Number(e.target.value))} />
                      </div>
                    </div>

                    {paginationType === 'click-next' && (
                      <div className={field}>
                        <Label className={fieldLabel}>下一页按钮选择器</Label>
                        <Input className={`${fieldInput} font-mono`} placeholder=".next-page-btn" value={nextSelector} onChange={(e) => setNextSelector(e.target.value)} />
                      </div>
                    )}

                    {paginationType === 'url-param' && (
                      <div className={field}>
                        <Label className={fieldLabel}>URL 模式</Label>
                        <Input className={`${fieldInput} font-mono`} placeholder="?page={page}" value={urlPattern} onChange={(e) => setUrlPattern(e.target.value)} />
                        <p className="text-xs text-muted-foreground">使用 {'{page}'} 作为页码占位符</p>
                      </div>
                    )}

                    {paginationType === 'scroll' && (
                      <div className={field}>
                        <Label className={fieldLabel}>滚动等待时间 (ms)</Label>
                        <Input type="number" className={fieldInput} min={100} max={10000} value={scrollDelay} onChange={(e) => setScrollDelay(Number(e.target.value))} />
                      </div>
                    )}
                  </motion.div>
                )}
              </TabsContent>

              {/* -------- Tab 8: 数据处理 -------- */}
              <TabsContent value="dataproc" className="mt-0 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">去除空白字符</Label>
                    <p className="text-xs text-muted-foreground">自动trim字段值的首尾空白</p>
                  </div>
                  <Switch checked={trimWhitespace} onCheckedChange={setTrimWhitespace} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">去除重复数据</Label>
                    <p className="text-xs text-muted-foreground">自动过滤完全相同的行</p>
                  </div>
                  <Switch checked={removeDuplicates} onCheckedChange={setRemoveDuplicates} />
                </div>
                <div className={field}>
                  <Label className={fieldLabel}>默认值</Label>
                  <Input className={fieldInput} placeholder="字段为空时使用的默认值" value={defaultValue} onChange={(e) => setDefaultValue(e.target.value)} />
                </div>

                <Separator />

                {/* Regex replace rules */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">正则替换规则</Label>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setRegexReplace((prev) => [...prev, { pattern: '', replacement: '' }])}>
                      <Plus className="size-3" />添加
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {regexReplace.map((r, i) => (
                      <KeyValueRow
                        key={i}
                        label={`规则${i + 1}`}
                        keyVal={r.pattern}
                        valueVal={r.replacement}
                        onKeyChange={(v) => setRegexReplace((prev) => prev.map((x, xi) => xi === i ? { ...x, pattern: v } : x))}
                        onValueChange={(v) => setRegexReplace((prev) => prev.map((x, xi) => xi === i ? { ...x, replacement: v } : x))}
                        onRemove={() => setRegexReplace((prev) => prev.filter((_, xi) => xi !== i))}
                        placeholderKey="正则表达式"
                        placeholderValue="替换为"
                      />
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Validation rules */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">验证规则</Label>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setValidationRules((prev) => [...prev, { field: '', type: 'required', message: '' }])}>
                      <Plus className="size-3" />添加
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {validationRules.map((r, i) => (
                      <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/30 p-3">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <Input className="h-7 text-xs" placeholder="字段名" value={r.field} onChange={(e) => setValidationRules((prev) => prev.map((x, xi) => xi === i ? { ...x, field: e.target.value } : x))} />
                          <Select value={r.type} onValueChange={(v) => setValidationRules((prev) => prev.map((x, xi) => xi === i ? { ...x, type: v as ValidationRule['type'] } : x))}>
                            <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="required">必填</SelectItem>
                              <SelectItem value="regex">正则</SelectItem>
                              <SelectItem value="min-length">最小长度</SelectItem>
                              <SelectItem value="max-length">最大长度</SelectItem>
                              <SelectItem value="email">邮箱</SelectItem>
                              <SelectItem value="url">URL</SelectItem>
                              <SelectItem value="number">数字</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input className="h-7 text-xs" placeholder="验证值(可选)" value={r.value ?? ''} onChange={(e) => setValidationRules((prev) => prev.map((x, xi) => xi === i ? { ...x, value: e.target.value } : x))} />
                        </div>
                        <div className="flex items-center gap-2">
                          <Input className="h-7 text-xs flex-1" placeholder="错误提示消息" value={r.message} onChange={(e) => setValidationRules((prev) => prev.map((x, xi) => xi === i ? { ...x, message: e.target.value } : x))} />
                          <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive shrink-0" onClick={() => setValidationRules((prev) => prev.filter((_, xi) => xi !== i))}>
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Transform rules */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">转换规则</Label>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setTransformations((prev) => [...prev, { field: '', type: 'uppercase' }])}>
                      <Plus className="size-3" />添加
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {transformations.map((t, i) => (
                      <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                        <Input className="h-7 text-xs flex-1" placeholder="字段名" value={t.field} onChange={(e) => setTransformations((prev) => prev.map((x, xi) => xi === i ? { ...x, field: e.target.value } : x))} />
                        <Select value={t.type} onValueChange={(v) => setTransformations((prev) => prev.map((x, xi) => xi === i ? { ...x, type: v as TransformConfig['type'] } : x))}>
                          <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="uppercase">大写</SelectItem>
                            <SelectItem value="lowercase">小写</SelectItem>
                            <SelectItem value="trim">修剪</SelectItem>
                            <SelectItem value="replace">替换</SelectItem>
                            <SelectItem value="regex">正则</SelectItem>
                            <SelectItem value="date-format">日期格式</SelectItem>
                            <SelectItem value="number-format">数字格式</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input className="h-7 text-xs flex-1" placeholder="参数(可选)" value={t.params ? JSON.stringify(t.params) : ''} onChange={(e) => {
                          try {
                            const p = e.target.value ? JSON.parse(e.target.value) : undefined;
                            setTransformations((prev) => prev.map((x, xi) => xi === i ? { ...x, params: p } : x));
                          } catch { /* ignore */ }
                        }} />
                        <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive shrink-0" onClick={() => setTransformations((prev) => prev.filter((_, xi) => xi !== i))}>
                          <X className="size-3.5" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* -------- Tab 9: 导出与通知 -------- */}
              <TabsContent value="export" className="mt-0 space-y-5">
                <div>
                  <Label className="text-sm font-medium mb-3 block">导出格式</Label>
                  <div className="flex flex-wrap gap-3">
                    {(['json', 'csv', 'xlsx', 'xml'] as const).map((fmt) => (
                      <label key={fmt} className="flex items-center gap-2 cursor-pointer rounded-lg border border-border/60 bg-muted/20 px-4 py-2.5 transition-colors hover:bg-muted/40 has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5">
                        <Checkbox checked={exportFormats.includes(fmt)} onCheckedChange={() => toggleExportFormat(fmt)} />
                        <span className="text-sm font-medium uppercase">{fmt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Separator />

                <Label className="text-sm font-medium mb-3 block">通知设置</Label>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">完成时通知</Label>
                  <Switch checked={notifOnCompletion} onCheckedChange={setNotifOnCompletion} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">失败时通知</Label>
                  <Switch checked={notifOnFailure} onCheckedChange={setNotifOnFailure} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">数据阈值通知</Label>
                  <Switch checked={notifOnDataThreshold} onCheckedChange={setNotifOnDataThreshold} />
                </div>

                {notifOnDataThreshold && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <div className={field}>
                      <Label className={fieldLabel}>数据量阈值 (条)</Label>
                      <Input type="number" className={fieldInput} min={1} value={dataThreshold} onChange={(e) => setDataThreshold(Number(e.target.value))} />
                    </div>
                  </motion.div>
                )}

                <Separator />

                <div>
                  <Label className="text-sm font-medium mb-3 block">通知渠道</Label>
                  <div className="flex flex-wrap gap-3">
                    {(['email', 'webhook', 'sms'] as const).map((ch) => {
                      const labels = { email: 'Email', webhook: 'Webhook', sms: 'SMS' };
                      return (
                        <label key={ch} className="flex items-center gap-2 cursor-pointer rounded-lg border border-border/60 bg-muted/20 px-4 py-2.5 transition-colors hover:bg-muted/40 has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5">
                          <Checkbox checked={notifChannels.includes(ch)} onCheckedChange={() => toggleChannel(ch)} />
                          <span className="text-sm font-medium">{labels[ch]}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {notifChannels.includes('email') && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={field}>
                    <Label className={fieldLabel}>邮件接收者</Label>
                    <Input className={fieldInput} placeholder="email1@example.com, email2@example.com" value={emailRecipients} onChange={(e) => setEmailRecipients(e.target.value)} />
                  </motion.div>
                )}

                {notifChannels.includes('webhook') && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={field}>
                    <Label className={fieldLabel}>Webhook URL</Label>
                    <Input className={`${fieldInput} font-mono`} placeholder="https://hooks.example.com/notify" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} />
                  </motion.div>
                )}
              </TabsContent>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t px-6 py-4 flex items-center justify-end gap-3 shrink-0 bg-muted/20">
            <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
            <Button onClick={handleSave} className="gap-1.5">
              <FileDown className="size-4" />
              {isNew ? '创建任务' : '保存配置'}
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  Task Card                                                                  */
/* -------------------------------------------------------------------------- */

function TaskCard({
  task,
  index,
  projectName,
  onViewConfig,
  onRun,
  onDelete,
}: {
  task: ScrapingTask;
  index: number;
  projectName: string;
  onViewConfig: (t: ScrapingTask) => void;
  onRun: (t: ScrapingTask) => void;
  onDelete: (t: ScrapingTask) => void;
}) {
  const statusCfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.pending;
  const methodColor = METHOD_COLORS[task.method] ?? METHOD_COLORS.GET;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      <Card className="group relative overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(var(--primary),0.08)]">
        {/* Glow accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            {/* Row 1: Name + badges */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <h3 className="text-sm font-semibold truncate">{task.name}</h3>
                <Badge variant="outline" className="text-xs shrink-0 opacity-80">{projectName}</Badge>
              </div>
              <Badge variant="outline" className={`text-xs shrink-0 border ${methodColor}`}>{task.method}</Badge>
            </div>

            {/* Row 2: URL */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="size-3 shrink-0" />
              <span className="truncate font-mono">{truncate(task.url, 72)}</span>
            </div>

            {/* Row 3: Meta info */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              {/* Status */}
              <div className="flex items-center gap-1.5">
                <span className={`inline-block size-2 rounded-full ${statusCfg.dot}`} />
                <span>{statusCfg.label}</span>
              </div>

              {/* Duration */}
              {task.duration != null && task.duration > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="size-3" />
                  <span>{formatDuration(task.duration)}</span>
                </div>
              )}

              {/* Data rows */}
              <div className="flex items-center gap-1">
                <Database className="size-3" />
                <span>{formatNumber(task.dataRows)} 条</span>
              </div>

              {/* Start time */}
              {task.startTime && (
                <div className="flex items-center gap-1">
                  <span>开始: {task.startTime.slice(5, 16)}</span>
                </div>
              )}

              {/* End time */}
              {task.endTime && (
                <div className="flex items-center gap-1">
                  <span>结束: {task.endTime.slice(5, 16)}</span>
                </div>
              )}
            </div>

            {/* Row 4: Actions */}
            <div className="flex items-center gap-2 pt-1 border-t border-border/40">
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground" onClick={() => onViewConfig(task)}>
                <Eye className="size-3" />配置
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-emerald-600 hover:text-emerald-500 hover:bg-emerald-500/10" onClick={() => onRun(task)}>
                <Play className="size-3" />运行
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-red-500 hover:text-red-400 hover:bg-red-500/10 ml-auto" onClick={() => onDelete(task)}>
                <Trash2 className="size-3" />删除
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Page Component                                                        */
/* -------------------------------------------------------------------------- */

export default function TasksPage() {
  /* Filter state */
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  /* Task list (local) */
  const [tasks, setTasks] = useState<ScrapingTask[]>([...MOCK_TASKS]);

  /* Dialog state */
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ScrapingTask | null>(null);

  /* Project lookup */
  const projectMap = useMemo(() => {
    const m: Record<string, string> = {};
    MOCK_PROJECTS.forEach((p) => { m[p.id] = p.name; });
    return m;
  }, []);

  /* Filtered tasks */
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (projectFilter !== 'all' && t.projectId !== projectFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (methodFilter !== 'all' && t.method !== methodFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!t.name.toLowerCase().includes(q) && !t.url.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [tasks, projectFilter, statusFilter, methodFilter, searchQuery]);

  /* Stats */
  const stats = useMemo(() => {
    const total = tasks.length;
    const running = tasks.filter((t) => t.status === 'running').length;
    const success = tasks.filter((t) => t.status === 'success').length;
    const failed = tasks.filter((t) => t.status === 'failed').length;
    return { total, running, success, failed };
  }, [tasks]);

  /* Handlers */
  const handleNewTask = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleViewConfig = (task: ScrapingTask) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleSaveTask = (task: ScrapingTask) => {
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === task.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = task;
        return updated;
      }
      return [task, ...prev];
    });
  };

  const handleRun = (task: ScrapingTask) => {
    toast.success(`任务「${task.name}」已开始运行`);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, status: 'running' as const, startTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-') }
          : t
      )
    );
  };

  const handleDelete = (task: ScrapingTask) => {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    toast.success(`任务「${task.name}」已删除`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Glow background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/4 size-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/3 right-0 size-96 rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              <Zap className="inline-block size-6 mr-2 text-primary" />
              采集任务管理
            </h1>
            <p className="text-sm text-muted-foreground mt-1">管理和监控所有数据采集任务的配置与执行状态</p>
          </div>
          <Button onClick={handleNewTask} className="gap-1.5 self-start">
            <Plus className="size-4" />
            新建任务
          </Button>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4"
        >
          {[
            { label: '总任务', value: stats.total, color: 'text-foreground' },
            { label: '运行中', value: stats.running, color: 'text-emerald-500' },
            { label: '已成功', value: stats.success, color: 'text-emerald-500' },
            { label: '已失败', value: stats.failed, color: 'text-red-500' },
          ].map((s) => (
            <Card key={s.label} className="border-border/50 bg-muted/30">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="text-sm text-muted-foreground">{s.label}</div>
                <div className={`ml-auto text-xl font-bold ${s.color}`}>{formatNumber(s.value)}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="flex flex-col gap-3 mb-6 sm:flex-row sm:flex-wrap sm:items-center"
        >
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="h-9 pl-9 text-sm"
              placeholder="搜索任务名称或URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Project filter */}
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="h-9 w-full sm:w-48"><SelectValue placeholder="全部项目" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部项目</SelectItem>
              {MOCK_PROJECTS.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-full sm:w-36"><SelectValue placeholder="全部状态" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="pending">待执行</SelectItem>
              <SelectItem value="running">运行中</SelectItem>
              <SelectItem value="success">成功</SelectItem>
              <SelectItem value="failed">失败</SelectItem>
              <SelectItem value="timeout">超时</SelectItem>
            </SelectContent>
          </Select>

          {/* Method filter */}
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="h-9 w-full sm:w-32"><SelectValue placeholder="全部方法" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Task list */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                index={i}
                projectName={projectMap[task.projectId] ?? '未知项目'}
                onViewConfig={handleViewConfig}
                onRun={handleRun}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>

          {filteredTasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 py-16 text-muted-foreground"
            >
              <Database className="size-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">暂无匹配的任务</p>
              <p className="text-xs mt-1">尝试调整筛选条件或创建新任务</p>
              <Button variant="outline" size="sm" className="mt-4 gap-1" onClick={handleNewTask}>
                <Plus className="size-3.5" />新建任务
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Config Dialog */}
      <TaskConfigDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSave={handleSaveTask}
      />
    </div>
  );
}
