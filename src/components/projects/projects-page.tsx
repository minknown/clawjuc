'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Play,
  Pause,
  Pencil,
  Trash2,
  Globe,
  Clock,
  Database,
  Tag,
  AlertCircle,
  CheckCircle2,
  Timer,
  X,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_PROJECTS } from '@/lib/mock-data';
import type { ScrapingProject, ScheduleConfig } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─── Status config ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ScrapingProject['status'],
  { label: string; color: string; dot: string }
> = {
  running: { label: '运行中', color: 'var(--theme-success)', dot: '#00ff88' },
  paused: { label: '已暂停', color: 'var(--theme-warning)', dot: '#ffaa00' },
  completed: { label: '已完成', color: 'var(--theme-info)', dot: '#00aaff' },
  error: { label: '失败', color: 'var(--theme-destructive)', dot: '#ff0044' },
  pending: { label: '待执行', color: 'var(--theme-muted-foreground)', dot: '#888888' },
};

const SCHEDULE_TYPE_LABELS: Record<ScheduleConfig['type'], string> = {
  once: '一次性',
  interval: '固定间隔',
  cron: 'Cron表达式',
  manual: '手动',
};

const STATUS_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'running', label: '运行中' },
  { value: 'paused', label: '已暂停' },
  { value: 'completed', label: '已完成' },
  { value: 'error', label: '失败' },
  { value: 'pending', label: '待执行' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  return n.toLocaleString('zh-CN');
}

function getAllTags(projects: ScrapingProject[]): string[] {
  const tagSet = new Set<string>();
  projects.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

// ─── Default form state ─────────────────────────────────────────────────────

function createDefaultForm(): ProjectFormData {
  return {
    name: '',
    description: '',
    targetUrl: '',
    scheduleType: 'manual',
    interval: 30,
    cronExpression: '',
    retryOnFail: true,
    maxRetries: 3,
    timeout: 60,
    tags: '',
  };
}

interface ProjectFormData {
  name: string;
  description: string;
  targetUrl: string;
  scheduleType: ScheduleConfig['type'];
  interval: number;
  cronExpression: string;
  retryOnFail: boolean;
  maxRetries: number;
  timeout: number;
  tags: string;
}

// ─── Animation variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 22 },
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ScrapingProject[]>(MOCK_PROJECTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ScrapingProject | null>(null);
  const [form, setForm] = useState<ProjectFormData>(createDefaultForm());

  // ─── Derived state ──────────────────────────────────────────────────────

  const allTags = useMemo(() => getAllTags(projects), [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.targetUrl.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || p.status === statusFilter;

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((t) => p.tags.includes(t));

      return matchesSearch && matchesStatus && matchesTags;
    });
  }, [projects, searchQuery, statusFilter, selectedTags]);

  // ─── Dialog handlers ────────────────────────────────────────────────────

  function openCreateDialog() {
    setEditingProject(null);
    setForm(createDefaultForm());
    setDialogOpen(true);
  }

  function openEditDialog(project: ScrapingProject) {
    setEditingProject(project);
    setForm({
      name: project.name,
      description: project.description,
      targetUrl: project.targetUrl,
      scheduleType: project.schedule.type,
      interval: project.schedule.interval ?? 30,
      cronExpression: project.schedule.cronExpression ?? '',
      retryOnFail: project.schedule.retryOnFail,
      maxRetries: project.schedule.maxRetries,
      timeout: project.schedule.timeout,
      tags: project.tags.join(', '),
    });
    setDialogOpen(true);
  }

  function handleSave() {
    if (!form.name.trim()) {
      toast.error('请输入项目名称');
      return;
    }
    if (!form.targetUrl.trim()) {
      toast.error('请输入目标 URL');
      return;
    }

    const parsedTags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const schedule: ScheduleConfig = {
      type: form.scheduleType,
      retryOnFail: form.retryOnFail,
      maxRetries: form.maxRetries,
      timeout: form.timeout,
    };
    if (form.scheduleType === 'interval') {
      schedule.interval = form.interval;
    }
    if (form.scheduleType === 'cron') {
      schedule.cronExpression = form.cronExpression;
    }

    if (editingProject) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingProject.id
            ? { ...p, name: form.name, description: form.description, targetUrl: form.targetUrl, schedule, tags: parsedTags }
            : p
        )
      );
      toast.success('项目已更新');
    } else {
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const newProject: ScrapingProject = {
        id: `p${Date.now()}`,
        name: form.name.trim(),
        description: form.description.trim(),
        status: 'pending',
        targetUrl: form.targetUrl.trim(),
        createdAt: now,
        lastRun: '',
        totalTasks: 0,
        completedTasks: 0,
        dataCount: 0,
        schedule,
        tags: parsedTags,
      };
      setProjects((prev) => [newProject, ...prev]);
      toast.success('项目已创建');
    }

    setDialogOpen(false);
  }

  function handleDelete(projectId: string) {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    toast.success('项目已删除');
  }

  function handleToggleStatus(project: ScrapingProject) {
    const newStatus =
      project.status === 'running'
        ? 'paused'
        : project.status === 'paused'
          ? 'running'
          : project.status === 'pending'
            ? 'running'
            : project.status;

    if (!newStatus) return;

    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, status: newStatus } : p))
    );

    if (newStatus === 'running') {
      toast.success(`项目「${project.name}」已启动`);
    } else {
      toast.info(`项目「${project.name}」已暂停`);
    }
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  // ─── Progress helper ────────────────────────────────────────────────────

  function getProgressInfo(project: ScrapingProject) {
    const pct =
      project.totalTasks > 0
        ? Math.round((project.completedTasks / project.totalTasks) * 100)
        : 0;
    return { pct, completed: project.completedTasks, total: project.totalTasks };
  }

  function getScheduleLabel(project: ScrapingProject): string {
    const s = project.schedule;
    switch (s.type) {
      case 'once':
        return '一次性执行';
      case 'interval':
        return `每 ${s.interval} 分钟`;
      case 'cron':
        return s.cronExpression ?? 'Cron';
      case 'manual':
        return '手动触发';
      default:
        return '未知';
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--theme-background)',
        color: 'var(--theme-foreground)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ─── Header ─────────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              className="text-2xl font-bold sm:text-3xl"
              style={{ color: 'var(--theme-foreground)' }}
            >
              采集项目管理
            </h1>
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--theme-muted-foreground)' }}
            >
              管理和监控所有数据采集项目
            </p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="gap-2 font-medium shadow-md transition-all duration-200 hover:scale-[1.03] hover:shadow-lg active:scale-[0.98]"
            style={{
              background: 'var(--theme-gradient)',
              color: 'var(--theme-primary)',
              border: '1px solid var(--theme-border)',
            }}
          >
            <Plus className="size-4" />
            新建项目
          </Button>
        </div>

        {/* ─── Filter / Search Bar ────────────────────────────────────── */}
        <div
          className="mb-6 rounded-xl border p-4"
          style={{
            background: 'var(--theme-card)',
            borderColor: 'var(--theme-border)',
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2"
                style={{ color: 'var(--theme-muted-foreground)' }}
              />
              <Input
                placeholder="搜索项目名称、描述或 URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                style={{
                  background: 'var(--theme-background)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-foreground)',
                }}
              />
            </div>

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                className="w-full md:w-[140px]"
                style={{
                  background: 'var(--theme-background)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-foreground)',
                }}
              >
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent
                style={{
                  background: 'var(--theme-card)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tag filter chips */}
          {allTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className="text-xs font-medium self-center"
                style={{ color: 'var(--theme-muted-foreground)' }}
              >
                标签筛选:
              </span>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200"
                  style={{
                    background: selectedTags.includes(tag)
                      ? 'var(--theme-primary)'
                      : 'var(--theme-muted)',
                    color: selectedTags.includes(tag)
                      ? 'var(--theme-background)'
                      : 'var(--theme-muted-foreground)',
                    border: `1px solid ${selectedTags.includes(tag) ? 'var(--theme-primary)' : 'var(--theme-border)'}`,
                    cursor: 'pointer',
                  }}
                >
                  {tag}
                  {selectedTags.includes(tag) && (
                    <X className="size-3" />
                  )}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200"
                  style={{
                    background: 'transparent',
                    color: 'var(--theme-muted-foreground)',
                    border: '1px solid var(--theme-border)',
                    cursor: 'pointer',
                  }}
                >
                  清除
                </button>
              )}
            </div>
          )}
        </div>

        {/* ─── Project count ──────────────────────────────────────────── */}
        <div className="mb-4 flex items-center gap-2">
          <span
            className="text-sm"
            style={{ color: 'var(--theme-muted-foreground)' }}
          >
            共
          </span>
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--theme-primary)' }}
          >
            {filteredProjects.length}
          </span>
          <span
            className="text-sm"
            style={{ color: 'var(--theme-muted-foreground)' }}
          >
            个项目
          </span>
        </div>

        {/* ─── Project Cards Grid ─────────────────────────────────────── */}
        <motion.div
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => {
              const statusCfg = STATUS_CONFIG[project.status];
              const progress = getProgressInfo(project);
              const canToggle =
                project.status === 'running' ||
                project.status === 'paused' ||
                project.status === 'pending';

              return (
                <motion.div
                  key={project.id}
                  variants={cardVariants}
                  layout
                  exit="exit"
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="group relative flex flex-col overflow-hidden rounded-xl border transition-shadow duration-300"
                  style={{
                    background: 'var(--theme-card)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-card-foreground)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow =
                      '0 0 24px var(--theme-glow)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                  }}
                >
                  {/* Glow accent line at top */}
                  <div
                    className="absolute inset-x-0 top-0 h-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: 'var(--theme-gradient)',
                    }}
                  />

                  <div className="flex flex-1 flex-col p-5">
                    {/* Header: name + status */}
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <h3
                        className="text-base font-bold leading-tight"
                        style={{ color: 'var(--theme-card-foreground)' }}
                      >
                        {project.name}
                      </h3>
                      <span
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          background: `${statusCfg.dot}18`,
                          color: statusCfg.color,
                          border: `1px solid ${statusCfg.dot}40`,
                        }}
                      >
                        <span
                          className="inline-block size-1.5 rounded-full"
                          style={{
                            background: statusCfg.dot,
                            boxShadow: `0 0 6px ${statusCfg.dot}`,
                          }}
                        />
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Description */}
                    <p
                      className="mb-4 line-clamp-2 text-xs leading-relaxed"
                      style={{ color: 'var(--theme-muted-foreground)' }}
                    >
                      {project.description}
                    </p>

                    {/* Target URL */}
                    <div
                      className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2"
                      style={{
                        background: 'var(--theme-background)',
                        border: '1px solid var(--theme-border)',
                      }}
                    >
                      <Globe
                        className="size-3.5 shrink-0"
                        style={{ color: 'var(--theme-muted-foreground)' }}
                      />
                      <span
                        className="truncate text-xs"
                        style={{ color: 'var(--theme-muted-foreground)' }}
                        title={project.targetUrl}
                      >
                        {project.targetUrl}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span
                          className="text-xs font-medium"
                          style={{ color: 'var(--theme-muted-foreground)' }}
                        >
                          任务进度
                        </span>
                        <span
                          className="text-xs font-semibold"
                          style={{ color: 'var(--theme-foreground)' }}
                        >
                          {progress.completed}/{progress.total}
                        </span>
                      </div>
                      <div
                        className="h-2 w-full overflow-hidden rounded-full"
                        style={{ background: 'var(--theme-muted)' }}
                      >
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress.pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          style={{
                            background: 'var(--theme-gradient)',
                            boxShadow: '0 0 8px var(--theme-glow)',
                          }}
                        />
                      </div>
                      <span
                        className="mt-1 block text-right text-[11px] font-medium"
                        style={{ color: 'var(--theme-muted-foreground)' }}
                      >
                        {progress.pct}%
                      </span>
                    </div>

                    {/* Stats row */}
                    <div className="mb-4 grid grid-cols-2 gap-3">
                      {/* Data count */}
                      <div
                        className="flex items-center gap-2 rounded-lg px-3 py-2"
                        style={{
                          background: 'var(--theme-background)',
                          border: '1px solid var(--theme-border)',
                        }}
                      >
                        <Database
                          className="size-3.5"
                          style={{ color: 'var(--theme-primary)' }}
                        />
                        <div className="min-w-0">
                          <div
                            className="text-[10px]"
                            style={{ color: 'var(--theme-muted-foreground)' }}
                          >
                            数据量
                          </div>
                          <div
                            className="text-sm font-semibold"
                            style={{ color: 'var(--theme-foreground)' }}
                          >
                            {formatNumber(project.dataCount)}
                          </div>
                        </div>
                      </div>

                      {/* Schedule */}
                      <div
                        className="flex items-center gap-2 rounded-lg px-3 py-2"
                        style={{
                          background: 'var(--theme-background)',
                          border: '1px solid var(--theme-border)',
                        }}
                      >
                        <Clock
                          className="size-3.5"
                          style={{ color: 'var(--theme-primary)' }}
                        />
                        <div className="min-w-0">
                          <div
                            className="text-[10px]"
                            style={{ color: 'var(--theme-muted-foreground)' }}
                          >
                            {SCHEDULE_TYPE_LABELS[project.schedule.type]}
                          </div>
                          <div
                            className="truncate text-sm font-semibold"
                            style={{ color: 'var(--theme-foreground)' }}
                            title={getScheduleLabel(project)}
                          >
                            {getScheduleLabel(project)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {project.tags.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium"
                            style={{
                              background: 'var(--theme-muted)',
                              color: 'var(--theme-primary)',
                              border: '1px solid var(--theme-border)',
                            }}
                          >
                            <Tag className="size-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Last run */}
                    <div
                      className="mb-3 flex items-center gap-2"
                      style={{ color: 'var(--theme-muted-foreground)' }}
                    >
                      <Timer className="size-3" />
                      <span className="text-[11px]">
                        上次运行:{' '}
                        {project.lastRun || '尚未运行'}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div
                      className="flex items-center gap-2 pt-3"
                      style={{ borderTop: '1px solid var(--theme-border)' }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs"
                        style={{ color: 'var(--theme-foreground)' }}
                        onClick={() => openEditDialog(project)}
                      >
                        <Pencil className="size-3.5" />
                        编辑
                      </Button>

                      {canToggle && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-xs"
                          style={{
                            color:
                              project.status === 'running'
                                ? 'var(--theme-warning)'
                                : 'var(--theme-success)',
                          }}
                          onClick={() => handleToggleStatus(project)}
                        >
                          {project.status === 'running' ? (
                            <>
                              <Pause className="size-3.5" />
                              暂停
                            </>
                          ) : (
                            <>
                              <Play className="size-3.5" />
                              启动
                            </>
                          )}
                        </Button>
                      )}

                      <div className="flex-1" />

                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs"
                        style={{ color: 'var(--theme-destructive)' }}
                        onClick={() => handleDelete(project.id)}
                      >
                        <Trash2 className="size-3.5" />
                        删除
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* ─── Empty state ────────────────────────────────────────────── */}
        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <AlertCircle
              className="mb-4 size-12"
              style={{ color: 'var(--theme-muted-foreground)' }}
            />
            <p
              className="text-base font-medium"
              style={{ color: 'var(--theme-muted-foreground)' }}
            >
              没有找到匹配的项目
            </p>
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--theme-muted-foreground)' }}
            >
              尝试调整搜索条件或创建新项目
            </p>
            <Button
              variant="outline"
              className="mt-4 gap-2"
              style={{
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-primary)',
              }}
              onClick={openCreateDialog}
            >
              <Plus className="size-4" />
              新建项目
            </Button>
          </motion.div>
        )}
      </div>

      {/* ─── Create / Edit Dialog ──────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]"
          style={{
            background: 'var(--theme-card)',
            borderColor: 'var(--theme-border)',
            color: 'var(--theme-card-foreground)',
          }}
        >
          <DialogHeader>
            <DialogTitle
              style={{ color: 'var(--theme-foreground)' }}
            >
              {editingProject ? '编辑项目' : '新建项目'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-2">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <Label style={{ color: 'var(--theme-foreground)' }}>
                项目名称 <span style={{ color: 'var(--theme-destructive)' }}>*</span>
              </Label>
              <Input
                placeholder="请输入项目名称"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                style={{
                  background: 'var(--theme-background)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-foreground)',
                }}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <Label style={{ color: 'var(--theme-foreground)' }}>
                项目描述
              </Label>
              <Textarea
                placeholder="请输入项目描述"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                style={{
                  background: 'var(--theme-background)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-foreground)',
                }}
              />
            </div>

            {/* Target URL */}
            <div className="flex flex-col gap-2">
              <Label style={{ color: 'var(--theme-foreground)' }}>
                目标 URL <span style={{ color: 'var(--theme-destructive)' }}>*</span>
              </Label>
              <Input
                placeholder="https://example.com/data"
                value={form.targetUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, targetUrl: e.target.value }))
                }
                style={{
                  background: 'var(--theme-background)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-foreground)',
                }}
              />
            </div>

            {/* Schedule type */}
            <div className="flex flex-col gap-2">
              <Label style={{ color: 'var(--theme-foreground)' }}>
                调度类型
              </Label>
              <Select
                value={form.scheduleType}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, scheduleType: v as ScheduleConfig['type'] }))
                }
              >
                <SelectTrigger
                  className="w-full"
                  style={{
                    background: 'var(--theme-background)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-foreground)',
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{
                    background: 'var(--theme-card)',
                    borderColor: 'var(--theme-border)',
                  }}
                >
                  <SelectItem value="once">一次性</SelectItem>
                  <SelectItem value="interval">固定间隔</SelectItem>
                  <SelectItem value="cron">Cron表达式</SelectItem>
                  <SelectItem value="manual">手动</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Interval input */}
            {form.scheduleType === 'interval' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-2"
              >
                <Label style={{ color: 'var(--theme-foreground)' }}>
                  间隔时间（分钟）
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={form.interval}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, interval: parseInt(e.target.value) || 1 }))
                  }
                  style={{
                    background: 'var(--theme-background)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-foreground)',
                  }}
                />
              </motion.div>
            )}

            {/* Cron expression input */}
            {form.scheduleType === 'cron' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-2"
              >
                <Label style={{ color: 'var(--theme-foreground)' }}>
                  Cron 表达式
                </Label>
                <Input
                  placeholder="*/15 * * * *"
                  value={form.cronExpression}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, cronExpression: e.target.value }))
                  }
                  style={{
                    background: 'var(--theme-background)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-foreground)',
                  }}
                />
                <p
                  className="text-[11px]"
                  style={{ color: 'var(--theme-muted-foreground)' }}
                >
                  例如: */15 * * * *（每15分钟），0 6,18 * * *（每天6点和18点）
                </p>
              </motion.div>
            )}

            {/* Retry on fail */}
            <div
              className="flex items-center justify-between rounded-lg px-4 py-3"
              style={{
                background: 'var(--theme-background)',
                border: '1px solid var(--theme-border)',
              }}
            >
              <div className="flex items-center gap-2">
                <Zap
                  className="size-4"
                  style={{ color: 'var(--theme-warning)' }}
                />
                <Label
                  className="cursor-pointer"
                  style={{ color: 'var(--theme-foreground)' }}
                >
                  失败自动重试
                </Label>
              </div>
              <Switch
                checked={form.retryOnFail}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, retryOnFail: checked }))
                }
              />
            </div>

            {/* Max retries + Timeout row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label style={{ color: 'var(--theme-foreground)' }}>
                  最大重试次数
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={form.maxRetries}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      maxRetries: parseInt(e.target.value) || 0,
                    }))
                  }
                  style={{
                    background: 'var(--theme-background)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-foreground)',
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label style={{ color: 'var(--theme-foreground)' }}>
                  超时时间（秒）
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={form.timeout}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      timeout: parseInt(e.target.value) || 30,
                    }))
                  }
                  style={{
                    background: 'var(--theme-background)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-foreground)',
                  }}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-2">
              <Label style={{ color: 'var(--theme-foreground)' }}>
                标签（逗号分隔）
              </Label>
              <Input
                placeholder="电商, 商品, 价格"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                style={{
                  background: 'var(--theme-background)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-foreground)',
                }}
              />
              <p
                className="text-[11px]"
                style={{ color: 'var(--theme-muted-foreground)' }}
              >
                多个标签用英文逗号分隔，例如: 电商, 商品, 价格
              </p>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              style={{
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-foreground)',
              }}
            >
              取消
            </Button>
            <Button
              onClick={handleSave}
              className="gap-2 font-medium"
              style={{
                background: 'var(--theme-gradient)',
                color: 'var(--theme-primary)',
              }}
            >
              <CheckCircle2 className="size-4" />
              {editingProject ? '保存修改' : '创建项目'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
