import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Upload, Sparkles, CheckCircle, AlertCircle, Lightbulb, Image, FileText, Star, RefreshCw, X, Lock, Crown, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getBackendUrl } from '@/utils/getBackendUrl';

export default function ProfileOptimizer() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [bio, setBio] = useState('');
  const [platform, setPlatform] = useState('tinder');
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('photos');
  const [hasAccess, setHasAccess] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const backendUrl = getBackendUrl();

  // Check if user has Pro or Elite subscription
  const checkAccess = () => {
    const tier = (localStorage.getItem('userSubscriptionTier') || '').toLowerCase();
    return ['pro', 'elite', 'premium'].includes(tier);
  };

  useEffect(() => {
    const access = checkAccess();
    setHasAccess(access);
    if (!access) {
      setShowUpgradeModal(true);
    }
  }, []);
  
  const currentLang = i18n.language || 'en';
  const isAlbanian = currentLang === 'sq' || currentLang.startsWith('sq');

  const platforms = [
    { id: 'tinder', name: 'Tinder', color: 'from-pink-500 to-rose-600' },
    { id: 'bumble', name: 'Bumble', color: 'from-yellow-500 to-amber-600' },
    { id: 'hinge', name: 'Hinge', color: 'from-purple-500 to-indigo-600' },
    { id: 'instagram', name: 'Instagram', color: 'from-pink-500 via-purple-500 to-indigo-500' },
  ];

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsLoading(true);
    try {
      const uploadedPhotos = [];
      for (const file of files.slice(0, 6)) { // Max 6 photos
        const result = await base44.integrations.Core.UploadFile({ file });
        uploadedPhotos.push(result.file_url);
      }
      setPhotos([...photos, ...uploadedPhotos].slice(0, 6));
    } catch (error) {
      console.error('Error uploading photos:', error);
    }
    setIsLoading(false);
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const analyzeProfile = async () => {
    if (photos.length === 0 && !bio.trim()) return;
    
    setIsLoading(true);
    try {
      const langInstruction = isAlbanian ? 'Përgjigju në shqip.' : `Respond in ${currentLang === 'en' ? 'English' : currentLang}.`;
      const platformInfo = platforms.find(p => p.id === platform);
      
      let prompt = `You are an expert dating profile consultant who has helped thousands of people optimize their dating profiles for maximum matches on ${platformInfo?.name}.

TASK: Analyze and optimize this dating profile.
PLATFORM: ${platformInfo?.name}

`;

      if (photos.length > 0) {
        prompt += `PHOTOS UPLOADED: ${photos.length} photos

For each photo, analyze:
- Quality (lighting, resolution, composition)
- What it communicates about the person
- Whether it's appropriate for the main photo slot
- Specific improvements needed

Then provide:
1. 📸 PHOTO RANKING - Rank the photos from best to worst with explanations
2. 🎯 MAIN PHOTO RECOMMENDATION - Which should be the main photo and why
3. ⚠️ PHOTOS TO REMOVE/REPLACE - Any photos that hurt the profile
4. 💡 A/B TESTING TIPS - Suggest photo experiments to try
5. 📷 MISSING PHOTOS - Types of photos they should add

`;
      }

      if (bio.trim()) {
        prompt += `
BIO TEXT:
"${bio}"

Analyze the bio for:
1. ✅ WHAT WORKS - Good elements in the bio
2. ❌ WHAT DOESN'T WORK - Issues or red flags
3. ✨ REWRITTEN BIO - Provide 2-3 improved versions
4. 🎣 CONVERSATION HOOKS - Elements that invite messages
5. 🚫 CLICHÉS TO AVOID - Common mistakes found

`;
      }

      prompt += `
Be specific, actionable, and encouraging. Give a score out of 10 for the overall profile.
${langInstruction}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: photos.length > 0 ? photos : undefined
      });
      
      setAnalysis(response);
    } catch (error) {
      console.error('Error analyzing profile:', error);
    }
    setIsLoading(false);
  };

  const resetAnalysis = () => {
    setPhotos([]);
    setBio('');
    setAnalysis(null);
  };

  // Upgrade Modal
  const UpgradeModal = () => {
    if (!showUpgradeModal) return null;
    
    return createPortal(
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => window.history.back()} />
        <div className="relative bg-slate-900 border border-purple-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t('upgrade.proFeature', 'Pro Feature')}</h3>
            <p className="text-slate-400 mb-6">
              {t('upgrade.profileOptimizerLocked', 'Profile Optimizer is available for Pro and Elite members. Upgrade to unlock AI-powered profile analysis!')}
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.hash = '#/profile?tab=subscription'}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                <Crown className="w-4 h-4 mr-2" />
                {t('upgrade.upgradeToPro', 'Upgrade to Pro')}
              </Button>
              <Button 
                onClick={() => window.history.back()}
                variant="outline"
                className="w-full border-slate-700 text-slate-300"
              >
                {t('common.goBack', 'Go Back')}
              </Button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  // If no access, show locked state
  if (!hasAccess) {
    return (
      <>
        <UpgradeModal />
        <div className="px-4 pt-6 pb-32 w-full max-w-full overflow-x-hidden">
          <div className="mb-6 text-center">
            <div className="inline-block mb-3">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-600 to-slate-700 rounded-3xl flex items-center justify-center shadow-2xl opacity-50">
                  <Camera className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                  <Lock className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{t('profileOptimizer.title', 'Profile Optimizer')}</h1>
            <p className="text-slate-400 text-sm">{t('upgrade.requiresProElite', 'Requires Pro or Elite membership')}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="px-4 pt-6 pb-32 w-full max-w-full overflow-x-hidden">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>{t('common.goBack', 'Back to Home')}</span>
      </button>

      {/* Header */}
      <div className="mb-6 text-center">
        <div className="inline-block mb-3">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">{t('profileOptimizer.title', 'Profile Optimizer')}</h1>
        <p className="text-slate-400 text-sm">{t('profileOptimizer.subtitle', 'AI-powered profile review & improvements')}</p>
      </div>

      {!analysis ? (
        <div className="space-y-6">
          {/* Platform Selection */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-400" />
              {t('profileOptimizer.selectPlatform', 'Select Platform')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    platform === p.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className={`text-lg font-bold bg-gradient-to-r ${p.color} bg-clip-text text-transparent`}>
                    {p.name}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Tabs */}
          <div className="flex gap-2 bg-slate-900/50 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('photos')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'photos'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Image className="w-4 h-4" />
              {t('profileOptimizer.photos', 'Photos')}
            </button>
            <button
              onClick={() => setActiveTab('bio')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'bio'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              {t('profileOptimizer.bio', 'Bio')}
            </button>
          </div>

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-purple-400" />
                {t('profileOptimizer.uploadPhotos', 'Upload Profile Photos')}
                <span className="text-xs text-slate-500 ml-auto">{photos.length}/6</span>
              </h3>
              
              {/* Photo Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden">
                    <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-1 left-1 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                        Main
                      </div>
                    )}
                  </div>
                ))}
                
                {photos.length < 6 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Upload className="w-6 h-6 text-slate-500 mb-1" />
                    <span className="text-xs text-slate-500">{t('profileOptimizer.addPhoto', 'Add')}</span>
                  </label>
                )}
              </div>

              <p className="text-xs text-slate-500 text-center">
                {t('profileOptimizer.photoTip', 'Upload your dating profile photos for AI analysis')}
              </p>
            </Card>
          )}

          {/* Bio Tab */}
          {activeTab === 'bio' && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                {t('profileOptimizer.yourBio', 'Your Bio')}
              </h3>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t('profileOptimizer.bioPlaceholder', 'Paste your dating profile bio here...')}
                className="bg-slate-900 border-slate-700 text-white min-h-[150px] mb-3"
              />
              <p className="text-xs text-slate-500">
                {t('profileOptimizer.bioTip', "Include your bio to get improvement suggestions")}
              </p>
            </Card>
          )}

          {/* Analyze Button */}
          <Button
            onClick={analyzeProfile}
            disabled={isLoading || (photos.length === 0 && !bio.trim())}
            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-6 text-lg"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('profileOptimizer.analyzing', 'Analyzing your profile...')}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                {t('profileOptimizer.analyzeProfile', 'Analyze My Profile')}
              </div>
            )}
          </Button>
        </div>
      ) : (
        /* Results */
        <div className="space-y-4">
          {/* Summary */}
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 backdrop-blur-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">{t('profileOptimizer.analysisComplete', 'Analysis Complete!')}</h3>
                <p className="text-purple-200 text-sm">
                  {photos.length} {t('profileOptimizer.photosAnalyzed', 'photos analyzed')} • {platform}
                </p>
              </div>
            </div>
          </Card>

          {/* Analysis Results */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              {t('profileOptimizer.recommendations', 'Recommendations')}
            </h3>
            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {analysis}
            </div>
          </Card>

          {/* Reset Button */}
          <Button
            onClick={resetAnalysis}
            variant="outline"
            className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('profileOptimizer.analyzeAnother', 'Analyze Another Profile')}
          </Button>
        </div>
      )}
    </div>
  );
}
