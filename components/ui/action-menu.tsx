"use client";

import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Edit, Trash2, Eye, Copy, RefreshCw } from "lucide-react";

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface ActionMenuProps {
  onEdit?: () => void;
  onViewDetails?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  customItems?: ActionMenuItem[];
}

export function ActionMenu({
  onEdit,
  onViewDetails,
  onDuplicate,
  onDelete,
  customItems = [],
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer focus:outline-none"
        title="Actions"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          {onViewDetails && (
            <button
              onClick={() => {
                setOpen(false);
                onViewDetails();
              }}
              className="w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-gray-500" /> View Details
            </button>
          )}

          {onEdit && (
            <button
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-2 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 text-blue-600" /> Edit Record
            </button>
          )}

          {onDuplicate && (
            <button
              onClick={() => {
                setOpen(false);
                onDuplicate();
              }}
              className="w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-2 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-emerald-600" /> Duplicate
            </button>
          )}

          {customItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              className={`w-full px-3 py-2 text-xs font-medium flex items-center gap-2 cursor-pointer ${
                item.variant === "danger"
                  ? "text-rose-600 hover:bg-rose-50"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {item.icon || <RefreshCw className="w-3.5 h-3.5" />} {item.label}
            </button>
          ))}

          {onDelete && (
            <div className="pt-1 mt-1 border-t border-gray-100">
              <button
                onClick={() => {
                  setOpen(false);
                  onDelete();
                }}
                className="w-full px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Delete Record
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
