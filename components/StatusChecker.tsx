
import React, { useState } from 'react';
import { Search, XCircle, LogIn, Key, Globe, ArrowLeft, Users, Share2, ClipboardCheck, ExternalLink, ShieldCheck, Facebook, Twitter, Link, Sparkles, Info } from 'lucide-react';
import { Participant, EntryStatus, Language, InvestmentOption } from '../types';
import { TRANSLATIONS, NETWORKS } from '../constants';

interface Props {
  participants: Participant[];
  tiers: InvestmentOption[];
  lang: Language;
  onBack: () => void;
  updateTID: (id: string, tid: string) => void;
  handleGlobalAdClick: (triggerId: string, defaultAction: () => void) => void;
}

const StatusChecker: React.FC<Props> = ({ participants, tiers, lang, onBack, updateTID, handleGlobalAdClick }) => {
  const t = TRANSLATIONS[lang];
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [network, setNetwork] = useState('');
  const [userEntries, setUserEntries] = useState<Participant[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [editingTID, setEditingTID] = useState<{ id: string, tid: string } | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleGlobalAdClick('status_check_btn', () => {
      const found = participants.filter(p => 
        p.phone === phone.trim() && 
        p.name.toLowerCase().trim() === name.toLowerCase().trim()
      );
      setUserEntries(found.length > 0 ? found : null);
      setHasSearched(true);
    });
  };

  const getSecretToken = (p: Participant) => {
    return p.secretToken || '-----';
  };

  const handleTIDSubmit = (id: string) => {
    if (!editingTID?.tid.trim()) return;
    
    const isTIDDuplicate = participants.some(p => p.trackingId === editingTID.tid.trim());
    if (isTIDDuplicate) {
      alert(t.duplicateTIDError);
      return;
    }

    updateTID(id, editingTID.tid.trim());
    setEditingTID(null);
    // Update local state to show the change immediately
    setUserEntries(prev => prev ? prev.map(p => p.id === id ? { ...p, trackingId: editingTID.tid, status: EntryStatus.PENDING } : p) : null);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(lang === 'ur' ? 'ٹوکن کاپی ہو گیا!' : 'Token Copied!');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 px-2 pb-20">
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border">
        <button 
          onClick={() => handleGlobalAdClick('status_back_btn', onBack)} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className={`w-5 h-5 ${lang === 'ur' ? 'rotate-180' : ''}`} />
        </button>
        <div className={`flex-grow ${lang === 'ur' ? 'text-right' : 'text-left'}`}>
          <h2 className="text-xl font-black text-gray-900 nastaliq leading-none">{t.statusTitle}</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.statusSub}</p>
        </div>
      </div>

      {!hasSearched ? (
        <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-100">
          <form onSubmit={handleSearch} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase px-1">{t.nameLabel}</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Ali Ahmed" 
                className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-bold text-gray-700" 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase px-1">{t.phoneLabel}</label>
                <input 
                  type="tel" 
                  required 
                  placeholder="03001234567" 
                  maxLength={11} 
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-bold text-gray-700" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase px-1">{t.networkLabel}</label>
                <select 
                  required 
                  value={network} 
                  onChange={e => setNetwork(e.target.value)} 
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-bold text-gray-700"
                >
                  <option value="">-- سلیکٹ --</option>
                  {NETWORKS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            
            <button type="submit" className="w-full py-4 bg-green-600 text-white rounded-2xl font-black shadow-lg shadow-green-100 hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <Search className="w-5 h-5" />
              {t.searchBtn}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {userEntries ? (
            <div className="space-y-6">
              <div className="bg-green-600 text-white p-6 rounded-[32px] shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black nastaliq">{lang === 'ur' ? `خوش آمدید، ${name}!` : `Welcome back, ${name}!`}</h3>
                    <p className="text-xs opacity-80 font-bold">{t.loginSuccess}</p>
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
              </div>

              <div className="space-y-4">
                {userEntries.map((entry, index) => {
                  const tier = tiers.find(t => t.id === entry.categoryId);
                  const tierApprovedParticipants = participants.filter(p => p.categoryId === entry.categoryId && p.status === EntryStatus.APPROVED).length;
                  const totalMembers = tierApprovedParticipants + (tier?.currentMembers || 0);
                  const needed = tier?.membersNeeded || 1;
                  const progress = Math.min((totalMembers / needed) * 100, 100);
                  
                  const bonusAmount = tier?.bonusPercentage ? (tier.winAmount * tier.bonusPercentage / 100) : 0;

                  return (
                    <div key={`${entry.id}-${index}`} className="bg-white border border-gray-100 p-5 rounded-[28px] shadow-sm space-y-4 relative overflow-hidden group">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{lang === 'ur' ? 'انٹری نمبر' : 'Entry'} #{index + 1}</span>
                          <h4 className="text-lg font-black text-gray-800">Card Rs. {tier?.investAmount} <span className="text-gray-300 font-normal">|</span> <span className="font-mono text-sm">TID: {entry.trackingId || '---'}</span></h4>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-sm ${
                          entry.status === EntryStatus.APPROVED ? 'bg-green-100 text-green-700' : 
                          entry.status === EntryStatus.REJECTED ? 'bg-red-100 text-red-700' : 
                          entry.status === EntryStatus.AWAITING_TID ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {entry.status === EntryStatus.APPROVED ? t.approvedMsg : 
                           entry.status === EntryStatus.REJECTED ? t.rejectedMsg : 
                           entry.status === EntryStatus.AWAITING_TID ? (lang === 'ur' ? 'TID درکار ہے' : 'TID Required') :
                           t.pendingMsg}
                        </div>
                      </div>

                      {/* Bonus Info */}
                      {entry.status === EntryStatus.APPROVED && tier?.bonusPercentage && (
                        <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-yellow-600" />
                            <div className="text-[10px] font-black text-yellow-800 uppercase">
                              {lang === 'ur' ? 'انوائٹ بونس' : 'Invite Bonus'} ({tier.bonusPercentage}%)
                            </div>
                          </div>
                          <div className="text-xs font-black text-yellow-900">Rs. {bonusAmount}</div>
                        </div>
                      )}

                      {/* Status Specific Message */}
                      <div className={`p-3 rounded-2xl text-[11px] font-bold leading-relaxed border ${
                        entry.status === EntryStatus.PENDING ? 'bg-yellow-50/50 border-yellow-100 text-yellow-800' :
                        entry.status === EntryStatus.APPROVED ? 'bg-green-50/50 border-green-100 text-green-800' :
                        entry.status === EntryStatus.AWAITING_TID ? 'bg-blue-50/50 border-blue-100 text-blue-800' :
                        'bg-red-50/50 border-red-100 text-red-800'
                      }`}>
                        {entry.status === EntryStatus.PENDING && t.pendingDetail}
                        {entry.status === EntryStatus.AWAITING_TID && (
                          <div className="space-y-3">
                            <p>{t.awaitingTIDDetail}</p>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Enter TID here" 
                                className="flex-grow p-2 bg-white border rounded-xl text-xs outline-none focus:border-blue-500"
                                value={editingTID?.id === entry.id ? editingTID.tid : ''}
                                onChange={e => setEditingTID({ id: entry.id, tid: e.target.value })}
                              />
                              <button 
                                onClick={() => handleTIDSubmit(entry.id)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black"
                              >
                                Submit
                              </button>
                            </div>
                          </div>
                        )}
                        {entry.status === EntryStatus.APPROVED && (lang === 'ur' ? 'مبارک ہو! آپ کی درخواست منظور ہو چکی ہے۔ اب قرعہ اندازی کا انتظار کریں۔' : 'Congratulations! Your application is approved. Wait for the lucky draw.')}
                        {entry.status === EntryStatus.REJECTED && (lang === 'ur' ? 'معذرت! آپ کی درخواست مسترد کر دی گئی ہے۔ براہ کرم صحیح TID کے ساتھ دوبارہ کوشش کریں۔' : 'Sorry! Your request was rejected. Please try again with a valid TID.')}
                      </div>

                      {/* Member Progress Section */}
                      <div className="space-y-2 pt-2 border-t border-gray-50">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase">
                          <span className="flex items-center gap-1.5 text-gray-500"><Users className="w-3.5 h-3.5" /> Members Progress</span>
                          <span className="text-green-600">{totalMembers} / {needed}</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border p-0.5">
                          <div 
                            className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold italic text-center">
                          {lang === 'ur' 
                            ? `صرف ${needed - totalMembers} ممبرز باقی ہیں! اسے شیئر کریں تاکہ قرعہ اندازی جلدی ہو۔` 
                            : `Only ${needed - totalMembers} members left! Share to speed up the draw.`}
                        </p>
                      </div>

                      {/* Invite Button for Approved */}
                      {entry.status === EntryStatus.APPROVED && (
                        <button 
                          onClick={() => {
                            const shareMsg = `${t.heroTitle}\nI invited you to join this card!\nInvest Rs. ${tier?.investAmount} & Win Rs. ${tier?.winAmount}!\nJoin here: ${window.location.origin}?card=${tier?.id}&ref=${encodeURIComponent(entry.name)}`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(shareMsg)}`, '_blank');
                          }}
                          className="w-full py-3 bg-blue-600 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-100 active:scale-95 transition-all"
                        >
                          <Share2 className="w-4 h-4" />
                          {lang === 'ur' ? 'دوستوں کو انوائٹ کریں اور بونس جیتیں' : 'Invite Friends & Win Bonus'}
                        </button>
                      )}

                      {/* Approved Token Section */}
                      {entry.status === EntryStatus.APPROVED && (
                        <div className="bg-gray-900 text-white p-5 rounded-[24px] space-y-4 shadow-xl border-t-4 border-green-500">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-black uppercase tracking-widest text-green-400 flex items-center gap-2">
                              <Key className="w-4 h-4" /> {t.tokenTitle}
                            </h5>
                            <div className="bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded-md animate-pulse uppercase">
                              {lang === 'ur' ? 'صرف ایک بار' : 'Only Once'}
                            </div>
                            <button onClick={() => handleCopy(getSecretToken(entry))} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all">
                              <ClipboardCheck className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="bg-white/10 p-4 rounded-xl text-center border border-white/10 backdrop-blur-sm">
                            <span className="font-mono text-3xl font-black tracking-[0.3em]">{getSecretToken(entry)}</span>
                          </div>
                          <div className="space-y-3">
                            <p className="text-[10px] font-bold text-gray-300 leading-relaxed italic">{t.tokenDesc}</p>
                            <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/20 flex gap-3 items-start">
                              <ExternalLink className="w-4 h-4 text-green-400 shrink-0" />
                              <p className="text-[10px] text-green-300 font-black">
                                {lang === 'ur' 
                                  ? 'ممبرز مکمل ہونے پر آپ کو ایک لنک دیا جائے گا جس پر یہ ٹوکن لگا کر آپ رزلٹ دیکھ سکیں گے۔ لائیو قرعہ اندازی سب کے سامنے ہوگی!' 
                                  : 'When members are full, you will receive a link where you can enter this token to check results. Live draw will be public!'}
                              </p>
                            </div>
                            
                            {/* Winner Process Info */}
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
                              <h6 className="text-[10px] font-black text-yellow-400 uppercase flex items-center gap-2">
                                <Info className="w-3.5 h-3.5" />
                                {lang === 'ur' ? 'جیتنے کے بعد کیا ہوگا؟' : 'What happens after winning?'}
                              </h6>
                              <ul className="text-[9px] text-gray-300 font-bold space-y-1.5 list-disc list-inside">
                                <li>{lang === 'ur' ? 'قرعہ اندازی یوٹیوب لائیو پر ہوگی۔' : 'Draw will be held on YouTube Live.'}</li>
                                <li>{lang === 'ur' ? 'جیتنے والے سے اس کے فون نمبر پر رابطہ کیا جائے گا۔' : 'Winner will be contacted via phone number.'}</li>
                                <li>{lang === 'ur' ? 'تصدیق کے بعد انعام کی رقم منتقل کر دی جائے گی۔' : 'Prize money will be transferred after verification.'}</li>
                                <li>{lang === 'ur' ? 'جیتنے والے کا نام رزلٹ پورٹل پر بھی آئے گا۔' : 'Winner name will be displayed on Result Portal.'}</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="bg-blue-600 text-white p-6 rounded-[32px] shadow-lg space-y-4">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-white/20 rounded-xl"><Share2 className="w-6 h-6" /></div>
                   <h4 className="font-black nastaliq text-lg">{lang === 'ur' ? 'قرعہ اندازی قریب ہے!' : 'Draw is Near!'}</h4>
                 </div>
                 <p className="text-[11px] font-bold leading-relaxed opacity-90">{t.shareText}</p>
                 
                 <div className="grid grid-cols-2 gap-2">
                   <button 
                    onClick={() => {
                      const text = `${t.heroTitle}\nInvest Rs. ${tiers[0]?.investAmount} & Win Rs. ${tiers[0]?.winAmount}!\nJoin here: ${window.location.origin}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white rounded-xl font-black text-[10px] shadow-md active:scale-95 transition-all"
                   >
                     WhatsApp
                   </button>
                   <button 
                    onClick={() => {
                      const url = window.location.origin;
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                    }}
                    className="flex items-center justify-center gap-2 py-3 bg-[#1877F2] text-white rounded-xl font-black text-[10px] shadow-md active:scale-95 transition-all"
                   >
                     <Facebook className="w-3.5 h-3.5" /> Facebook
                   </button>
                   <button 
                    onClick={() => {
                      const text = t.heroTitle;
                      const url = window.location.origin;
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                    }}
                    className="flex items-center justify-center gap-2 py-3 bg-[#1DA1F2] text-white rounded-xl font-black text-[10px] shadow-md active:scale-95 transition-all"
                   >
                     <Twitter className="w-3.5 h-3.5" /> Twitter
                   </button>
                   <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin);
                      alert(lang === 'ur' ? 'لنک کاپی ہو گیا!' : 'Link Copied!');
                    }}
                    className="flex items-center justify-center gap-2 py-3 bg-white text-gray-700 rounded-xl font-black text-[10px] shadow-md active:scale-95 transition-all"
                   >
                     <Link className="w-3.5 h-3.5" /> Copy Link
                   </button>
                 </div>
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={() => setHasSearched(false)} className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm border-2 border-transparent hover:border-gray-200 transition-all">
                  {lang === 'ur' ? 'کسی اور نمبر سے چیک کریں' : 'Check Another Number'}
                </button>
                <button onClick={onBack} className="w-full py-4 bg-white text-green-600 rounded-2xl font-black text-sm border-2 border-green-600 shadow-sm hover:bg-green-50 transition-all">
                  {lang === 'ur' ? 'ایک اور کارڈ میں حصہ لیں' : 'Join Another Card'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-10 rounded-[40px] shadow-xl text-center space-y-6 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-800 nastaliq">{t.noRecord}</h3>
                <p className="text-xs text-gray-400 font-bold px-6">{lang === 'ur' ? 'ہمیں آپ کی فراہم کردہ معلومات کے مطابق کوئی انٹری نہیں ملی۔ براہ کرم سپیلنگ اور نمبر چیک کریں۔' : 'No entry found matching your details. Please check spelling and number.'}</p>
              </div>
              <button onClick={() => setHasSearched(false)} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-100 hover:bg-red-700 transition-all">
                {lang === 'ur' ? 'دوبارہ کوشش کریں' : 'Try Again'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatusChecker;
