"use client"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    // Show fewer pages on mobile
    const maxVisible = window.innerWidth < 640 ? 3 : 5
    return Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter((p) => {
        if (totalPages <= maxVisible) return true
        if (p === 1 || p === totalPages) return true
        return Math.abs(p - currentPage) <= (maxVisible <= 3 ? 0 : 1)
      })
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="mt-6 sm:mt-8 flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
      <button
        className="px-2 sm:px-3 py-2 rounded border border-border hover:bg-muted text-xs sm:text-sm disabled:opacity-50 min-w-[60px] sm:min-w-[80px]"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        Anterior
      </button>

      <div className="flex items-center gap-1 sm:gap-2">
        {visiblePages.map((p, idx, arr) => {
          const prev = arr[idx - 1]
          const showDots = prev && p - prev > 1
          
          return (
            <span key={p} className="flex items-center">
              {showDots && <span className="px-1 sm:px-2 text-muted-foreground text-xs sm:text-sm">…</span>}
              <button
                onClick={() => onPageChange(p)}
                className={`px-2 sm:px-3 py-2 rounded border text-xs sm:text-sm min-w-[32px] sm:min-w-[40px] ${
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
      </div>

      <button
        className="px-2 sm:px-3 py-2 rounded border border-border hover:bg-muted text-xs sm:text-sm disabled:opacity-50 min-w-[60px] sm:min-w-[80px]"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        Siguiente
      </button>
    </div>
  )
}
