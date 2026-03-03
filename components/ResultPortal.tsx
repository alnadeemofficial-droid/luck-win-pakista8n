
import React, { useState } from 'react';
import { Search, Trophy, XCircle, ArrowLeft, Key, Sparkles, Gift, TrendingUp, Star, ShieldCheck, Heart } from 'lucide-react';
import { Participant, EntryStatus, Language, InvestmentOption } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  participants: Participant[];
  tiers: InvestmentOption[];
  lang: Language;
  onBack: () => void;
  handleGlobalAdClick: (triggerId: string, defaultAction: () => void) => void;
}

const ResultPortal: React.FC<Props> = ({ participants, tiers, lang, onBack, handleGlobalAdClick }) => {
  const t = TRANSLATIONS[lang] as any;
  const [token, setToken] = useState('');
  const [result, setResult] = useState<{ status: 'WINNER' | 'NOT_WINNER' | 'PENDING', entry?: Participant } | null>(null);

  const handleCheckResult = (e: React.FormEvent) => {
    e.preventDefault();
    handleGlobalAdClick('result_check_btn', () => {
      const cleanToken = token.trim().toUpperCase();
      
      const entry = participants.find(p => p.secretToken?.toUpperCase() === cleanToken);

      if (!entry) {
        setResult(null);
        alert(t.noRecord);
        return;
      }

      const tier = tiers.find(t => t.id === entry.categoryId);
      const tierApprovedParticipants = participants.filter(p => p.categoryId === entry.categoryId && p.status === EntryStatus.APPROVED).length;
      const totalMembers = tierApprovedParticipants + (tier?.currentMembers || 0);
      const isFull = totalMembers >= (tier?.membersNeeded || 999999);

      if (!isFull) {
        setResult({ status: 'PENDING', entry });
      } else {
        const isWinner = entry.isWinner || false; 
        setResult({ status: isWinner ? 'WINNER' : 'NOT_WINNER', entry });
      }
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 px-2 pb-20">
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border">
        <button 
          onClick={() => handleGlobalAdClick('result_back_btn', onBack)} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className={`w-5 h-5 ${lang === 'ur' ? 'rotate-180' : ''}`} />
        </button>
        <div className={`flex-grow ${lang === 'ur' ? 'text-right' : 'text-left'}`}>
          <h2 className="text-xl font-black text-gray-900 nastaliq leading-none">{t.resultTitle}</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.resultSub}</p>
        </div>
      </div>

      {!result ? (
        <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-gray-100">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key className="w-10 h-10 text-blue-600" />
          </div>
          <form onSubmit={handleCheckResult} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest block text-center">آپ کا لکی ریکارڈ کوڈ درج کریں</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. A1B2C" 
                className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-3xl outline-none text-center font-mono font-black text-2xl tracking-widest text-gray-800 transition-all" 
                value={token} 
                onChange={e => setToken(e.target.value)} 
              />
            </div>
            
            <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg">
              <Search className="w-6 h-6" />
              {t.checkResultBtn}
            </button>
          </form>
        </div>
      ) : (
        <div className="">
          {result.status === 'WINNER' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-600 p-1 rounded-[40px] shadow-2xl">
                <div className="bg-white p-8 rounded-[38px] text-center space-y-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                      <Trophy className="w-14 h-14 text-yellow-600" />
                    </div>
                    <Sparkles className="absolute top-0 right-1/4 w-8 h-8 text-yellow-500" />
                    <Sparkles className="absolute bottom-0 left-1/4 w-6 h-6 text-orange-500" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-4xl font-black nastaliq text-orange-600 leading-tight">{lang === 'ur' ? 'مبارک ہو!' : 'Congratulations!'}</h3>
                    <p className="text-lg text-gray-700 font-bold leading-relaxed">
                      {lang === 'ur' 
                        ? `مبارک ہو! ہم جلد آپ سے رابطہ کریں گے۔ آپ نے Rs. ${tiers.find(t => t.id === result.entry?.categoryId)?.investAmount} والے کارڈ پر انویسٹ کیا تھا اور اب آپ Rs. ${tiers.find(t => t.id === result.entry?.categoryId)?.winAmount} جیت چکے ہیں۔ اپنا نمبر آن رکھیں۔`
                        : `Congratulations! We will contact you soon. You invested in Rs. ${tiers.find(t => t.id === result.entry?.categoryId)?.investAmount} card and won Rs. ${tiers.find(t => t.id === result.entry?.categoryId)?.winAmount}. Keep your number active.`
                      }
                    </p>
                  </div>
                  <div className="bg-orange-50 p-6 rounded-3xl border-2 border-orange-100 space-y-2">
                    <div className="text-[10px] text-orange-600 font-black uppercase tracking-widest">آپ کا انعام</div>
                    <div className="text-4xl font-black text-orange-800">Rs. {tiers.find(t => t.id === result.entry?.categoryId)?.winAmount}</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-600 text-white p-6 rounded-[32px] shadow-lg space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl"><TrendingUp className="w-6 h-6" /></div>
                  <h4 className="font-black nastaliq text-lg">{lang === 'ur' ? 'سلسلہ جاری رکھیں!' : 'Keep the Streak!'}</h4>
                </div>
                <p className="text-[11px] font-bold leading-relaxed opacity-90">
                  {lang === 'ur' 
                    ? 'ماشاءاللہ! آپ ایک کارڈ پر جیت چکے ہیں، اس کا مطلب ہے کہ آپ کی قسمت بہت اچھی ہے۔ باقی کارڈز پر بھی انویسٹ کریں، ہو سکتا ہے آپ ان پر بھی جیت جائیں اور اپنی جیت کا سلسلہ جاری رکھیں!' 
                    : 'MashaAllah! You have won on one card, which means you are very lucky. Invest in other cards too, maybe you win on them as well and keep your winning streak going!'}
                </p>
                <button onClick={() => setResult(null)} className="w-full py-4 bg-white text-green-700 rounded-2xl font-black shadow-xl hover:bg-gray-50 transition-all uppercase tracking-widest text-xs">
                  {lang === 'ur' ? 'مزید کارڈز میں حصہ لیں' : 'Join More Cards'}
                </button>
              </div>
            </div>
          )}

          {result.status === 'NOT_WINNER' && (
            <div className="space-y-4">
              <div className="bg-white p-10 rounded-[40px] shadow-xl text-center space-y-6 border border-gray-100">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="w-12 h-12 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-800 nastaliq">{lang === 'ur' ? 'ہمت نہ ہاریں، آپ کی جیت قریب ہے!' : 'Don\'t Lose Hope, Your Win is Near!'}</h3>
                  <p className="text-sm text-gray-500 font-bold px-6 leading-relaxed">
                    {lang === 'ur' 
                      ? 'اگر آپ اس کارڈ میں نہیں جیتے تو بالکل پریشان نہ ہوں! یہ تو صرف ایک شروعات ہے۔ اگلی بار قسمت آپ پر مہربان ہو سکتی ہے۔' 
                      : 'Don\'t be worried if you didn\'t win this card! This is just the beginning. Next time luck might be on your side.'}
                  </p>
                </div>

                {/* Other entries motivation */}
                {participants.filter(p => p.phone === result.entry?.phone && p.id !== result.entry?.id).length > 0 && (
                  <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 space-y-4">
                    <div className="flex items-center justify-center gap-2 text-blue-700">
                      <Star className="w-5 h-5 fill-blue-700" />
                      <h4 className="font-black text-sm uppercase">{lang === 'ur' ? 'آپ کی دیگر امیدیں' : 'Your Other Hopes'}</h4>
                    </div>
                    <p className="text-[11px] text-blue-600 font-bold leading-relaxed">
                      {lang === 'ur' 
                        ? `ایک میں ہار گئے تو کیا ہوا؟ آپ نے ابھی ${participants.filter(p => p.phone === result.entry?.phone && p.id !== result.entry?.id).length} اور کارڈز میں بھی حصہ لیا ہوا ہے! ہو سکتا ہے ان میں سے کوئی آپ کی زندگی بدل دے۔` 
                        : `Lost in one? No problem! You still have ${participants.filter(p => p.phone === result.entry?.phone && p.id !== result.entry?.id).length} more entries active! One of them could change your life.`}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {participants.filter(p => p.phone === result.entry?.phone && p.id !== result.entry?.id).map(p => {
                        const t = tiers.find(tier => tier.id === p.categoryId);
                        return (
                          <div key={p.id} className="bg-white px-3 py-1.5 rounded-full border border-blue-200 text-[9px] font-black text-blue-800">
                            Rs. {t?.investAmount} Card
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 space-y-3">
                  <div className="flex items-center justify-center gap-2 text-orange-700">
                    <TrendingUp className="w-5 h-5" />
                    <h4 className="font-black text-sm uppercase">{lang === 'ur' ? 'جیتنے کا چانس بڑھائیں' : 'Increase Your Chance'}</h4>
                  </div>
                  <p className="text-[11px] text-orange-600 font-bold leading-relaxed">
                    {lang === 'ur' 
                      ? 'زیادہ سے زیادہ انویسٹ کریں تاکہ آپ کے جیتنے کے امکانات بڑھ جائیں۔ جتنے زیادہ کارڈز، اتنے زیادہ چانس!' 
                      : 'Invest more to increase your winning chances. More cards mean more chances!'}
                  </p>
                </div>

                <button onClick={() => setResult(null)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black shadow-lg hover:bg-black transition-all">
                  {lang === 'ur' ? 'دوبارہ کوشش کریں' : 'Try Again'}
                </button>
              </div>
            </div>
          )}

          {result.status === 'PENDING' && (
            <div className="bg-white p-10 rounded-[40px] shadow-xl text-center space-y-6 border border-gray-100">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                <Gift className="w-12 h-12 text-blue-500 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-800 nastaliq">{lang === 'ur' ? 'قرعہ اندازی پینڈنگ ہے' : 'Draw Pending'}</h3>
                <p className="text-sm text-gray-500 font-bold px-6 leading-relaxed">{t.drawPending}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <p className="text-[11px] text-blue-700 font-bold">
                  {lang === 'ur' 
                    ? 'اس کارڈ کے ممبرز ابھی مکمل نہیں ہوئے۔ جیسے ہی ممبرز پورے ہوں گے، لائیو قرعہ اندازی ہوگی۔' 
                    : 'Members for this card are not full yet. Live draw will happen as soon as they are full.'}
                </p>
              </div>
              <button onClick={() => setResult(null)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all">واپس جائیں</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultPortal;
