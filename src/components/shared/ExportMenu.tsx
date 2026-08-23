"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";

interface ExportMenuProps {
  onExportExcel: () => void;
  onExportPDF: () => void;
  label?: string;
}

export default function ExportMenu({ onExportExcel, onExportPDF, label = "Exporter" }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition cursor-pointer"
      >
        <Download className="w-4 h-4 text-indigo-400" />
        <span>{label}</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-1.5 w-44 rounded-xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
          <button
            type="button"
            onClick={() => {
              onExportExcel();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Excel (.xlsx)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onExportPDF();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-rose-400" />
            <span>PDF</span>
          </button>
        </div>
      )}
    </div>
  );
}
