'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Database,
  Play,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Shield,
  Clock,
} from 'lucide-react';
import { DASHBOARD_CHART_DATA, ACTIVITY_LOG, MOCK_PROJECTS } from '@/lib/mock-data';
import { useThemeStore } from '@/store/theme';

/* ────────────────────────── animation variants ────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
};

/* ────────────────────────── animated counter hook ─────────────────────── */

function useAnimatedNumber(target: number, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString();
}

/* ────────────────────────── stat card config ──────────────────────────── */

interface StatCardConfig {
  label: string;
  value: number;
  suffix: string;
  decimals: number;
  trend: string;
  trendUp: boolean;
  icon: React.ElementType;
  gradient: string;
  glowColor: string;
}

const STAT_CARDS: StatCardConfig[] = [
  {
    label: '采集项目总数',
    value: MOCK_PROJECTS.length,
    suffix: ' 个',
    decimals: 0,
    trend: '+12.5%',
    trendUp: true,
    icon: Database,
    gradient: 'linear-gradient(135deg, var(--theme-primary), var(--theme-accent))',
    glowColor: 'var(--theme-primary)',
  },
  {
    label: '运行中任务',
    value: MOCK_PROJECTS.filter((p) => p.status === 'running').length,
    suffix: ' 个',
    decimals: 0,
    trend: '+2',
    trendUp: true,
    icon: Play,
    gradient: 'linear-gradient(135deg, var(--theme-success), #00c97b)',
    glowColor: 'var(--theme-success)',
  },
  {
    label: '今日数据量',
    value: 1284500,
    suffix: '',
    decimals: 0,
    trend: '+18.2%',
    trendUp: true,
    icon: BarChart3,
    gradient: 'linear-gradient(135deg, var(--theme-info), #0099ff)',
    glowColor: 'var(--theme-info)',
  },
  {
    label: '成功率',
    value: 94.7,
    suffix: '%',
    decimals: 1,
    trend: '+1.3%',
    trendUp: true,
    icon: TrendingUp,
    gradient: 'linear-gradient(135deg, var(--theme-warning), #ffaa00)',
    glowColor: 'var(--theme-warning)',
  },
];

/* ────────────────────────── stat card component ──────────────────────── */

function StatCard({ config, index }: { config: StatCardConfig; index: number }) {
  const animatedValue = useAnimatedNumber(config.value, 1400, config.decimals);
  const displayValue =
    config.decimals > 0
      ? animatedValue
      : animatedValue;

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="group relative overflow-hidden rounded-2xl p-[1px]"
      style={{
        background: `linear-gradient(135deg, var(--theme-border), transparent 60%)`,
      }}
    >
      {/* Glow background */}
      <div
        className="pointer-events-none absolute -inset-1 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-30"
        style={{ background: config.glowColor }}
      />

      {/* Card body */}
      <div
        className="relative flex items-center gap-4 rounded-2xl p-5 backdrop-blur-md"
        style={{
          background: 'var(--theme-card)',
          border: '1px solid var(--theme-border)',
        }}
      >
        {/* Icon */}
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-lg"
          style={{ background: config.gradient }}
        >
          <config.icon className="h-6 w-6 text-white" />
        </div>

        {/* Text content */}
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-xs font-medium tracking-wide"
            style={{ color: 'var(--theme-muted-foreground)' }}
          >
            {config.label}
          </p>
          <p className="mt-0.5 flex items-baseline gap-1 text-2xl font-bold tabular-nums" style={{ color: 'var(--theme-card-foreground)' }}>
            {displayValue}
            <span
              className="text-sm font-semibold"
              style={{ color: 'var(--theme-muted-foreground)' }}
            >
              {config.suffix}
            </span>
          </p>
        </div>

        {/* Trend indicator */}
        <div
          className={`flex shrink-0 items-center gap-0.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            config.trendUp
              ? ''
              : ''
          }`}
          style={{
            background: config.trendUp
              ? 'color-mix(in srgb, var(--theme-success) 15%, transparent)'
              : 'color-mix(in srgb, var(--theme-destructive) 15%, transparent)',
            color: config.trendUp ? 'var(--theme-success)' : 'var(--theme-destructive)',
          }}
        >
          {config.trendUp ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          {config.trend}
        </div>

        {/* Decorative corner gradient */}
        <div
          className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-[0.07] blur-2xl transition-opacity group-hover:opacity-[0.14]"
          style={{ background: config.glowColor }}
        />
      </div>
    </motion.div>
  );
}

/* ──────────────────────── chart tooltip style ─────────────────────────── */

const tooltipStyle: React.CSSProperties = {
  background: 'var(--theme-card)',
  border: '1px solid var(--theme-border)',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  color: 'var(--theme-card-foreground)',
  padding: '10px 14px',
  fontSize: '13px',
};

const labelStyle = { fill: 'var(--theme-muted-foreground)', fontSize: 12 };

/* ──────────────────────── activity log type icon ──────────────────────── */

function ActivityIcon({ type }: { type: string }) {
  const colors: Record<string, string> = {
    info: 'var(--theme-info)',
    success: 'var(--theme-success)',
    warning: 'var(--theme-warning)',
    error: 'var(--theme-destructive)',
  };
  const icons: Record<string, React.ElementType> = {
    info: Activity,
    success: Shield,
    warning: Zap,
    error: Clock,
  };
  const Icon = icons[type] || Activity;
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
      style={{ background: `color-mix(in srgb, ${colors[type]} 15%, transparent)` }}
    >
      <Icon className="h-4 w-4" style={{ color: colors[type] }} />
    </div>
  );
}

/* ──────────────────────── glass card wrapper ──────────────────────────── */

function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`relative overflow-hidden rounded-2xl p-[1px] ${className}`}
      style={{
        background: 'linear-gradient(135deg, var(--theme-border), transparent 60%)',
      }}
    >
      <div
        className="relative h-full overflow-hidden rounded-2xl backdrop-blur-md"
        style={{
          background: 'var(--theme-card)',
          border: '1px solid var(--theme-border)',
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

/* ════════════════════════ MAIN DASHBOARD PAGE ══════════════════════════ */

export default function DashboardPage() {
  const { getCurrentConfig } = useThemeStore();
  const theme = getCurrentConfig();

  // Stabilize chart data so recharts doesn't re-animate on every render
  const chartData = useMemo(() => DASHBOARD_CHART_DATA, []);
  const filteredDistribution = useMemo(
    () => chartData.projectDistribution.filter((d) => d.value > 0),
    [chartData],
  );

  // Activity log auto-scroll
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setAutoScroll(isAtBottom);
  }, []);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [autoScroll]);

  return (
    <section className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* ── Page header ── */}
        <motion.div variants={itemVariants} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              className="text-2xl font-bold tracking-tight md:text-3xl"
              style={{ color: 'var(--theme-foreground)' }}
            >
              系统概览
            </h1>
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--theme-muted-foreground)' }}
            >
              数据采集管理系统 &middot; 实时监控中心
            </p>
          </div>
          <div
            className="mt-2 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium sm:mt-0"
            style={{
              background: 'color-mix(in srgb, var(--theme-success) 12%, transparent)',
              color: 'var(--theme-success)',
              border: '1px solid color-mix(in srgb, var(--theme-success) 25%, transparent)',
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: 'var(--theme-success)' }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: 'var(--theme-success)' }} />
            </span>
            系统运行正常
          </div>
        </motion.div>

        {/* ── Stats cards row ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STAT_CARDS.map((card, i) => (
            <StatCard key={card.label} config={card} index={i} />
          ))}
        </div>

        {/* ── Charts row (2 cols) ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Hourly area chart */}
          <GlassCard>
            <div className="p-5 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className="text-base font-semibold"
                    style={{ color: 'var(--theme-card-foreground)' }}
                  >
                    24 小时请求量
                  </h3>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--theme-muted-foreground)' }}>
                    请求总数 / 成功 / 失败
                  </p>
                </div>
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: 'color-mix(in srgb, var(--theme-primary) 15%, transparent)' }}
                >
                  <Activity className="h-4 w-4" style={{ color: 'var(--theme-primary)' }} />
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full px-2 pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.hourlyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradientRequests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.colors.primary} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={theme.colors.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradientSuccess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.colors.success} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={theme.colors.success} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradientFailed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.colors.destructive} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={theme.colors.destructive} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" />
                  <XAxis dataKey="hour" tick={labelStyle} axisLine={false} tickLine={false} interval={2} />
                  <YAxis tick={labelStyle} axisLine={false} tickLine={false} width={50} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: 'var(--theme-muted-foreground)' }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    name="请求总数"
                    stroke={theme.colors.primary}
                    strokeWidth={2}
                    fill="url(#gradientRequests)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="success"
                    name="成功"
                    stroke={theme.colors.success}
                    strokeWidth={2}
                    fill="url(#gradientSuccess)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="failed"
                    name="失败"
                    stroke={theme.colors.destructive}
                    strokeWidth={1.5}
                    fill="url(#gradientFailed)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Weekly bar chart */}
          <GlassCard>
            <div className="p-5 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className="text-base font-semibold"
                    style={{ color: 'var(--theme-card-foreground)' }}
                  >
                    本周任务完成
                  </h3>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--theme-muted-foreground)' }}>
                    每日任务数量 / 数据量
                  </p>
                </div>
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: 'color-mix(in srgb, var(--theme-accent) 15%, transparent)' }}
                >
                  <BarChart3 className="h-4 w-4" style={{ color: 'var(--theme-accent)' }} />
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full px-2 pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.weeklyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradientTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.colors.accent} stopOpacity={0.9} />
                      <stop offset="95%" stopColor={theme.colors.accent} stopOpacity={0.35} />
                    </linearGradient>
                    <linearGradient id="gradientData" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.colors.primary} stopOpacity={0.9} />
                      <stop offset="95%" stopColor={theme.colors.primary} stopOpacity={0.35} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" />
                  <XAxis dataKey="day" tick={labelStyle} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={labelStyle} axisLine={false} tickLine={false} width={40} />
                  <YAxis yAxisId="right" orientation="right" tick={labelStyle} axisLine={false} tickLine={false} width={55} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: 'var(--theme-muted-foreground)' }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="tasks"
                    name="任务数"
                    fill="url(#gradientTasks)"
                    radius={[6, 6, 0, 0]}
                    barSize={22}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="data"
                    name="数据量"
                    fill="url(#gradientData)"
                    radius={[6, 6, 0, 0]}
                    barSize={22}
                    opacity={0.7}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* ── Bottom row: Pie + Activity log ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Pie / Donut chart */}
          <GlassCard className="lg:col-span-2">
            <div className="p-5 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className="text-base font-semibold"
                    style={{ color: 'var(--theme-card-foreground)' }}
                  >
                    项目数据分布
                  </h3>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--theme-muted-foreground)' }}>
                    各项目采集数据量占比
                  </p>
                </div>
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: 'color-mix(in srgb, var(--theme-warning) 15%, transparent)' }}
                >
                  <Zap className="h-4 w-4" style={{ color: 'var(--theme-warning)' }} />
                </div>
              </div>
            </div>
            <div className="h-[310px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {filteredDistribution.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number) => [value.toLocaleString(), '数据量']}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ fontSize: 12, color: 'var(--theme-muted-foreground)', paddingLeft: 10 }}
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Activity log */}
          <GlassCard className="lg:col-span-3">
            <div className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className="text-base font-semibold"
                    style={{ color: 'var(--theme-card-foreground)' }}
                  >
                    实时动态
                  </h3>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--theme-muted-foreground)' }}>
                    系统活动日志
                  </p>
                </div>
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: 'color-mix(in srgb, var(--theme-success) 15%, transparent)' }}
                >
                  <Activity className="h-4 w-4" style={{ color: 'var(--theme-success)' }} />
                </div>
              </div>
            </div>
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="max-h-[320px] overflow-y-auto px-3 pb-3"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--theme-border) transparent',
              }}
            >
              <div className="space-y-2">
                {ACTIVITY_LOG.map((log, idx) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + idx * 0.06, duration: 0.35 }}
                    className="group flex items-start gap-3 rounded-xl p-3 transition-colors"
                    style={{
                      background: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background =
                        'color-mix(in srgb, var(--theme-muted) 50%, transparent)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                    }}
                  >
                    <ActivityIcon type={log.type} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-medium"
                          style={{ color: 'var(--theme-card-foreground)' }}
                        >
                          {log.action}
                        </span>
                        <span
                          className="text-[11px] tabular-nums"
                          style={{ color: 'var(--theme-muted-foreground)' }}
                        >
                          {log.time}
                        </span>
                      </div>
                      <p
                        className="mt-0.5 text-xs leading-relaxed"
                        style={{ color: 'var(--theme-muted-foreground)' }}
                      >
                        {log.detail}
                      </p>
                    </div>
                    {/* Dot indicator */}
                    <div
                      className="mt-2 h-2 w-2 shrink-0 rounded-full"
                      style={{
                        background:
                          log.type === 'info'
                            ? 'var(--theme-info)'
                            : log.type === 'success'
                              ? 'var(--theme-success)'
                              : log.type === 'warning'
                                ? 'var(--theme-warning)'
                                : 'var(--theme-destructive)',
                        boxShadow:
                          log.type === 'error'
                            ? '0 0 8px var(--theme-destructive)'
                            : 'none',
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </motion.div>
    </section>
  );
}
