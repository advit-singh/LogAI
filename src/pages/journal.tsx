// Improved comments and code structure for better readability
    import { useState, useEffect, useCallback, useRef } from 'react';
    import { useAuth } from '@/hooks/useAuth';
    import { JournalEditor } from '@/components/journal/JournalEditor';
    import { api } from '@/lib/api';
    import { Button } from '@/components/ui/button';
    import { useJournal } from '@/hooks/useJournal';
    import { Loader2, Play, Pause, Trash2 } from 'lucide-react';
    import { toast } from 'sonner';
    import { Slider } from '@/components/ui/slider';
    import AudioPlayer from 'react-h5-audio-player';
    import 'react-h5-audio-player/lib/styles.css';
    import { JournalEntry } from '@/components/journal/JournalEntry';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
    import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
    import { Sidebar, SidebarTrigger } from '@/components/ui/sidebar';
    import { useState as useGlobalState, type GlobalState } from '@/lib/global-state';
    import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
    import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
    import { useSearchParams } from 'next/navigation';
    import { cn } from '@/lib/utils';
    
    // Main Journal Page Component
    export default function JournalPage() {
      // State variables for user authentication, journal entries, and UI controls
      const { user, loading: authLoading } = useAuth();
      const { entries, loading: journalLoading, fetchEntries, createEntry, updateEntry, deleteEntry } = useJournal();
      const [currentEntry, setCurrentEntry] = useState('');
      const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
      const [isSaving, setIsSaving] = useState(false);
      const [playingAudio, setPlayingAudio] = useState<string | null>(null);
      const audioRef = useRef<HTMLAudioElement | null>(null);
      const [filter, setFilter] = useState('');
      const [activeTab, setActiveTab] = useState('entries');
      const [sidebarOpen, setSidebarOpen] = useGlobalState('sidebarOpen', false);
      const searchParams = useSearchParams();
      const initialEntryId = searchParams.get('entryId');
    
      // Fetch journal entries on mount if user is authenticated
      useEffect(() => {
        if (user) {
          fetchEntries();
        }
      }, [user, fetchEntries]);
    
      // Automatically select entry if entryId is provided in URL parameters
      useEffect(() => {
        if (initialEntryId) {
          const entry = entries.find(entry => entry.id === initialEntryId);
          if (entry) {
            handleEntrySelect(entry.id);
          }
        }
      }, [initialEntryId, entries, handleEntrySelect]);
    
      // useCallback hooks for optimized event handlers
      const handleSave = useCallback(async (content: string) => {
        setIsSaving(true);
        try {
          if (selectedEntryId) {
            await updateEntry(selectedEntryId, { content });
            toast.success('Journal entry updated');
          } else {
            await createEntry({ content });
            toast.success('Journal entry created');
          }
        } catch (error) {
          toast.error('Failed to save journal entry');
        } finally {
          setIsSaving(false);
        }
      }, [updateEntry, createEntry, toast, selectedEntryId]);
    
      const handleNewEntry = useCallback(() => {
        setSelectedEntryId(null);
        setCurrentEntry('');
        setPlayingAudio(null);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }, []);
    
      const handleEntrySelect = useCallback((id: string) => {
        const entry = entries.find(e => e.id === id);
        if (entry) {
          setSelectedEntryId(id);
          setCurrentEntry(entry.content || '');
          setPlayingAudio(entry.audio_url);
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
        }
      }, [entries]);
    
      const handlePlayAudio = useCallback((url: string) => {
        if (audioRef.current) {
          if (playingAudio === url) {
            audioRef.current.paused ? audioRef.current.play() : audioRef.current.pause();
          } else {
            setPlayingAudio(url);
            audioRef.current.src = url;
            audioRef.current.play();
          }
        }
      }, [playingAudio]);
    
      const handleAudioError = useCallback(() => {
        toast.error('Failed to load audio');
        setPlayingAudio(null);
      }, [toast]);
    
      const handleDeleteEntry = useCallback(async (id: string) => {
        try {
          await deleteEntry(id);
          if (selectedEntryId === id) {
            handleNewEntry();
          }
          toast.success('Journal entry deleted');
        } catch (error) {
          toast.error('Failed to delete journal entry');
        }
      }, [deleteEntry, toast, handleNewEntry, selectedEntryId]);
    
      // Handle loading states
      if (authLoading || journalLoading) {
        return (
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>
        );
      }
    
      // Filter entries based on the filter state
      const filteredEntries = entries.filter(entry => entry.content?.toLowerCase().includes(filter.toLowerCase()));
    
      // Render the Journal Page
      return (
        <TooltipProvider>
          <div className="flex h-screen">
            {/* Sidebar */}
            <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} className="w-64 bg-muted">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Sidebar</h2>
                <ScrollArea className="h-[calc(100vh_-_100px)]">
                  <ul className="space-y-2">
                    <li>
                      <a href="/journal" className="text-foreground hover:underline">Journal</a>
                    </li>
                    <li>
                      <a href="/insights" className="text-foreground hover:underline">Insights</a>
                    </li>
                    <li>
                      <a href="/settings" className="text-foreground hover:underline">Settings</a>
                    </li>
                  </ul>
                </ScrollArea>
              </div>
            </Sidebar>
            {/* Main Content Area */}
            <div className="flex-1 bg-background">
              <div className="container mx-auto px-4 py-8">
                {/* Header with Filter and New Entry Button */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">Journal</h2>
                    <DropdownMenu>
                      <DropdownMenuTrigger>Filter</DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setFilter('')}>Clear Filter</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilter('happy')}>Happy</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilter('sad')}>Sad</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilter('neutral')}>Neutral</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={handleNewEntry}>New Entry</Button>
                    <SidebarTrigger>
                      <Button variant="ghost" size="icon">
                        <span className="sr-only">Open Sidebar</span>
                      </Button>
                    </SidebarTrigger>
                  </div>
                </div>
                {/* Resizable Panels for Entries and Insights */}
                <ResizablePanelGroup direction="vertical" className="h-full">
                  <ResizablePanel minSize={200} className="flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList>
                        <TabsTrigger value="entries">Entries</TabsTrigger>
                        <TabsTrigger value="insights">Insights</TabsTrigger>
                      </TabsList>
                      <TabsContent value="entries">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-1">
                            <h3 className="text-lg font-semibold mb-2">Entries</h3>
                            <ScrollArea className="h-[calc(100vh_-_250px)]">
                              <div className="space-y-2">
                                {filteredEntries.map((entry) => (
                                  <Tooltip key={entry.id} openDelay={200} closeDelay={200} trigger="hover">
                                    <TooltipTrigger asChild>
                                      <JournalEntry entry={entry} onSelect={handleEntrySelect} />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs text-muted-foreground">
                                        {entry.content}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                          <div className="md:col-span-2">
                            <JournalEditor initialContent={currentEntry} onSave={handleSave} />
                            {selectedEntryId && playingAudio && (
                              <div className="mt-4">
                                <AudioPlayer
                                  src={playingAudio}
                                  controls
                                  onPlayError={handleAudioError}
                                  className="bg-background"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="insights">
                        <InsightsPage />
                      </TabsContent>
                    </Tabs>
                  </ResizablePanel>
                  <ResizablePanel minSize={200} className="flex flex-col">
                    <div className="p-4">
                      <h2 className="text-xl font-bold mb-4">Insights</h2>
                      <InsightsPage />
                    </div>
                  </ResizablePanel>
                  <ResizableHandle />
                </ResizablePanelGroup>
              </div>
            </div>
          </div>
        </TooltipProvider>
      );
    }
