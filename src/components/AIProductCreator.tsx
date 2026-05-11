"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Sparkles, Loader2, Terminal, RotateCcw, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const DEFAULT_IMAGE_PROMPT = "Generate this product on a studio product listing setting, WHITE background. Isolate the item, no person no table, only the item, and you can line it up like a product shot, so in the most aesthetically pleasing way. If only parts is visible, zoom out to capture the full item. Make the item as LARGE as possible without it sticking out of the viewport.";

interface ProductData {
  title: string;
  price: string;
  tagline: string;
  description: string;
}

interface AIProductCreatorProps {
  onComplete: (data: { image: string; imageOriginal: string; productData: ProductData }) => void;
  onCancel: () => void;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const fitToSquare = (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const size = Math.max(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);
        const x = (size - img.width) / 2;
        const y = (size - img.height) / 2;
        ctx.drawImage(img, x, y);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Optimized quality for smaller file size
      }
    };
    img.src = base64Str;
  });
};

export default function AIProductCreator({ onComplete, onCancel }: AIProductCreatorProps) {
  const [step, setStep] = useState<'upload' | 'processing_image' | 'details' | 'processing_text' | 'result'>('upload');

  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [targetItem, setTargetItem] = useState("");
  const [promptNote, setPromptNote] = useState("");

  const [finalData, setFinalData] = useState<ProductData | null>(null);

  const [isDevMode, setIsDevMode] = useState(false);
  const [imagePrompt, setImagePrompt] = useState(DEFAULT_IMAGE_PROMPT);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    setStep('upload');
    setOriginalImage(null);
    setFinalImage(null);
    setProductName("");
    setProductPrice("");
    setPromptNote("");
    setFinalData(null);
    setTargetItem("");
  };

  const processUpload = useCallback(async (file: File) => {
    setStep('processing_image');
    try {
      const base64Original = await blobToBase64(file);
      setOriginalImage(base64Original);

      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Original,
          targetItem,
          customPrompt: isDevMode ? imagePrompt : null
        })
      });

      if (!response.ok) throw new Error('Failed to generate image');

      const data = await response.json();
      const rawGenImage = data.image;

      if (rawGenImage) {
        const squared = await fitToSquare(rawGenImage);
        setFinalImage(squared);
        setStep('details');
      } else {
        throw new Error('No image returned');
      }

    } catch (error) {
      console.error("Error processing image:", error);
      alert("Error processing image. Please try again.");
      setStep('upload');
    }
  }, [imagePrompt, isDevMode, targetItem]);

  // Paste Event
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (step !== 'upload') return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            processUpload(file);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processUpload, step]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUpload(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const generateListing = async () => {
    if (!finalImage) return;
    setStep('processing_text');

    try {
      const response = await fetch('/api/ai/generate-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: finalImage,
          productName,
          productPrice,
          promptNote
        })
      });

      if (!response.ok) throw new Error('Failed to generate listing');

      const data = await response.json();
      setFinalData(data);
      setStep('result');

    } catch (error) {
      console.error(error);
      alert("Error generating listing details.");
      setStep('details');
    }
  };

  const handleSaveProduct = () => {
    if (!finalData || !finalImage || !originalImage) return;
    onComplete({
      image: finalImage,
      imageOriginal: originalImage,
      productData: finalData
    });
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">

      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-foreground" />
              <h1 className="text-lg font-medium text-foreground">AI Product Creator</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>

              <Button
                variant={isDevMode ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsDevMode(!isDevMode)}
              >
                <Terminal className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dev Mode Panel */}
      {isDevMode && (
        <div className="bg-muted border-b border-border p-4">
          <div className="container mx-auto max-w-4xl">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
              Image Generation System Prompt
            </Label>
            <Textarea
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              className="font-mono text-sm h-24 resize-none"
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6">

        {/* Upload */}
        {step === 'upload' && (
          <div className="w-full max-w-xl space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-light tracking-tight text-foreground">Upload Product Photo</h2>
              <p className="text-muted-foreground">AI will generate a studio shot and professional listing</p>
            </div>

            <div className="space-y-4">
              <div>
                <Input
                  type="text"
                  value={targetItem}
                  onChange={(e) => setTargetItem(e.target.value)}
                  placeholder="What is the item? (e.g. Vintage Watch, Sneaker)"
                  className="w-full"
                />
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative overflow-hidden border-2 border-dashed border-border hover:border-foreground/20 bg-muted/50 hover:bg-muted transition-all cursor-pointer"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center py-24 px-4">
                  <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-1">Click to Upload</h3>
                  <p className="text-sm text-muted-foreground">or paste image (Ctrl+V)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Processing Image */}
        {step === 'processing_image' && (
          <div className="text-center animate-fade-in space-y-4">
            <Loader2 className="w-12 h-12 text-foreground animate-spin mx-auto" />
            <div>
              <h3 className="text-xl font-medium text-foreground">Generating Studio Shot</h3>
              <p className="text-muted-foreground mt-2">Processing image...</p>
            </div>
          </div>
        )}

        {/* Details Entry */}
        {step === 'details' && finalImage && (
          <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 animate-fade-in items-center">

            {/* Left: Image Preview */}
            <div className="bg-background p-4 border border-border">
              <div className="aspect-square relative overflow-hidden bg-white">
                <img
                  src={finalImage}
                  alt="Studio Shot"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Right: Form */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-light tracking-tight text-foreground mb-2">Product Details</h2>
                <p className="text-muted-foreground text-sm">AI will generate the listing copy from these details</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Herman Miller Aeron Chair"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input
                    type="text"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="e.g. 1495"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Prompt Note <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                  <Input
                    type="text"
                    value={promptNote}
                    onChange={(e) => setPromptNote(e.target.value)}
                    placeholder="e.g. Emphasize durability, keep it brief"
                  />
                </div>
              </div>

              <Button
                onClick={generateListing}
                disabled={!productName || !productPrice}
                className="w-full bg-foreground text-background hover:bg-foreground/90"
                size="lg"
              >
                Generate Listing
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Processing Text */}
        {step === 'processing_text' && (
          <div className="text-center animate-fade-in space-y-4">
            <Sparkles className="w-12 h-12 text-foreground mx-auto" />
            <div>
              <h3 className="text-xl font-medium text-foreground">Crafting Copy</h3>
              <p className="text-muted-foreground mt-2">Analyzing features and formatting specs...</p>
            </div>
          </div>
        )}

        {/* Final Result */}
        {step === 'result' && finalData && finalImage && (
          <div className="w-full max-w-2xl animate-fade-in space-y-6">

            {/* Preview Card */}
            <div className="border border-border bg-background overflow-hidden">
              <div className="aspect-square bg-white p-6">
                <img
                  src={finalImage}
                  alt={finalData.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-8 space-y-6 border-t border-border">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-medium text-foreground leading-tight">{finalData.title}</h1>
                    <span className="text-xl font-medium text-foreground whitespace-nowrap">{finalData.price}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{finalData.tagline}</p>
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                  <h3 className="text-sm font-medium uppercase tracking-wider text-foreground">Details</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {finalData.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleSaveProduct}
                className="flex-1 bg-foreground text-background hover:bg-foreground/90"
                size="lg"
              >
                Save Product
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                size="lg"
              >
                Start Over
              </Button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
