
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import OptionButton from './components/OptionButton';
import BottomNav from './components/BottomNav';
import { SZYBKA_5, DETAILED_BLOCKS } from './constants';
import { QuizState, QuizPhase, FlaggedAnswer } from './types';
import { getMoreInformation } from './services/geminiService';

type Tab = 'Documents' | 'Services' | 'QRCode' | 'More';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Services');
  const [state, setState] = useState<QuizState>({
    phase: 'IDLE',
    currentQuestionIndex: 0,
    currentBlockIndex: 0,
    flaggedAnswers: [],
    answers: {},
    currentWarning: null,
  });
  const [infoMessage, setInfoMessage] = useState<Record<number, string | null>>({});
  const [infoVisible, setInfoVisible] = useState<Record<number, boolean>>({});
  const [infoLoading, setInfoLoading] = useState<Record<number, boolean>>({});
  const [selectedRadio, setSelectedRadio] = useState<'TAK' | 'NIE' | null>(null);

  const getHeaderTitle = () => {
    switch (state.phase) {
      case 'IDLE': return '';
      case 'SERVICE_MAIN': return 'Krwiodawstwo';
      case 'BENEFITS_VIEW': return 'Korzyści z oddawania krwi';
      case 'SZYBKA_5': return 'Czy możesz dziś oddać krew?';
      case 'VERIFICATION_SUCCESS': return 'Status weryfikacji';
      case 'DETAILED_INTRO': return 'Ankieta zdrowotna';
      case 'DETAILED_SURVEY': return 'Ankieta zdrowotna';
      case 'SUMMARY': return 'Raport dla lekarza';
      default: return 'Krwiodawstwo';
    }
  };

  const handleBack = () => {
    if (state.currentWarning) {
      setState(prev => ({ ...prev, currentWarning: null }));
      return;
    }
    setInfoMessage({});
    setInfoVisible({});
    setSelectedRadio(null);

    setState(prev => {
      switch (prev.phase) {
        case 'SERVICE_MAIN': return { ...prev, phase: 'IDLE' };
        case 'BENEFITS_VIEW': return { ...prev, phase: 'SERVICE_MAIN' };
        case 'SZYBKA_5': return { ...prev, phase: 'SERVICE_MAIN' };
        case 'VERIFICATION_SUCCESS': return { ...prev, phase: 'SERVICE_MAIN' };
        case 'DETAILED_INTRO': return { ...prev, phase: 'SERVICE_MAIN' };
        case 'DETAILED_SURVEY': 
          if (prev.currentBlockIndex > 0) {
            return { ...prev, currentBlockIndex: prev.currentBlockIndex - 1 };
          }
          return { ...prev, phase: 'DETAILED_INTRO' };
        case 'SUMMARY': return { ...prev, phase: 'SERVICE_MAIN' };
        default: return prev;
      }
    });
  };

  const updateAnswer = (id: number, val: 'TAK' | 'NIE') => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [id]: val }
    }));
  };

  const handleSzybka5Answer = () => {
    if (!selectedRadio) return;
    const q = SZYBKA_5[state.currentQuestionIndex];
    if (selectedRadio === q.failCondition) {
      setState(prev => ({ ...prev, currentWarning: q.stopMessage }));
    } else {
      if (state.currentQuestionIndex < SZYBKA_5.length - 1) {
        setState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 }));
        setSelectedRadio(null);
      } else {
        setState(prev => ({ ...prev, phase: 'VERIFICATION_SUCCESS' }));
      }
    }
  };

  const handleNextBlock = () => {
    const block = DETAILED_BLOCKS[state.currentBlockIndex];
    const isBlockComplete = block.questions.every(q => state.answers[q.id]);
    
    if (!isBlockComplete) return;

    if (state.currentBlockIndex < DETAILED_BLOCKS.length - 1) {
      setState(prev => ({ ...prev, currentBlockIndex: prev.currentBlockIndex + 1 }));
      window.scrollTo(0, 0);
    } else {
      const allFlagged: FlaggedAnswer[] = [];
      DETAILED_BLOCKS.forEach(b => {
        b.questions.forEach(q => {
          if (state.answers[q.id] === q.failCondition) {
            allFlagged.push({
              questionId: q.id,
              questionText: q.text,
              userAnswer: state.answers[q.id]!,
              warningMessage: q.stopMessage,
              category: b.title
            });
          }
        });
      });
      setState(prev => ({ ...prev, flaggedAnswers: allFlagged, phase: 'SUMMARY' }));
    }
  };

  const renderKrewContent = () => {
    switch (state.phase) {
      case 'IDLE':
        return (
          <div className="p-6 animate-fadeIn">
            <div className="mb-6 pt-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c9/Herb_Polski.svg" alt="PL" className="w-10 h-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-100 mb-8">Usługi</h2>
            <OptionButton 
              text="Krwiodawstwo" variant="tile" badge="Nowe" iconColor="text-[#ff4d4d]"
              icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.5c-3.5 0-6.5-2.8-6.5-6.5 0-4 6.5-12 6.5-12s6.5 8 6.5 12c0 3.7-3 6.5-6.5 6.5z" /></svg>}
              onClick={() => setState(prev => ({ ...prev, phase: 'SERVICE_MAIN' }))} 
            />
          </div>
        );

      case 'SERVICE_MAIN':
        return (
          <div className="p-6 animate-fadeIn">
            <div className="flex flex-col items-start mb-10 text-left">
              <div className="w-20 h-20 bg-red-950/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-[#ff4d4d]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.5c-3.5 0-6.5-2.8-6.5-6.5 0-4 6.5-12 6.5-12s6.5 8 6.5 12c0 3.7-3 6.5-6.5 6.5z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-100">Oddaj krew i pomagaj innym</h2>
            </div>
            <div className="space-y-4">
              <OptionButton 
                text="Korzyści z oddawania krwi" 
                description="Co zyskujesz jako dawca" 
                variant="tile" 
                iconColor="text-white"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <polyline points="20 12 20 22 4 22 4 12"></polyline>
                    <rect x="2" y="7" width="20" height="5"></rect>
                    <line x1="12" y1="22" x2="12" y2="7"></line>
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                  </svg>
                }
                onClick={() => setState(prev => ({ ...prev, phase: 'BENEFITS_VIEW' }))} 
              />
              <OptionButton 
                text="Czy możesz dziś oddać krew?" 
                description="Szybka wstępna weryfikacja" 
                variant="tile" 
                iconColor="text-white"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                }
                onClick={() => setState(prev => ({ ...prev, phase: 'SZYBKA_5', currentQuestionIndex: 0 }))} 
              />
              <OptionButton 
                text="Ankieta zdrowotna" 
                description="Uzupełnij przed oddaniem krwi" 
                variant="tile" 
                iconColor="text-white"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                }
                onClick={() => setState(prev => ({ ...prev, phase: 'DETAILED_INTRO', currentBlockIndex: 0, currentQuestionIndex: 0, answers: {} }))} 
              />
            </div>
          </div>
        );

      case 'BENEFITS_VIEW':
        const benefits = [
          { 
            t: "2 dni wolnego", 
            d: "Odpoczynek po donacji", 
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> 
          },
          { 
            t: "9 czekolad", 
            d: "Regeneracja na słodko", 
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /><path d="M9 3v18" /><path d="M15 3v18" /></svg> 
          },
          { 
            t: "Ulga PIT", 
            d: "Ulga za darowiznę krwi", 
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></svg> 
          },
          { 
            t: "Badania", 
            d: "Regularna kontrola zdrowia", 
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg> 
          }
        ];

        return (
          <div className="p-6 animate-fadeIn">
            <h3 className="text-xl font-bold mb-6 text-gray-100">Przywileje dawcy</h3>
            <div className="divide-y divide-gray-800">
              {benefits.map((b, i) => (
                <div key={i} className="py-4 flex items-center">
                  <div className="bg-white/5 p-3 rounded-xl mr-4 flex items-center justify-center text-white/80 shrink-0">
                    {b.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-100 text-sm">{b.t}</h4>
                    <p className="text-xs text-gray-500">{b.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'SZYBKA_5':
        const q5 = SZYBKA_5[state.currentQuestionIndex];
        return (
          <div className="p-6 animate-fadeIn h-full flex flex-col">
            <div className="flex-grow">
              <span className="text-[10px] font-bold text-gray-600 uppercase mb-2 block">Pytanie {state.currentQuestionIndex + 1}/5</span>
              {state.currentWarning ? (
                <div className="bg-orange-950/20 border border-orange-500/50 p-6 rounded-3xl">
                  <p className="text-orange-200 text-sm mb-6">{state.currentWarning}</p>
                  <button onClick={handleBack} className="w-full bg-orange-600 text-black font-bold py-3 rounded-xl text-xs shadow-lg">Wróć</button>
                </div>
              ) : (
                <div className="bg-[#1c1c1e] p-6 rounded-3xl border border-gray-800">
                  <h2 className="text-xl font-bold mb-8 text-white">{q5.text}</h2>
                  <div className="space-y-4">
                    {['TAK', 'NIE'].map(o => (
                      <button key={o} onClick={() => setSelectedRadio(o as 'TAK' | 'NIE')} className={`w-full p-4 rounded-2xl border flex items-center ${selectedRadio === o ? 'border-blue-500 bg-blue-500/10' : 'border-gray-800 bg-black/20'}`}>
                        <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${selectedRadio === o ? 'border-blue-500' : 'border-gray-600'}`}>
                          {selectedRadio === o && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                        </div>
                        <span className={selectedRadio === o ? 'text-blue-400 font-bold' : 'text-gray-400'}>{o === 'TAK' ? 'Tak' : 'Nie'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {!state.currentWarning && (
              <button disabled={!selectedRadio} onClick={handleSzybka5Answer} className={`w-full py-4 rounded-xl font-bold mb-8 transition-transform active:scale-95 ${selectedRadio ? 'bg-blue-600 text-black shadow-lg shadow-blue-500/10' : 'bg-gray-800 text-gray-600'}`}>Dalej</button>
            )}
          </div>
        );

      case 'VERIFICATION_SUCCESS':
        return (
          <div className="p-6 animate-fadeIn h-full flex flex-col bg-[#121212]">
            <div className="flex-grow flex flex-col items-center justify-center text-center">
              <div className="w-28 h-28 bg-[#006e33]/15 rounded-full flex items-center justify-center mb-8 border border-[#006e33]/30 shadow-[0_0_30px_rgba(0,110,51,0.1)]">
                <div className="w-20 h-20 rounded-full border-[6px] border-[#006e33] flex items-center justify-center">
                  <svg className="w-10 h-10 text-[#006e33]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-[18px] font-semibold text-white mb-4 leading-tight text-center">Pozytywny wynik<br/>weryfikacji</h2>
              <p className="text-gray-400 text-sm leading-relaxed px-6 max-w-xs">
                Wstępna ankieta nie wykazała przeciwwskazań do oddania krwi.
                Możesz przejść do ankiety zdrowotnej.
              </p>
            </div>
            <button 
              onClick={() => setState(prev => ({ ...prev, phase: 'SERVICE_MAIN' }))} 
              className="w-full py-4 rounded-xl font-bold bg-blue-600 text-black mb-8 active:scale-95 transition-transform shadow-xl shadow-blue-600/20"
            >
              OK
            </button>
          </div>
        );

      case 'DETAILED_INTRO':
        return (
          <div className="p-8 animate-fadeIn h-full flex flex-col justify-center text-center">
            <div className="w-20 h-20 bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">Przygotuj się do wizyty</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-10">
              Ta ankieta zawiera szczegółowe pytania o Twój stan zdrowia. Twoje odpowiedzi zostaną zapisane <span className="text-white font-medium">tylko dla lekarza</span> w celu przyspieszenia kwalifikacji.
            </p>
            <button onClick={() => setState(prev => ({ ...prev, phase: 'DETAILED_SURVEY' }))} className="bg-blue-600 text-black font-bold py-4 rounded-xl w-full shadow-lg">Rozpocznij ankietę</button>
          </div>
        );

      case 'DETAILED_SURVEY':
        const block = DETAILED_BLOCKS[state.currentBlockIndex];
        const allAnswered = block.questions.every(q => state.answers[q.id]);
        return (
          <div className="p-6 animate-fadeIn">
             <span className="text-xs font-bold text-gray-500 mb-2 block">Blok {state.currentBlockIndex + 1}/4</span>
             <h2 className="text-xl font-bold text-white mb-6">{block.title}</h2>
             
             <div className="space-y-6 mb-10">
               {block.questions.map((q) => (
                 <div key={q.id} className="bg-[#1c1c1e] border border-gray-800 p-5 rounded-2xl">
                   <p className="text-sm font-medium mb-4 text-gray-100">{q.text}</p>
                   <div className="flex space-x-4 mb-3">
                     {['TAK', 'NIE'].map(o => (
                       <button 
                         key={o} 
                         onClick={() => updateAnswer(q.id, o as 'TAK' | 'NIE')}
                         className={`flex-1 py-3 rounded-xl border flex items-center justify-center ${state.answers[q.id] === o ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-gray-800 text-gray-500'}`}
                       >
                         <span className="text-xs font-bold">{o === 'TAK' ? 'Tak' : 'Nie'}</span>
                       </button>
                     ))}
                   </div>
                 </div>
               ))}
             </div>

             <button 
               disabled={!allAnswered} 
               onClick={handleNextBlock}
               className={`w-full py-4 rounded-xl font-bold sticky bottom-6 transition-all ${allAnswered ? 'bg-blue-600 text-black shadow-2xl' : 'bg-gray-800 text-gray-600'}`}
             >
               {state.currentBlockIndex === DETAILED_BLOCKS.length - 1 ? 'Podsumuj ankietę' : 'Dalej'}
             </button>
          </div>
        );

      case 'SUMMARY':
        return (
          <div className="p-6 animate-fadeIn flex flex-col min-h-full">
            <div className="bg-[#1c1c1e] border border-gray-800 rounded-3xl p-6 mb-6">
              <h3 className="font-bold text-lg mb-6 text-white">Raport dla lekarza</h3>
              <p className="text-gray-400 text-sm">Twoja ankieta jest gotowa do weryfikacji przez lekarza w punkcie pobrań.</p>
            </div>

            <div className="bg-white p-5 rounded-3xl mx-auto mb-6 shadow-inner">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=MO_KREW_${Date.now()}`} alt="QR" className="w-32 h-32" />
            </div>

            <button onClick={() => setState(prev => ({ ...prev, phase: 'IDLE' }))} className="w-full bg-gray-800 text-black py-4 rounded-xl font-bold mt-auto active:scale-95 transition-transform">Zakończ</button>
          </div>
        );

      default: return null;
    }
  };

  const renderPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fadeIn">
      <h3 className="text-xl font-bold text-gray-100 mb-2">Wkrótce dostępne</h3>
      <p className="text-sm text-gray-500">Ta funkcja jest obecnie w fazie projektowania.</p>
    </div>
  );

  const mainContent = activeTab === 'Services' ? renderKrewContent() : renderPlaceholder();

  return (
    <div className="flex flex-col h-full bg-[#121212] text-gray-100 font-sans">
      {activeTab === 'Services' && state.phase !== 'IDLE' && state.phase !== 'VERIFICATION_SUCCESS' && <Header title={getHeaderTitle()} onBack={handleBack} />}
      <div className="flex-grow overflow-y-auto">{mainContent}</div>
      {state.phase === 'IDLE' && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default App;
