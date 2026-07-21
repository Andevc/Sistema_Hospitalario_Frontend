export default function SidePanel({ open, title, subtitle, onClose, children, wide }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div
        className={`relative bg-surface h-full ${wide ? 'w-full max-w-2xl' : 'w-full max-w-md'} shadow-panel flex flex-col`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-6 py-4">
          <div>
            <h2 className="font-display text-xl text-ink">{title}</h2>
            {subtitle && <p className="text-sm text-inksoft mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-inksoft hover:text-ink text-xl leading-none px-1"
            aria-label="Cerrar panel"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
