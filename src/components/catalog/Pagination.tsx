"use client"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter((p) => {
        if (totalPages <= 5) return true
        if (p === 1 || p === totalPages) return true
        return Math.abs(p - currentPage) <= 1
      })
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        className="px-3 py-2 rounded border border-border hover:bg-muted text-sm disabled:opacity-50"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        Anterior
      </button>

      {visiblePages.map((p, idx, arr) => {
        const prev = arr[idx - 1]
        const showDots = prev && p - prev > 1
        
        return (
          <span key={p} className="flex">
            {showDots && <span className="px-2 text-muted-foreground">…</span>}
            <button
              onClick={() => onPageChange(p)}
              className={`px-3 py-2 rounded border text-sm ${
                currentPage === p
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              {p}
            </button>
          </span>
        )
      })}

      <button
        className="px-3 py-2 rounded border border-border hover:bg-muted text-sm disabled:opacity-50"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        Siguiente
      </button>
    </div>
  )
}
