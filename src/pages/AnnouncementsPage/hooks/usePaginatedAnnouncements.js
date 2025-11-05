import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAnnouncements } from '../../../services/announcementsService';

/**
 * Custom hook for paginated announcements with client-side filtering
 * Fetches all announcements once and filters them locally for instant updates
 * 
 * @param {number} pageSize - Number of items per page (default: 12)
 * @returns {Object} Announcements data, pagination controls, and filter functions
 */
export const usePaginatedAnnouncements = (pageSize = 12) => {
  // Store ALL announcements fetched once on mount
  const [allAnnouncements, setAllAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter states
  const [filters, setFilters] = useState({
    category: 'All',
    search: '',
    startDate: null,
    endDate: null,
    year: null,
    isThisWeek: false  // Flag to track if "This Week" is active
  });

  // Fetch ALL announcements ONCE on component mount
  useEffect(() => {
    const loadAllAnnouncements = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all announcements from the database
        const data = await getAnnouncements();

        setAllAnnouncements(data || []);
      } catch (err) {
        setError(err.message || 'An unexpected error occurred');
        setAllAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    loadAllAnnouncements();
  }, []); // Empty dependency array - only runs once on mount

  // CLIENT-SIDE filtering - Instant updates without loading state
  const filteredAnnouncements = useMemo(() => {
    return allAnnouncements.filter((announcement) => {
      // Search filter - matches title or description
      const matchesSearch =
        filters.search === '' ||
        announcement.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        announcement.description.toLowerCase().includes(filters.search.toLowerCase());

      // Category filter
      const matchesCategory =
        filters.category === 'All' || announcement.category === filters.category;

      const announcementDate = new Date(announcement.date);
      
      // Date range filter (used for "This Week" or specific month selection)
      if (filters.startDate && filters.endDate) {
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        const matchesDateRange = announcementDate >= startDate && announcementDate <= endDate;
        return matchesSearch && matchesCategory && matchesDateRange;
      }

      // Year filter (when no date range is active)
      const matchesYear =
        !filters.year || announcementDate.getFullYear() === filters.year;

      return matchesSearch && matchesCategory && matchesYear;
    });
  }, [allAnnouncements, filters]);

  // Sort announcements by date (newest first)
  const sortedAnnouncements = useMemo(() => {
    return [...filteredAnnouncements].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
  }, [filteredAnnouncements]);

  // Calculate pagination values
  const totalCount = sortedAnnouncements.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Get announcements for the current page
  const paginatedAnnouncements = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedAnnouncements.slice(startIndex, endIndex);
  }, [sortedAnnouncements, currentPage, pageSize]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Navigate to a specific page
  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Smooth scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPages]);

  // Navigate to next page
  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  // Navigate to previous page
  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  // Update filters (merges with existing filters)
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    announcements: paginatedAnnouncements,  // Current page announcements
    loading,                                 // Loading state (only true on initial fetch)
    error,                                   // Error message if fetch fails
    currentPage,                             // Current page number
    totalPages,                              // Total number of pages
    totalCount,                              // Total number of filtered announcements
    pageSize,                                // Items per page
    goToPage,                                // Function to go to specific page
    nextPage,                                // Function to go to next page
    prevPage,                                // Function to go to previous page
    updateFilters,                           // Function to update filters
    filters                                  // Current filter values
  };
};