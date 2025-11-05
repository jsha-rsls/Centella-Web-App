import { useEffect, useState } from "react";
import { 
  getAnnouncements, 
  subscribeToAnnouncements, 
  unsubscribeFromAnnouncements 
} from "../../../services/announcementsService";

export const useAnnouncementsData = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let subscription = null;

    // Initial fetch
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const data = await getAnnouncements();
        setAnnouncements(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch announcements:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();

    // Set up real-time subscription
    subscription = subscribeToAnnouncements((payload) => {
      console.log("Real-time update:", payload);

      if (payload.eventType === "INSERT") {
        // Add new announcement
        const newAnnouncement = {
          id: payload.new.id,
          title: payload.new.title,
          date: payload.new.published_at,
          category: payload.new.category,
          description: payload.new.content,
          image: payload.new.image_url,
          views: payload.new.views,
          createdAt: payload.new.created_at
        };
        
        setAnnouncements(prev => [newAnnouncement, ...prev]);
      } else if (payload.eventType === "UPDATE") {
        // Update existing announcement
        const updatedAnnouncement = {
          id: payload.new.id,
          title: payload.new.title,
          date: payload.new.published_at,
          category: payload.new.category,
          description: payload.new.content,
          image: payload.new.image_url,
          views: payload.new.views,
          createdAt: payload.new.created_at
        };

        setAnnouncements(prev =>
          prev.map(ann => ann.id === payload.new.id ? updatedAnnouncement : ann)
        );
      } else if (payload.eventType === "DELETE") {
        // Remove deleted announcement
        setAnnouncements(prev =>
          prev.filter(ann => ann.id !== payload.old.id)
        );
      }
    });

    // Cleanup on unmount
    return () => {
      if (subscription) {
        unsubscribeFromAnnouncements(subscription);
      }
    };
  }, []);

  return { announcements, loading, error };
};