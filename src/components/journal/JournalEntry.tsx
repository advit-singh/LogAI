import * as React from 'react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { cn } from '@/lib/utils';
    import { Play } from 'lucide-react';
    import { format } from 'date-fns';
    import { Badge } from '@/components/ui/badge';
    import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from '@/components/ui/popover';
    import { Collapse, CollapseContent, CollapseTrigger } from '@/components/ui/collapse';
    
    interface JournalEntryProps {
      entry: {
        id: string;
        content: string | null;
        audio_url: string | null;
        created_at: string;
        tags?: string[];
        mood?: string;
      };
      onSelect: (id: string) => void;
    }
    
    export function JournalEntry({ entry, onSelect }: JournalEntryProps) {
      const [isExpanded, setIsExpanded] = useState(false);
    
      return (
        <Card onClick={() => onSelect(entry.id)} className="cursor-pointer">
          <CardHeader className="flex justify-between">
            <CardTitle>{format(new Date(entry.created_at), 'MMMM dd, yyyy')}</CardTitle>
            <Popover>
              <PopoverTrigger>
                <span className="text-xs text-muted-foreground">{entry.mood}</span>
              </PopoverTrigger>
              <PopoverContent side="bottom">
                <p className="text-xs text-muted-foreground">Mood: {entry.mood}</p>
              </PopoverContent>
            </Popover>
          </CardHeader>
          <Collapse open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapseTrigger>Show More</CollapseTrigger>
            <CollapseContent>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {entry.content}
                </div>
                {entry.audio_url && (
                  <div className="mt-2 flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    <span className="text-xs text-muted-foreground">Audio recording available</span>
                  </div>
                )}
                {entry.tags?.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </CardContent>
            </CollapseContent>
          </Collapse>
        </Card>
      );
    }
