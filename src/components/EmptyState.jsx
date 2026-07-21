export default function EmptyState({ label = 'Sin registros todavía.', hint }) {
  return (
    <div className="siih-card flex flex-col items-center justify-center gap-1 py-14 text-center">
      <p className="font-display text-lg text-ink">{label}</p>
      {hint && <p className="text-sm text-inksoft max-w-sm">{hint}</p>}
    </div>
  )
}
