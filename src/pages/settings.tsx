import { useState, useEffect } from 'react';
    import { useAuth } from '@/hooks/useAuth';
    import { Button } from '@/components/ui/button';
    import {
      Form,
      FormControl,
      FormField,
      FormItem,
      FormLabel,
      FormMessage,
    } from '@/components/ui/form';
    import { Input } from '@/components/ui/input';
    import { Switch } from '@/components/ui/switch';
    import { useForm } from 'react-hook-form';
    import { toast } from 'sonner';
    import { Loader2 } from 'lucide-react';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import {
      Accordion,
      AccordionContent,
      AccordionItem,
      AccordionTrigger,
    } from '@/components/ui/accordion';
    import { api } from '@/lib/api';
    import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuList } from '@/components/ui/navigation-menu';
    import { useGlobalState } from '@/lib/global-state';
    
    export default function SettingsPage() {
      const { user, loading: authLoading, signOut } = useAuth();
      const [isSaving, setIsSaving] = useState(false);
      const [transcriptionLanguage, setTranscriptionLanguage] = useGlobalState('transcriptionLanguage', 'en');
      const [saveRecordings, setSaveRecordings] = useState(true);
      const [feedback, setFeedback] = useState('');
      const [showFeedback, setShowFeedback] = useState(false);
      const [audioQuality, setAudioQuality] = useGlobalState('audioQuality', 'standard');
      const [hotkeys, setHotkeys] = useGlobalState('hotkeys', { start: 'Ctrl+Shift+R', stop: 'Ctrl+Shift+S' });
      const [showAudioManagement, setShowAudioManagement] = useState(false);
      const [audioFiles, setAudioFiles] = useState<string[]>([]);
    
      useEffect(() => {
        const storedSaveRecordings = localStorage.getItem('saveRecordings');
        if (storedSaveRecordings) {
          setSaveRecordings(storedSaveRecordings === 'true');
        }
      }, []);
    
      const form = useForm({
        defaultValues: {
          transcriptionLanguage: transcriptionLanguage,
          saveRecordings: saveRecordings,
          audioQuality: audioQuality,
          hotkeys: hotkeys,
        },
      });
    
      const handleSaveSettings = async (data: any) => {
        setIsSaving(true);
        try {
          localStorage.setItem('saveRecordings', data.saveRecordings);
          setTranscriptionLanguage(data.transcriptionLanguage);
          setAudioQuality(data.audioQuality);
          setHotkeys(data.hotkeys);
          toast.success('Settings saved successfully');
        } catch (error) {
          toast.error('Failed to save settings');
        } finally {
          setIsSaving(false);
        }
      };
    
      const handleFeedbackSubmit = async () => {
        // Simulate sending feedback
        // In a real application, this would involve sending the feedback to a server
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.success('Feedback submitted successfully');
        setFeedback('');
        setShowFeedback(false);
      };
    
      const handleHotkeyChange = (key: string, value: string) => {
        setHotkeys((prev) => ({ ...prev, [key]: value }));
      };
    
      const handleAudioFileManagement = async () => {
        // Simulate audio file management
        // In a real application, this would involve displaying a list of audio files
        // and allowing users to delete or download them.
        setShowAudioManagement(true);
        // Simulate fetching audio files
        await new Promise((resolve) => setTimeout(resolve, 500));
        const files = ['recording1.webm', 'recording2.webm', 'recording3.webm'];
        setAudioFiles(files);
      };
    
      const handleDownloadAudio = (file: string) => {
        // Simulate downloading audio file
        // In a real application, this would involve downloading the audio file from Supabase
        toast.info(\`Downloading \${file}\`);
      };
    
      const handleDeleteAudio = (file: string) => {
        // Simulate deleting audio file
        // In a real application, this would involve deleting the audio file from Supabase
        setAudioFiles((prev) => prev.filter((f) => f !== file));
        toast.success(\`Deleted \${file}\`);
      };
    
      if (authLoading) {
        return (
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>
        );
      }
    
      return (
        <div className="container mx-auto px-4 py-8">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  <a href="/journal" className="text-foreground hover:underline">Journal</a>
                </NavigationMenuTrigger>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  <a href="/insights" className="text-foreground hover:underline">Insights</a>
                </NavigationMenuTrigger>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  <a href="/settings" className="text-foreground hover:underline">Settings</a>
                </NavigationMenuTrigger>
              </NavigationMenuItem>
            </NavigationMenuList>
            <NavigationMenuContent>
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
            </NavigationMenuContent>
          </NavigationMenu>
          <h2 className="text-2xl font-bold mb-4">Settings</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveSettings)} className="space-y-4">
              <Accordion type="single" collapsible>
                <AccordionItem value="general">
                  <AccordionTrigger>General Settings</AccordionTrigger>
                  <AccordionContent>
                    <FormField
                      control={form.control}
                      name="transcriptionLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Transcription Language</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a language" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="saveRecordings"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <FormLabel>Save Recordings</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="audio">
                  <AccordionTrigger>Audio Settings</AccordionTrigger>
                  <AccordionContent>
                    <FormField
                      control={form.control}
                      name="audioQuality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Audio Quality</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select audio quality" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormItem>
                      <FormLabel>Start Recording Hotkey</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          value={hotkeys.start}
                          onChange={(e) => handleHotkeyChange('start', e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                    <FormItem>
                      <FormLabel>Stop Recording Hotkey</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          value={hotkeys.stop}
                          onChange={(e) => handleHotkeyChange('stop', e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="feedback">
                  <AccordionTrigger>Feedback</AccordionTrigger>
                  <AccordionContent>
                    {showFeedback ? (
                      <div className="space-y-2">
                        <Input
                          type="textarea"
                          placeholder="Suggest corrections or provide feedback"
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                        />
                        <Button onClick={handleFeedbackSubmit}>Submit Feedback</Button>
                      </div>
                    ) : (
                      <Button onClick={() => setShowFeedback(true)}>
                        Provide Transcription Feedback
                      </Button>
                    )}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="audio-management">
                  <AccordionTrigger>Audio File Management</AccordionTrigger>
                  <AccordionContent>
                    {showAudioManagement && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground">
                          This is a placeholder for audio file management. In a real application, you would be able to see a list of your audio files, download them, or delete them.
                        </p>
                        <ul className="mt-2 space-y-2">
                          {audioFiles.map((file) => (
                            <li key={file} className="flex items-center justify-between">
                              <span>{file}</span>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleDownloadAudio(file)}>
                                  Download
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteAudio(file)}>
                                  Delete
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Button onClick={handleAudioFileManagement}>
                      Manage Audio Files
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Settings
              </Button>
            </form>
          </Form>
          <div className="mt-8">
            <Button variant="destructive" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      );
    }
