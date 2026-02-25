"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  labelPrefix?: string;
  width?: string;
}

export default function Dropdown({ 
  options, 
  selectedValue, 
  onSelect, 
  labelPrefix,
  width = "w-48" 
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside - essential for reusability
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLabel = options.find(opt => opt.value === selectedValue)?.label;

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      {/* Optional Label Prefix */}
      {labelPrefix && (
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-(--text-color) opacity-50 mr-3 select-none">
          {labelPrefix}
        </span>
      )}

      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-transparent hover:border-(--rev-input-border) hover:bg-(--rev-overall-bg) transition-all duration-200"
        >
          <span className="text-sm font-bold text-(--text-color) whitespace-nowrap">
            {currentLabel}
          </span>
          <ChevronDown 
            size={14} 
            className={`text-(--text-color) opacity-50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`absolute right-0 mt-2 ${width} bg-(--rev-form-bg) border border-(--rev-overall-border) rounded-xl shadow-xl z-50 overflow-hidden theme-transition`}
            >
              <div className="p-1.5 space-y-1">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onSelect(option.value);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${selectedValue === option.value 
                        ? 'bg-(--rev-input-bg) text-(--text-color)' 
                        : 'text-(--text-color) opacity-70 hover:bg-(--rev-overall-bg) hover:opacity-100'
                      }
                    `}
                  >
                    {option.label}
                    {selectedValue === option.value && (
                      <Check size={14} className="text-(--colored-text)" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}