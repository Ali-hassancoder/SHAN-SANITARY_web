const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.pages <= 1) return null;

  const { page, pages } = pagination;
  const pageNumbers = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="px-3 py-1.5 rounded-lg border border-carbon/15 disabled:opacity-40 hover:bg-carbon/5"
      >
        Prev
      </button>
      {pageNumbers.map((p, idx) => (
        <span key={p} className="flex items-center">
          {idx > 0 && pageNumbers[idx - 1] !== p - 1 && <span className="px-1 text-carbon/30">...</span>}
          <button
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-lg text-sm ${
              p === page ? "bg-wine text-white" : "hover:bg-carbon/5"
            }`}
          >
            {p}
          </button>
        </span>
      ))}
      <button
        disabled={page === pages}
        onClick={() => onPageChange(page + 1)}
        className="px-3 py-1.5 rounded-lg border border-carbon/15 disabled:opacity-40 hover:bg-carbon/5"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;