import type { ReactNode } from "react";

export type Column<Row> = {
  key: keyof Row;
  label: string;
  render?: (row: Row) => ReactNode;
};

export function DataTable<Row extends Record<string, string | number>>({
  columns,
  rows,
}: {
  columns: Column<Row>[];
  rows: Row[];
}) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                className="border-b border-slate-200 px-3 py-3.5 text-left text-xs font-extrabold uppercase tracking-normal text-slate-500"
                key={String(column.key)}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td
                  className="border-b border-slate-200 px-3 py-3.5 align-middle text-sm text-slate-700 last:border-b-0"
                  key={String(column.key)}
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
