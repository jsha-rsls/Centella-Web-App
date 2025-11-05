import supabase from '../utils/supabase';

/**
 * Fetch paginated announcements from the database
 * @param {Object} params - Pagination and filter parameters
 * @returns {Promise<Object>} Object containing data, total count, and pagination info
 */
export const getAnnouncementsPaginated = async ({
  page = 1,
  pageSize = 12,
  filters = {}
}) => {
  try {
    // Calculate offset
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Base query with count
    let query = supabase
      .from('announcements')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    // Apply category filter
    if (filters.category && filters.category !== 'All') {
      query = query.eq('category', filters.category);
    }

    // Apply search filter (searches in title and content)
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }

    // Apply date range filters
    if (filters.startDate) {
      query = query.gte('published_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('published_at', filters.endDate);
    }

    // Apply pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    // Transform data to match the format used in your components
    const announcements = data.map(announcement => ({
      id: announcement.id,
      title: announcement.title,
      date: announcement.published_at,
      category: announcement.category,
      description: announcement.content,
      image: announcement.image_url,
      views: announcement.views,
      createdAt: announcement.created_at
    }));

    return {
      data: announcements,
      totalCount: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  } catch (error) {
    console.error('Error fetching paginated announcements:', error);
    throw error;
  }
};

/**
 * Fetch all published announcements from the database (backward compatibility)
 * @param {Object} filters - Optional filters for category, search, date range
 * @returns {Promise<Array>} Array of announcements
 */
export const getAnnouncements = async (filters = {}) => {
  try {
    let query = supabase
      .from('announcements')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    // Apply category filter
    if (filters.category && filters.category !== 'All') {
      query = query.eq('category', filters.category);
    }

    // Apply search filter (searches in title and content)
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }

    // Apply date range filters
    if (filters.startDate) {
      query = query.gte('published_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('published_at', filters.endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform data to match the format used in your components
    return data.map(announcement => ({
      id: announcement.id,
      title: announcement.title,
      date: announcement.published_at,
      category: announcement.category,
      description: announcement.content,
      image: announcement.image_url,
      views: announcement.views,
      createdAt: announcement.created_at
    }));
  } catch (error) {
    console.error('Error fetching announcements:', error);
    throw error;
  }
};

/**
 * Fetch a single announcement by ID
 * @param {number} id - Announcement ID
 * @returns {Promise<Object>} Announcement object
 */
export const getAnnouncementById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (error) throw error;

    // Transform data to match component format
    return {
      id: data.id,
      title: data.title,
      date: data.published_at,
      category: data.category,
      description: data.content,
      image: data.image_url,
      views: data.views,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Error fetching announcement:', error);
    throw error;
  }
};

/**
 * Increment view count for an announcement
 * @param {number} id - Announcement ID
 * @returns {Promise<void>}
 */
export const incrementAnnouncementViews = async (id) => {
  try {
    const { error } = await supabase.rpc('increment_announcement_views', {
      announcement_id: id
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error incrementing views:', error);
    // Don't throw error for view increment failures
  }
};

/**
 * Subscribe to real-time announcements updates
 * @param {Function} callback - Callback function to handle updates
 * @returns {Object} Subscription object
 */
export const subscribeToAnnouncements = (callback) => {
  const subscription = supabase
    .channel('announcements_channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'announcements',
        filter: 'status=eq.published'
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
};

/**
 * Unsubscribe from real-time updates
 * @param {Object} subscription - Subscription object to remove
 */
export const unsubscribeFromAnnouncements = async (subscription) => {
  if (subscription) {
    await supabase.removeChannel(subscription);
  }
};

/**
 * Get unique categories from announcements
 * @returns {Promise<Array>} Array of category strings
 */
export const getAnnouncementCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('category')
      .eq('status', 'published');

    if (error) throw error;

    // Get unique categories
    const categories = [...new Set(data.map(item => item.category))];
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Get announcements count by status
 * @returns {Promise<Object>} Object with counts by status
 */
export const getAnnouncementsCount = async () => {
  try {
    const { count: publishedCount, error: publishedError } = await supabase
      .from('announcements')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    if (publishedError) throw publishedError;

    const { count: totalCount, error: totalError } = await supabase
      .from('announcements')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    return {
      published: publishedCount || 0,
      total: totalCount || 0
    };
  } catch (error) {
    console.error('Error fetching announcements count:', error);
    throw error;
  }
};