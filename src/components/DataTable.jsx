import EmptyState from './EmptyState'

/**
 * Tabla genérica. `columns`: [{ key, header, render? }]
 * `rows`: array de objetos. `rowKey`: función para la key de React.
 */
export default function DataTable({ columns, rows, rowKey, emptyLabel, onRowClick }) {
  if (!rows || rows.length === 0) {
    return <EmptyState label={emptyLabel || 'Sin registros todavía.'} />
  }
  return (
    <div className="siih-card overflow-x-auto">
      <table className="siih-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className={onRowClick ? 'cursor-pointer' : ''}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key] ?? '—'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
