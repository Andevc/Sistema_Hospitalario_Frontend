export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <h1 className="font-display text-2xl text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-inksoft mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
