import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Upload, Lock, Crown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import UpgradeModal from '@/components/UpgradeModal';

export default function StyleAdvisor() {
  const { t } = useTranslation();
  const [occasion, setOccasion] = useState('');
  const [description, setDescription] = useState('');
  const [advice, setAdvice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  
  // Check if user has Pro or Elite subscription
  const [hasAccess, setHasAccess] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const checkAccess = () => {
    const tier = (localStorage.getItem('userSubscriptionTier') || '').toLowerCase();
    console.log('🔐 Style Advisor - Checking access for tier:', tier);
    return ['pro', 'elite', 'premium'].includes(tier);
  };
  
  useEffect(() => {
    const access = checkAccess();
    setHasAccess(access);
    if (!access) {
      setShowUpgradeModal(true);
    }
  }, []);

  const occasions = [
    { value: 'coffee', label: t('styleAdvisor.occasions.coffee') },
    { value: 'dinner', label: t('styleAdvisor.occasions.dinner') },
    { value: 'casual', label: t('styleAdvisor.occasions.casual') },
    { value: 'club', label: t('styleAdvisor.occasions.club') },
    { value: 'movie', label: t('styleAdvisor.occasions.movie') },
    { value: 'beach', label: t('styleAdvisor.occasions.beach') }
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setUploadedImage(result.file_url);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
    setIsLoading(false);
  };

  const getAdvice = async () => {
    if (!occasion) return;

    setIsLoading(true);
    setAdvice(null);

    try {
      let prompt = `Ti je një ekspert mode për meshkuj. Jep këshilla të detajuara në shqip për çfarë të veshë një djalë për: ${occasions.find(o => o.value === occasion)?.label}. KRITIKE: Nëse ka foto të ngarkuar, SHIKO dhe ANALIZO foton. MOS thuaj "nuk kam mundësi të shoh foto" - ti MUND ta shohësh dhe duhet ta analizosh. Përshkruaj çfarë sheh në foto dhe jep këshilla bazuar në veshjen që sheh.



${description ? `Konteksti shtesë: ${description}` : ''}



Jep këshilla specifike për:

- Veshje (çfarë lloj, ngjyra, stil)

- Këpucë

- Aksesorë

- Parfum (nëse është e rëndësishme)

- Flokë dhe stil i përgjithshëm

- Tips për konfidencë



Bëji këshillat praktike dhe moderne. Jep 3-4 opsione të ndryshme në varësi të stilit personal.`;

      if (uploadedImage) {
        prompt += `\n\nKRITIKE: Shiko foton e ngarkuar dhe analizo atë që sheh në foto. Jep këshilla specifike bazuar në veshjen që sheh në foto. MOS thuaj "nuk kam mundësi të shoh foto" - ti MUND ta shohësh dhe duhet ta analizosh. Përshkruaj çfarë sheh në foto dhe jep këshilla bazuar në atë.`;
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        file_urls: uploadedImage ? [uploadedImage] : undefined
      });

      setAdvice(response);

      // Save to database
      await base44.entities.StyleAdvice.create({
        occasion: occasion,
        description: description,
        advice: response,
        image_url: uploadedImage
      });
    } catch (error) {
      console.error('Error:', error);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen pb-4">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-lg border-b border-slate-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{t('styleAdvisor.title')}</h1>
            <p className="text-xs text-slate-400">{t('styleAdvisor.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Input Form */}
        {!advice && (
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  {t('styleAdvisor.selectOccasion')}
                </label>
                <Select value={occasion} onValueChange={setOccasion}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue placeholder={t('styleAdvisor.selectOccasion')} />
                  </SelectTrigger>
                  <SelectContent>
                    {occasions.map(occ => (
                      <SelectItem key={occ.value} value={occ.value}>
                        {occ.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  {t('styleAdvisor.additionalContext')}
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('styleAdvisor.placeholder')}
                  className="bg-slate-900 border-slate-700 text-white min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  {t('styleAdvisor.uploadPhoto')}
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-slate-600 transition-colors">
                      {uploadedImage ? (
                        <div className="space-y-2">
                          <img 
                            src={uploadedImage} 
                            alt="Uploaded" 
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <p className="text-sm text-green-400">✓ {t('common.uploaded', 'Photo uploaded')}</p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                          <p className="text-sm text-slate-400">
                            {t('styleAdvisor.uploadPhotoDesc')}
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <Button
                onClick={getAdvice}
                disabled={!occasion || isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold h-12"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('styleAdvisor.generating')}</span>
                  </div>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    {t('styleAdvisor.getAdvice')}
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Advice Display */}
        {advice && (
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/30 backdrop-blur-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white">{t('styleAdvisor.yourAdvice')}</h2>
              </div>
              {uploadedImage && (
                <img 
                  src={uploadedImage} 
                  alt="Reference" 
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {advice}
                </p>
              </div>
            </Card>

            <Button
              onClick={() => {
                setAdvice(null);
                setOccasion('');
                setDescription('');
                setUploadedImage(null);
              }}
              variant="outline"
              className="w-full border-slate-700 text-white hover:bg-slate-800"
            >
              {t('styleAdvisor.getAdvice')}
            </Button>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal 
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature="Style Advisor"
        />
      )}
    </div>
  );
}

