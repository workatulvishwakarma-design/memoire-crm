"use client";

import React from "react";
import { Search, Filter, ArrowUpDown, LayoutGrid, List } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter?: string;
  onStatusChange?: (status: string) => void;
  statusOptions?: { label: string; value: string }[];
  categoryFilter?: string;
  onCategoryChange?: (category: string) => void;
  categoryOptions?: { label: string; value: string }[];
  sortBy?: string;
  onSortChange?: (sort: string) => void;
  sortOptions?: { label: string; value: string }[];
  viewMode?: "grid" | "table";
  onViewModeChange?: (mode: "grid" | "table") => void;
  totalCount?: number;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  statusOptions,
  categoryFilter,
  onCategoryChange,
  categoryOptions,
  sortBy,
  onSortChange,
  sortOptions,
  viewMode,
  onViewModeChange,
  totalCount,
}: FilterBarProps) {
  return (
    <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[220px]">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by name, title, client or tag..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F26722] focus:bg-white transition-all"
        />
      </div>

      {/* Select Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {statusOptions && onStatusChange && (
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="bg-transparent focus:outline-none text-gray-700 font-semibold cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {categoryOptions && onCategoryChange && (
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs">
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="bg-transparent focus:outline-none text-gray-700 font-semibold cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {sortOptions && onSortChange && (
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent focus:outline-none text-gray-700 font-semibold cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Grid / Table View Mode Switcher */}
        {viewMode && onViewModeChange && (
          <div className="flex items-center bg-gray-100 p-1 rounded-xl gap-1 border border-gray-200">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === "grid" ? "bg-white text-gray-900 shadow-2xs font-bold" : "text-gray-500 hover:text-gray-900"
              }`}
              title="Grid Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange("table")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === "table" ? "bg-white text-gray-900 shadow-2xs font-bold" : "text-gray-500 hover:text-gray-900"
              }`}
              title="Data Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {typeof totalCount === "number" && (
          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1.5 rounded-xl">
            {totalCount} Total
          </span>
        )}
      </div>
    </div>
  );
}
