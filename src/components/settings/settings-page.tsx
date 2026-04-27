'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Settings as SettingsIcon,
  Monitor,
  Gauge,
  Shield,
  Globe,
  Bell,
  HardDrive,
  Save,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { SYSTEM_SETTINGS } from '@/lib/mock-data';
import type { SystemSetting } from '@/lib/types';

interface SettingsSection {
  id: SystemSetting['category'];
  title: string;
  description: string;
  icon: React.ElementType;
}

const SECTIONS: SettingsSection[] = [
  { id: 'general', title: '常规设置', description: '系统基础配置项', icon: Monitor },
  { id: 'performance', title: '性能设置', description: '调整系统性能参数', icon: Gauge },
  { id: 'security', title: '安全设置', description: '安全与访问控制', icon: Shield },
  { id: 'proxy', title: '代理设置', description: '代理服务器配置', icon: Globe },
  { id: 'notification', title: '通知设置', description: '消息通知与推送', icon: Bell },
  { id: 'storage', title: '存储设置', description: '数据存储与导出', icon: HardDrive },
];

function SettingItem({ setting, value, onChange }: {
  setting: SystemSetting;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
}) {
  const id = `setting-${setting.id}`;

  if (setting.type === 'boolean') {
    return (
      <div className="flex items-center justify-between py-3">
        <div className="space-y-0.5 pr-4">
          <Label htmlFor={id} className="text-sm font-medium" style={{ color: 'var(--theme-foreground)' }}>
            {setting.label}
          </Label>
          <p className="text-xs" style={{ color: 'var(--theme-muted-foreground)' }}>
            {setting.description}
          </p>
        </div>
        <Switch
          id={id}
          checked={value as boolean}
          onCheckedChange={(checked) => onChange(checked)}
          className="data-[state=checked]:bg-[var(--theme-primary)]"
        />
      </div>
    );
  }

  if (setting.type === 'select' && setting.options && setting.options.length > 0) {
    return (
      <div className="flex flex-col gap-2 py-3">
        <div className="space-y-0.5">
          <Label htmlFor={id} className="text-sm font-medium" style={{ color: 'var(--theme-foreground)' }}>
            {setting.label}
          </Label>
          <p className="text-xs" style={{ color: 'var(--theme-muted-foreground)' }}>
            {setting.description}
          </p>
        </div>
        <Select value={String(value)} onValueChange={(v) => onChange(v)}>
          <SelectTrigger
            id={id}
            className="w-full sm:w-64"
            style={{
              backgroundColor: 'var(--theme-muted)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-foreground)',
            }}
          >
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}>
            {setting.options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                style={{ color: 'var(--theme-foreground)' }}
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (setting.type === 'number') {
    return (
      <div className="flex flex-col gap-2 py-3">
        <div className="space-y-0.5">
          <Label htmlFor={id} className="text-sm font-medium" style={{ color: 'var(--theme-foreground)' }}>
            {setting.label}
          </Label>
          <p className="text-xs" style={{ color: 'var(--theme-muted-foreground)' }}>
            {setting.description}
          </p>
        </div>
        <Input
          id={id}
          type="number"
          value={String(value)}
          onChange={(e) => {
            const num = Number(e.target.value);
            onChange(isNaN(num) ? 0 : num);
          }}
          className="w-full sm:w-64"
          style={{
            backgroundColor: 'var(--theme-muted)',
            borderColor: 'var(--theme-border)',
            color: 'var(--theme-foreground)',
          }}
        />
      </div>
    );
  }

  // text or password
  return (
    <div className="flex flex-col gap-2 py-3">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium" style={{ color: 'var(--theme-foreground)' }}>
          {setting.label}
        </Label>
        <p className="text-xs" style={{ color: 'var(--theme-muted-foreground)' }}>
          {setting.description}
        </p>
      </div>
      <Input
        id={id}
        type={setting.type === 'password' ? 'password' : 'text'}
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        className="w-full sm:w-64"
        style={{
          backgroundColor: 'var(--theme-muted)',
          borderColor: 'var(--theme-border)',
          color: 'var(--theme-foreground)',
        }}
      />
    </div>
  );
}

function SettingsSectionCard({
  section,
  settings,
  values,
  onChange,
  onSave,
}: {
  section: SettingsSection;
  settings: SystemSetting[];
  values: Record<string, string | number | boolean>;
  onChange: (key: string, value: string | number | boolean) => void;
  onSave: (category: string) => void;
}) {
  const Icon = section.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
    >
      <Card
        className="overflow-hidden"
        style={{
          backgroundColor: 'var(--theme-card)',
          borderColor: 'var(--theme-border)',
          color: 'var(--theme-card-foreground)',
        }}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{
                background: 'var(--theme-primary)',
                color: 'var(--theme-primary-foreground)',
                opacity: 0.9,
              }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base" style={{ color: 'var(--theme-foreground)' }}>
                {section.title}
              </CardTitle>
              <CardDescription style={{ color: 'var(--theme-muted-foreground)' }}>
                {section.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-0">
          {settings.map((setting, idx) => (
            <div key={setting.id}>
              {idx > 0 && <Separator className="mb-1" style={{ borderColor: 'var(--theme-border)' }} />}
              <SettingItem
                setting={setting}
                value={values[setting.key] ?? setting.value}
                onChange={(v) => onChange(setting.key, v)}
              />
            </div>
          ))}
          <div className="flex justify-end pt-4">
            <Button
              size="sm"
              onClick={() => onSave(section.id)}
              className="gap-2 transition-all duration-200 hover:shadow-lg"
              style={{
                background: 'var(--theme-primary)',
                color: 'var(--theme-primary-foreground)',
              }}
            >
              <Save className="h-3.5 w-3.5" />
              保存设置
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string | number | boolean>>(() => {
    const initial: Record<string, string | number | boolean> = {};
    SYSTEM_SETTINGS.forEach((s) => {
      initial[s.key] = s.value;
    });
    return initial;
  });

  const handleChange = (key: string, value: string | number | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSection = (category: string) => {
    const sectionLabel = SECTIONS.find((s) => s.id === category)?.title ?? category;
    toast.success(`${sectionLabel}保存成功`, {
      description: '设置已更新并立即生效',
    });
  };

  const handleSaveAll = () => {
    toast.success('所有设置已保存', {
      description: '全部配置项已更新并立即生效',
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{
              background: 'var(--theme-gradient)',
              color: 'var(--theme-primary-foreground)',
            }}
          >
            <SettingsIcon className="h-5 w-5" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--theme-foreground)' }}
            >
              系统设置
            </h1>
            <p className="text-sm" style={{ color: 'var(--theme-muted-foreground)' }}>
              管理和配置系统参数
            </p>
          </div>
        </div>
        <Button
          onClick={handleSaveAll}
          className="mt-3 gap-2 sm:mt-0 transition-all duration-200 hover:shadow-lg"
          style={{
            background: 'var(--theme-primary)',
            color: 'var(--theme-primary-foreground)',
          }}
        >
          <Save className="h-4 w-4" />
          保存全部
        </Button>
      </motion.div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {SECTIONS.map((section) => {
          const sectionSettings = SYSTEM_SETTINGS.filter((s) => s.category === section.id);
          return (
            <SettingsSectionCard
              key={section.id}
              section={section}
              settings={sectionSettings}
              values={values}
              onChange={handleChange}
              onSave={handleSaveSection}
            />
          );
        })}
      </div>
    </div>
  );
}
