
import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, QrCode, ClipboardCopy, ArrowLeft, Globe, Check, Trophy, AlertTriangle, Download, Sparkles, Facebook, Twitter, Link, Users, ShieldCheck, Info, Key, ArrowRight } from 'lucide-react';
import { InvestmentOption, Participant, EntryStatus, Language, TermCondition } from '../types';
import { NETWORKS, TRANSLATIONS } from '../constants';

interface Props {
  tier: InvestmentOption;
  onClose: () => void;
  onRegister: (p: Participant) => void;
  lang: Language;
  onToggleLang: () => void;
  existingParticipants: Participant[];
  allTerms: TermCondition[];
}

const RegistrationForm: React.FC<Props> = ({ tier, onClose, onRegister, lang, onToggleLang, existingParticipants, allTerms }) => {
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const t = TRANSLATIONS[lang] as any;
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    network: '', 
    secondaryPhone: '',
    secondaryNetwork: '',
    whatsapp: '', // Optional WhatsApp
    trackingId: '',
    agreements: [false, false, false],
    acceptedTerms: false
  });

  const tierTerms = allTerms.filter(term => tier.termsIds?.includes(term.id));

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateInfo = () => {
    const newErrors: Record<string, string> = {};
    const hasUrdu = /[\u0600-\u06FF]/.test(formData.name);
    if (hasUrdu) {
      alert(t.urduNameError);
      newErrors.name = t.urduNameError;
      return false;
    }
    if (formData.name.trim().length < 3) newErrors.name = lang === 'ur' ? 'مکمل نام لکھیں' : 'Enter full name';
    if (!/^03\d{9}$/.test(formData.phone)) newErrors.phone = lang === 'ur' ? 'درست نمبر لکھیں' : 'Enter valid number';
    if (!formData.network) newErrors.network = lang === 'ur' ? 'نیٹ ورک سلیکٹ کریں' : 'Select network';
    if (!formData.acceptedTerms) newErrors.terms = lang === 'ur' ? 'شرائط قبول کریں' : 'Accept terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
      return;
    }
    if (step === 1) {
      if (validateInfo()) setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }
  };

  const handleBack = () => {
    if (step === 0) onClose();
    else setStep((step - 1) as any);
  };

  const handleFinish = (skipTID: boolean = false) => {
    if (!skipTID && !formData.trackingId.trim()) {
      setErrors({ trackingId: lang === 'ur' ? 'TID ضروری ہے' : 'TID required' });
      return;
    }

    if (!skipTID && formData.trackingId.trim()) {
      const isTIDDuplicate = existingParticipants.some(p => p.trackingId === formData.trackingId.trim());
      if (isTIDDuplicate) {
        alert(t.duplicateTIDError);
        setErrors({ trackingId: t.duplicateTIDError });
        return;
      }
    }

    const newParticipant: Participant = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      phone: formData.phone,
      network: formData.network,
      secondaryPhone: formData.secondaryPhone,
      secondaryNetwork: formData.secondaryNetwork,
      whatsapp: formData.whatsapp,
      categoryId: tier.id,
      investAmount: tier.investAmount,
      trackingId: skipTID ? '' : formData.trackingId,
      status: skipTID ? EntryStatus.AWAITING_TID : EntryStatus.PENDING,
      timestamp: Number(Date.now()),
      referredBy: localStorage.getItem('luckwin_ref') || undefined
    };
    onRegister(newParticipant);
    localStorage.removeItem('luckwin_ref'); // Clear after use
    setStep(4);
  };

  const toggleAgreement = (idx: number) => {
    const newAgreements = [...formData.agreements];
    newAgreements[idx] = !newAgreements[idx];
    setFormData({ ...formData, agreements: newAgreements });
  };

  const handleDownloadQR = () => {
    if (!tier.qrImage) return;
    const link = document.createElement('a');
    link.href = tier.qrImage;
    link.download = `LuckWin_QR_Rs${tier.investAmount}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-3 overflow-y-auto">
      <div className={`bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl my-auto ${lang === 'ur' ? 'rtl font-urdu' : 'ltr font-sans'}`} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
        <div 
          className={`p-5 text-white flex justify-between items-center ${tier.color?.startsWith('#') ? '' : `bg-gradient-to-r ${tier.color || 'from-green-800 to-green-600'}`}`}
          style={tier.color?.startsWith('#') ? { background: `linear-gradient(to right, ${tier.color}, ${tier.color}dd)` } : {}}
        >
          <div className="flex items-center gap-3">
            {step < 4 && (
              <button onClick={handleBack} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                <ArrowLeft className={`w-5 h-5 ${lang === 'ur' ? 'rotate-180' : ''}`} />
              </button>
            )}
            <h3 className="text-xl font-black nastaliq">{lang === 'ur' ? 'رجسٹریشن فارم' : 'Registration'}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onToggleLang} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"><Globe className="w-4 h-4" /></button>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-6">
          {step === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-2">
                <div className={`inline-block px-4 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest ${tier.color?.startsWith('#') ? '' : `bg-gradient-to-r ${tier.color || 'from-green-800 to-green-600'}`}`} style={tier.color?.startsWith('#') ? { background: tier.color } : {}}>
                  {tier.cardType?.replace('_', ' ')}
                </div>
                <h4 className="text-3xl font-black text-gray-900">Rs. {tier.investAmount}</h4>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{lang === 'ur' ? 'انویسٹمنٹ رقم' : 'Investment Amount'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 text-center">
                  <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                  <div className="text-lg font-black text-gray-900">Rs. {tier.winAmount.toLocaleString()}</div>
                  <div className="text-[8px] text-gray-400 font-bold uppercase">{lang === 'ur' ? 'جیتنے والی رقم' : 'Winning Amount'}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 text-center">
                  <Users className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                  <div className="text-lg font-black text-gray-900">{tier.membersNeeded}</div>
                  <div className="text-[8px] text-gray-400 font-bold uppercase">{lang === 'ur' ? 'کل ممبرز' : 'Total Members'}</div>
                </div>
              </div>

              {tier.cardType === 'TIME_BASED' && tier.drawDate && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-2xl flex justify-between items-center">
                  <span className="text-[10px] font-black text-red-600 uppercase">{lang === 'ur' ? 'قرعہ اندازی کی تاریخ' : 'Draw Date'}</span>
                  <span className="text-xs font-black text-red-700">
                    {new Date(tier.drawDate).toLocaleDateString('en-PK', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                </div>
              )}

              <div className="space-y-2 pt-2 border-t">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{lang === 'ur' ? 'شرائط و ضوابط' : 'Terms & Conditions'}</p>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-2 scrollbar-hide">
                  {tierTerms.length > 0 ? tierTerms.map((term, i) => (
                    <div key={`${term.id}-${i}`} className="flex gap-2 text-[10px] font-bold text-gray-600 leading-relaxed">
                      <span className="text-green-600">{i + 1}.</span>
                      <span>{lang === 'ur' ? term.text : term.textEn}</span>
                    </div>
                  )) : (
                    <p className="text-[10px] text-gray-400 italic">{lang === 'ur' ? 'اس کارڈ کے لیے کوئی خاص شرائط نہیں ہیں۔' : 'No specific terms for this card.'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <Info className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-[10px] font-bold text-blue-800 leading-tight">
                  {lang === 'ur' ? 'رجسٹریشن کے بعد آپ کو ایک "سیکرٹ ٹوکن" ملے گا جسے سنبھال کر رکھیں۔ یہ ٹوکن آپ کی جیت کی صورت میں انعام وصول کرنے کے لیے ضروری ہوگا۔' : 'After registration, you will receive a "Secret Token". Keep it safe as it will be required to claim your prize if you win.'}
                </p>
              </div>

              <button onClick={handleNext} className="w-full py-5 bg-green-600 text-white rounded-2xl font-black shadow-xl shadow-green-100 hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                {lang === 'ur' ? 'رجسٹریشن شروع کریں' : 'Start Registration'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-green-50 p-3 rounded-2xl border border-green-100 flex gap-3">
                <Sparkles className="w-5 h-5 text-green-600 shrink-0" />
                <p className="text-[11px] text-green-800 font-bold leading-relaxed">{lang === 'ur' ? 'اپنی معلومات درست ڈالیں، اسٹیٹس چیک کرنے اور انعام کے لیے یہی تفصیلات استعمال ہوں گی۔' : 'Enter correct info for status checking and prizes.'}</p>
              </div>
              <div className="space-y-4 text-right">
                <div className="relative">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">{t.nameLabel}</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Ali Ahmed" className={`w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none focus:ring-0 focus:border-green-500 transition-all font-bold ${errors.name ? 'border-red-500' : 'border-transparent'}`} />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">{t.phoneLabel}</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} placeholder="03001234567" maxLength={11} className={`w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none font-bold ${errors.phone ? 'border-red-500' : 'border-transparent'}`} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">{t.networkLabel} (Select One)</label>
                    <select value={formData.network} onChange={e => setFormData({...formData, network: e.target.value})} className={`w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none font-bold ${errors.network ? 'border-red-500' : 'border-transparent'}`}>
                      <option value="">-- نیٹ ورک سلیکٹ کریں --</option>
                      {NETWORKS.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">WhatsApp Number (Optional)</label>
                    <input type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value.replace(/\D/g, '')})} placeholder="03001234567" maxLength={11} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none font-bold" />
                  </div>
                </div>

                <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    checked={formData.acceptedTerms}
                    onChange={e => setFormData({...formData, acceptedTerms: e.target.checked})}
                  />
                  <span className={`text-[10px] font-bold leading-relaxed transition-colors ${errors.terms ? 'text-red-500' : 'text-gray-600 group-hover:text-gray-900'}`}>
                    {lang === 'ur' ? 'میں نے تمام شرائط و ضوابط پڑھ لی ہیں اور میں ان سے متفق ہوں۔' : 'I have read and agree to all Terms & Conditions.'}
                  </span>
                </label>
              </div>
              <button onClick={handleNext} className="w-full py-4 bg-green-600 text-white rounded-2xl font-black shadow-xl shadow-green-100 active:scale-95 transition-all text-sm uppercase tracking-widest">آگے بڑھیں</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldAlert className="w-8 h-8 text-yellow-600" />
                </div>
                <h4 className="font-black text-xl text-gray-800">{t.agreementHeader}</h4>
              </div>
              <div className="space-y-3">
                {[
                  t.agree1, 
                  t.agree2.replace('10', tier.investAmount.toString()), 
                  t.agree3
                ].map((text, idx) => (
                  <div key={idx} onClick={() => toggleAgreement(idx)} className={`p-4 rounded-2xl border-2 flex items-center gap-4 cursor-pointer transition-all ${formData.agreements[idx] ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-white'}`}>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${formData.agreements[idx] ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-gray-100'}`}>
                      {formData.agreements[idx] && <Check className="w-4 h-4" />}
                    </div>
                    <p className="text-[11px] font-bold text-gray-700 leading-snug">{text}</p>
                  </div>
                ))}
              </div>
              <button disabled={!formData.agreements.every(a => a)} onClick={() => setStep(3)} className={`w-full py-4 rounded-2xl font-black transition-all text-sm uppercase tracking-widest ${formData.agreements.every(a => a) ? 'bg-green-600 text-white shadow-xl shadow-green-100' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>پیمنٹ پیج پر جائیں</button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 text-center animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-1">
                <h4 className="font-black text-xl text-gray-800 uppercase">{t.paymentTitle}</h4>
                <p className="text-[11px] text-gray-400 font-bold">{t.paymentSub}</p>
              </div>
              <div className="bg-gray-50 p-5 rounded-[32px] border-2 border-dashed border-green-200 relative group">
                {tier.qrImage ? (
                  <div className="space-y-4">
                    <img src={tier.qrImage} className="w-full max-h-56 object-contain rounded-2xl mx-auto shadow-sm" />
                    <button 
                      onClick={handleDownloadQR}
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-green-200 text-green-700 rounded-xl text-xs font-black hover:bg-green-50 transition-all"
                    >
                      <Download className="w-4 h-4" /> {t.downloadQR}
                    </button>
                  </div>
                ) : (
                  <div className="py-16 text-gray-300">
                    <QrCode className="w-20 h-20 mx-auto opacity-20" />
                    <p className="text-[10px] mt-2 font-bold">QR Code Not Available</p>
                  </div>
                )}
                <div className="mt-4 bg-white p-3 rounded-2xl border-2 border-green-100 font-mono font-black text-green-700 flex justify-between items-center shadow-sm">
                  <span className="text-lg">{tier.qrData || '03xxxxxxxxx'}</span>
                  <button onClick={() => {
                    navigator.clipboard.writeText(tier.qrData || '');
                    alert(lang === 'ur' ? 'نمبر کاپی ہو گیا!' : 'Number Copied!');
                  }} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all">
                    <ClipboardCopy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-right space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">ٹریکنگ آئی ڈی (TID)</label>
                  <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest italic">{lang === 'ur' ? '(اختیاری)' : '(Optional)'}</span>
                </div>
                <input type="text" value={formData.trackingId} onChange={e => setFormData({...formData, trackingId: e.target.value})} className={`w-full p-4 bg-white border-2 rounded-2xl text-center font-mono font-black text-2xl outline-none transition-all shadow-sm ${errors.trackingId ? 'border-red-500' : 'border-green-100 focus:border-green-600'}`} placeholder="e.g. 123456789" />
                {errors.trackingId && <p className="text-[9px] text-red-500 font-bold text-center mt-1">{errors.trackingId}</p>}
                <p className="text-[9px] text-gray-400 font-bold text-center mt-1">
                  {lang === 'ur' ? 'اگر آپ کے پاس ابھی TID نہیں ہے تو آپ اسے بعد میں بھی اپڈیٹ کر سکتے ہیں۔' : 'If you don\'t have a TID yet, you can update it later.'}
                </p>
              </div>
              <div className="space-y-3">
                <button onClick={() => handleFinish(false)} className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black shadow-2xl active:scale-95 transition-all uppercase tracking-[0.2em] text-sm">{t.enterTIDNow}</button>
                <button onClick={() => handleFinish(true)} className="w-full py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all text-[10px] leading-tight px-4">
                  {lang === 'ur' 
                    ? 'بعد میں TID دوں گا (سکیپ کریں)' 
                    : 'Skip TID for now'}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="py-6 text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <Sparkles className="absolute top-0 right-1/4 w-6 h-6 text-yellow-400" />
                <Sparkles className="absolute bottom-0 left-1/4 w-4 h-4 text-yellow-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black nastaliq text-green-800 leading-tight">{t.welcomeTitle}</h3>
                <p className="text-[11px] text-gray-500 px-2 font-bold leading-relaxed">{t.welcomeSub}</p>
              </div>
              
              <div className="bg-blue-600 text-white p-5 rounded-3xl shadow-lg space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-90">{t.shareText}</p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => {
                      const shareMsg = `${t.heroTitle}\nInvest Rs. ${tier.investAmount} & Win Rs. ${tier.winAmount}!\nJoin here: ${window.location.origin}?card=${tier.id}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(shareMsg)}`, '_blank');
                    }}
                    className="w-full py-3 bg-[#25D366] text-white rounded-xl font-black text-[10px] flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                  >
                    WhatsApp
                  </button>
                  <button 
                    onClick={() => {
                      const url = `${window.location.origin}?card=${tier.id}`;
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                    }}
                    className="w-full py-3 bg-[#1877F2] text-white rounded-xl font-black text-[10px] flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                  >
                    <Facebook className="w-3.5 h-3.5" /> Facebook
                  </button>
                  <button 
                    onClick={() => {
                      const text = t.heroTitle;
                      const url = `${window.location.origin}?card=${tier.id}`;
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                    }}
                    className="w-full py-3 bg-[#1DA1F2] text-white rounded-xl font-black text-[10px] flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                  >
                    <Twitter className="w-3.5 h-3.5" /> Twitter
                  </button>
                  <button 
                    onClick={() => {
                      const url = `${window.location.origin}?card=${tier.id}`;
                      navigator.clipboard.writeText(url);
                      alert(lang === 'ur' ? 'لنک کاپی ہو گیا!' : 'Link Copied!');
                    }}
                    className="w-full py-3 bg-white text-gray-700 rounded-xl font-black text-[10px] flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                  >
                    <Link className="w-3.5 h-3.5" /> Copy Link
                  </button>
                </div>
              </div>

              <button onClick={onClose} className="w-full py-4 bg-green-600 text-white rounded-2xl font-black shadow-xl shadow-green-100 hover:bg-green-700 transition-all text-sm uppercase tracking-widest">ٹھیک ہے (ہوم اسکرین)</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
