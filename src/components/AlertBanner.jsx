const TONOS = {
  error: 'bg-triaje-rojoSoft text-triaje-rojo border-triaje-rojo/20',
  ok: 'bg-triaje-verdeSoft text-triaje-verde border-triaje-verde/20',
  info: 'bg-brand-soft text-brand-deep border-brand/20',
}

export default function AlertBanner({ tone = 'info', children, onClose }) {
  if (!children) return null
  return (
    <div className={`rounded-md2 border px-4 py-2.5 text-sm flex items-start justify-between gap-3 ${TONOS[tone]}`}>
      <span>{children}</span>
      {onClose && (
        <button onClick={onClose} className="text-current opacity-60 hover:opacity-100" aria-label="Cerrar">
          ×
        </button>
      )}
    </div>
  )
}
