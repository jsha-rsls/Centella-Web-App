import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { memo, useMemo } from "react"
import styles from "../styles/Pagination.module.css"

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalCount,
  pageSize 
}) => {
  // Calculate showing range
  const showingRange = useMemo(() => {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalCount);
    return { start, end };
  }, [currentPage, pageSize, totalCount]);

  // Generate page numbers to display
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);
      
      if (currentPage <= 3) {
        endPage = Math.min(5, totalPages);
      } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(1, totalPages - 4);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className={styles.paginationWrapper}>
      <div className={styles.paginationInfo}>
        <span>
          Showing {showingRange.start}-{showingRange.end} of {totalCount} announcements
        </span>
      </div>
      
      <div className={styles.pagination}>
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={styles.paginationButton}
          aria-label="First page"
        >
          <ChevronsLeft size={18} />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={styles.paginationButton}
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Page Numbers */}
        <div className={styles.pageNumbers}>
          {pageNumbers[0] > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className={styles.pageNumber}
              >
                1
              </button>
              {pageNumbers[0] > 2 && <span className={styles.ellipsis}>...</span>}
            </>
          )}
          
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`${styles.pageNumber} ${currentPage === page ? styles.active : ''}`}
            >
              {page}
            </button>
          ))}
          
          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className={styles.ellipsis}>...</span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className={styles.pageNumber}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={styles.paginationButton}
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={styles.paginationButton}
          aria-label="Last page"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default memo(Pagination);