"use client";

import React from "react";
import { ListChecks } from "lucide-react";

export interface AvailableLecture {
  id: string;
  title: string;
  sectionTitle?: string;
}

interface Props {
  /** All lectures in the course the admin can pick as prerequisites. */
  available: AvailableLecture[];
  /** Currently selected prerequisite lecture IDs. */
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  /** The lecture being edited, excluded so it can't require itself. */
  currentLectureId?: string;
}

export default function PrerequisitesField({ available, selectedIds, onChange, currentLectureId }: Props) {
  const options = available.filter((l) => l.id !== currentLectureId);

  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  };

  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
        <ListChecks size={14} /> Prerequisites (optional)
      </label>

      {options.length === 0 ? (
        <p className="text-[11px] text-gray-400 ml-1 py-2">
          No other lectures available yet to set as prerequisites.
        </p>
      ) : (
        <div className="max-h-40 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 divide-y divide-gray-100">
          {options.map((l) => {
            const checked = selectedIds.includes(l.id);
            return (
              <label
                key={l.id}
                className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-white transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(l.id)}
                  className="h-4 w-4 rounded accent-blue-600"
                />
                <span className="text-sm text-gray-700 truncate">
                  {l.sectionTitle ? <span className="text-gray-400">{l.sectionTitle} · </span> : null}
                  {l.title}
                </span>
              </label>
            );
          })}
        </div>
      )}
      <p className="text-[11px] text-gray-400 ml-1">
        Students must complete the selected lectures (or spend a skip credit) before this unlocks.
      </p>
    </div>
  );
}
