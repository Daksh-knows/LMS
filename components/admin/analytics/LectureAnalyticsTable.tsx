"use client";

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlayCircle, FileText, HelpCircle, FileCheck } from "lucide-react";

export type LectureAnalytics = {
  id: string;
  title: string;
  type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT' | 'LIVE';
  moduleTitle: string;
  completionRate: number; // percentage 0-100
  avgWatchTimeMinutes?: number;
  totalViews: number;
};

interface LectureAnalyticsTableProps {
  data: LectureAnalytics[];
}

export function LectureAnalyticsTable({ data }: LectureAnalyticsTableProps) {
  const getIconForType = (type: string) => {
    switch (type) {
      case 'VIDEO': return <PlayCircle className="w-4 h-4 text-blue-500" />;
      case 'TEXT': return <FileText className="w-4 h-4 text-emerald-500" />;
      case 'QUIZ': return <HelpCircle className="w-4 h-4 text-purple-500" />;
      case 'ASSIGNMENT': return <FileCheck className="w-4 h-4 text-orange-500" />;
      default: return <PlayCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <Card className="col-span-4 lg:col-span-3 bg-white dark:bg-zinc-900 border-yellow-600/20 shadow-sm overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl text-slate-800 dark:text-slate-100">Lecture Performance</CardTitle>
        <CardDescription>
          Identify drop-off points and measure engagement across course content
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-zinc-800/50">
              <TableRow className="border-b border-amber-100 dark:border-zinc-800">
                <TableHead className="w-[300px]">Lecture</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Avg Watch Time</TableHead>
                <TableHead className="text-right">Completion Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((lecture) => (
                <TableRow key={lecture.id} className="border-b border-slate-100 dark:border-zinc-800 hover:bg-amber-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-800 dark:text-slate-200 line-clamp-1">{lecture.title}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{lecture.moduleTitle}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getIconForType(lecture.type)}
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {lecture.type.charAt(0) + lecture.type.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">{lecture.totalViews}</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">
                    {lecture.avgWatchTimeMinutes !== undefined 
                      ? `${lecture.avgWatchTimeMinutes} min` 
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 w-9">
                        {lecture.completionRate.toFixed(0)}%
                      </span>
                      <Progress 
                        value={lecture.completionRate} 
                        className="h-2 w-24 bg-slate-100 dark:bg-zinc-800" 
                        indicatorClassName={
                          lecture.completionRate > 75 ? "bg-emerald-500" :
                          lecture.completionRate > 40 ? "bg-amber-500" : 
                          "bg-red-500"
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-slate-500">
                    No lecture data available yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
