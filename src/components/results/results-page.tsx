'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Eye,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Calendar,
  FileJson,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
} from 'lucide-react';
import { MOCK_RESULTS } from '@/lib/mock-data';
import { ScrapingResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string; icon: typeof CheckCircle2 }
> = {
  success: {
    label: '成功',
    color: 'var(--theme-success)',
    bgColor: 'color-mix(in srgb, var(--theme-success) 15%, transparent)',
    icon: CheckCircle2,
  },
  partial: {
    label: '部分成功',
    color: 'var(--theme-warning)',
    bgColor: 'color-mix(in srgb, var(--theme-warning) 15%, transparent)',
    icon: AlertTriangle,
  },
  failed: {
    label: '失败',
    color: 'var(--theme-destructive)',
    bgColor: 'color-mix(in srgb, var(--theme-destructive) 15%, transparent)',
    icon: XCircle,
  },
};

export default function ResultsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fullDataResult, setFullDataResult] = useState<ScrapingResult | null>(null);
  const [tableSearch, setTableSearch] = useState<string>('');

  // Unique project names for filter
  const projectNames = useMemo(
    () => ['all', ...Array.from(new Set(MOCK_RESULTS.map((r) => r.projectName)))],
    []
  );

  // Filtered results
  const filteredResults = useMemo(() => {
    return MOCK_RESULTS.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (projectFilter !== 'all' && r.projectName !== projectFilter) return false;
      if (dateFrom && r.timestamp < dateFrom) return false;
      if (dateTo && r.timestamp > dateTo) return false;
      return true;
    });
  }, [statusFilter, projectFilter, dateFrom, dateTo]);

  // Full data table rows filtered by search
  const filteredTableRows = useMemo(() => {
    if (!fullDataResult) return [];
    if (!tableSearch.trim()) return fullDataResult.rows;
    const lower = tableSearch.toLowerCase();
    return fullDataResult.rows.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(lower))
    );
  }, [fullDataResult, tableSearch]);

  const columnKeys = useMemo(() => {
    if (!fullDataResult || fullDataResult.rows.length === 0) return [];
    return Object.keys(fullDataResult.rows[0]);
  }, [fullDataResult]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleDelete = (id: string) => {
    // Simulated delete
    console.log('Delete result:', id);
  };

  const handleDownload = (result: ScrapingResult) => {
    // Simulated download
    const blob = new Blob([JSON.stringify(result.rows, null, 2)], {
      type: result.format === 'CSV' ? 'text/csv' : 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.projectName}_${result.timestamp}.${result.format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
    }),
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  return (
    <div
      className="min-h-screen p-4 md:p-6 lg:p-8"
      style={{ background: 'var(--theme-background)', color: 'var(--theme-foreground)' }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="p-2.5 rounded-xl"
            style={{
              background: 'var(--theme-gradient)',
              boxShadow: '0 0 20px var(--theme-glow)',
            }}
          >
            <Database className="size-5" style={{ color: 'var(--theme-primary-foreground, #fff)' }} />
          </div>
          <div>
            <h1
              className="text-2xl md:text-3xl font-bold"
              style={{
                background: 'var(--theme-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              采集结果
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--theme-muted-foreground)' }}>
              查看和管理所有数据采集结果
            </p>
          </div>
        </div>
        <div className="flex gap-4 mt-4 text-sm" style={{ color: 'var(--theme-muted-foreground)' }}>
          <span>
            共 <strong style={{ color: 'var(--theme-foreground)' }}>{filteredResults.length}</strong> 条结果
          </span>
          <span>
            成功{' '}
            <strong style={{ color: 'var(--theme-success)' }}>
              {filteredResults.filter((r) => r.status === 'success').length}
            </strong>
          </span>
          <span>
            失败{' '}
            <strong style={{ color: 'var(--theme-destructive)' }}>
              {filteredResults.filter((r) => r.status === 'failed').length}
            </strong>
          </span>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-end"
        style={{
          background: 'color-mix(in srgb, var(--theme-card) 80%, transparent)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--theme-border)',
        }}
      >
        <div className="flex items-center gap-2 text-sm font-medium mr-2" style={{ color: 'var(--theme-muted-foreground)' }}>
          <Filter className="size-4" />
          <span>筛选</span>
        </div>

        {/* Project Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs" style={{ color: 'var(--theme-muted-foreground)' }}>
            项目
          </label>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger
              className="w-[180px] md:w-[220px]"
              style={{
                background: 'color-mix(in srgb, var(--theme-muted) 40%, transparent)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-foreground)',
              }}
            >
              <SelectValue placeholder="全部项目" />
            </SelectTrigger>
            <SelectContent
              style={{
                background: 'var(--theme-card)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <SelectItem value="all">全部项目</SelectItem>
              {MOCK_RESULTS.map((r) => (
                <SelectItem key={r.projectName} value={r.projectName}>
                  {r.projectName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs" style={{ color: 'var(--theme-muted-foreground)' }}>
            状态
          </label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              className="w-[120px]"
              style={{
                background: 'color-mix(in srgb, var(--theme-muted) 40%, transparent)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-foreground)',
              }}
            >
              <SelectValue placeholder="全部状态" />
            </SelectTrigger>
            <SelectContent
              style={{
                background: 'var(--theme-card)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="success">成功</SelectItem>
              <SelectItem value="partial">部分</SelectItem>
              <SelectItem value="failed">失败</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="flex flex-col gap-1">
          <label className="text-xs" style={{ color: 'var(--theme-muted-foreground)' }}>
            起始日期
          </label>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5" style={{ color: 'var(--theme-muted-foreground)' }} />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[150px] pl-8"
              style={{
                background: 'color-mix(in srgb, var(--theme-muted) 40%, transparent)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-foreground)',
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs" style={{ color: 'var(--theme-muted-foreground)' }}>
            截止日期
          </label>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5" style={{ color: 'var(--theme-muted-foreground)' }} />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[150px] pl-8"
              style={{
                background: 'color-mix(in srgb, var(--theme-muted) 40%, transparent)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-foreground)',
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Results Cards */}
      <AnimatePresence mode="popLayout">
        {filteredResults.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
            style={{ color: 'var(--theme-muted-foreground)' }}
          >
            <Database className="size-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">暂无采集结果</p>
            <p className="text-sm mt-1">尝试调整筛选条件或开始新的采集任务</p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredResults.map((result, index) => {
              const sc = statusConfig[result.status];
              const StatusIcon = sc.icon;
              const isExpanded = expandedId === result.id;
              const previewRows = result.rows.slice(0, 3);

              return (
                <motion.div
                  key={result.id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="rounded-xl overflow-hidden transition-shadow duration-300"
                  style={{
                    background: 'color-mix(in srgb, var(--theme-card) 85%, transparent)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid var(--theme-border)',
                  }}
                  whileHover={{
                    boxShadow: `0 0 30px color-mix(in srgb, var(--theme-glow) 20%, transparent), 0 8px 32px rgba(0,0,0,0.2)`,
                    borderColor: 'color-mix(in srgb, var(--theme-primary) 40%, transparent)',
                  }}
                >
                  <div className="p-5">
                    {/* Card Top Row */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className="text-lg font-bold truncate"
                            style={{ color: 'var(--theme-card-foreground)' }}
                          >
                            {result.projectName}
                          </h3>
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
                            style={{ background: sc.bgColor, color: sc.color }}
                          >
                            <StatusIcon className="size-3" />
                            {sc.label}
                          </span>
                        </div>
                        <p
                          className="text-xs truncate"
                          style={{ color: 'var(--theme-muted-foreground)' }}
                        >
                          {result.url}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(result)}
                          style={{ color: 'var(--theme-foreground)' }}
                          className="hover:opacity-80"
                        >
                          <Download className="size-4" />
                          <span className="hidden sm:inline">下载</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFullDataResult(result)}
                          style={{ color: 'var(--theme-foreground)' }}
                          className="hover:opacity-80"
                        >
                          <Eye className="size-4" />
                          <span className="hidden sm:inline">查看全部</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(result.id)}
                          style={{ color: 'var(--theme-destructive)' }}
                          className="hover:opacity-80"
                        >
                          <Trash2 className="size-4" />
                          <span className="hidden sm:inline">删除</span>
                        </Button>
                      </div>
                    </div>

                    {/* Meta Row */}
                    <div
                      className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs"
                      style={{ color: 'var(--theme-muted-foreground)' }}
                    >
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {result.timestamp}
                      </span>
                      <span className="flex items-center gap-1">
                        {result.format === 'JSON' ? (
                          <FileJson className="size-3" />
                        ) : (
                          <FileSpreadsheet className="size-3" />
                        )}
                        {result.fileSize}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-primary)' }}
                      >
                        {result.format}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-foreground)' }}
                      >
                        {result.rows.length} 行
                      </Badge>
                    </div>

                    {/* Preview Toggle */}
                    <button
                      onClick={() => toggleExpand(result.id)}
                      className="mt-4 flex items-center gap-1 text-xs font-medium transition-colors"
                      style={{ color: 'var(--theme-primary)' }}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="size-3" />
                          收起预览
                        </>
                      ) : (
                        <>
                          <ChevronDown className="size-3" />
                          展开预览
                        </>
                      )}
                    </button>

                    {/* Preview Table */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div
                            className="mt-3 rounded-lg overflow-x-auto"
                            style={{
                              background: 'color-mix(in srgb, var(--theme-muted) 30%, transparent)',
                              border: '1px solid var(--theme-border)',
                            }}
                          >
                            <table className="w-full text-xs">
                              <thead>
                                <tr
                                  style={{
                                    borderBottom: '1px solid var(--theme-border)',
                                    background: 'color-mix(in srgb, var(--theme-muted) 50%, transparent)',
                                  }}
                                >
                                  {Object.keys(previewRows[0] || {}).map((key) => (
                                    <th
                                      key={key}
                                      className="px-3 py-2 text-left font-medium whitespace-nowrap"
                                      style={{ color: 'var(--theme-foreground)' }}
                                    >
                                      {key}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {previewRows.map((row, ri) => (
                                  <tr
                                    key={ri}
                                    style={{
                                      borderBottom:
                                        ri < previewRows.length - 1
                                          ? '1px solid var(--theme-border)'
                                          : 'none',
                                      background:
                                        ri % 2 === 0
                                          ? 'transparent'
                                          : 'color-mix(in srgb, var(--theme-muted) 15%, transparent)',
                                    }}
                                  >
                                    {Object.values(row).map((val, vi) => (
                                      <td
                                        key={vi}
                                        className="px-3 py-2 whitespace-nowrap max-w-[200px] truncate"
                                        style={{ color: 'var(--theme-card-foreground)' }}
                                      >
                                        {String(val)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {result.rows.length > 3 && (
                              <div
                                className="text-center py-2 text-xs"
                                style={{ color: 'var(--theme-muted-foreground)' }}
                              >
                                还有 {result.rows.length - 3} 行数据...
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Full Data Dialog */}
      <Dialog open={!!fullDataResult} onOpenChange={() => setFullDataResult(null)}>
        <DialogContent
          className="max-w-4xl w-[95vw] max-h-[85vh] flex flex-col"
          style={{
            background: 'var(--theme-card)',
            borderColor: 'var(--theme-border)',
            color: 'var(--theme-card-foreground)',
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-bold" style={{ color: 'var(--theme-foreground)' }}>
              {fullDataResult?.projectName} - 完整数据
            </DialogTitle>
            <DialogDescription style={{ color: 'var(--theme-muted-foreground)' }}>
              {fullDataResult?.url} | {fullDataResult?.timestamp}
            </DialogDescription>
          </DialogHeader>

          {/* Search within results */}
          <div className="relative">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4"
              style={{ color: 'var(--theme-muted-foreground)' }}
            />
            <Input
              placeholder="搜索数据..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="pl-8"
              style={{
                background: 'color-mix(in srgb, var(--theme-muted) 40%, transparent)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-foreground)',
              }}
            />
          </div>

          {/* Data Count */}
          <p className="text-xs" style={{ color: 'var(--theme-muted-foreground)' }}>
            显示 {filteredTableRows.length} / {fullDataResult?.rows.length || 0} 行
          </p>

          {/* Table */}
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--theme-border)' }}
            >
              <Table>
                <TableHeader>
                  <TableRow
                    style={{
                      background: 'color-mix(in srgb, var(--theme-muted) 50%, transparent)',
                    }}
                  >
                    <TableHead className="text-xs font-semibold" style={{ color: 'var(--theme-foreground)' }}>
                      #
                    </TableHead>
                    {columnKeys.map((key) => (
                      <TableHead
                        key={key}
                        className="text-xs font-semibold whitespace-nowrap"
                        style={{ color: 'var(--theme-foreground)' }}
                      >
                        {key}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTableRows.map((row, idx) => (
                    <TableRow
                      key={idx}
                      style={{
                        background:
                          idx % 2 === 0
                            ? 'transparent'
                            : 'color-mix(in srgb, var(--theme-muted) 15%, transparent)',
                      }}
                    >
                      <TableCell
                        className="text-xs"
                        style={{ color: 'var(--theme-muted-foreground)' }}
                      >
                        {idx + 1}
                      </TableCell>
                      {columnKeys.map((key) => (
                        <TableCell
                          key={key}
                          className="text-xs whitespace-nowrap max-w-[250px] truncate"
                          style={{ color: 'var(--theme-card-foreground)' }}
                          title={String(row[key])}
                        >
                          {String(row[key])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {filteredTableRows.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={columnKeys.length + 1}
                        className="text-center py-8"
                        style={{ color: 'var(--theme-muted-foreground)' }}
                      >
                        无匹配数据
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
