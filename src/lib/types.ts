export type Profile = {
  id: string;
  username: string;
  created_at: string;
  updated_at: string;
};

export type JournalEntry = {
  id: string;
  user_id: string;
  content: string | null;
  audio_url: string | null;
  transcription: string | null;
  mood: string | null;
  created_at: string;
  updated_at: string;
  tags?: EntryTag[];
};

export type EntryTag = {
  id: string;
  entry_id: string;
  tag: string;
  created_at: string;
};
