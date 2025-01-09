import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useJournal } from '@/hooks/useJournal';
import { Loader2, Mic, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal, ModalContent, ModalTrigger, ModalClose, ModalOverlay, ModalPortal, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/components/ui/modal';
import { Combobox, ComboboxInput, ComboboxLabel, ComboboxList, ComboboxItem } from '@/components/ui/combobox';
import { Progress } from '@/components/ui/progress';


interface JournalEditorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
}

export function JournalEditor({ initialContent = '', onSave }: JournalEditorProps) {
  const editorRef = useRef<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { updateEntry } = useJournal();
  const [transcriptionLanguage, setTranscriptionLanguage] = useState('en');
  const [recordingFeedback, setRecordingFeedback] = useState<string | null>(null);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [realTimeTranscription, setRealTimeTranscription] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [longRecordingWarning, setLongRecordingWarning] = useState<string | null>(null);
  const [simultaneousInput, setSimultaneousInput] = useState(false);
  const [isAudioSaved, setIsAudioSaved] = useState(false);

  useEffect(() => {
    // Load transcription language from local storage if available
    const storedLanguage = localStorage.getItem('transcriptionLanguage');
    if (storedLanguage) {
      setTranscriptionLanguage(storedLanguage);
    }
    // Check if onboarding has been seen before
    const hasSeenOnboarding = localStorage.getItem('voiceOnboarding');
    if (hasSeenOnboarding) {
      setShowOnboarding(false);
    }
  }, []);

  const handleEditorChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.getContent();
      onSave?.(content);
    }
  };

  const startRecording = useCallback(async () => {
    setIsRecording(true);
    setRecordingDuration(0);
    setRecordedChunks([]);
    setRecordingFeedback(null);
    setTranscriptionError(null);
    setRealTimeTranscription('');
    setLongRecordingWarning(null);
    setIsAudioSaved(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      setMediaRecorder(recorder);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        if (recordingTimer) {
          clearInterval(recordingTimer);
          setRecordingTimer(null);
        }
      };
      recorder.start();
      const timer = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
        if (recordingDuration > 600) {
          setLongRecordingWarning('Recording is longer than 10 minutes. Please consider stopping the recording.');
        }
      }, 1000);
      setRecordingTimer(timer);
       // Simulate real-time transcription (replace with actual API call)
      const interval = setInterval(async () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          // Simulate transcription - replace with actual API call to transcription service
          const simulatedTranscription = `This is a simulated transcription of your recording.  This text will update every 5 seconds while recording.`;
          setRealTimeTranscription(prev => prev + simulatedTranscription + ' ');
        }
      }, 5000);
      return () => clearInterval(interval);
    } catch (error) {
      setIsRecording(false);
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
      toast({
        title: 'Microphone access denied',
        description: 'Microphone access is required for recording. Please enable permissions in your browser settings.',
        variant: 'destructive',
      });
    }
  }, [toast, recordedChunks, recordingDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  }, [mediaRecorder]);

  const handleSaveAudio = useCallback(async () => {
    if (recordedChunks.length === 0) {
      return;
    }

    setIsTranscribing(true);
    setTranscriptionError(null);
    try {
      const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
      const audioFile = new File([audioBlob], 'recording.webm');
      let audioPath = await api.uploadAudio(audioFile); //Simulate upload - replace with actual API call

      if (audioPath) {
        setAudioURL(audioPath);
        const qualityFeedback = await api.checkAudioQuality(audioPath); //Simulate quality check - replace with actual API call
        if (qualityFeedback) {
          setRecordingFeedback(qualityFeedback);
          toast.warning(qualityFeedback);
        }
        // Simulate audio compression before transcription.
        const compressedAudioPath = await api.compressAudio(audioPath); //Simulate compression - replace with actual API call
        if (compressedAudioPath) {
          audioPath = compressedAudioPath;
        }
        const transcribedText = await transcribeAudio(audioPath, transcriptionLanguage);
        if (transcribedText) {
          if (editorRef.current) {
            const currentContent = editorRef.current.getContent();
            editorRef.current.setContent(currentContent + transcribedText);
            handleEditorChange();
          }
          toast.success('Transcription complete');
        }
        setIsAudioSaved(true);
      }
    } catch (error) {
      setTranscriptionError('Transcription failed. Please try again.');
      toast.error(error instanceof Error ? error.message : 'Failed to upload and transcribe audio');
    } finally {
      setIsTranscribing(false);
      setRecordedChunks([]);
    }
  }, [recordedChunks, toast, handleEditorChange, transcriptionLanguage]);

  const transcribeAudio = async (audioPath: string, language: string) => {
    try {
      // Replace this with actual API call to transcription service (e.g., OpenAI Whisper)
      const transcribedText = await api.transcribeAudio(audioPath, language); //Simulate transcription - replace with actual API call

      // Simulate AI analysis (replace with actual API calls)
      if (transcribedText) {
        const { mood, summary, keywords } = await api.analyzeTranscription(transcribedText); //Simulate analysis - replace with actual API call
        if (mood && summary && keywords) {
          toast({
            title: 'AI Analysis Complete',
            description: `Mood: ${mood}, Summary: ${summary}, Keywords: ${keywords.join(', ')}`,
          });
        }
        const audioSummary = await api.summarizeAudio(audioPath); //Simulate summarization - replace with actual API call
        if (audioSummary) {
          toast({
            title: 'Audio Summary',
            description: audioSummary,
          });
        }
      }
      return transcribedText;
    } catch (error) {
      setTranscriptionError('Transcription failed. Please try again.');
      toast.error('Transcription failed. Please try again.');
      return null;
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setTranscriptionLanguage(newLanguage);
    localStorage.setItem('transcriptionLanguage', newLanguage);
  };

  const handleCancelRecording = () => {
    stopRecording();
    setRecordedChunks([]);
    setRecordingFeedback(null);
    setTranscriptionError(null);
    setRealTimeTranscription('');
    toast.warning('Recording cancelled');
  };

  const handleRetryTranscription = async () => {
    if (audioURL) {
      setIsTranscribing(true);
      setTranscriptionError(null);
      try {
        const transcribedText = await transcribeAudio(audioURL, transcriptionLanguage);
        if (transcribedText) {
          if (editorRef.current) {
            const currentContent = editorRef.current.getContent();
            editorRef.current.setContent(currentContent + transcribedText);
            handleEditorChange();
          }
          toast.success('Transcription complete');
        }
      } catch (error) {
        setTranscriptionError('Transcription failed. Please try again.');
        toast.error('Transcription failed. Please try again.');
      } finally {
        setIsTranscribing(false);
      }
    }
  };

  const handleDismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('voiceOnboarding', 'true');
  };

  const handleSimultaneousInput = () => {
    setSimultaneousInput(true);
    setTimeout(() => {
      setSimultaneousInput(false);
    }, 5000);
  };

  return (
    <div className="relative">
      <div className="relative flex h-[calc(100vh_-_150px)] w-full flex-col">
        <Editor
          apiKey="your-api-key"
          onInit={(evt, editor) => (editorRef.current = editor)}
          initialValue={initialContent}
          init={{
            height: '100%',
            menubar: false,
            plugins: [
              'advlist',
              'autolink',
              'lists',
              'link',
              'image',
              'charmap',
              'preview',
              'anchor',
              'searchreplace',
              'visualblocks',
              'code',
              'fullscreen',
              'insertdatetime',
              'media',
              'table',
              'code',
              'help',
              'wordcount',
            ],
            toolbar:
              'undo redo | blocks | ' +
              'bold italic forecolor backcolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help',
            content_style:
              'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          }}
          onEditorChange={handleEditorChange}
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          {isRecording ? (
            <Button
              variant="outline"
              onClick={stopRecording}
              disabled={isTranscribing}
            >
              <Square className="mr-2 h-4 w-4" />
              Stop Recording ({recordingDuration}s)
            </Button>
          ) : (
            <Modal>
              <ModalTrigger>
                <Button
                  variant="outline"
                  onClick={startRecording}
                  disabled={isTranscribing}
                >
                  <Mic className={cn('mr-2 h-4 w-4', isRecording && 'animate-pulse')} />
                  Record
                </Button>
              </ModalTrigger>
              <ModalPortal>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>
                    <ModalTitle>Recording in progress</ModalTitle>
                    <ModalDescription>
                      Recording your thoughts...
                    </ModalDescription>
                  </ModalHeader>
                  <div className="flex justify-center">
                    <Progress value={recordingDuration} />
                  </div>
                  <ModalFooter>
                    <Button onClick={stopRecording}>Stop Recording</Button>
                  </ModalFooter>
                </ModalContent>
              </ModalPortal>
            </Modal>
          )}
          {recordedChunks.length > 0 && (
            <Button onClick={handleSaveAudio} disabled={isTranscribing}>
              {isTranscribing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Transcribe
            </Button>
          )}
          <Combobox value={transcriptionLanguage} onValueChange={handleLanguageChange}>
            <ComboboxLabel>Transcription Language</ComboboxLabel>
            <ComboboxInput placeholder="Select a language" />
            <ComboboxList>
              <ComboboxItem value="en">English</ComboboxItem>
              <ComboboxItem value="es">Spanish</ComboboxItem>
              <ComboboxItem value="fr">French</ComboboxItem>
            </ComboboxList>
          </Combobox>
        </div>
        {recordingFeedback && (
          <div className="absolute bottom-12 right-4 text-xs text-muted-foreground">
            {recordingFeedback}
          </div>
        )}
        {transcriptionError && (
          <div className="absolute bottom-12 left-4 text-xs text-destructive">
            {transcriptionError}
            <Button
              variant="link"
              size="sm"
              onClick={handleRetryTranscription}
              disabled={isTranscribing}
            >
              Retry Transcription
            </Button>
          </div>
        )}
        {isRecording && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute bottom-4 left-4"
            onClick={handleCancelRecording}
          >
            Cancel Recording
          </Button>
        )}
        {realTimeTranscription && (
          <div className="absolute bottom-12 left-4 text-xs text-muted-foreground">
            {realTimeTranscription}
          </div>
        )}
        {longRecordingWarning && (
          <div className="absolute bottom-16 right-4 text-xs text-warning">
            {longRecordingWarning}
          </div>
        )}
        {showOnboarding && (
          <div className="absolute top-4 left-4 bg-background border p-4 rounded-md shadow-md">
            <h3 className="text-lg font-semibold mb-2">Voice Recording Tips</h3>
            <p className="text-sm text-muted-foreground">
              Click the microphone icon to start recording. Speak clearly and avoid background noise for best results.
            </p>
            <Button onClick={handleDismissOnboarding} className="mt-4">
              Got it!
            </Button>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="absolute bottom-4 left-4"
          onClick={handleSimultaneousInput}
        >
          Simulate Typing While Recording
        </Button>
        {simultaneousInput && (
          <div className="absolute bottom-12 left-4 text-xs text-muted-foreground">
            Simulating typing while recording...
          </div>
        )}
      </div>
    </div>
  );
}
