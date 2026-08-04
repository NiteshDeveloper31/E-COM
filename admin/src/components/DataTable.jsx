import React, { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

export const DataTable = ({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  filterKey,
  filterOptions = [],
  filterPlaceholder = "All Categories",
  actionsHeader = "Actions",
  renderActions,
  itemsPerPage = 5
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination on search or filter change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    setFilterValue(e.target.value);
    setCurrentPage(1);
  };

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = searchKey
        ? String(item[searchKey] || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        : true;

      const matchesFilter =
        filterKey && filterValue
          ? String(item[filterKey] || "") === filterValue
          : true;

      return matchesSearch && matchesFilter;
    });
  }, [data, searchQuery, filterValue, searchKey, filterKey]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  return (
    <div className="bg-white rounded-xl border border-primary/10 overflow-hidden shadow-xs">
      {/* Header controls (Search & Filter) */}
      <div className="p-5 border-b border-primary/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-background/50">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-light" size={18} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-primary/10 rounded-lg text-sm bg-white placeholder-charcoal-light focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          {filterKey && filterOptions.length > 0 && (
            <div className="relative">
              <select
                value={filterValue}
                onChange={handleFilterChange}
                className="appearance-none pl-4 pr-10 py-2 border border-primary/10 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all cursor-pointer"
              >
                <option value="">{filterPlaceholder}</option>
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-charcoal-light">
                <SlidersHorizontal size={14} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary/5 border-b border-primary/10">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3.5 text-xs font-display font-semibold uppercase tracking-wider text-primary ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
              {renderActions && (
                <th className="px-6 py-3.5 text-xs font-display font-semibold uppercase tracking-wider text-primary text-right">
                  {actionsHeader}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className="hover:bg-background/30 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-6 py-4 text-sm text-charcoal font-medium ${col.className || ""}`}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {renderActions && (
                    <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
                      {renderActions(row)}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (renderActions ? 1 : 0)}
                  className="px-6 py-12 text-center text-charcoal-light text-sm"
                >
                  No matching results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-primary/5 bg-background/20 flex items-center justify-between">
          <p className="text-xs text-charcoal-light">
            Showing{" "}
            <span className="font-semibold text-charcoal">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-charcoal">
              {Math.min(currentPage * itemsPerPage, filteredData.length)}
            </span>{" "}
            of <span className="font-semibold text-charcoal">{filteredData.length}</span> entries
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-primary/10 rounded-md bg-white text-charcoal-light hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-charcoal-light"
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNum = index + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center text-xs rounded-md border font-semibold transition-all ${
                    currentPage === pageNum
                      ? "bg-primary border-primary text-secondary"
                      : "border-primary/10 bg-white text-charcoal hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-primary/10 rounded-md bg-white text-charcoal-light hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-charcoal-light"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
