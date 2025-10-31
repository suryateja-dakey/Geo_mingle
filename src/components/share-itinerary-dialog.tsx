'use client';

import { useRef, useState, useEffect } from 'react';
import type { Itinerary } from '@/lib/types';
import { toPng } from 'html-to-image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ItineraryShareImage } from '@/components/itinerary-share-image';
import { Loader2, Download, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareItineraryDialogProps {
  itinerary: Itinerary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareItineraryDialog({ itinerary, open, onOpenChange }: ShareItineraryDialogProps) {
  const imageRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && itinerary && imageRef.current) {
      setIsGenerating(true);
      const timer = setTimeout(() => {
          generateImage();
      }, 500); // Small delay to ensure images are loaded
      return () => clearTimeout(timer);
    } else {
      setImageDataUrl(null);
    }
  }, [open, itinerary]);
  
  const generateImage = async () => {
    if (!imageRef.current) return;
    try {
      const dataUrl = await toPng(imageRef.current, { cacheBust: true, pixelRatio: 2 });
      setImageDataUrl(dataUrl);
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Image Generation Failed",
        description: "Could not create an image of the itinerary.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!imageDataUrl || !itinerary) return;
    const link = document.createElement('a');
    link.download = `geomingle-itinerary-${itinerary.title.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = imageDataUrl;
    link.click();
  };

  const handleShare = async () => {
    if (!imageDataUrl || !itinerary) return;
    
    try {
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], `geomingle-itinerary.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `My Itinerary: ${itinerary.title}`,
          text: `Check out my travel plans from Geo Mingle!`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Sharing Not Supported",
          description: "Your browser does not support sharing files.",
        });
      }
    } catch (error) {
        console.error('Share failed', error);
        // Don't show a toast if user cancels share
        if (String(error).includes('AbortError')) return;
        toast({
            variant: "destructive",
            title: "Sharing Failed",
            description: "Could not share the itinerary.",
        });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Share Your Itinerary</DialogTitle>
          <DialogDescription>
            Here's a preview of your shareable itinerary image.
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative my-4 flex items-center justify-center bg-muted/40 p-4 rounded-lg min-h-[300px]">
          {isGenerating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Generating preview...</p>
            </div>
          )}
          
          {imageDataUrl ? (
            <img src={imageDataUrl} alt="Itinerary Preview" className="max-w-full h-auto rounded-md shadow-lg" />
          ) : (
            <div className="opacity-0">
              {itinerary && <ItineraryShareImage ref={imageRef} itinerary={itinerary} />}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="outline" onClick={handleDownload} disabled={!imageDataUrl}>
            <Download className="mr-2" />
            Download PNG
          </Button>
          <Button onClick={handleShare} disabled={!imageDataUrl || !navigator.share}>
            <Share2 className="mr-2" />
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
