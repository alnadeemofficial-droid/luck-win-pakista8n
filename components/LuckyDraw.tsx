
import React, { useState, useEffect, useRef } from 'react';
import { Trophy, ArrowLeft, Play, Eye, EyeOff, Sparkles, User, Phone, Key, Gift, Users } from 'lucide-react';
import { Participant, InvestmentOption, Language, EntryStatus } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  tier: InvestmentOption;
  participants: Participant[];
  lang: Language;
  onBack: () => void;
  onSaveWinner: (participantId: string, winAmount: number) => void;
}

const LuckyDraw: React.FC<Props> = ({ tier, participants, lang, onBack, onSaveWinner }) => {
  const t = TRANSLATIONS[lang] as any;
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [showWinnerDetails, setShowWinnerDetails] = useState(false);
  const [revealedFields, setRevealedFields] = useState({ phone: false, token: false });
  const [rotation, setRotation] = useState(0);
  const [drawLocked, setDrawLocked] = useState(tier.drawCompleted || false);
  const wheelRef = useRef<HTMLDivElement>(null);

  // Filter only approved participants for this tier
  const approvedParticipants = participants.filter(p => p.categoryId === tier.id && p.status === EntryStatus.APPROVED);

  const startDraw = () => {
    if (drawLocked) {
      alert('This draw is already completed and locked!');
      return;
    }

    if (approvedParticipants.length === 0) {
      alert('No approved participants for this card!');
      return;
    }

    const confirmMsg = lang === 'ur' 
      ? 'کیا آپ واقعی قرعہ اندازی شروع کرنا چاہتے ہیں؟ یہ صرف ایک بار ہو سکتی ہے اور اس کے بعد لاک ہو جائے گی۔' 
      : 'Are you sure you want to start the draw? This is a one-time action and will be locked afterwards.';
    
    if (!window.confirm(confirmMsg)) return;
    
    setIsSpinning(true);
    setWinner(null);
    setShowWinnerDetails(false);
    setRevealedFields({ phone: false, token: false });

    const extraSpins = 5 + Math.random() * 5;
    const newRotation = rotation + extraSpins * 360 + Math.random() * 360;
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const randomIndex = Math.floor(Math.random() * approvedParticipants.length);
      const selectedWinner = approvedParticipants[randomIndex];
      setWinner(selectedWinner);
      setShowWinnerDetails(true);
      setDrawLocked(true);
      onSaveWinner(selectedWinner.id, tier.winAmount);
    }, 4000);
  };

  const currentDate = new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 space-y-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-black nastaliq text-yellow-400">لکی ڈرا (Lucky Draw)</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <div 
                className={`w-3 h-3 rounded-full ${tier.color?.startsWith('#') ? '' : `bg-gradient-to-br ${tier.color || 'from-green-600 to-green-900'}`}`}
                style={tier.color?.startsWith('#') ? { background: tier.color } : {}}
              ></div>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Card: Rs. {tier.investAmount} | Win: Rs. {tier.winAmount}</p>
            </div>
            <p className="text-[10px] text-blue-400 font-black mt-1 uppercase tracking-tighter">Date: {currentDate}</p>
          </div>
          <div className="w-12"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Wheel Section */}
          <div className="flex flex-col items-center space-y-8">
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              {/* Pointer */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                <div className="w-8 h-8 bg-yellow-400 rotate-45 shadow-xl"></div>
              </div>
              
              {/* The Wheel */}
              <div 
                ref={wheelRef}
                className="w-full h-full rounded-full border-8 border-white/20 shadow-[0_0_50px_rgba(234,179,8,0.3)] overflow-hidden relative transition-transform duration-[4000ms] cubic-bezier(0.15, 0, 0.15, 1)"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <div 
                  className={`absolute inset-0 ${tier.color?.startsWith('#') ? '' : `bg-gradient-to-br ${tier.color || 'from-green-600 via-green-800 to-green-900'}`}`}
                  style={tier.color?.startsWith('#') ? { background: `radial-gradient(circle, ${tier.color}, ${tier.color}dd)` } : {}}
                ></div>
                {/* Wheel Segments (Visual only) */}
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute top-0 left-1/2 w-1 h-1/2 bg-white/10 origin-bottom"
                    style={{ transform: `translateX(-50%) rotate(${i * 30}deg)` }}
                  ></div>
                ))}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white rounded-full shadow-inner flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            <button 
              disabled={isSpinning || drawLocked}
              onClick={startDraw}
              className={`px-12 py-5 rounded-full font-black text-xl shadow-2xl transition-all flex items-center gap-3 ${isSpinning || drawLocked ? 'bg-gray-700 cursor-not-allowed opacity-50' : 'bg-yellow-500 text-yellow-900 hover:bg-yellow-400 active:scale-95'}`}
            >
              {isSpinning ? <><Sparkles className="w-6 h-6 animate-spin" /> Spinning...</> : drawLocked ? <><Trophy className="w-6 h-6" /> Draw Completed</> : <><Play className="w-6 h-6" /> Start Draw</>}
            </button>
            {drawLocked && !isSpinning && <p className="text-xs text-red-400 font-bold uppercase tracking-widest">This draw is locked (One-time only)</p>}
          </div>

          {/* Winner Details Section */}
          <div className="space-y-6">
            {winner && showWinnerDetails ? (
              <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 space-y-6 shadow-2xl">
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-10 h-10 text-yellow-400" />
                  </div>
                  <h3 className="text-4xl font-black nastaliq text-yellow-400">مبارک ہو! فاتح مل گیا</h3>
                  <p className="text-gray-400 font-bold uppercase tracking-widest">Winner Found!</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400"><User className="w-6 h-6" /></div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-black uppercase">نام (Name)</p>
                        <p className="text-2xl font-black">{winner.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-500/20 rounded-2xl text-green-400"><Phone className="w-6 h-6" /></div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-black uppercase">موبائل نمبر (Phone)</p>
                        <p className="text-2xl font-mono font-black">
                          {revealedFields.phone ? winner.phone : String(winner.phone).replace(/(\d{4})\d{4}(\d{3})/, '$1****$2')}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setRevealedFields(prev => ({ ...prev, phone: !prev.phone }))}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                    >
                      {revealedFields.phone ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-400"><Key className="w-6 h-6" /></div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-black uppercase">لکی کوڈ (Lucky Code)</p>
                        <p className="text-2xl font-mono font-black">
                          {revealedFields.token ? winner.secretToken : '*****'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setRevealedFields(prev => ({ ...prev, token: !prev.token }))}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                    >
                      {revealedFields.token ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-3xl border border-white/10 text-center">
                      <p className="text-[10px] text-gray-500 font-black uppercase">انویسٹمنٹ (Invested)</p>
                      <p className="text-xl font-black text-blue-400">Rs. {tier.investAmount}</p>
                    </div>
                    <div className="bg-yellow-500/10 p-4 rounded-3xl border border-yellow-500/20 text-center">
                      <p className="text-[10px] text-yellow-500 font-black uppercase">جیتا (Won)</p>
                      <p className="text-xl font-black text-yellow-400">Rs. {tier.winAmount}</p>
                    </div>
                  </div>

                  <div className="bg-yellow-500 p-6 rounded-3xl text-center text-yellow-900">
                    <p className="text-[10px] font-black uppercase opacity-60">کل انعام (Total Prize)</p>
                    <p className="text-4xl font-black">Rs. {tier.winAmount}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 p-12 border-4 border-dashed border-white/5 rounded-[40px]">
                <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center">
                  <Users className="w-16 h-16 text-white/20" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-black nastaliq text-gray-500">قرعہ اندازی کا انتظار ہے</h4>
                  <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">Waiting for Lucky Draw to Start</p>
                </div>
                <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
                  <p className="text-xs text-blue-400 font-bold">Total Participants: {approvedParticipants.length}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Participants List (Admin view) */}
        <div className="bg-white/5 rounded-[32px] p-6 border border-white/10">
          <h4 className="text-xl font-black nastaliq mb-4 text-gray-400">ممبرز لسٹ (Participants)</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {approvedParticipants.map(p => (
              <div key={p.id} className={`p-3 rounded-xl border text-center transition-all ${winner?.id === p.id ? 'bg-yellow-500 border-yellow-400 text-yellow-900 scale-110 shadow-lg z-10' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                <p className="text-xs font-black truncate">{p.name}</p>
                <p className="text-[9px] font-mono opacity-60">{String(p.phone).slice(-4)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuckyDraw;
