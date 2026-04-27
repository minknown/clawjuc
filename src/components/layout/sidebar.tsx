'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bug,
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Database,
  FileCode2,
  Settings,
  Palette,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppStore } from '@/store/index';
import { useThemeStore } from '@/store/theme';
import { applyThemeToDocument } from '@/store/theme';
import type { PageType, ThemeName } from '@/lib/types';

interface NavItem {
  id: PageType;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
  { id: 'projects', label: '采集项目', icon: FolderKanban },
  { id: 'tasks', label: '采集任务', icon: ListTodo },
  { id: 'results', label: '采集结果', icon: Database },
  { id: 'files', label: '文件管理', icon: FileCode2 },
  { id: 'settings', label: '系统设置', icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed: collapsedProp }: SidebarProps) {
  const { currentPage, setCurrentPage, sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const { currentTheme, availableThemes, setTheme } = useThemeStore();
  const [themeOpen, setThemeOpen] = useState(false);

  const isCollapsed = collapsedProp ?? sidebarCollapsed;

  const handleNavClick = (pageId: PageType) => {
    setCurrentPage(pageId);
  };

  const handleThemeChange = (themeName: ThemeName) => {
    setTheme(themeName);
    const config = availableThemes.find((t) => t.name === themeName);
    if (config) {
      applyThemeToDocument(config);
    }
  };

  const currentThemeConfig = availableThemes.find((t) => t.name === currentTheme);

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="relative flex h-full flex-col overflow-hidden"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--theme-background) 85%, transparent)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRight: '1px solid var(--theme-border)',
        }}
      >
        {/* Logo Area */}
        <div className="flex h-16 items-center gap-3 px-4">
          <motion.div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{
              background: 'var(--theme-gradient)',
              color: 'var(--theme-primary-foreground)',
              boxShadow: 'var(--theme-glow)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bug className="h-5 w-5" />
          </motion.div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h2
                  className="text-base font-bold tracking-tight"
                  style={{ color: 'var(--theme-foreground)' }}
                >
                  DataCrawler
                </h2>
                <p
                  className="text-[10px] leading-tight"
                  style={{ color: 'var(--theme-muted-foreground)' }}
                >
                  数据采集系统
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator style={{ borderColor: 'var(--theme-border)' }} />

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.id;
            const Icon = item.icon;

            const navButton = (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200"
                style={{
                  backgroundColor: isActive
                    ? 'color-mix(in srgb, var(--theme-primary) 15%, transparent)'
                    : 'transparent',
                  color: isActive
                    ? 'var(--theme-primary)'
                    : 'var(--theme-muted-foreground)',
                  borderLeft: isActive
                    ? '3px solid var(--theme-primary)'
                    : '3px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor =
                      'color-mix(in srgb, var(--theme-muted) 60%, transparent)';
                    e.currentTarget.style.color = 'var(--theme-foreground)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--theme-muted-foreground)';
                  }
                }}
              >
                <Icon
                  className="h-5 w-5 shrink-0 transition-colors duration-200"
                  style={{ color: isActive ? 'var(--theme-primary)' : undefined }}
                />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{navButton}</TooltipTrigger>
                  <TooltipContent
                    side="right"
                    style={{
                      backgroundColor: 'var(--theme-card)',
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-foreground)',
                    }}
                  >
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return navButton;
          })}
        </nav>

        <Separator style={{ borderColor: 'var(--theme-border)' }} />

        {/* Bottom Section */}
        <div className="flex flex-col gap-2 p-3">
          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!isCollapsed)}
            className="w-full justify-center gap-2 text-xs transition-colors duration-200"
            style={{ color: 'var(--theme-muted-foreground)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--theme-foreground)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--theme-muted-foreground)';
            }}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>收起菜单</span>
              </>
            )}
          </Button>

          {/* Theme Switcher */}
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center"
                  style={{ color: 'var(--theme-muted-foreground)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--theme-foreground)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--theme-muted-foreground)';
                  }}
                >
                  <Palette className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                style={{
                  backgroundColor: 'var(--theme-card)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-foreground)',
                }}
              >
                主题切换
              </TooltipContent>
            </Tooltip>
          ) : (
            <Popover open={themeOpen} onOpenChange={setThemeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs transition-colors duration-200"
                  style={{ color: 'var(--theme-muted-foreground)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--theme-foreground)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--theme-muted-foreground)';
                  }}
                >
                  <div
                    className="h-3.5 w-3.5 rounded-full"
                    style={{
                      background: currentThemeConfig?.colors.primary ?? 'var(--theme-primary)',
                      boxShadow: `0 0 6px ${currentThemeConfig?.colors.primary ?? 'var(--theme-primary)'}`,
                    }}
                  />
                  <span className="truncate">{currentThemeConfig?.label ?? '赛博暗黑'}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="start"
                className="w-52 p-2"
                style={{
                  backgroundColor: 'var(--theme-card)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                <p
                  className="mb-2 px-2 text-xs font-semibold"
                  style={{ color: 'var(--theme-foreground)' }}
                >
                  选择主题
                </p>
                <div className="space-y-0.5">
                  {availableThemes.map((theme) => {
                    const isActiveTheme = theme.name === currentTheme;
                    return (
                      <button
                        key={theme.name}
                        onClick={() => {
                          handleThemeChange(theme.name);
                          setThemeOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors duration-150"
                        style={{
                          backgroundColor: isActiveTheme
                            ? 'color-mix(in srgb, var(--theme-primary) 10%, transparent)'
                            : 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActiveTheme) {
                            e.currentTarget.style.backgroundColor =
                              'color-mix(in srgb, var(--theme-muted) 60%, transparent)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActiveTheme) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <div
                          className="h-5 w-5 shrink-0 rounded-full border-2"
                          style={{
                            borderColor: theme.colors.primary,
                            background: isActiveTheme
                              ? theme.colors.primary
                              : 'transparent',
                            boxShadow: isActiveTheme
                              ? `0 0 8px ${theme.colors.primary}`
                              : 'none',
                          }}
                        />
                        <div className="overflow-hidden">
                          <p
                            className="text-sm font-medium"
                            style={{ color: 'var(--theme-foreground)' }}
                          >
                            {theme.label}
                          </p>
                          <p
                            className="text-[10px] truncate"
                            style={{ color: 'var(--theme-muted-foreground)' }}
                          >
                            {theme.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
