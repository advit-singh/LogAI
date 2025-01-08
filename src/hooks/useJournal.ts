import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { JournalEntry } from '@/lib/types';
import { toast } from 'sonner';

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getEntries();
      setEntries(data);
    } catch (error) {
      toast.error('Failed to fetch journal entries');
    } finally {
      setLoading(false);
    }
  }, []);

  const createEntry = useCallback(async (entry: Partial<JournalEntry>) => {
    try {
      const newEntry = await api.createEntry(entry);
      if (newEntry) {
        setEntries(prev => [newEntry, ...prev]);
        return newEntry;
      }
    } catch (error) {
      toast.error('Failed to create journal entry');
    }
    return null;
  }, []);

  const updateEntry = useCallback(async (id: string, updates: Partial<JournalEntry>) => {
    try {
      const updated = await api.updateEntry(id, updates);
      if (updated) {
        setEntries(prev => 
          prev.map(entry => entry.id === id ? updated : entry)
        );
        return updated;
      }
    } catch (error) {
      toast.error('Failed to update journal entry');
    }
    return null;
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      const success = await api.deleteEntry(id);
      if (success) {
        setEntries(prev => prev.filter(entry => entry.id !== id));
        return true;
      }
    } catch (error) {
      toast.error('Failed to delete journal entry');
    }
    return false;
  }, []);

  return {
    entries,
    loading,
    fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry
  };
}
