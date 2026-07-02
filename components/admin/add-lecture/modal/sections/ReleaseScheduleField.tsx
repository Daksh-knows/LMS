"use client";

import React from "react";
import { CalendarClock } from "lucide-react";

interface Props {
  /** ISO string, datetime-local string, or "" */
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

/**
 * Converts any date-ish value into the `YYYY-MM-DDTHH:mm` shape that a
 * <input type="datetime-local"> expects. Returns "" for empty/invalid input.
 */
export function toDateTimeLocal(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ReleaseScheduleField({ value, onChange, label = "Release date (optional)" }: Props) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
        {label}
      </label>
      <div className="relative group">
        <input
          type="datetime-local"
          value={toDateTimeLocal(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none text-gray-700"
        />
        <CalendarClock
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500"
          size={18}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400 hover:text-red-500"
          >
            Clear
          </button>
        )}
      </div>
      <p className="text-[11px] text-gray-400 ml-1">
        Leave empty to make this content available immediately.
      </p>
    </div>
  );
}
