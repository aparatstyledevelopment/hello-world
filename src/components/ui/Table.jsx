import { cn } from "../../lib/utils";

export function Table({
  columns,
  data,
  onRowClick,
  renderCell,
  rowClassName,
  className,
  compact = false,
  emphasisRows = false,
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border border-gray-200 bg-white",
        className
      )}
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400",
                  compact ? "py-2.5" : "py-3.5",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                  col.headerClassName ?? col.className
                )}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, idx) => {
            const isEmphasis = emphasisRows && row._emphasis;

            return (
              <tr
                key={row.id ?? idx}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "transition-colors hover:bg-gray-50",
                  onRowClick && "cursor-pointer",
                  isEmphasis && "bg-red-50/30",
                  row._muted && "opacity-60",
                  compact ? "" : "h-16",
                  rowClassName ? rowClassName(row) : undefined
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 text-sm",
                      compact ? "py-2.5" : "py-4",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.primary
                        ? "font-semibold text-black"
                        : "text-gray-600",
                      col.className
                    )}
                  >
                    {renderCell ? (
                      renderCell(row, col)
                    ) : col.primary && row[col.subtitleKey] ? (
                      <div>
                        <div className="font-semibold text-black">
                          {row[col.key]}
                        </div>
                        <div className="mt-0.5 text-xs font-normal text-gray-400">
                          {row[col.subtitleKey]}
                        </div>
                      </div>
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-sm text-gray-400"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
