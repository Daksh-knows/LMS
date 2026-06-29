import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
}

export function KPICard({ title, value, description, icon: Icon, trend }: KPICardProps) {
  return (
    <Card className="bg-white dark:bg-zinc-900 border-yellow-600/20 shadow-sm transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {title}
        </CardTitle>
        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
          <Icon className="w-4 h-4 text-amber-600 dark:text-amber-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">
          {value}
        </div>
        {(description || trend) && (
          <div className="mt-1 flex items-center text-xs text-slate-500 dark:text-slate-400">
            {trend && (
              <span className={`mr-2 font-medium ${trend.value >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {trend.value >= 0 ? '+' : ''}{trend.value}%
              </span>
            )}
            {description}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
