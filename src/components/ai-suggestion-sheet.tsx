'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface AiSuggestionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (prompt: string) => Promise<void>;
}

export function AiSuggestionSheet({ open, onOpenChange, onGenerate }: AiSuggestionSheetProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    await onGenerate(prompt);
    setIsLoading(false);
  };
  
  const examplePrompts = [
    "A relaxed day with a focus on art and good coffee.",
    "An adventurous morning and a foodie afternoon.",
    "Kid-friendly activities for a family with two young children.",
    "A solo traveler interested in history and local markets."
  ];

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Generate AI Itinerary</SheetTitle>
          <SheetDescription>
            Describe the kind of day you'd like, and our AI will create a personalized plan for you.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 py-4 space-y-4">
            <div className="space-y-2">
                <Label htmlFor="prompt">Your preferences</Label>
                <Textarea
                    id="prompt"
                    placeholder="e.g., A relaxing day exploring historical sites and enjoying local food."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px]"
                />
            </div>
            <div className="space-y-2">
                <Label>Or try an example:</Label>
                <div className="flex flex-wrap gap-2">
                    {examplePrompts.map(p => (
                        <Button key={p} variant="outline" size="sm" onClick={() => handleExampleClick(p)}>{p}</Button>
                    ))}
                </div>
            </div>
        </div>
        <SheetFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!prompt || isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Generating...' : 'Generate Itinerary'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
