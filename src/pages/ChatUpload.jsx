import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Camera, 
  ClipboardPaste, 
  Upload, 
  X, 
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  FileText,
  Loader2,
  Check,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  extractTextFromImage, 
  formatExtractedMessagesAsText,
  getConfidenceLabel 
} from '@/services/ocrService';

export default function ChatUpload() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') || 'screenshot';
  
  const [activeMode, setActiveMode] = useState(initialMode);
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [chatText, setChatText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // Screenshot Intelligence Layer™ state
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState(null);
  const [extractionError, setExtractionError] = useState(null);
  
  const fileInputRef = useRef(null);

  // Screenshot Intelligence Layer™ - Extract text when image is loaded
  useEffect(() => {
    if (screenshot && screenshotPreview) {
      performExtraction(screenshot);
    }
  }, [screenshot, screenshotPreview]);

  const performExtraction = async (file) => {
    setIsExtracting(true);
    setExtractionResult(null);
    setExtractionError(null);
    
    try {
      const result = await extractTextFromImage(file, {
        platform: 'auto'
      });
      
      if (result.success) {
        setExtractionResult(result);
      } else {
        setExtractionError('Failed to extract text from screenshot');
      }
    } catch (error) {
      console.error('Extraction error:', error);
      setExtractionError('An error occurred during extraction');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Reset extraction state
      setExtractionResult(null);
      setExtractionError(null);
      
      setScreenshot(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setScreenshotPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Reset extraction state
      setExtractionResult(null);
      setExtractionError(null);
      
      setScreenshot(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setScreenshotPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const clearScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    setExtractionResult(null);
    setExtractionError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // For screenshots, require successful extraction
  const canContinue = activeMode === 'screenshot' 
    ? (!!screenshot && !!extractionResult && !isExtracting)
    : chatText.trim().length > 10;

  const handleContinue = () => {
    let inputData;
    
    if (activeMode === 'screenshot') {
      // Screenshot path: use extracted text from OCR service
      const extractedText = formatExtractedMessagesAsText(extractionResult?.messages);
      
      inputData = {
        mode: activeMode,
        source: 'screenshot', // Tag for engine
        content: extractedText,
        rawExtraction: extractionResult, // Full extraction result
        imagePreview: screenshotPreview, // Keep preview for reference
        fileName: screenshot?.name || null,
        extractionMetadata: extractionResult?.metadata || {},
        timestamp: Date.now()
      };
    } else {
      // Text paste path: use raw pasted text
      inputData = {
        mode: activeMode,
        source: 'text', // Tag for engine
        content: chatText,
        timestamp: Date.now()
      };
    }
    
    navigate('/copilot/analysis', { state: inputData });
  };

  return (
    <div className="w-full min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <button 
          onClick={() => navigate('/copilot')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        
        <h1 className="text-2xl font-bold text-white mb-2">Upload Your Chat</h1>
        <p className="text-slate-400">Share your conversation and get the perfect reply</p>
      </div>

      {/* Mode Tabs */}
      <div className="px-4 mb-6">
        <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700/50">
          <button
            onClick={() => setActiveMode('screenshot')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
              activeMode === 'screenshot'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-5 h-5" />
            Screenshot
          </button>
          <button
            onClick={() => setActiveMode('paste')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
              activeMode === 'paste'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ClipboardPaste className="w-5 h-5" />
            Paste Text
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4">
        {activeMode === 'screenshot' ? (
          <div className="space-y-4">
            {/* Upload Area */}
            {!screenshotPreview ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-slate-600 hover:border-purple-500/50 hover:bg-slate-800/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Drop your screenshot here
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  or tap to select from your gallery
                </p>
                <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
                  <ImageIcon className="w-4 h-4" />
                  <span>PNG, JPG, HEIC supported</span>
                </div>
              </div>
            ) : (
              /* Preview with Screenshot Intelligence Layer™ */
              <div className="relative">
                <Card className="bg-slate-800/50 border-slate-700/50 p-2 overflow-hidden">
                  <img
                    src={screenshotPreview}
                    alt="Chat screenshot"
                    className="w-full rounded-xl max-h-[300px] object-contain"
                  />
                </Card>
                <button
                  onClick={clearScreenshot}
                  className="absolute top-4 right-4 w-10 h-10 bg-red-500/90 hover:bg-red-500 rounded-full flex items-center justify-center shadow-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <p className="text-center text-slate-400 text-sm mt-3">
                  {screenshot?.name}
                </p>
                
                {/* Extraction Status */}
                <div className="mt-4">
                  {isExtracting && (
                    <Card className="bg-purple-500/10 border-purple-500/30 p-4">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                        <div>
                          <p className="text-purple-300 font-medium text-sm">
                            Screenshot detected — extracting conversation…
                          </p>
                          <p className="text-purple-400/70 text-xs mt-0.5">
                            Analyzing message bubbles and text
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                  
                  {extractionResult && !isExtracting && (
                    <Card className="bg-green-500/10 border-green-500/30 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                          <Check className="w-4 h-4 text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-green-300 font-medium text-sm">
                              Conversation extracted successfully
                            </p>
                            <span className="text-green-400/70 text-xs px-2 py-0.5 bg-green-500/10 rounded-full">
                              {getConfidenceLabel(extractionResult.metadata?.confidence)} confidence
                            </span>
                          </div>
                          <div className="bg-slate-900/50 rounded-lg p-3 max-h-32 overflow-y-auto">
                            <p className="text-slate-300 text-xs font-mono whitespace-pre-wrap">
                              {formatExtractedMessagesAsText(extractionResult.messages)}
                            </p>
                          </div>
                          <p className="text-slate-500 text-xs mt-2">
                            {extractionResult.messages?.length || 0} messages detected
                            {extractionResult.metadata?.detectedPlatform !== 'unknown' && (
                              <span> • Platform: {extractionResult.metadata.detectedPlatform}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                  
                  {extractionError && !isExtracting && (
                    <Card className="bg-red-500/10 border-red-500/30 p-4">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <div>
                          <p className="text-red-300 font-medium text-sm">
                            {extractionError}
                          </p>
                          <p className="text-red-400/70 text-xs mt-0.5">
                            Try uploading a clearer screenshot
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Tips */}
            <Card className="bg-slate-800/30 border-slate-700/30 p-4">
              <h4 className="text-sm font-medium text-purple-300 mb-2">💡 Tips for best results:</h4>
              <ul className="text-slate-400 text-sm space-y-1">
                <li>• Include their last 2-3 messages</li>
                <li>• Crop out sensitive info if needed</li>
                <li>• Make sure text is readable</li>
              </ul>
            </Card>
          </div>
        ) : (
          /* Paste Text Mode */
          <div className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700/50 p-1">
              <textarea
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder="Paste your conversation here...

Example:
Them: Hey! How was your weekend?
Me: It was good, went hiking
Them: Nice! Where did you go?
Me: [this is where I need help replying]"
                className="w-full h-64 bg-transparent text-white placeholder-slate-500 p-4 resize-none focus:outline-none text-sm leading-relaxed"
              />
            </Card>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">
                {chatText.length} characters
              </span>
              {chatText.length > 0 && chatText.length < 20 && (
                <span className="text-amber-400">Add more context for better results</span>
              )}
            </div>

            {/* Tips */}
            <Card className="bg-slate-800/30 border-slate-700/30 p-4">
              <h4 className="text-sm font-medium text-purple-300 mb-2">💡 Format tips:</h4>
              <ul className="text-slate-400 text-sm space-y-1">
                <li>• Label messages: "Them:" and "Me:"</li>
                <li>• Include the last 3-5 messages</li>
                <li>• Add context like "[we matched yesterday]"</li>
              </ul>
            </Card>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pt-8">
        <Button
          onClick={handleContinue}
          disabled={!canContinue}
          className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
            canContinue
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/30'
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
          }`}
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
