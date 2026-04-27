'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  List,
  Search,
  FileCode2,
  FileText,
  File,
  FolderOpen,
  ArrowUpDown,
  HardDrive,
} from 'lucide-react';
import { MOCK_FILES } from '@/lib/mock-data';
import { ProjectFile } from '@/lib/types';
import { Input } from '@/components/ui/input';
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
import { Button } from '@/components/ui/button';

// Language color mapping
const languageColors: Record<string, { color: string; bg: string; icon: typeof FileCode2 }> = {
  Java: { color: '#f89820', bg: 'color-mix(in srgb, #f89820 12%, transparent)', icon: FileCode2 },
  Python: { color: '#ffd43b', bg: 'color-mix(in srgb, #ffd43b 12%, transparent)', icon: FileCode2 },
  PHP: { color: '#8892bf', bg: 'color-mix(in srgb, #8892bf 12%, transparent)', icon: FileCode2 },
  CSS: { color: '#264de4', bg: 'color-mix(in srgb, #264de4 12%, transparent)', icon: FileCode2 },
  JavaScript: { color: '#f7df1e', bg: 'color-mix(in srgb, #f7df1e 12%, transparent)', icon: FileCode2 },
  TypeScript: { color: '#3178c6', bg: 'color-mix(in srgb, #3178c6 12%, transparent)', icon: FileCode2 },
  Go: { color: '#00add8', bg: 'color-mix(in srgb, #00add8 12%, transparent)', icon: FileCode2 },
  Rust: { color: '#ce422b', bg: 'color-mix(in srgb, #ce422b 12%, transparent)', icon: FileCode2 },
  Kotlin: { color: '#7f52ff', bg: 'color-mix(in srgb, #7f52ff 12%, transparent)', icon: FileCode2 },
  YAML: { color: '#cb171e', bg: 'color-mix(in srgb, #cb171e 12%, transparent)', icon: FileText },
  Markdown: { color: '#083fa1', bg: 'color-mix(in srgb, #083fa1 12%, transparent)', icon: FileText },
  Docker: { color: '#2496ed', bg: 'color-mix(in srgb, #2496ed 12%, transparent)', icon: File },
  Text: { color: '#6b7280', bg: 'color-mix(in srgb, #6b7280 12%, transparent)', icon: FileText },
  Properties: { color: '#6b7280', bg: 'color-mix(in srgb, #6b7280 12%, transparent)', icon: FileText },
  TOML: { color: '#9c4221', bg: 'color-mix(in srgb, #9c4221 12%, transparent)', icon: FileText },
};

// Filter language options
const languageOptions = [
  '全部',
  'Java',
  'Python',
  'PHP',
  'CSS',
  'JavaScript',
  'TypeScript',
  'Go',
  'Rust',
  'Kotlin',
  'Other',
];

// Parse file size to KB number for sorting
function parseSizeToKB(size: string): number {
  const match = size.match(/([\d.]+)\s*(KB|MB|GB|B)/i);
  if (!match) return 0;
  const val = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  if (unit === 'KB') return val;
  if (unit === 'MB') return val * 1024;
  if (unit === 'GB') return val * 1024 * 1024;
  return val / 1024;
}

// Check if language matches the filter
function matchLanguageFilter(language: string, filter: string): boolean {
  if (filter === '全部') return true;
  if (filter === 'Other') {
    return !['Java', 'Python', 'PHP', 'CSS', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'Kotlin'].includes(language);
  }
  return language === filter;
}

type SortKey = 'name' | 'language' | 'size' | 'modifiedAt';
type SortDir = 'asc' | 'desc';

export default function FilesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('全部');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);

  // Filtered and sorted files
  const filteredFiles = useMemo(() => {
    let files = MOCK_FILES.filter((f) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!f.name.toLowerCase().includes(q) && !f.language.toLowerCase().includes(q)) {
          return false;
        }
      }
      // Language filter
      if (!matchLanguageFilter(f.language, languageFilter)) return false;
      return true;
    });

    // Sort
    files = [...files].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'language':
          cmp = a.language.localeCompare(b.language);
          break;
        case 'size':
          cmp = parseSizeToKB(a.size) - parseSizeToKB(b.size);
          break;
        case 'modifiedAt':
          cmp = a.modifiedAt.localeCompare(b.modifiedAt);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return files;
  }, [searchQuery, languageFilter, sortKey, sortDir]);

  // Stats
  const totalSize = useMemo(() => {
    return MOCK_FILES.reduce((acc, f) => acc + parseSizeToKB(f.size), 0);
  }, []);

  const totalSizeLabel =
    totalSize >= 1024 ? `${(totalSize / 1024).toFixed(1)} MB` : `${totalSize.toFixed(1)} KB`;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const getLanguageStyle = (language: string) => {
    return languageColors[language] || languageColors['Text'];
  };

  const gridVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.04, duration: 0.3, ease: 'easeOut' },
    }),
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
            <FolderOpen className="size-5" style={{ color: 'var(--theme-primary-foreground, #fff)' }} />
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
              项目文件管理
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--theme-muted-foreground)' }}>
              管理和浏览项目所有源代码与配置文件
            </p>
          </div>
        </div>
        {/* Stats */}
        <div className="flex gap-6 mt-4 text-sm" style={{ color: 'var(--theme-muted-foreground)' }}>
          <span className="flex items-center gap-1.5">
            <FileCode2 className="size-4" />
            <strong style={{ color: 'var(--theme-foreground)' }}>{MOCK_FILES.length}</strong> 个文件
          </span>
          <span className="flex items-center gap-1.5">
            <HardDrive className="size-4" />
            总大小 <strong style={{ color: 'var(--theme-foreground)' }}>{totalSizeLabel}</strong>
          </span>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center"
        style={{
          background: 'color-mix(in srgb, var(--theme-card) 80%, transparent)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--theme-border)',
        }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4"
            style={{ color: 'var(--theme-muted-foreground)' }}
          />
          <Input
            placeholder="搜索文件名或语言..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
            style={{
              background: 'color-mix(in srgb, var(--theme-muted) 40%, transparent)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-foreground)',
            }}
          />
        </div>

        {/* Language Filter */}
        <Select value={languageFilter} onValueChange={setLanguageFilter}>
          <SelectTrigger
            className="w-[140px]"
            style={{
              background: 'color-mix(in srgb, var(--theme-muted) 40%, transparent)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-foreground)',
            }}
          >
            <SelectValue placeholder="语言" />
          </SelectTrigger>
          <SelectContent
            style={{
              background: 'var(--theme-card)',
              borderColor: 'var(--theme-border)',
            }}
          >
            {languageOptions.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View Mode Toggle */}
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--theme-border)' }}
        >
          <button
            onClick={() => setViewMode('grid')}
            className="p-2 transition-colors"
            style={{
              background:
                viewMode === 'grid'
                  ? 'color-mix(in srgb, var(--theme-primary) 20%, transparent)'
                  : 'transparent',
              color: viewMode === 'grid' ? 'var(--theme-primary)' : 'var(--theme-muted-foreground)',
            }}
            aria-label="Grid view"
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="p-2 transition-colors"
            style={{
              background:
                viewMode === 'list'
                  ? 'color-mix(in srgb, var(--theme-primary) 20%, transparent)'
                  : 'transparent',
              color: viewMode === 'list' ? 'var(--theme-primary)' : 'var(--theme-muted-foreground)',
            }}
            aria-label="List view"
          >
            <List className="size-4" />
          </button>
        </div>
      </motion.div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <AnimatePresence mode="popLayout">
          {filteredFiles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
              style={{ color: 'var(--theme-muted-foreground)' }}
            >
              <FileCode2 className="size-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">未找到文件</p>
              <p className="text-sm mt-1">尝试调整搜索或筛选条件</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFiles.map((file, index) => {
                const langStyle = getLanguageStyle(file.language);
                const LangIcon = langStyle.icon;
                return (
                  <motion.div
                    key={file.id}
                    custom={index}
                    variants={gridVariants}
                    initial="hidden"
                    animate="visible"
                    layout
                    whileHover={{
                      y: -4,
                      boxShadow: `0 0 24px color-mix(in srgb, ${langStyle.color} 25%, transparent), 0 8px 32px rgba(0,0,0,0.15)`,
                      borderColor: `color-mix(in srgb, ${langStyle.color} 50%, var(--theme-border))`,
                    }}
                    onClick={() => setSelectedFile(file)}
                    className="rounded-xl p-4 cursor-pointer transition-all duration-200"
                    style={{
                      background: 'color-mix(in srgb, var(--theme-card) 85%, transparent)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid var(--theme-border)',
                    }}
                  >
                    {/* File Icon */}
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                      style={{ background: langStyle.bg }}
                    >
                      <LangIcon className="size-6" style={{ color: langStyle.color }} />
                    </div>

                    {/* File Name */}
                    <h3
                      className="text-sm font-bold truncate mb-1"
                      style={{ color: 'var(--theme-card-foreground)' }}
                      title={file.name}
                    >
                      {file.name}
                    </h3>

                    {/* Language Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{
                          background: langStyle.bg,
                          color: langStyle.color,
                        }}
                      >
                        {file.language}
                      </span>
                    </div>

                    {/* Meta Info */}
                    <div
                      className="flex justify-between text-xs"
                      style={{ color: 'var(--theme-muted-foreground)' }}
                    >
                      <span>{file.size}</span>
                      <span className="truncate ml-2" title={file.modifiedAt}>
                        {file.modifiedAt.split(' ')[0]}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <AnimatePresence mode="wait">
          {filteredFiles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
              style={{ color: 'var(--theme-muted-foreground)' }}
            >
              <FileCode2 className="size-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">未找到文件</p>
              <p className="text-sm mt-1">尝试调整搜索或筛选条件</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl overflow-hidden"
              style={{
                background: 'color-mix(in srgb, var(--theme-card) 85%, transparent)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--theme-border)',
              }}
            >
              <ScrollArea>
                <Table>
                  <TableHeader>
                    <TableRow
                      style={{
                        background: 'color-mix(in srgb, var(--theme-muted) 50%, transparent)',
                      }}
                    >
                      <TableHead
                        className="cursor-pointer select-none"
                        style={{ color: 'var(--theme-foreground)' }}
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-1">
                          名称
                          <ArrowUpDown className="size-3 opacity-50" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer select-none"
                        style={{ color: 'var(--theme-foreground)' }}
                        onClick={() => handleSort('language')}
                      >
                        <div className="flex items-center gap-1">
                          语言
                          <ArrowUpDown className="size-3 opacity-50" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer select-none"
                        style={{ color: 'var(--theme-foreground)' }}
                        onClick={() => handleSort('size')}
                      >
                        <div className="flex items-center gap-1">
                          大小
                          <ArrowUpDown className="size-3 opacity-50" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer select-none hidden sm:table-cell"
                        style={{ color: 'var(--theme-foreground)' }}
                        onClick={() => handleSort('modifiedAt')}
                      >
                        <div className="flex items-center gap-1">
                          修改日期
                          <ArrowUpDown className="size-3 opacity-50" />
                        </div>
                      </TableHead>
                      <TableHead style={{ color: 'var(--theme-foreground)' }}>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFiles.map((file) => {
                      const langStyle = getLanguageStyle(file.language);
                      return (
                        <TableRow
                          key={file.id}
                          style={{
                            background:
                              'color-mix(in srgb, var(--theme-card-foreground) 3%, transparent)',
                          }}
                          className="cursor-pointer"
                          onClick={() => setSelectedFile(file)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: langStyle.bg }}
                              >
                                <FileCode2 className="size-4" style={{ color: langStyle.color }} />
                              </div>
                              <span
                                className="text-sm font-medium truncate max-w-[200px]"
                                style={{ color: 'var(--theme-card-foreground)' }}
                              >
                                {file.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className="text-xs px-1.5 py-0.5 rounded"
                              style={{
                                background: langStyle.bg,
                                color: langStyle.color,
                              }}
                            >
                              {file.language}
                            </span>
                          </TableCell>
                          <TableCell
                            className="text-xs"
                            style={{ color: 'var(--theme-muted-foreground)' }}
                          >
                            {file.size}
                          </TableCell>
                          <TableCell
                            className="text-xs hidden sm:table-cell"
                            style={{ color: 'var(--theme-muted-foreground)' }}
                          >
                            {file.modifiedAt}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFile(file);
                              }}
                              style={{ color: 'var(--theme-primary)' }}
                            >
                              查看
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* File Detail Dialog */}
      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent
          className="max-w-3xl w-[95vw] max-h-[85vh] flex flex-col"
          style={{
            background: 'var(--theme-card)',
            borderColor: 'var(--theme-border)',
            color: 'var(--theme-card-foreground)',
          }}
        >
          <DialogHeader>
            <div className="flex items-center gap-3">
              {selectedFile && (
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: getLanguageStyle(selectedFile.language).bg }}
                >
                  <FileCode2
                    className="size-5"
                    style={{ color: getLanguageStyle(selectedFile.language).color }}
                  />
                </div>
              )}
              <div className="min-w-0">
                <DialogTitle
                  className="text-lg font-bold truncate"
                  style={{ color: 'var(--theme-foreground)' }}
                >
                  {selectedFile?.name}
                </DialogTitle>
                <DialogDescription style={{ color: 'var(--theme-muted-foreground)' }}>
                  {selectedFile?.language}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedFile && (
            <>
              {/* File Info */}
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg"
                style={{
                  background: 'color-mix(in srgb, var(--theme-muted) 30%, transparent)',
                  border: '1px solid var(--theme-border)',
                }}
              >
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--theme-muted-foreground)' }}>
                    文件名
                  </p>
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--theme-foreground)' }}>
                    {selectedFile.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--theme-muted-foreground)' }}>
                    语言
                  </p>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded font-medium"
                    style={{
                      background: getLanguageStyle(selectedFile.language).bg,
                      color: getLanguageStyle(selectedFile.language).color,
                    }}
                  >
                    {selectedFile.language}
                  </span>
                </div>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--theme-muted-foreground)' }}>
                    大小
                  </p>
                  <p className="text-sm font-medium" style={{ color: 'var(--theme-foreground)' }}>
                    {selectedFile.size}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--theme-muted-foreground)' }}>
                    修改日期
                  </p>
                  <p className="text-sm font-medium" style={{ color: 'var(--theme-foreground)' }}>
                    {selectedFile.modifiedAt}
                  </p>
                </div>
              </div>

              {/* Code Preview */}
              <div className="flex-1 min-h-0">
                <p
                  className="text-xs font-medium mb-2 flex items-center gap-1.5"
                  style={{ color: 'var(--theme-muted-foreground)' }}
                >
                  <FileCode2 className="size-3.5" />
                  代码预览
                </p>
                <ScrollArea className="h-[400px] rounded-lg">
                  <pre
                    className="text-xs leading-relaxed p-4 rounded-lg overflow-x-auto"
                    style={{
                      background: getLanguageStyle(selectedFile.language).bg,
                      color: 'var(--theme-card-foreground)',
                      border: '1px solid var(--theme-border)',
                      fontFamily: 'var(--font-mono), "Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
                      tabSize: 4,
                    }}
                  >
                    <code>{selectedFile.content}</code>
                  </pre>
                </ScrollArea>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
