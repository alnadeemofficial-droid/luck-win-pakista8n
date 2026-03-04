
import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, CheckCircle, XCircle, Search, Plus, Trash2, QrCode, Image as ImageIcon, BellPlus, Edit3, Save, X, FastForward, Play, Pause, ArrowLeft, Phone, Network, Trophy, TrendingUp, ShieldCheck, Settings
} from 'lucide-react';
import { Participant, EntryStatus, Announcement, InvestmentOption, AdService, TermCondition, GlobalAd } from '../types';

interface Props {
  participants: Participant[];
  updateStatus: (id: string, status: EntryStatus) => void;
  tiers: InvestmentOption[];
  setTiers: React.Dispatch<React.SetStateAction<InvestmentOption[]>>;
  deleteTier: (id: string) => void;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  ads: AdService[];
  setAds: React.Dispatch<React.SetStateAction<AdService[]>>;
  globalAds: GlobalAd[];
  setGlobalAds: React.Dispatch<React.SetStateAction<GlobalAd[]>>;
  terms: TermCondition[];
  setTerms: React.Dispatch<React.SetStateAction<TermCondition[]>>;
  marqueeSpeed: number;
  setMarqueeSpeed: (speed: number) => void;
  marqueePaused: boolean;
  setMarqueePaused: (paused: boolean) => void;
  onBack: () => void;
  onStartDraw: (tier: InvestmentOption) => void;
}

const AdminDashboard: React.FC<Props> = ({ 
  participants, updateStatus, tiers, setTiers, deleteTier, announcements, setAnnouncements, 
  ads, setAds, globalAds, setGlobalAds, terms, setTerms,
  marqueeSpeed, setMarqueeSpeed, marqueePaused, setMarqueePaused, onBack, onStartDraw 
}) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'tiers' | 'announcement' | 'stats' | 'completed' | 'awaiting_tid' | 'calculator' | 'ads' | 'global_ads' | 'terms'>('users');
  const [userFilter, setUserFilter] = useState<EntryStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
// ... (imports)

// ... (inside AdminDashboard component)

  const [newTier, setNewTier] = useState<Partial<InvestmentOption>>({ 
    investAmount: 0, 
    winAmount: 0, 
    membersNeeded: 100, 
    currentMembers: 0, 
    qrData: '', 
    color: 'from-green-600 to-green-900',
    cardType: 'member-based',
    bonusPercentage: 0,
    termsIds: [],
    designVariant: 'default'
  });

  const DESIGN_VARIANTS = ['default', 'gold', 'royal', 'neon', 'minimal', 'dark', 'glass'];

  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [editTierData, setEditTierData] = useState<Partial<InvestmentOption>>({});
  const [newAnn, setNewAnn] = useState({ text: '', textEn: '' });
  
  const [newAd, setNewAd] = useState<Partial<AdService>>({ titleUr: '', titleEn: '', linkUrl: '', category: 'General', active: true });
  const [newGlobalAd, setNewGlobalAd] = useState<Partial<GlobalAd>>({ 
    adNetwork: 'Google AdSense', 
    location: 'Home', 
    placement: 'Header', 
    linkUrl: '', 
    active: true, 
    isExpired: false 
  });
  const [editingGlobalAdId, setEditingGlobalAdId] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const AD_NETWORKS = [
    'Google AdSense', 
    'PropellerAds', 
    'AdMob', 
    'Unity Ads', 
    'ironSource', 
    'AppLovin', 
    'Mintegral', 
    'Pangle', 
    'Liftoff', 
    'Vungle'
  ];

  const AD_LOCATIONS = ['Home', 'Status', 'Result', 'Services'];

  const AD_PLACEMENTS = [
    { id: 'Header', label: 'Header (Top Banner)', location: 'All' },
    { id: 'Footer', label: 'Footer (Bottom Banner)', location: 'All' },
    { id: 'Below_Hero', label: 'Below Hero Section', location: 'Home' },
    { id: 'Below_Buttons', label: 'Below Main Buttons', location: 'Home' },
    { id: 'Interstitial_Home', label: 'Interstitial (On Page Load)', location: 'Home' },
    { id: 'Direct_Link_Status', label: 'Status Button (Direct Link)', location: 'Home' },
    { id: 'Direct_Link_Result', label: 'Result Button (Direct Link)', location: 'Home' },
    { id: 'Direct_Link_Services', label: 'Services Button (Direct Link)', location: 'Home' },
    { id: 'Language_Toggle', label: 'Language Toggle Button', location: 'All' },
    { id: 'Admin_Button', label: 'Admin Button', location: 'All' },
    { id: 'Header_Back', label: 'Header Back Button', location: 'All' },
    { id: 'Category_Filter', label: 'Category Filter Click', location: 'Home' },
    { id: 'Interstitial_Status', label: 'Status Page Interstitial', location: 'Status' },
    { id: 'Interstitial_Result', label: 'Result Page Interstitial', location: 'Result' },
  ];

  const [newTerm, setNewTerm] = useState<Partial<TermCondition>>({ text: '', textEn: '' });

  // Calculator State
  const [calcData, setCalcData] = useState({
    members: 1000,
    invest: 10,
    prize: 8000,
    expenses: 0
  });

  const CARD_COLORS = [
    { name: 'Green', value: 'from-green-600 to-green-900' },
    { name: 'Blue', value: 'from-blue-600 to-blue-900' },
    { name: 'Purple', value: 'from-purple-600 to-purple-900' },
    { name: 'Red', value: 'from-red-600 to-red-900' },
    { name: 'Orange', value: 'from-orange-600 to-orange-900' },
    { name: 'Yellow', value: 'from-yellow-600 to-yellow-800' },
    { name: 'Pink', value: 'from-pink-600 to-pink-900' },
    { name: 'Indigo', value: 'from-indigo-600 to-indigo-900' },
    { name: 'Cyan', value: 'from-cyan-600 to-cyan-900' },
    { name: 'Teal', value: 'from-teal-600 to-teal-900' },
    { name: 'Slate', value: 'from-slate-600 to-slate-900' },
    { name: 'Emerald', value: 'from-emerald-600 to-emerald-900' },
    { name: 'Rose', value: 'from-rose-600 to-rose-900' },
  ];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const filteredParticipants = participants.filter(p => {
    const isAwaitingTid = p.status === EntryStatus.AWAITING_TID;
    const matchesFilter = userFilter === 'ALL' ? !isAwaitingTid : p.status === userFilter;
    const matchesSearch = String(p.name || '').toLowerCase().includes(search.toLowerCase()) || String(p.phone || '').includes(search) || String(p.trackingId || '').includes(search);
    return matchesFilter && matchesSearch;
  });

  const totalRevenue = participants
    .filter(p => p.status === EntryStatus.APPROVED)
    .reduce((acc, p) => acc + (p.investAmount || tiers.find(t => t.id === p.categoryId)?.investAmount || 0), 0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      // Compress image before setting
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max width/height 800px to save space
          const MAX_SIZE = 800;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG 0.6 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          
          if (isEdit) {
            setEditTierData(prev => ({ ...prev, qrImage: dataUrl }));
          } else {
            setNewTier(prev => ({ ...prev, qrImage: dataUrl }));
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const addTier = () => { 
    if (newTier.investAmount && newTier.winAmount) { 
      setTiers(prev => [...prev, { ...newTier, id: Date.now().toString() } as InvestmentOption]); 
      setNewTier({ investAmount: 0, winAmount: 0, membersNeeded: 100, currentMembers: 0, qrData: '', color: 'from-green-600 to-green-900' }); 
    } 
  };
  
  const startEditTier = (tier: InvestmentOption) => { 
    setEditingTierId(tier.id); 
    setEditTierData({ ...tier }); 
  };
  
  const saveEditTier = () => { 
    if (editingTierId) { 
      setTiers(prev => prev.map(t => t.id === editingTierId ? { ...t, ...editTierData } as InvestmentOption : t)); 
      setEditingTierId(null); 
    } 
  };

  const addAnnouncement = () => { 
    if (newAnn.text.trim()) { 
      setAnnouncements(prev => [{ id: Date.now().toString(), text: newAnn.text, textEn: newAnn.textEn, active: true }, ...prev]); 
      setNewAnn({ text: '', textEn: '' }); 
    } 
  };

  const deleteAnnouncement = (id: string) => { 
    if (window.confirm('Delete notification?')) setAnnouncements(prev => prev.filter(a => a.id !== id)); 
  };

  const toggleAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Use the server proxy instead of direct URL
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            username: username.trim(), 
            password: adminPassword.trim() 
        })
      });

      const result = await response.json();
      console.log("Server Response:", result);

      // Check for various success indicators
      if (result.status === 'success' || result.success === true) {
        // Login Successful
        setIsAdminAuthenticated(true);
        if (result.message && result.message.includes('restored')) {
            alert(result.message);
        }
      } else {
        // Login Failed
        alert('Login Failed: ' + (result.message || result.error || 'Invalid credentials'));
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Network error or API issue. Please check console for details.');
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[40px] border shadow-2xl w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 nastaliq">ایڈمن لاگ ان</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Admin Access Only</p>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">یوزر نیم (Username)</label>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-2xl outline-none font-bold text-lg transition-all text-center"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">پاسورڈ (Password)</label>
              <input 
                type="password" 
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-2xl outline-none font-bold text-lg transition-all text-center"
              />
            </div>
            <button type="submit" className="w-full py-5 bg-green-600 text-white rounded-2xl font-black shadow-xl shadow-green-100 hover:bg-green-700 active:scale-95 transition-all uppercase tracking-widest text-sm">
              ایکسیس حاصل کریں
            </button>
            
            <button type="button" onClick={onBack} className="w-full py-3 text-gray-400 font-bold text-xs uppercase hover:text-gray-600 transition-all">
              واپس جائیں (Back)
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20 p-2">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 bg-white rounded-full border shadow-sm hover:bg-gray-50 flex items-center justify-center transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-grow">
          {['users', 'awaiting_tid', 'tiers', 'ads', 'global_ads', 'terms', 'announcement', 'stats', 'completed', 'calculator', 'settings'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeTab === tab ? 'bg-green-600 text-white shadow-lg' : 'bg-white border text-gray-500'}`}>
              {tab === 'users' ? 'درخواستیں' : 
               tab === 'awaiting_tid' ? 'بغیر TID درخواستیں' : 
               tab === 'tiers' ? 'کارڈز سیٹنگ' : 
               tab === 'ads' ? 'ایڈز / سروسز' :
               tab === 'global_ads' ? 'گلوبل ایڈز کنٹرول' :
               tab === 'terms' ? 'شرائط و ضوابط' :
               tab === 'announcement' ? 'اناؤنسمنٹ پٹی' : 
               tab === 'stats' ? 'کارڈ شماریات' : 
               tab === 'completed' ? 'مکمل کارڈز (Draw)' : 
               tab === 'calculator' ? 'منافع کیلکولیٹر' : 
               'سیٹنگز'}
            </button>
          ))}
        </div>
      </div>

      {editingTierId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl">
            <div className="bg-blue-600 p-5 text-white flex justify-between items-center">
              <h3 className="font-black text-lg">ایڈٹ کارڈ (Edit Card)</h3>
              <button onClick={() => setEditingTierId(null)} className="p-1 hover:bg-white/20 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">انویسٹمنٹ رقم</label>
                  <input type="number" value={editTierData.investAmount ?? 0} className="w-full p-3 border-2 rounded-2xl text-sm font-bold focus:border-blue-500 outline-none" onChange={e => setEditTierData({...editTierData, investAmount: +e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">انعام رقم</label>
                  <input type="number" value={editTierData.winAmount ?? 0} className="w-full p-3 border-2 rounded-2xl text-sm font-bold focus:border-blue-500 outline-none" onChange={e => setEditTierData({...editTierData, winAmount: +e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">ممبر لمٹ</label>
                  <input type="number" value={editTierData.membersNeeded ?? 0} className="w-full p-3 border-2 rounded-2xl text-sm font-bold focus:border-blue-500 outline-none" onChange={e => setEditTierData({...editTierData, membersNeeded: +e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">والٹ نمبر</label>
                  <input type="text" value={editTierData.qrData ?? ''} className="w-full p-3 border-2 rounded-2xl text-sm font-bold focus:border-blue-500 outline-none" onChange={e => setEditTierData({...editTierData, qrData: e.target.value})} />
                </div>

                {/* Live Calculation for Edit */}
                <div className="col-span-2">
                  {(() => {
                    const total = (editTierData.investAmount || 0) * (editTierData.membersNeeded || 0);
                    const profit = total - (editTierData.winAmount || 0);
                    return (
                      <div className={`p-3 rounded-xl border flex justify-between items-center ${profit >= 0 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                        <div className="text-[10px] font-black uppercase">لائیو اسٹیٹس (Live Status)</div>
                        <div className="text-sm font-black">
                          {profit >= 0 ? `منافع: Rs. ${profit}` : `نقصان: Rs. ${Math.abs(profit)}`}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">کارڈ کا رنگ (Card Color)</label>
                  <div className="flex flex-wrap gap-2">
                    {CARD_COLORS.map(c => (
                      <button 
                        key={c.value} 
                        onClick={() => setEditTierData({...editTierData, color: c.value})}
                        className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.value} border-2 ${editTierData.color === c.value ? 'border-black scale-110' : 'border-transparent'}`}
                        title={c.name}
                      />
                    ))}
                    <div className="flex items-center gap-2 ml-2 border-l pl-2">
                      <input 
                        type="color" 
                        value={editTierData.color?.startsWith('#') ? editTierData.color : '#000000'} 
                        onChange={e => setEditTierData({...editTierData, color: e.target.value})}
                        className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 cursor-pointer"
                      />
                      <span className="text-[8px] font-black text-gray-400 uppercase">Custom</span>
                    </div>
                  </div>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="edit-expired" 
                    checked={editTierData.isExpired} 
                    onChange={e => setEditTierData({...editTierData, isExpired: e.target.checked})} 
                    className="w-4 h-4"
                  />
                  <label htmlFor="edit-expired" className="text-xs font-bold text-gray-600">کارڈ ایکسپائر کریں (Expire Card)</label>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative cursor-pointer" onClick={() => editFileInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 hover:bg-gray-100 transition-all">
                    {editTierData.qrImage ? <img src={editTierData.qrImage} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-300 w-8 h-8" />}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-lg shadow-lg"><ImageIcon className="w-3 h-3" /></div>
                </div>
                <input type="file" ref={editFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, true)} />
                <div className="flex-grow space-y-2">
                   <button onClick={saveEditTier} className="w-full py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"><Save className="w-4 h-4" /> محفوظ کریں</button>
                   <button onClick={() => setEditingTierId(null)} className="w-full py-3 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all">کینسل</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'global_ads' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
            <h3 className="font-black border-b pb-3 text-green-700">
              {editingGlobalAdId ? 'ایڈٹ گلوبل ایڈ (Edit Global Ad)' : 'نیا گلوبل ایڈ شامل کریں (Add Global Ad)'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">ایڈ نیٹ ورک (Ad Network)</label>
                <select 
                  className="w-full p-3 bg-gray-50 border rounded-xl text-sm" 
                  value={newGlobalAd.adNetwork} 
                  onChange={e => setNewGlobalAd({...newGlobalAd, adNetwork: e.target.value})}
                >
                  {AD_NETWORKS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">لوکیشن (Location)</label>
                <select 
                  className="w-full p-3 bg-gray-50 border rounded-xl text-sm" 
                  value={newGlobalAd.location} 
                  onChange={e => setNewGlobalAd({...newGlobalAd, location: e.target.value})}
                >
                  {AD_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">پلیسمنٹ (Placement)</label>
                <select 
                  className="w-full p-3 bg-gray-50 border rounded-xl text-sm" 
                  value={newGlobalAd.placement} 
                  onChange={e => setNewGlobalAd({...newGlobalAd, placement: e.target.value})}
                >
                  {AD_PLACEMENTS.filter(p => p.location === 'All' || p.location === newGlobalAd.location).map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">ایکسپائری ڈیٹ (Expiry Date)</label>
                <input 
                  type="date" 
                  className="w-full p-3 bg-gray-50 border rounded-xl text-sm" 
                  value={newGlobalAd.expiryDate ? new Date(newGlobalAd.expiryDate).toISOString().split('T')[0] : ''}
                  onChange={e => setNewGlobalAd({...newGlobalAd, expiryDate: new Date(e.target.value).getTime()})} 
                />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase">لنک / کوڈ (Link URL / Code)</label>
                <input 
                  type="text" 
                  placeholder="https://..." 
                  className="w-full p-3 bg-gray-50 border rounded-xl text-sm" 
                  value={newGlobalAd.linkUrl || ''} 
                  onChange={e => setNewGlobalAd({...newGlobalAd, linkUrl: e.target.value})} 
                />
              </div>
              <div className="col-span-2 flex gap-2">
                {editingGlobalAdId && (
                  <button 
                    onClick={() => {
                      setNewGlobalAd({ adNetwork: 'Google AdSense', location: 'Home', placement: 'Header', linkUrl: '', active: true, isExpired: false });
                      setEditingGlobalAdId(null);
                    }}
                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-black hover:bg-gray-200 transition-all"
                  >
                    کینسل (Cancel)
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (newGlobalAd.linkUrl) {
                      if (editingGlobalAdId) {
                        setGlobalAds(prev => prev.map(a => a.id === editingGlobalAdId ? { ...newGlobalAd, id: editingGlobalAdId } as GlobalAd : a));
                        setEditingGlobalAdId(null);
                      } else {
                        setGlobalAds(prev => [...prev, { ...newGlobalAd, id: Date.now().toString(), active: true, isExpired: false } as GlobalAd]);
                      }
                      setNewGlobalAd({ adNetwork: 'Google AdSense', location: 'Home', placement: 'Header', linkUrl: '', active: true, isExpired: false });
                    }
                  }}
                  className="flex-[2] py-3 bg-green-600 text-white rounded-xl font-black shadow-lg hover:bg-green-700 transition-all"
                >
                  {editingGlobalAdId ? 'اپ ڈیٹ کریں (Update)' : 'محفوظ کریں (Save Ad)'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {globalAds.map((ad, idx) => (
              <div key={`${ad.id}-${idx}`} className={`bg-white p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 ${ad.isExpired ? 'opacity-60 grayscale' : ''}`}>
                <div className="space-y-1 w-full md:w-auto">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-[10px] font-black uppercase">{ad.adNetwork}</span>
                    <span className="bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-md text-[10px] font-black uppercase">{ad.location}</span>
                    <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md text-[10px] font-black uppercase">{AD_PLACEMENTS.find(p => p.id === ad.placement)?.label || ad.placement}</span>
                    {ad.isExpired && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md text-[10px] font-black uppercase">EXPIRED</span>}
                  </div>
                  <div className="text-xs text-gray-500 font-mono truncate max-w-[300px]">{ad.linkUrl}</div>
                  {ad.expiryDate && <div className="text-[10px] text-gray-400">Expires: {new Date(ad.expiryDate).toLocaleDateString()}</div>}
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button 
                    onClick={() => setGlobalAds(prev => prev.map(a => a.id === ad.id ? { ...a, active: !a.active } : a))}
                    className={`p-2 rounded-xl transition-all ${ad.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                    title="Toggle Active"
                  >
                    {ad.active ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </button>
                  
                  <button 
                    onClick={() => {
                      setNewGlobalAd(ad);
                      setEditingGlobalAdId(ad.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                    title="Edit"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>

                  <button 
                    onClick={() => setGlobalAds(prev => prev.map(a => a.id === ad.id ? { ...a, isExpired: !a.isExpired, active: !a.isExpired ? false : a.active } : a))}
                    className={`p-2 rounded-xl transition-all ${ad.isExpired ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400 hover:bg-orange-50 hover:text-orange-600'}`}
                    title="Toggle Expire"
                  >
                    <FastForward className="w-5 h-5" />
                  </button>

                  <button 
                    onClick={() => {
                      if(window.confirm('Delete this ad?')) {
                        setGlobalAds(prev => prev.filter(a => a.id !== ad.id));
                      }
                    }}
                    className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {globalAds.length === 0 && (
              <div className="text-center p-10 text-gray-400 font-bold italic border-2 border-dashed rounded-3xl">
                کوئی گلوبل ایڈ موجود نہیں (No Global Ads)
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'calculator' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] border shadow-xl space-y-8">
            <div className="flex items-center gap-4 border-b pb-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><Trophy className="w-8 h-8" /></div>
              <div>
                <h3 className="text-2xl font-black text-gray-800">منافع اور نقصان کیلکولیٹر</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Profit & Loss Analysis</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">کل ممبرز (Total Members)</label>
                  <input 
                    type="number" 
                    value={calcData.members} 
                    onChange={e => setCalcData({...calcData, members: +e.target.value})}
                    className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-lg transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">انویسٹمنٹ فی ممبر (Invest per Member)</label>
                  <input 
                    type="number" 
                    value={calcData.invest} 
                    onChange={e => setCalcData({...calcData, invest: +e.target.value})}
                    className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-lg transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">انعام کی رقم (Prize Amount)</label>
                  <input 
                    type="number" 
                    value={calcData.prize} 
                    onChange={e => setCalcData({...calcData, prize: +e.target.value})}
                    className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-lg transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">دیگر اخراجات / کمیشن (Expenses/Commission)</label>
                  <input 
                    type="number" 
                    value={calcData.expenses} 
                    onChange={e => setCalcData({...calcData, expenses: +e.target.value})}
                    className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-lg transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-[32px] border-2 border-dashed border-gray-200 space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase">کل جمع شدہ رقم (Total Collection)</span>
                    <span className="text-xl font-black text-blue-600">Rs. {calcData.members * calcData.invest}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase">کل ادائیگی (Total Payout)</span>
                    <span className="text-xl font-black text-red-500">Rs. {calcData.prize + calcData.expenses}</span>
                  </div>
                  <div className="pt-4 border-t-2 border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-black text-gray-800 uppercase">خالص منافع / نقصان (Net Profit/Loss)</span>
                      <span className={`text-3xl font-black ${(calcData.members * calcData.invest) - (calcData.prize + calcData.expenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Rs. {(calcData.members * calcData.invest) - (calcData.prize + calcData.expenses)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-[32px] border-2 flex items-center gap-4 ${(calcData.members * calcData.invest) - (calcData.prize + calcData.expenses) >= 0 ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                  {(calcData.members * calcData.invest) - (calcData.prize + calcData.expenses) >= 0 ? (
                    <>
                      <CheckCircle className="w-8 h-8 shrink-0" />
                      <p className="text-sm font-bold leading-relaxed">ماشاءاللہ! اس کارڈ کنفیگریشن پر آپ کو منافع ہوگا۔ آپ اسے لائیو کر سکتے ہیں۔</p>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-8 h-8 shrink-0" />
                      <p className="text-sm font-bold leading-relaxed">احتیاط! اس کنفیگریشن پر آپ کو نقصان ہو رہا ہے۔ براہ کرم ممبرز بڑھائیں یا انعام کم کریں۔</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'awaiting_tid' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border text-center shadow-sm">
            <div className="text-2xl font-black text-blue-600">
              {participants.filter(p => p.status === EntryStatus.AWAITING_TID).length}
            </div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">بغیر TID درخواستیں</div>
          </div>

          <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
            <div className="p-4 border-b flex flex-col md:flex-row gap-3 items-center justify-between">
              <h3 className="font-black text-gray-800">TID کا انتظار (Awaiting TID)</h3>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="تلاش کریں..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500/20" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                  <tr>
                    <th className="p-4">یوزر / نیٹ ورک</th>
                    <th className="p-4">کارڈ</th>
                    <th className="p-4">تاریخ</th>
                    <th className="p-4">اسٹیٹس</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {participants
                    .filter(p => p.status === EntryStatus.AWAITING_TID)
                    .filter(p => String(p.name || '').toLowerCase().includes(search.toLowerCase()) || String(p.phone || '').includes(search))
                    .map((p, i) => (
                    <tr key={`${p.id}-${i}`} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-black text-gray-900 text-sm">{p.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="text-green-600 font-bold text-[11px]">{p.phone}</div>
                          <span className="bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase">
                            {p.network}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-black text-gray-800">Rs. {tiers.find(t => t.id === p.categoryId)?.investAmount || '??'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-500 font-bold">{new Date(p.timestamp).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</div>
                      </td>
                      <td className="p-4">
                        <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full font-black text-[9px] uppercase">
                          Awaiting TID
                        </span>
                      </td>
                    </tr>
                  ))}
                  {participants.filter(p => p.status === EntryStatus.AWAITING_TID).length === 0 && (
                    <tr key="no-data">
                      <td colSpan={4} className="p-10 text-center text-gray-400 font-bold italic">کوئی ایسی درخواست نہیں ملی</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-white p-4 rounded-2xl border text-center shadow-sm">
              <div className="text-2xl font-black text-green-600">{participants.length}</div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ٹوٹل رجسٹرڈ</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border text-center shadow-sm">
              <div className="text-2xl font-black text-blue-600">Rs. {totalRevenue}</div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ٹوٹل آمدنی</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
            <div className="p-4 border-b flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex bg-gray-100 p-1 rounded-xl">
                {['ALL', EntryStatus.PENDING, EntryStatus.APPROVED, EntryStatus.REJECTED].map((f) => (
                  <button key={f} onClick={() => setUserFilter(f as any)} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${userFilter === f ? 'bg-white shadow-sm text-green-700' : 'text-gray-500'}`}>
                    {f === 'ALL' ? 'سب' : f}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="نام یا TID تلاش کریں..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500/20" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                  <tr>
                    <th className="p-4">یوزر / نیٹ ورک</th>
                    <th className="p-4">WhatsApp</th>
                    <th className="p-4">کارڈ / TID</th>
                    <th className="p-4">تاریخ</th>
                    <th className="p-4">ایکشن</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredParticipants.map((p, i) => (
                    <tr key={`${p.id}-${i}`} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-black text-gray-900 text-sm">{p.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="text-green-600 font-bold text-[11px]">{p.phone}</div>
                          <span className="bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase">
                            {p.network}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-500 font-bold">{p.whatsapp || '-'}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-black text-gray-800">Rs. {p.investAmount || tiers.find(t => t.id === p.categoryId)?.investAmount || '??'}</div>
                        <div className="text-gray-400 font-mono text-[10px]">{p.trackingId}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-500 font-bold">{new Date(p.timestamp).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</div>
                        <div className="text-[9px] text-gray-400">{new Date(p.timestamp).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button onClick={() => updateStatus(p.id, EntryStatus.APPROVED)} className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all"><CheckCircle className="w-4 h-4" /></button>
                          <button onClick={() => updateStatus(p.id, EntryStatus.REJECTED)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"><XCircle className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredParticipants.length === 0 && (
                    <tr key="no-data">
                      <td colSpan={4} className="p-10 text-center text-gray-400 font-bold italic">کوئی درخواست نہیں ملی</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tiers' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
            <h3 className="font-black flex items-center gap-2 text-green-700 border-b pb-3"><Plus className="w-5 h-5" /> نیا کارڈ شامل کریں</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">کارڈ کی قسم (Card Type)</label>
                <select value={newTier.cardType} className="w-full p-2 border rounded-xl text-sm" onChange={e => setNewTier({...newTier, cardType: e.target.value as any})}>
                  <option value="member-based">ممبر بیسڈ (Member Based)</option>
                  <option value="time-based">ٹائم بیسڈ (Time Based)</option>
                  <option value="custom-design">کسٹم ڈیزائن (Custom Design)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">کارڈ ڈیزائن (Card Design)</label>
                <select value={newTier.designVariant || 'default'} className="w-full p-2 border rounded-xl text-sm" onChange={e => setNewTier({...newTier, designVariant: e.target.value as any})}>
                  {DESIGN_VARIANTS.map(v => <option key={v} value={v}>{v.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">انویسٹمنٹ رقم</label>
                <input type="number" value={newTier.investAmount ?? 0} className="w-full p-2 border rounded-xl text-sm" onChange={e => setNewTier({...newTier, investAmount: +e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">انعام رقم</label>
                <input type="number" value={newTier.winAmount ?? 0} className="w-full p-2 border rounded-xl text-sm" onChange={e => setNewTier({...newTier, winAmount: +e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">ممبر لمٹ</label>
                <input type="number" value={newTier.membersNeeded ?? 0} className="w-full p-2 border rounded-xl text-sm" onChange={e => setNewTier({...newTier, membersNeeded: +e.target.value})} />
              </div>
              
              {newTier.cardType === 'TIME_BASED' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">قرعہ اندازی کی تاریخ (Draw Date)</label>
                  <input type="datetime-local" className="w-full p-2 border rounded-xl text-sm" onChange={e => setNewTier({...newTier, drawDate: new Date(e.target.value).getTime()})} />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">انوائٹ بونس (%)</label>
                <input type="number" value={newTier.bonusPercentage ?? 0} className="w-full p-2 border rounded-xl text-sm" onChange={e => setNewTier({...newTier, bonusPercentage: +e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">والٹ نمبر</label>
                <input type="text" value={newTier.qrData ?? ''} className="w-full p-2 border rounded-xl text-sm" onChange={e => setNewTier({...newTier, qrData: e.target.value})} />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">شرائط منتخب کریں (Select Terms)</label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 border rounded-xl">
                  {terms.map((term, idx) => (
                    <label key={`${term.id}-${idx}`} className="flex items-center gap-2 text-[10px] font-bold bg-gray-50 px-2 py-1 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input 
                        type="checkbox" 
                        checked={newTier.termsIds?.includes(term.id)} 
                        onChange={e => {
                          const current = newTier.termsIds || [];
                          const updated = e.target.checked ? [...current, term.id] : current.filter(id => id !== term.id);
                          setNewTier({...newTier, termsIds: updated});
                        }}
                      />
                      {term.text.substring(0, 20)}...
                    </label>
                  ))}
                  {terms.length === 0 && <span className="text-[10px] text-gray-400 italic">کوئی شرائط موجود نہیں</span>}
                </div>
              </div>

              {/* Live Calculation for New Tier */}
              <div className="col-span-2 md:col-span-4">
                {(() => {
                  const total = (newTier.investAmount || 0) * (newTier.membersNeeded || 0);
                  const profit = total - (newTier.winAmount || 0);
                  return (
                    <div className={`p-4 rounded-2xl border flex justify-between items-center shadow-sm ${profit >= 0 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">لائیو منافع/نقصان (Live P&L)</span>
                      </div>
                      <div className="text-lg font-black">
                        {profit >= 0 ? `منافع: Rs. ${profit}` : `نقصان: Rs. ${Math.abs(profit)}`}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="col-span-2 md:col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">کارڈ کا رنگ منتخب کریں (Select Card Color)</label>
                <div className="flex flex-wrap gap-2">
                  {CARD_COLORS.map(c => (
                    <button 
                      key={c.value} 
                      onClick={() => setNewTier({...newTier, color: c.value})}
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.value} border-2 ${newTier.color === c.value ? 'border-black scale-110' : 'border-transparent'}`}
                      title={c.name}
                    />
                  ))}
                  <div className="flex items-center gap-2 ml-2 border-l pl-2">
                    <input 
                      type="color" 
                      value={newTier.color?.startsWith('#') ? newTier.color : '#000000'} 
                      onChange={e => setNewTier({...newTier, color: e.target.value})}
                      className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 cursor-pointer"
                    />
                    <span className="text-[8px] font-black text-gray-400 uppercase">Custom</span>
                  </div>
                </div>
              </div>
              
              {newTier.cardType === 'CUSTOM_DESIGN' && (
                <div className="col-span-2 md:col-span-4 grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <label className="text-[10px] font-bold text-gray-400 uppercase">ٹیکسٹ کلر (Text Color)</label>
                     <input type="color" value={newTier.customTextColor || '#000000'} onChange={e => setNewTier({...newTier, customTextColor: e.target.value})} className="w-full h-10 rounded-xl cursor-pointer" />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] font-bold text-gray-400 uppercase">بیک گراؤنڈ امیج (BG Image URL)</label>
                     <input type="text" value={newTier.customBgImage || ''} onChange={e => setNewTier({...newTier, customBgImage: e.target.value})} className="w-full p-2 border rounded-xl text-sm" placeholder="https://..." />
                   </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 pt-2">
              <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 hover:bg-gray-100 transition-all">
                  {newTier.qrImage ? <img src={newTier.qrImage} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-300 w-8 h-8" />}
                </div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e)} />
              <button onClick={addTier} className="flex-grow py-4 bg-green-600 text-white rounded-2xl font-black shadow-lg shadow-green-100 hover:bg-green-700 active:scale-95 transition-all">کارڈ لائیو کریں</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tiers.map((t, idx) => (
              <div key={`${t.id}-${idx}`} className={`bg-white p-5 rounded-3xl border shadow-sm flex gap-4 hover:shadow-md transition-all ${t.isExpired ? 'opacity-50 grayscale' : ''}`}>
                <div 
                  className={`w-20 h-20 rounded-2xl border flex items-center justify-center overflow-hidden shrink-0 ${t.color?.startsWith('#') ? '' : `bg-gradient-to-br ${t.color || 'from-gray-100 to-gray-200'}`}`}
                  style={t.color?.startsWith('#') ? { background: `linear-gradient(135deg, ${t.color}, ${t.color}dd)` } : {}}
                >
                  {t.qrImage ? <img src={t.qrImage} className="w-full h-full object-cover" /> : <QrCode className="text-white/50" />}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start font-black">
                    <span className="text-xl text-gray-900">Rs. {t.investAmount} {t.isExpired && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase ml-2">Expired</span>}</span>
                    <div className="flex gap-1">
                      <button onClick={() => startEditTier(t)} className="p-2 text-blue-500 bg-blue-50 rounded-xl hover:bg-blue-500 hover:text-white transition-all"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => deleteTier(t.id)} className="p-2 text-red-500 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">انعام: Rs. {t.winAmount} | لمٹ: {t.membersNeeded}</div>
                  <div className="text-[10px] text-green-600 font-bold mt-1">والٹ: {t.qrData || 'N/A'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ads' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
            <h3 className="font-black border-b pb-3">نئی سروس / اشتہار شامل کریں</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Title (Urdu)" className="p-3 bg-gray-50 border rounded-xl text-sm" value={newAd.titleUr || ''} onChange={e => setNewAd({...newAd, titleUr: e.target.value})} />
              <input type="text" placeholder="Title (English)" className="p-3 bg-gray-50 border rounded-xl text-sm" value={newAd.titleEn || ''} onChange={e => setNewAd({...newAd, titleEn: e.target.value})} />
              
              <input type="text" placeholder="Description (Urdu)" className="p-3 bg-gray-50 border rounded-xl text-sm" value={newAd.descriptionUr || ''} onChange={e => setNewAd({...newAd, descriptionUr: e.target.value})} />
              <input type="text" placeholder="Description (English)" className="p-3 bg-gray-50 border rounded-xl text-sm" value={newAd.descriptionEn || ''} onChange={e => setNewAd({...newAd, descriptionEn: e.target.value})} />

              <input type="text" placeholder="Link URL" className="p-3 bg-gray-50 border rounded-xl text-sm" value={newAd.linkUrl || ''} onChange={e => setNewAd({...newAd, linkUrl: e.target.value})} />
              
              <div className="flex gap-2">
                {!isCustomCategory ? (
                  <select className="p-3 bg-gray-50 border rounded-xl text-sm w-full" value={newAd.category} onChange={e => {
                    if (e.target.value === 'CUSTOM') setIsCustomCategory(true);
                    else setNewAd({...newAd, category: e.target.value});
                  }}>
                    <option value="General">General</option>
                    <option value="Investment">Investment</option>
                    <option value="Education">Education</option>
                    <option value="Health">Health</option>
                    {Array.from(new Set(ads.map(a => a.category))).filter((c: string) => !['General', 'Investment', 'Education', 'Health'].includes(c)).map((c: string) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="CUSTOM">+ Add New Category</option>
                  </select>
                ) : (
                  <div className="flex gap-2 w-full">
                    <input type="text" placeholder="New Category Name" className="p-3 bg-gray-50 border rounded-xl text-sm w-full" value={customCategory} onChange={e => setCustomCategory(e.target.value)} />
                    <button onClick={() => { setNewAd({...newAd, category: customCategory}); setIsCustomCategory(false); }} className="p-2 bg-green-600 text-white rounded-xl"><CheckCircle className="w-4 h-4" /></button>
                    <button onClick={() => setIsCustomCategory(false)} className="p-2 bg-gray-200 rounded-xl"><X className="w-4 h-4" /></button>
                  </div>
                )}
              </div>

              <input type="text" placeholder="Image URL (or select below)" className="p-3 bg-gray-50 border rounded-xl text-sm" value={newAd.imageUrl || ''} onChange={e => setNewAd({...newAd, imageUrl: e.target.value})} />
            </div>
            
            {/* Image Presets */}
            <div className="flex gap-2 overflow-x-auto pb-2 items-center">
              <div className="relative cursor-pointer shrink-0" onClick={() => document.getElementById('ad-image-upload')?.click()}>
                <div className="w-10 h-10 rounded-lg border-2 border-dashed border-blue-300 flex items-center justify-center bg-blue-50 hover:bg-blue-100">
                  <Plus className="w-4 h-4 text-blue-500" />
                </div>
                <input 
                  type="file" 
                  id="ad-image-upload" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const img = new Image();
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          const MAX_SIZE = 600; // Smaller for ads
                          let width = img.width;
                          let height = img.height;
                          if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } 
                          else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
                          canvas.width = width;
                          canvas.height = height;
                          const ctx = canvas.getContext('2d');
                          ctx?.drawImage(img, 0, 0, width, height);
                          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                          setNewAd({...newAd, imageUrl: dataUrl});
                        };
                        img.src = event.target?.result as string;
                      };
                      reader.readAsDataURL(file);
                    }
                  }} 
                />
              </div>
              {['https://cdn-icons-png.flaticon.com/512/2910/2910761.png', 'https://cdn-icons-png.flaticon.com/512/2910/2910791.png', 'https://cdn-icons-png.flaticon.com/512/2910/2910768.png'].map(url => (
                  <img key={url} src={url} className="w-10 h-10 rounded-lg cursor-pointer border hover:border-blue-500" onClick={() => setNewAd({...newAd, imageUrl: url})} />
              ))}
            </div>

            <button 
              onClick={() => {
                if (newAd.titleUr && newAd.linkUrl) {
                  setAds(prev => [...prev, { ...newAd, id: Date.now().toString(), active: true } as AdService]);
                  setNewAd({ titleUr: '', titleEn: '', linkUrl: '', category: 'General', active: true });
                  setCustomCategory('');
                }
              }}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
            >
              ایڈ شامل کریں
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ads.map((ad, idx) => (
              <div key={`${ad.id}-${idx}`} className={`bg-white p-4 rounded-2xl border shadow-sm space-y-3 ${!ad.active ? 'opacity-50 grayscale' : ''}`}>
                {ad.imageUrl && <img src={ad.imageUrl} className="w-full h-24 object-cover rounded-xl" />}
                <div className="font-black text-sm">{ad.titleUr} / {ad.titleEn}</div>
                <div className="text-[10px] text-gray-400 truncate">{ad.linkUrl}</div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{ad.category}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setAds(prev => prev.map(a => a.id === ad.id ? { ...a, active: !a.active } : a))} className={`p-2 rounded-lg ${ad.active ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                        {ad.active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setAds(prev => prev.filter(a => a.id !== ad.id))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'terms' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
            <h3 className="font-black border-b pb-3">نئی شرط شامل کریں (Add Term)</h3>
            <div className="space-y-3">
              <textarea placeholder="اردو میں لکھیں..." className="w-full p-4 bg-gray-50 border rounded-2xl text-sm" rows={2} value={newTerm.text || ''} onChange={e => setNewTerm({...newTerm, text: e.target.value})} />
              <textarea placeholder="Write in English..." className="w-full p-4 bg-gray-50 border rounded-2xl text-sm" rows={2} value={newTerm.textEn || ''} onChange={e => setNewTerm({...newTerm, textEn: e.target.value})} />
            </div>
            <button 
              onClick={() => {
                if (newTerm.text) {
                  setTerms(prev => [...prev, { ...newTerm, id: Date.now().toString() } as TermCondition]);
                  setNewTerm({ text: '', textEn: '' });
                }
              }}
              className="w-full py-4 bg-green-600 text-white rounded-2xl font-black shadow-lg shadow-green-100 hover:bg-green-700 transition-all"
            >
              شرط شامل کریں
            </button>
          </div>
          <div className="bg-white rounded-3xl border overflow-hidden shadow-sm divide-y">
            {terms.map((term, idx) => (
              <div key={`${term.id}-${idx}`} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-all">
                <div className="space-y-1">
                  <div className="text-xs font-black text-gray-800">{idx + 1}. {term.text}</div>
                  <div className="text-[10px] text-gray-400">{term.textEn}</div>
                </div>
                <button onClick={() => setTerms(prev => prev.filter(t => t.id !== term.id))} className="p-2 text-red-400 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {terms.length === 0 && <div className="p-10 text-center text-gray-300 italic">کوئی شرائط موجود نہیں</div>}
          </div>
        </div>
      )}

      {activeTab === 'announcement' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
            <h3 className="font-black border-b pb-3">نیا نوٹیفکیشن جاری کریں</h3>
            <div className="space-y-3">
              <textarea className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-yellow-500/20" value={newAnn.text} onChange={e => setNewAnn({...newAnn, text: e.target.value})} placeholder="اردو میسج لکھیں..." rows={2} />
              <textarea className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-yellow-500/20" value={newAnn.textEn} onChange={e => setNewAnn({...newAnn, textEn: e.target.value})} placeholder="English Message..." rows={2} />
            </div>
            <button onClick={addAnnouncement} className="w-full py-4 bg-yellow-600 text-white rounded-2xl font-black shadow-lg shadow-yellow-100 hover:bg-yellow-700 transition-all">پٹی میں شامل کریں</button>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
             <div className="flex items-center justify-between border-b pb-3">
               <h3 className="font-black text-blue-600 flex items-center gap-2"><FastForward className="w-5 h-5" /> رفتار اور پوز (Settings)</h3>
               <button onClick={() => setMarqueePaused(!marqueePaused)} className={`px-5 py-2 rounded-full text-white font-black text-xs flex items-center gap-2 transition-all active:scale-95 ${marqueePaused ? 'bg-green-600 shadow-green-100 shadow-lg' : 'bg-red-600 shadow-red-100 shadow-lg'}`}>
                 {marqueePaused ? <><Play className="w-3.5 h-3.5" /> Resume</> : <><Pause className="w-3.5 h-3.5" /> Pause</>}
               </button>
             </div>
             <div className="flex items-center gap-4">
               <span className="text-[10px] font-black text-gray-400">تیز</span>
               <input type="range" min="5" max="60" value={marqueeSpeed} onChange={e => setMarqueeSpeed(Number(e.target.value))} className="flex-grow h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
               <span className="text-[10px] font-black text-gray-400">آہستہ</span>
             </div>
             <p className="text-[10px] text-gray-400 text-center font-bold">موجودہ سپیڈ: {marqueeSpeed} سیکنڈز</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
            <h3 className="font-black border-b pb-3">ایڈمن سیٹنگز (Admin Settings)</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">بغیر پاسورڈ لاگ ان بٹن دکھائیں (Show No Password Login)</span>
              <button 
                onClick={() => {
                  const current = localStorage.getItem('showNoPassLogin') === 'true';
                  localStorage.setItem('showNoPassLogin', (!current).toString());
                  // Force re-render (simple way)
                  window.location.reload();
                }}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all ${localStorage.getItem('showNoPassLogin') === 'true' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}
              >
                {localStorage.getItem('showNoPassLogin') === 'true' ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-xs font-bold text-gray-700">گوگل شیٹ کنکشن ٹیسٹ (Test Google Sheet)</span>
              <div className="flex gap-2">
                <button 
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/debug-auth');
                      const text = await res.text();
                      try {
                        const data = JSON.parse(text);
                        if (data.success) {
                          alert('کنکشن کامیاب! (Connection Successful)\nSheet Title: ' + data.sheetTitle);
                        } else {
                          alert('کنکشن فیل (Connection Failed):\n' + data.message + '\nError: ' + data.error);
                        }
                      } catch (e) {
                        console.error("Debug Auth Error:", text);
                        alert('سرور ایرر (Server Error):\n' + text.substring(0, 300));
                      }
                    } catch (err) {
                      alert('ایرر: نیٹ ورک کنکشن فیل ہو گیا۔');
                    }
                  }}
                  className="px-3 py-2 rounded-full text-[10px] font-black uppercase bg-purple-600 text-white hover:bg-purple-700 transition-all"
                >
                  ڈیبگ (Debug)
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border overflow-hidden shadow-sm divide-y divide-gray-100">
            <div className="p-4 bg-gray-50 text-[10px] font-black text-gray-400 uppercase">موجودہ لسٹ</div>
            {announcements.map((ann, idx) => (
              <div key={`${ann.id}-${idx}`} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div className="space-y-1">
                  <div className="text-sm font-black text-gray-800">{ann.text}</div>
                  <div className="text-[10px] text-gray-400">{ann.textEn}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => toggleAnnouncement(ann.id)} className={`p-2 rounded-xl transition-all ${ann.active ? 'text-green-500 bg-green-50 hover:bg-green-500 hover:text-white' : 'text-gray-400 bg-gray-50 hover:bg-gray-400 hover:text-white'}`}>
                    {ann.active ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </button>
                  <button onClick={() => deleteAnnouncement(ann.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <div className="p-10 text-center text-gray-300 italic text-sm">کوئی نوٹیفکیشن موجود نہیں ہے</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiers.map((t, idx) => {
              const approvedCount = participants.filter(p => p.categoryId === t.id && p.status === EntryStatus.APPROVED).length;
              const totalCount = approvedCount + (t.currentMembers || 0);
              const progress = Math.min((totalCount / t.membersNeeded) * 100, 100);
              const revenue = approvedCount * t.investAmount;

              return (
                <div key={`${t.id}-${idx}`} className="bg-white p-6 rounded-[32px] border shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div 
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black ${t.color?.startsWith('#') ? '' : `bg-gradient-to-br ${t.color || 'from-gray-100 to-gray-200'}`}`}
                      style={t.color?.startsWith('#') ? { background: `linear-gradient(135deg, ${t.color}, ${t.color}dd)` } : {}}
                    >
                      {t.investAmount}
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400 font-black uppercase">کل آمدنی</div>
                      <div className="text-lg font-black text-green-600">Rs. {revenue}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase">
                      <span className="text-gray-400">ممبرز (Members)</span>
                      <span className="text-gray-900">{totalCount} / {t.membersNeeded}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <div className="text-center">
                      <div className="text-[8px] text-gray-400 font-black uppercase">باقی ممبرز</div>
                      <div className="text-sm font-black text-gray-800">{Math.max(0, t.membersNeeded - totalCount)}</div>
                    </div>
                    <div className="text-center border-l">
                      <div className="text-[8px] text-gray-400 font-black uppercase">اسٹیٹس</div>
                      <div className={`text-sm font-black ${progress >= 100 ? 'text-red-600' : 'text-green-600'}`}>
                        {progress >= 100 ? 'مکمل' : 'جاری'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tiers.filter(t => {
              const approvedCount = participants.filter(p => p.categoryId === t.id && p.status === EntryStatus.APPROVED).length;
              return (approvedCount + (t.currentMembers || 0)) >= t.membersNeeded;
            }).map((t, idx) => (
              <div key={`${t.id}-${idx}`} className="bg-white p-6 rounded-[32px] border shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div 
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl ${t.color?.startsWith('#') ? '' : `bg-gradient-to-br ${t.color || 'from-green-600 to-green-900'}`}`}
                    style={t.color?.startsWith('#') ? { background: `linear-gradient(135deg, ${t.color}, ${t.color}dd)` } : {}}
                  >
                    {t.investAmount}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900">Rs. {t.investAmount} Card</h4>
                    <p className="text-xs text-gray-400 font-bold">Draw Amount: Rs. {t.winAmount}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onStartDraw(t)}
                  className="px-6 py-3 bg-green-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-green-100 hover:bg-green-700 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4" /> Start Draw
                </button>
              </div>
            ))}
            {tiers.filter(t => {
              const approvedCount = participants.filter(p => p.categoryId === t.id && p.status === EntryStatus.APPROVED).length;
              return (approvedCount + (t.currentMembers || 0)) >= t.membersNeeded;
            }).length === 0 && (
              <div className="col-span-full p-20 text-center text-gray-300 italic">کوئی مکمل کارڈ نہیں ملا</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-[32px] border shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Settings className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="text-xl font-black text-gray-900 nastaliq">ایڈمن سیٹنگز (Admin Settings)</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-2xl border space-y-4">
               <h4 className="font-bold text-sm text-gray-700">ایڈمن یوزر نیم اور پاسورڈ تبدیل کریں (Change Credentials)</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <input 
                   type="text" 
                   placeholder="نیا یوزر نیم" 
                   id="new-admin-user"
                   className="p-3 bg-white border rounded-xl text-sm font-bold outline-none focus:border-green-500"
                 />
                 <input 
                   type="text" 
                   placeholder="نیا پاسورڈ" 
                   id="new-admin-pass"
                   className="p-3 bg-white border rounded-xl text-sm font-bold outline-none focus:border-green-500"
                 />
               </div>
               <button 
                 onClick={async () => {
                    const user = (document.getElementById('new-admin-user') as HTMLInputElement).value;
                    const pass = (document.getElementById('new-admin-pass') as HTMLInputElement).value;
                    if(!user || !pass) return alert('برائے مہربانی دونوں فیلڈز پُر کریں');
                    
                    try {
                        const res = await fetch('/api/admin/update-credentials', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ newUsername: user, newPassword: pass })
                        });
                        const data = await res.json();
                        if(data.status === 'success') alert('کریڈینشلز اپ ڈیٹ ہو گئے!');
                        else alert('Error: ' + data.message);
                    } catch(e) {
                        alert('نیٹ ورک ایرر');
                    }
                 }}
                 className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold text-xs shadow-lg hover:bg-green-700 active:scale-95 transition-all"
               >
                 کریڈینشلز اپ ڈیٹ کریں
               </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border space-y-4">
               <h4 className="font-bold text-sm text-gray-700">لوگو لانگ پریس دورانیہ (سیکنڈز)</h4>
               <div className="flex items-center gap-4">
                 <input 
                   type="number" 
                   defaultValue={localStorage.getItem('admin_long_press_duration') || 3}
                   id="long-press-duration"
                   className="p-3 bg-white border rounded-xl text-sm font-bold outline-none focus:border-green-500 w-24 text-center"
                 />
                 <button 
                   onClick={() => {
                      const dur = (document.getElementById('long-press-duration') as HTMLInputElement).value;
                      localStorage.setItem('admin_long_press_duration', dur);
                      alert('دورانیہ محفوظ ہو گیا! (اپلائی کرنے کے لیے پیج ریفریش کریں)');
                   }}
                   className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
                 >
                   محفوظ کریں
                 </button>
               </div>
               <p className="text-[10px] text-gray-400">یہ سیٹنگ فی الحال آپ کے براؤزر میں محفوظ ہوگی۔</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
