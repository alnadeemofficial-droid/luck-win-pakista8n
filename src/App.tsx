
import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Settings,
  Search,
  Bell,
  Globe,
  Star,
  UserCheck,
  Key,
  Share2,
  X
} from 'lucide-react';
import { Participant, EntryStatus, InvestmentOption, Announcement, Language, AdService, TermCondition, GlobalAd } from './types';
import { INITIAL_INVESTMENT_TIERS, TRANSLATIONS } from './constants';
import AdminDashboard from './components/AdminDashboard';
import RegistrationForm from './components/RegistrationForm';
import StatusChecker from './components/StatusChecker';
import ResultPortal from './components/ResultPortal';
import LuckyDraw from './components/LuckyDraw';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ur');
  const [activeTab, setActiveTab] = useState<'home' | 'status' | 'admin' | 'result' | 'lucky-draw' | 'services'>('home');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [luckyDrawTier, setLuckyDrawTier] = useState<InvestmentOption | null>(null);
  const [tiers, setTiers] = useState<InvestmentOption[]>(INITIAL_INVESTMENT_TIERS);
  const [ads, setAds] = useState<AdService[]>([]);
  const [globalAds, setGlobalAds] = useState<GlobalAd[]>([]);
  const [terms, setTerms] = useState<TermCondition[]>([]);
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null);
  const [deletedTier, setDeletedTier] = useState<{ tier: InvestmentOption, index: number } | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [selectedTier, setSelectedTier] = useState<InvestmentOption | null>(null);
  const [marqueeSpeed, setMarqueeSpeed] = useState<number>(25); 
  const [marqueePaused, setMarqueePaused] = useState<boolean>(false);
  const [selectedWinner, setSelectedWinner] = useState<Participant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdminButton, setShowAdminButton] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: '1',
      text: 'اگلی بڑی قرعہ اندازی 15 رمضان کو لائیو ہوگی! ابھی شامل ہوں اور اپنی قسمت بدلیں۔',
      textEn: 'Next big draw will be live on 15th Ramadan! Join now and change your luck.',
      active: true
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const CATEGORIES = [
    { id: 'ALL', label: lang === 'ur' ? 'All' : 'All', min: 0, max: Infinity },
    { id: '1-10', label: 'Rs. 1 - 10', min: 1, max: 10 },
    { id: '10-100', label: 'Rs. 10 - 100', min: 10, max: 100 },
    { id: '100-1000', label: 'Rs. 100 - 1k', min: 100, max: 1000 },
    { id: '1000-10000', label: 'Rs. 1k - 10k', min: 1000, max: 10000 },
  ];

  const HOW_IT_WORKS_DETAILS = [
    {
      title: { ur: 'کارڈ منتخب کریں', en: 'Select Card' },
      details: {
        ur: 'سب سے پہلے آپ ہوم سکرین پر موجود مختلف کارڈز میں سے اپنی پسند کا کارڈ منتخب کریں۔ ہر کارڈ کی انویسٹمنٹ رقم اور انعام کی رقم مختلف ہے۔ آپ اپنی گنجائش کے مطابق کارڈ چن سکتے ہیں۔',
        en: 'First, select a card from the available options on the home screen. Each card has a different investment amount and prize money. You can choose a card that fits your budget.'
      }
    },
    {
      title: { ur: 'رجسٹریشن', en: 'Register' },
      details: {
        ur: 'کارڈ منتخب کرنے کے بعد رجسٹریشن فارم پُر کریں۔ اپنا نام، موبائل نمبر اور نیٹ ورک درست لکھیں۔ یہ معلومات انعام کی وصولی کے لیے استعمال ہوں گی۔',
        en: 'After selecting a card, fill out the registration form. Enter your name, mobile number, and network correctly. This information will be used for prize claiming.'
      }
    },
    {
      title: { ur: 'TID حاصل کریں', en: 'Get TID' },
      details: {
        ur: 'فیس ادا کرنے کے بعد آپ کو ایک ٹریکنگ آئی ڈی (TID) ملے گی۔ اسے سنبھال کر رکھیں۔ یہ آپ کی انٹری کا ثبوت ہے۔',
        en: 'After paying the fee, you will receive a Tracking ID (TID). Keep it safe. This is proof of your entry.'
      }
    },
    {
      title: { ur: 'انعام جیتیں', en: 'Win Prize' },
      details: {
        ur: 'قرعہ اندازی کے بعد اگر آپ کا نام نکلتا ہے تو آپ کو انعام دیا جائے گا۔ فاتحین کی لسٹ ویب سائٹ پر لگا دی جاتی ہے۔',
        en: 'If your name is drawn in the lucky draw, you will receive the prize. The list of winners is displayed on the website.'
      }
    }
  ];

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const sortedTiers = [...tiers].sort((a, b) => {
    if (a.id === highlightedCardId) return -1;
    if (b.id === highlightedCardId) return 1;
    return 0;
  });

  const t = TRANSLATIONS[lang];

  const [error, setError] = useState<string | null>(null);

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        if (response.ok) {
          try {
            const data = await response.json();
            console.log('Fetched data:', data); // Debug log
            if (data.participants) setParticipants(data.participants);
            if (data.tiers) setTiers(data.tiers);
            if (data.announcements) setAnnouncements(data.announcements);
            if (data.ads) setAds(data.ads);
            if (data.globalAds) setGlobalAds(data.globalAds);
            if (data.terms) setTerms(data.terms);
            setError(null);
          } catch (jsonError) {
            console.error('Error parsing JSON data:', jsonError);
            setError('Failed to parse data from server.');
          }
        } else {
            const errData = await response.json().catch(() => ({}));
            console.error('API response not OK:', response.status, errData);
            setError(`Failed to load data: ${errData.details || response.statusText || 'Unknown Error'}`);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Network error: Could not connect to server.');
      } finally {
        setIsDataLoaded(true);
      }
    };
    fetchData();

    // Check for shared card in URL
    const urlParams = new URLSearchParams(window.location.search);
    const cardId = urlParams.get('card');
    const ref = urlParams.get('ref');
    
    if (cardId) {
      setHighlightedCardId(cardId);
      const tier = tiers.find(t => t.id === cardId);
      if (tier) setSelectedTier(tier);
    }
    
    if (ref) {
      localStorage.setItem('luckwin_ref', ref);
    }

    // Remove params from URL without refresh
    if (cardId || ref) {
      window.history.replaceState({}, '', window.location.pathname);
    }

    const savedLang = localStorage.getItem('luckwin_lang');
    if (savedLang) setLang(savedLang as Language);

    const savedSpeed = localStorage.getItem('luckwin_speed');
    if (savedSpeed) setMarqueeSpeed(Number(savedSpeed));

    const savedPaused = localStorage.getItem('luckwin_paused');
    if (savedPaused) setMarqueePaused(savedPaused === 'true');

    // Enable No Password Login by default for the first time
    if (localStorage.getItem('showNoPassLogin') === null) {
      localStorage.setItem('showNoPassLogin', 'true');
    }
  }, []);

  useEffect(() => {
    if (!isDataLoaded) return;

    const saveData = async () => {
      try {
        const tiersRes = await fetch('/api/tiers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tiers)
        });
        if (!tiersRes.ok) {
            const err = await tiersRes.text();
            console.error('Error saving tiers:', tiersRes.status, err);
        }

        const annRes = await fetch('/api/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(announcements)
        });
        if (!annRes.ok) {
            const err = await annRes.text();
            console.error('Error saving announcements:', annRes.status, err);
        }

        const adsRes = await fetch('/api/ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ads)
        });
        if (!adsRes.ok) {
            const err = await adsRes.text();
            console.error('Error saving ads:', adsRes.status, err);
        }

        const globalAdsRes = await fetch('/api/global-ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(globalAds)
        });
        if (!globalAdsRes.ok) {
            const err = await globalAdsRes.text();
            console.error('Error saving global ads:', globalAdsRes.status, err);
        }

        const termsRes = await fetch('/api/terms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(terms)
        });
        if (!termsRes.ok) {
            const err = await termsRes.text();
            console.error('Error saving terms:', termsRes.status, err);
        }

      } catch (error) {
        console.error('Error saving data:', error);
      }
    };
    
    // Debounce save to prevent too many writes
    const timeoutId = setTimeout(() => {
        saveData();
    }, 1000);

    localStorage.setItem('luckwin_lang', lang);
    localStorage.setItem('luckwin_speed', marqueeSpeed.toString());
    localStorage.setItem('luckwin_paused', marqueePaused.toString());

    return () => clearTimeout(timeoutId);
  }, [tiers, announcements, ads, globalAds, terms, lang, marqueeSpeed, marqueePaused, isDataLoaded]);

  const handleGlobalAdClick = (placementId: string, defaultAction: () => void) => {
    // Find active ad for this specific placement
    const ad = globalAds.find(a => a.active && !a.isExpired && a.placement === placementId);
    
    if (ad && ad.linkUrl) {
      window.open(ad.linkUrl, '_blank');
    } else {
      defaultAction();
    }
  };

  const renderGlobalAd = (placement: string) => {
    const ad = globalAds.find(a => a.active && !a.isExpired && a.placement === placement);
    if (!ad || !ad.linkUrl) return null;

    return (
      <div className="w-full my-4 text-center animate-pulse">
        <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block">
            <div className="bg-gray-100 p-2 rounded-xl border border-gray-200 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors">
                Sponsored • {ad.adNetwork}
            </div>
        </a>
      </div>
    );
  };

  const handleRegister = async (newParticipant: Participant) => {
    const existingUser = participants.find(p => p.phone === newParticipant.phone && p.name === newParticipant.name);
    const secretToken = existingUser?.secretToken || Math.random().toString(36).substring(2, 7).toUpperCase();
    
    const participantWithToken = { ...newParticipant, secretToken };
    
    try {
      const response = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(participantWithToken)
      });
      if (response.ok) {
        setParticipants(prev => [participantWithToken, ...prev]);
      }
    } catch (error) {
      console.error('Error registering:', error);
    }
    setSelectedTier(null);
  };

  const updateParticipantTID = async (id: string, trackingId: string) => {
    try {
      const status = EntryStatus.PENDING;
      await fetch('/api/participants/tid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, trackingId, status })
      });
      setParticipants(prev => prev.map(p => p.id === id ? { ...p, trackingId, status } : p));
    } catch (error) {
      console.error('Error updating TID:', error);
    }
  };

  const updateParticipantStatus = async (id: string, status: EntryStatus) => {
    try {
      await fetch('/api/participants/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      setParticipants(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteTierWithUndo = (id: string) => {
    const index = tiers.findIndex(t => t.id === id);
    if (index !== -1) {
      const tier = tiers[index];
      setDeletedTier({ tier, index });
      setTiers(prev => prev.filter(t => t.id !== id));
      setShowUndo(true);
      setTimeout(() => {
        setShowUndo(false);
        setDeletedTier(null);
      }, 10000);
    }
  };

  const undoDelete = () => {
    if (deletedTier) {
      setTiers(prev => {
        const newTiers = [...prev];
        newTiers.splice(deletedTier.index, 0, deletedTier.tier);
        return newTiers;
      });
      setShowUndo(false);
      setDeletedTier(null);
    }
  };

  const handleSaveWinner = async (participantId: string, winAmount: number) => {
    const winningDate = Date.now();
    try {
      await fetch('/api/participants/winner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: participantId, winAmount, winningDate })
      });
      setParticipants(prev => prev.map(p => p.id === participantId ? { ...p, isWinner: true, winAmount, winningDate } : p));
      
      const winner = participants.find(p => p.id === participantId);
      if (winner) {
        setTiers(prev => prev.map(t => t.id === winner.categoryId ? { ...t, drawCompleted: true } : t));
      }
    } catch (error) {
      console.error('Error saving winner:', error);
    }
  };

  const toggleLanguage = () => setLang(l => l === 'ur' ? 'en' : 'ur');

  const marqueeText = announcements
    .filter(a => a.active)
    .map(a => lang === 'ur' ? a.text : a.textEn)
    .join('  |  ');

  const handleLogoTouchStart = () => {
    const duration = Number(localStorage.getItem('admin_long_press_duration') || 3) * 1000;
    const timer = setTimeout(() => {
      setShowAdminButton(true);
      alert(lang === 'ur' ? 'ایڈمن بٹن اب ظاہر ہو گیا ہے!' : 'Admin button is now visible!');
    }, duration);
    setLongPressTimer(timer);
  };

  const handleLogoTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${lang === 'ur' ? 'rtl font-urdu' : 'ltr font-sans'}`} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm" dir="ltr">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer select-none" 
            onClick={() => setActiveTab('home')}
            onMouseDown={handleLogoTouchStart}
            onMouseUp={handleLogoTouchEnd}
            onMouseLeave={handleLogoTouchEnd}
            onTouchStart={handleLogoTouchStart}
            onTouchEnd={handleLogoTouchEnd}
          >
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white shadow-lg rotate-3">
              <Trophy className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-gray-900 nastaliq tracking-tighter">LUCK WIN</h1>
          </div>
          <div className="flex items-center gap-2">
            {activeTab !== 'home' && (
              <button 
                onClick={() => handleGlobalAdClick('Header_Back', () => setActiveTab('home'))}
                className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full text-[10px] font-black text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {lang === 'ur' ? 'واپس' : 'Back'}
              </button>
            )}
            <button onClick={() => handleGlobalAdClick('Language_Toggle', toggleLanguage)} className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full text-[10px] font-black text-gray-700 hover:bg-green-50 transition-colors">
              <Globe className="w-3 h-3" /> {lang === 'ur' ? 'English' : 'اردو'}
            </button>
            {showAdminButton && (
              <button onClick={() => handleGlobalAdClick('Admin_Button', () => setActiveTab('admin'))} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-500 text-white text-center p-2 text-sm font-bold">
          ⚠️ {error}
        </div>
      )}

      <main className="flex-grow max-w-7xl mx-auto w-full px-2 md:px-4 py-4 md:py-6">
        {renderGlobalAd('Header')}
        {activeTab === 'home' && (
          <div className="space-y-6 md:space-y-8">
            {marqueeText && (
              <div className="overflow-hidden bg-gradient-to-r from-yellow-500 to-orange-500 p-0.5 rounded-xl shadow-md">
                <div className="bg-yellow-50 px-4 py-2.5 rounded-[10px] flex items-center gap-3">
                  <Bell className="w-5 h-5 text-yellow-600 shrink-0" />
                  <div className="flex-grow overflow-hidden relative h-6">
                     <p 
                        className="absolute whitespace-nowrap text-sm font-black text-yellow-900"
                        style={{ 
                          left: '50%',
                          transform: 'translateX(-50%)'
                        }}
                      >
                       {marqueeText}
                     </p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center space-y-4">
              <h2 className="text-2xl md:text-5xl font-black text-gray-900 nastaliq leading-snug">
                {lang === 'ur' ? 'اپنی قسمت بدلنے کا وقت آ گیا ہے!' : 'Time to change your luck!'}
              </h2>
              <p className="text-[10px] md:text-lg text-gray-500 font-bold uppercase tracking-widest">{t.heroSub}</p>
              {renderGlobalAd('Below_Hero')}
              
              <div className="flex flex-col md:flex-row justify-center gap-3 pt-2">
                <button 
                  onClick={() => handleGlobalAdClick('Direct_Link_Status', () => setActiveTab('status'))}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-white border-2 border-green-600 text-green-700 rounded-full font-black text-sm shadow-xl shadow-green-100 hover:bg-green-50 active:scale-95 transition-all group"
                >
                  <UserCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {lang === 'ur' ? 'اپنا اسٹیٹس چیک کریں' : 'Check Your Status'}
                </button>
                <button 
                  onClick={() => handleGlobalAdClick('Direct_Link_Result', () => setActiveTab('result'))}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-green-600 text-white rounded-full font-black text-sm shadow-xl shadow-green-200 hover:bg-green-700 active:scale-95 transition-all group"
                >
                  <Trophy className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  {t.viewResults}
                </button>
                <button 
                  onClick={() => handleGlobalAdClick('Direct_Link_Services', () => setActiveTab('services'))}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full font-black text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all group"
                >
                  <Star className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {lang === 'ur' ? 'سروسز پورٹل' : 'Services Portal'}
                </button>
              </div>
              {renderGlobalAd('Below_Buttons')}
            </div>

            {/* Search and Category Filters */}
            <div className="space-y-4">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder={lang === 'ur' ? 'کارڈ تلاش کریں...' : 'Search cards...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-100 rounded-2xl shadow-sm focus:border-green-500 outline-none font-bold transition-all"
                />
              </div>

              <div className="flex flex-wrap justify-center gap-2 pb-4">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleGlobalAdClick('Category_Filter', () => setSelectedCategory(cat.id))}
                    className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${selectedCategory === cat.id ? 'bg-gray-900 text-white shadow-lg scale-105' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedTiers.filter(t => {
                 const cat = CATEGORIES.find(c => c.id === selectedCategory);
                 if (cat && (t.investAmount < cat.min || t.investAmount > cat.max)) return false;
                 
                 const matchesSearch = String(t.investAmount || '').includes(searchQuery) || 
                                     String(t.winAmount || '').includes(searchQuery);
                 if (!matchesSearch) return false;

                 return !t.isExpired && (t.currentMembers + participants.filter(p => p.categoryId === t.id && p.status === EntryStatus.APPROVED).length < t.membersNeeded);
              }).map((tier, index) => {
                const tierParticipants = participants.filter(p => p.categoryId === tier.id && p.status === EntryStatus.APPROVED);
                const currentCount = tierParticipants.length + tier.currentMembers;
                const progress = Math.min((currentCount / tier.membersNeeded) * 100, 100);
                const isHighlighted = tier.id === highlightedCardId;
                const cardColor = tier.color || 'from-green-600 to-green-900';

                return (
                  <div 
                    key={tier.id ? `${tier.id}-${index}` : `tier-${index}`} 
                    onClick={() => handleGlobalAdClick('Interstitial_Home', () => setSelectedTier(tier))}
                    className={`relative overflow-hidden rounded-[40px] shadow-2xl transition-all duration-500 cursor-pointer group hover:scale-[1.02] active:scale-95 ${isHighlighted ? 'ring-4 ring-blue-500 ring-offset-4 scale-[1.05] z-10' : ''}`}
                    style={tier.cardType === 'CUSTOM_DESIGN' && tier.customBgImage ? {
                      backgroundImage: `url(${tier.customBgImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: tier.customTextColor || '#ffffff'
                    } : cardColor.startsWith('#') ? {
                      background: `linear-gradient(135deg, ${cardColor}, ${cardColor}dd)`,
                      color: '#ffffff'
                    } : {}}
                  >
                    {!tier.customBgImage && !cardColor.startsWith('#') && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${cardColor} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                    )}
                    
                    {tier.cardType === 'CUSTOM_DESIGN' && (
                      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] group-hover:backdrop-blur-0 transition-all"></div>
                    )}

                    <div className="relative p-8 space-y-6 z-10">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{lang === 'ur' ? 'انویسٹمنٹ' : 'Investment'}</span>
                            {tier.cardType === 'TIME_BASED' && (
                              <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse">LIVE DRAW</span>
                            )}
                          </div>
                          <h3 className="text-4xl font-black tracking-tighter">Rs. {tier.investAmount}</h3>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{lang === 'ur' ? 'ممکنہ انعام' : 'Potential Win'}</p>
                            <p className="text-2xl font-black">Rs. {tier.winAmount.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{lang === 'ur' ? 'ممبرز' : 'Members'}</p>
                            <p className="text-sm font-black">{currentCount} / {tier.membersNeeded}</p>
                          </div>
                        </div>
                        
                        <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden p-0.5 border border-white/10">
                          <div 
                            className="h-full bg-white rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {tier.cardType === 'TIME_BASED' && tier.drawDate && (
                        <div className="bg-black/30 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                             <span className="text-[10px] font-black uppercase">{lang === 'ur' ? 'قرعہ اندازی' : 'Draw In'}</span>
                           </div>
                           <div className="text-xs font-black font-mono">
                             {(() => {
                               const diff = tier.drawDate - Date.now();
                               if (diff <= 0) return 'DRAWING NOW...';
                               const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                               const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                               const mins = Math.floor((diff / (1000 * 60)) % 60);
                               return `${days}d ${hours}h ${mins}m`;
                             })()}
                           </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                              <img src={`https://picsum.photos/seed/user${i}/32/32`} referrerPolicy="no-referrer" alt="User" />
                            </div>
                          ))}
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-green-500 flex items-center justify-center text-[8px] font-black text-white">
                            +{currentCount}
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const text = `${t.heroTitle}\nInvest Rs. ${tier.investAmount} & Win Rs. ${tier.winAmount}!\nJoin here: ${window.location.origin}?card=${tier.id}`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                          }}
                          className="p-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all backdrop-blur-md border border-white/20"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* How It Works Section */}
            <div className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 space-y-8">
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-black text-gray-900 nastaliq">{t.howItWorksTitle}</h3>
                <div className="w-20 h-1.5 bg-green-600 mx-auto rounded-full"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { icon: Search, title: t.step1Title, desc: t.step1Desc, color: 'bg-blue-50 text-blue-600' },
                  { icon: UserCheck, title: t.step2Title, desc: t.step2Desc, color: 'bg-green-50 text-green-600' },
                  { icon: Key, title: t.step3Title, desc: t.step3Desc, color: 'bg-yellow-50 text-yellow-600' },
                  { icon: Trophy, title: t.step4Title, desc: t.step4Desc, color: 'bg-orange-50 text-orange-600' }
                ].map((step, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedStep(i)}
                    className="flex flex-col items-center text-center space-y-3 p-4 rounded-3xl hover:bg-gray-50 transition-colors cursor-pointer active:scale-95"
                  >
                    <div className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center shadow-sm`}>
                      <step.icon className="w-7 h-7" />
                    </div>
                    <h4 className="font-black text-gray-800 text-lg">{step.title}</h4>
                    <p className="text-xs text-gray-400 font-bold leading-relaxed">{step.desc}</p>
                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-2">{lang === 'ur' ? 'مزید پڑھیں' : 'Read More'}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedStep !== null && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-[32px] p-8 relative shadow-2xl">
                  <button onClick={() => setSelectedStep(null)} className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full">
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="space-y-4 text-center">
                    <h3 className="text-2xl font-black text-gray-900 nastaliq">
                      {lang === 'ur' ? HOW_IT_WORKS_DETAILS[selectedStep].title.ur : HOW_IT_WORKS_DETAILS[selectedStep].title.en}
                    </h3>
                    <div className="w-16 h-1 bg-green-500 mx-auto rounded-full"></div>
                    <p className={`text-gray-600 leading-relaxed ${lang === 'ur' ? 'font-urdu text-lg' : 'text-sm'}`}>
                      {lang === 'ur' ? HOW_IT_WORKS_DETAILS[selectedStep].details.ur : HOW_IT_WORKS_DETAILS[selectedStep].details.en}
                    </p>
                    <button onClick={() => setSelectedStep(null)} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm mt-4">
                      {lang === 'ur' ? 'بند کریں' : 'Close'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Winners Section */}
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-black text-gray-900 nastaliq">{t.winnersTitle}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t.winnersSub}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {participants.filter(p => p.isWinner).sort((a, b) => (b.winningDate || 0) - (a.winningDate || 0)).slice(0, 6).map((winner, i) => (
                  <div 
                    key={`${winner.id}-${i}`} 
                    onClick={() => setSelectedWinner(winner)}
                    className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-[32px] border border-gray-100 shadow-lg flex items-center gap-4 group hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center text-yellow-900 shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                      <Trophy className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900">{winner.name}</h4>
                      <div className="text-green-600 font-black text-xl">Rs. {winner.winAmount?.toLocaleString()}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                        {formatDate(winner.winningDate || 0)}
                      </div>
                    </div>
                  </div>
                ))}
                {participants.filter(p => p.isWinner).length === 0 && (
                  <div className="col-span-full p-10 bg-white rounded-[32px] border border-dashed text-center text-gray-400 font-bold italic">
                    {lang === 'ur' ? 'ابھی تک کوئی فاتح نہیں ہے۔ اگلا نمبر آپ کا ہو سکتا ہے!' : 'No winners yet. You could be next!'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedWinner && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl relative">
              <button onClick={() => setSelectedWinner(null)} className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all z-10">
                <X className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-10 text-center text-white space-y-4">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-4xl font-black nastaliq leading-tight">{lang === 'ur' ? 'خوش نصیب فاتح' : 'Lucky Winner'}</h3>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-80">Winner Profile</p>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="text-center space-y-1">
                  <h4 className="text-3xl font-black text-gray-900">{selectedWinner.name}</h4>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{String(selectedWinner.phone).replace(/(\d{4})\d{4}(\d{3})/, '$1****$2')}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100 text-center">
                    <p className="text-[10px] text-blue-600 font-black uppercase">انویسٹمنٹ (Invested)</p>
                    <p className="text-xl font-black text-blue-800">Rs. {tiers.find(t => t.id === selectedWinner.categoryId)?.investAmount}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-3xl border border-green-100 text-center">
                    <p className="text-[10px] text-green-600 font-black uppercase">جیتا (Won)</p>
                    <p className="text-xl font-black text-green-800">Rs. {selectedWinner.winAmount?.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-gray-400 uppercase">انویسٹمنٹ کی تاریخ</span>
                    <span className="text-gray-800">{new Date(selectedWinner.timestamp).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-gray-400 uppercase">جیتنے کی تاریخ</span>
                    <span className="text-gray-800">{new Date(selectedWinner.winningDate || 0).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedWinner(null)}
                  className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all uppercase tracking-widest text-sm"
                >
                  ماشاءاللہ
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'status' && (
          <StatusChecker 
            participants={participants} 
            tiers={tiers} 
            lang={lang} 
            onBack={() => setActiveTab('home')} 
            updateTID={updateParticipantTID}
            handleGlobalAdClick={handleGlobalAdClick}
          />
        )}
        {activeTab === 'services' && (
          <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black nastaliq text-gray-900">{lang === 'ur' ? 'سروسز پورٹل' : 'Services Portal'}</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{lang === 'ur' ? 'ہمارے پارٹنرز اور خصوصی سروسز' : 'Our Partners & Special Services'}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ads.filter(ad => ad.active).map((ad, idx) => (
                <a 
                  key={`${ad.id}-${idx}`} 
                  href={ad.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-lg hover:shadow-xl transition-all group overflow-hidden relative"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden shrink-0">
                      {ad.imageUrl ? (
                        <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Globe className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow space-y-1">
                      <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-widest">{ad.category}</span>
                      <h3 className="font-black text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{ad.title}</h3>
                      <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                        Visit Service <Share2 className="w-3 h-3" />
                      </p>
                    </div>
                  </div>
                </a>
              ))}
              {ads.length === 0 && (
                <div className="col-span-full p-20 bg-white rounded-[40px] border border-dashed text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                    <Globe className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-400 font-bold italic">{lang === 'ur' ? 'فی الحال کوئی سروس دستیاب نہیں ہے۔' : 'No services available at the moment.'}</p>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'result' && (
          <ResultPortal 
            participants={participants} 
            tiers={tiers} 
            lang={lang} 
            onBack={() => setActiveTab('home')} 
            handleGlobalAdClick={handleGlobalAdClick}
          />
        )}
        {activeTab === 'lucky-draw' && luckyDrawTier && (
          <LuckyDraw 
            tier={luckyDrawTier} 
            participants={participants} 
            lang={lang} 
            onBack={() => {
              setActiveTab('admin');
              setLuckyDrawTier(null);
            }} 
            onSaveWinner={handleSaveWinner}
          />
        )}
        {activeTab === 'admin' && (
          <AdminDashboard 
            participants={participants} 
            updateStatus={updateParticipantStatus} 
            tiers={tiers} 
            setTiers={setTiers} 
            deleteTier={deleteTierWithUndo}
            announcements={announcements} 
            setAnnouncements={setAnnouncements}
            ads={ads}
            setAds={setAds}
            globalAds={globalAds}
            setGlobalAds={setGlobalAds}
            terms={terms}
            setTerms={setTerms}
            marqueeSpeed={marqueeSpeed}
            setMarqueeSpeed={setMarqueeSpeed}
            marqueePaused={marqueePaused}
            setMarqueePaused={setMarqueePaused}
            onBack={() => setActiveTab('home')}
            onStartDraw={(tier) => {
              setLuckyDrawTier(tier);
              setActiveTab('lucky-draw');
            }}
          />
        )}
        {renderGlobalAd('Footer')}
      </main>

      {showUndo && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60]">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4">
            <span className="text-sm font-bold">Card removed.</span>
            <button onClick={undoDelete} className="text-yellow-400 font-black text-sm uppercase hover:underline">Undo</button>
          </div>
        </div>
      )}

      <footer className="md:hidden bg-white border-t sticky bottom-0 z-50 py-2 flex justify-around items-center">
        {[ 
          { id: 'home', icon: Trophy, label: t.home }, 
          { id: 'status', icon: Search, label: t.status }, 
          { id: 'result', icon: Star, label: lang === 'ur' ? 'رزلٹ' : 'Result' },
          { id: 'admin', icon: Settings, label: t.admin } 
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex flex-col items-center p-1.5 transition-all ${activeTab === tab.id ? 'text-green-600 scale-110' : 'text-gray-400'}`}>
            <tab.icon className="w-5 h-5" />
            <span className="text-[9px] mt-0.5 font-black uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </footer>

      {selectedTier && (
        <RegistrationForm 
          tier={selectedTier} 
          onClose={() => setSelectedTier(null)} 
          onRegister={handleRegister} 
          lang={lang} 
          onToggleLang={toggleLanguage} 
          existingParticipants={participants} 
          allTerms={terms}
        />
      )}
      
      <style>{`
        /* Marquee animation removed */
      `}</style>
    </div>
  );
};

export default App;
