import { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  align?: 'left' | 'right';
}

export default function DataTable<T extends { id: string }>({
  rows, columns, searchPlaceholder = 'Search…', searchKeys, onRowClick, pageSize = 14,
}: {
  rows: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKeys?: (row: T) => string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
}) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!query || !searchKeys) return rows;
    const q = query.toLowerCase();
    return rows.filter(r => searchKeys(r).toLowerCase().includes(q));
  }, [rows, query, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find(c => c.key === sortKey);
    if (!col?.sortValue) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice(page * pageSize, (page + 1) * pageSize);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  return (
    <div className="rounded-lg border border-line bg-surface">
      {searchKeys && (
        <div className="flex items-center gap-2 border-b border-line px-3.5 py-2.5">
          <Search size={15} className="text-ink-muted" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0); }}
            placeholder={searchPlaceholder}
            className="focus-ring w-full rounded bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
          />
          <span className="whitespace-nowrap font-mono text-xs text-ink-muted">{sorted.length} records</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line font-mono text-[11px] uppercase tracking-wide text-ink-muted">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`whitespace-nowrap px-3.5 py-2.5 font-medium ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.sortValue ? 'cursor-pointer select-none hover:text-ink' : ''}`}
                  onClick={() => col.sortValue && toggleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {sortKey === col.key && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map(row => (
              <tr key={row.id} onClick={() => onRowClick?.(row)} className={`border-b border-line last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-surface-raised' : ''}`}>
                {columns.map(col => (
                  <td key={col.key} className={`whitespace-nowrap px-3.5 py-2.5 ${col.align === 'right' ? 'text-right' : ''}`}>{col.render(row)}</td>
                ))}
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr><td colSpan={columns.length} className="px-3.5 py-10 text-center text-sm text-ink-muted">No records match this view.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-line px-3.5 py-2.5 font-mono text-xs text-ink-muted">
          <span>PAGE {page + 1} / {totalPages}</span>
          <div className="flex gap-1.5">
            <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} className="focus-ring rounded border border-line px-2 py-1 disabled:opacity-40">Prev</button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} className="focus-ring rounded border border-line px-2 py-1 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
