import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, X, Star, TrendingUp, AlertCircle, Check, Crown, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { trackFeatureUse } from '@/utils/analytics';
import UpgradeModal from '@/components/UpgradeModal';
import LimitReachedModal from '@/components/LimitReachedModal';

export default function PhotoFeedback() {
  const [selectedImages, setSelectedImages] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [maxUsage] = useState(3); // Free users: 3 photo analyses per month
  const fileInputRef = useRef(null);

  const subscriptionTier = localStorage.getItem('userSubscriptionTier') || 'free';
  const isPaidUser = ['pro', 'elite', 'premium'].includes(subscriptionTier?.toLowerCase());

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      alert('Please select only image files!');
      return;
    }

    // Limit to 6 images max
    const remainingSlots = 6 - selectedImages.length;
    const filesToAdd = imageFiles.slice(0, remainingSlots);

    const newImages = await Promise.all(
      filesToAdd.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              file: file,
              dataUrl: e.target.result,
              name: file.name
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );

    setSelectedImages(prev => [...prev, ...newImages]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const analyzePhotos = async () => {
    if (selectedImages.length === 0) return;

    if (!isPaidUser && usageCount >= maxUsage) {
      setShowLimitModal(true);
      return;
    }

    setIsLoading(true);
    trackFeatureUse('photo_feedback');

    try {
      const prompt = `You are a dating profile expert. Analyze these ${selectedImages.length} dating profile photo(s).

Rate each photo 1-10 and provide:
1. Overall score (1-10)
2. What works well
3. What could be improved
4. Recommended order for dating profile

Then provide:
- Overall profile photo score
- Which photo should be the main profile picture
- General tips for better photos

Be honest, specific, and helpful. Format as JSON with:
{
  "overall_score": number,
  "main_photo_recommendation": number (index 1-${selectedImages.length}),
  "photos": [{ "score": number, "works_well": string, "improve": string }],
  "general_tips": [string]
}`;

      const response = await base44.generateResponse(prompt, 'gpt-4o-mini');
      const content = response.choices?.[0]?.message?.content || '';
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setFeedback(parsed);
        setUsageCount(prev => prev + 1);
      } else {
        throw new Error('Failed to parse response');
      }
    } catch (error) {
      console.error('Error analyzing photos:', error);
      alert('Failed to analyze photos. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 pt-20 pb-32 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Photo Feedback</h1>
          </div>
          {!isPaidUser && (
            <div className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg">
              <span className="text-slate-400 text-sm">{usageCount}/{maxUsage} this month</span>
            </div>
          )}
        </div>
        <p className="text-slate-400">Get AI-powered feedback on your dating profile photos</p>
      </div>

      {/* Upload Section */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageSelect}
        className="hidden"
      />

      {selectedImages.length < 6 && !feedback && (
        <Card className="bg-slate-800/50 border-slate-700 p-8 mb-6">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-slate-600 hover:border-purple-500 rounded-xl p-8 transition-colors"
          >
            <Upload className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">Upload Profile Photos</p>
            <p className="text-slate-400 text-sm">Add up to 6 photos for analysis</p>
          </button>
        </Card>
      )}

      {/* Selected Images */}
      {selectedImages.length > 0 && !feedback && (
        <Card className="bg-slate-800/50 border-slate-700 p-4 mb-6">
          <h3 className="text-white font-semibold mb-3">Selected Photos ({selectedImages.length}/6)</h3>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {selectedImages.map((img, index) => (
              <div key={index} className="relative aspect-square">
                <img src={img.dataUrl} alt={`Upload ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                <div className="absolute bottom-1 left-1 w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center border border-slate-700">
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>
              </div>
            ))}
          </div>
          <Button
            onClick={analyzePhotos}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Analyzing Photos...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze My Photos
              </>
            )}
          </Button>
        </Card>
      )}

      {/* Feedback Results */}
      {feedback && (
        <div className="space-y-4">
          {/* Overall Score */}
          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-bold">Overall Profile Score</h3>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-2xl font-bold text-white">{feedback.overall_score}/10</span>
              </div>
            </div>
            <p className="text-slate-300 text-sm">
              <strong>Main Photo:</strong> Use Photo #{feedback.main_photo_recommendation}
            </p>
          </Card>

          {/* Individual Photo Ratings */}
          {feedback.photos?.map((photo, index) => (
            <Card key={index} className={`bg-slate-800/50 border-slate-700 p-4 ${
              index + 1 === feedback.main_photo_recommendation ? 'ring-2 ring-yellow-500' : ''
            }`}>
              <div className="flex items-start gap-3 mb-3">
                <img src={selectedImages[index].dataUrl} alt={`Photo ${index + 1}`} className="w-16 h-16 object-cover rounded-lg" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold">Photo #{index + 1}</h4>
                    <div className="flex items-center gap-1 px-2 py-1 bg-slate-700 rounded-lg">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-white font-bold">{photo.score}/10</span>
                    </div>
                  </div>
                  {index + 1 === feedback.main_photo_recommendation && (
                    <div className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded text-xs text-yellow-400 font-semibold inline-block mb-2">
                      ⭐ Recommended Main Photo
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-green-400 font-semibold flex items-center gap-1 mb-1">
                    <Check className="w-3 h-3" /> What Works
                  </p>
                  <p className="text-slate-300">{photo.works_well}</p>
                </div>
                <div>
                  <p className="text-orange-400 font-semibold flex items-center gap-1 mb-1">
                    <TrendingUp className="w-3 h-3" /> Could Improve
                  </p>
                  <p className="text-slate-300">{photo.improve}</p>
                </div>
              </div>
            </Card>
          ))}

          {/* General Tips */}
          <Card className="bg-slate-800/50 border-slate-700 p-5">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              General Photo Tips
            </h3>
            <ul className="space-y-2">
              {feedback.general_tips?.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-300 text-sm">
                  <span className="text-purple-400">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Button
            onClick={() => {
              setFeedback(null);
              setSelectedImages([]);
            }}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white"
          >
            Analyze New Photos
          </Button>
        </div>
      )}

      {/* Modals */}
      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
      {showLimitModal && (
        <LimitReachedModal
          onClose={() => setShowLimitModal(false)}
          featureName="Photo Feedback"
          limit={maxUsage}
          onUpgrade={() => {
            setShowLimitModal(false);
            setShowUpgradeModal(true);
          }}
        />
      )}
    </div>
  );
}
