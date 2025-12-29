
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
      case 'BENEFITS_VIEW': return 'Benefity';
      case 'SZYBKA_5': return 'Sprawdź czy możesz dziś oddać krew';
      case 'DETAILED_INTRO': return 'Ankieta medyczna';
      case 'DETAILED_SURVEY': return 'Ankieta medyczna';
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

  const handleToggleInfo = async (id: number, prompt: string) => {
    if (infoVisible[id]) {
      setInfoVisible(prev => ({ ...prev, [id]: false }));
      return;
    }

    if (infoMessage[id]) {
      setInfoVisible(prev => ({ ...prev, [id]: true }));
      return;
    }

    if (infoLoading[id]) return;
    setInfoLoading(prev => ({ ...prev, [id]: true }));
    try {
      const info = await getMoreInformation(prompt);
      setInfoMessage(prev => ({ ...prev, [id]: info }));
      setInfoVisible(prev => ({ ...prev, [id]: true }));
    } catch (error) {
      setInfoMessage(prev => ({ ...prev, [id]: "Błąd połączenia." }));
      setInfoVisible(prev => ({ ...prev, [id]: true }));
    } finally {
      setInfoLoading(prev => ({ ...prev, [id]: false }));
    }
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
        setState(prev => ({ ...prev, phase: 'SUMMARY' }));
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
      // Finalize flagged answers
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
              <h2 className="text-2xl font-bold text-gray-100">Oddaj honorowo krew</h2>
            </div>
            <div className="space-y-4">
              <OptionButton text="Benefity" description="Korzyści wynikające z krwiodawstwa" variant="tile" onClick={() => setState(prev => ({ ...prev, phase: 'BENEFITS_VIEW' }))} />
              <OptionButton text="Sprawdź czy możesz dziś oddać krew" description="Wstępna weryfikacja sytuacji" variant="tile" onClick={() => setState(prev => ({ ...prev, phase: 'SZYBKA_5', currentQuestionIndex: 0 }))} />
              <OptionButton text="Ankieta medyczna" description="Przygotuj wywiad medyczny" variant="tile" onClick={() => setState(prev => ({ ...prev, phase: 'DETAILED_INTRO', currentBlockIndex: 0, currentQuestionIndex: 0, answers: {} }))} />
            </div>
          </div>
        );

      case 'BENEFITS_VIEW':
        return (
          <div className="p-6 animate-fadeIn">
            <h3 className="text-xl font-bold mb-6 text-gray-100">Przywileje dawcy</h3>
            <div className="divide-y divide-gray-800">
              {[{t: "2 dni wolnego", d: "Dzień donacji i następny"}, {t: "9 czekolad", d: "Posiłek 4500 kcal"}, {t: "Ulga PIT", d: "Odliczenie od dochodu"}, {t: "Badania", d: "Morfologia i testy"}].map((b, i) => (
                <div key={i} className="py-4 flex items-center">
                  <div className="bg-gray-800 p-3 rounded-xl mr-4"><div className="w-5 h-5 bg-white/10 rounded-full" /></div>
                  <div><h4 className="font-bold text-gray-100">{b.t}</h4><p className="text-xs text-gray-500">{b.d}</p></div>
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
              <span className="text-[10px] font-bold text-gray-600 uppercase mb-2 block">Krok {state.currentQuestionIndex + 1}/5</span>
              {state.currentWarning ? (
                <div className="bg-orange-950/20 border border-orange-500/50 p-6 rounded-3xl">
                  <p className="text-orange-200 text-sm mb-6">{state.currentWarning}</p>
                  <button onClick={handleBack} className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl text-xs">Wróć</button>
                </div>
              ) : (
                <div className="bg-[#1c1c1e] p-6 rounded-3xl border border-gray-800">
                  <h2 className="text-xl font-bold mb-8">{q5.text}</h2>
                  <div className="space-y-4">
                    {['TAK', 'NIE'].map(o => (
                      <button key={o} onClick={() => setSelectedRadio(o as 'TAK' | 'NIE')} className={`w-full p-4 rounded-2xl border flex items-center ${selectedRadio === o ? 'border-blue-500 bg-blue-500/10' : 'border-gray-800 bg-black/20'}`}>
                        <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${selectedRadio === o ? 'border-blue-500' : 'border-gray-600'}`}>
                          {selectedRadio === o && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                        </div>
                        <span className={selectedRadio === o ? 'text-blue-400' : 'text-gray-400'}>{o === 'TAK' ? 'Tak' : 'Nie'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {!state.currentWarning && (
              <button disabled={!selectedRadio} onClick={handleSzybka5Answer} className={`w-full py-4 rounded-xl font-bold mb-8 ${selectedRadio ? 'bg-blue-600' : 'bg-gray-800 text-gray-600'}`}>Dalej</button>
            )}
          </div>
        );

      case 'DETAILED_INTRO':
        return (
          <div className="p-8 animate-fadeIn h-full flex flex-col justify-center text-center">
            <div className="w-20 h-20 bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Przygotuj się do wizyty</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-10">
              Ta ankieta zawiera szczegółowe pytania o Twój stan zdrowia. Twoje odpowiedzi zostaną zapisane <span className="text-white font-medium">tylko dla lekarza</span> w celu przyspieszenia kwalifikacji.
            </p>
            <button onClick={() => setState(prev => ({ ...prev, phase: 'DETAILED_SURVEY' }))} className="bg-blue-600 text-white font-bold py-4 rounded-xl w-full">Rozpocznij ankietę</button>
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
               {block.questions.map((q) => {
                 const isFlagged = state.answers[q.id] === q.failCondition;
                 return (
                    <div key={q.id} className="bg-[#1c1c1e] border border-gray-800 p-5 rounded-2xl">
                      <p className="text-sm font-medium mb-4 text-gray-100">{q.text}</p>
                      
                      <div className="flex space-x-4 mb-3">
                        {['TAK', 'NIE'].map(o => (
                          <button 
                            key={o} 
                            onClick={() => updateAnswer(q.id, o as 'TAK' | 'NIE')}
                            className={`flex-1 py-3 rounded-xl border flex items-center justify-center ${state.answers[q.id] === o ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-gray-800 text-gray-500'}`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center ${state.answers[q.id] === o ? 'border-blue-400' : 'border-gray-600'}`}>
                              {state.answers[q.id] === o && <div className="w-2 h-2 bg-blue-400 rounded-full" />}
                            </div>
                            <span className="text-xs font-bold">{o === 'TAK' ? 'Tak' : 'Nie'}</span>
                          </button>
                        ))}
                      </div>

                      <button 
                        onClick={() => handleToggleInfo(q.id, q.moreInfoPrompt)}
                        className="text-[10px] text-gray-500 flex items-center hover:text-blue-400"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {infoVisible[q.id] ? <path d="M5 15l7-7 7 7" /> : <path d="M19 9l-7 7-7-7" />}
                        </svg>
                        {infoLoading[q.id] ? 'Ładowanie...' : (infoVisible[q.id] ? 'Mniej' : 'Więcej')}
                      </button>

                      {infoVisible[q.id] && infoMessage[q.id] && (
                        <div className="mt-3 p-3 bg-black/40 rounded-lg text-[11px] text-gray-400 leading-relaxed border-l-2 border-blue-500">
                          {infoMessage[q.id]}
                        </div>
                      )}

                      {isFlagged && (
                        <div className="mt-3 flex items-start text-[11px] text-orange-400 font-medium animate-slideUp bg-orange-900/10 p-2 rounded-lg">
                          <span className="mr-1.5">⚠️</span>
                          <span>Zanotowano. Lekarz zapyta Cię o szczegóły tego punktu.</span>
                        </div>
                      )}
                    </div>
                 );
               })}
             </div>

             <button 
               disabled={!allAnswered} 
               onClick={handleNextBlock}
               className={`w-full py-4 rounded-xl font-bold sticky bottom-6 ${allAnswered ? 'bg-blue-600 shadow-xl' : 'bg-gray-800 text-gray-600'}`}
             >
               {state.currentBlockIndex === DETAILED_BLOCKS.length - 1 ? 'Podsumuj ankietę' : 'Dalej'}
             </button>
          </div>
        );

      case 'SUMMARY':
        const flagged = state.flaggedAnswers;
        const allQuestions = DETAILED_BLOCKS.flatMap(b => b.questions.map(q => ({ ...q, blockTitle: b.title })));
        const correctOnes = allQuestions.filter(q => state.answers[q.id] && state.answers[q.id] !== q.failCondition);

        return (
          <div className="p-6 animate-fadeIn flex flex-col min-h-full">
            <div className="bg-[#1c1c1e] border border-gray-800 rounded-3xl p-6 mb-6">
              <h3 className="font-bold text-lg mb-6">Raport dla lekarza</h3>
              
              {flagged.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-[10px] uppercase tracking-widest text-orange-400 font-bold mb-3">Punkty do weryfikacji lekarskiej (Żółte)</h4>
                  <div className="space-y-3">
                    {flagged.map((f, i) => (
                      <div key={i} className="bg-orange-950/10 border border-orange-900/30 p-4 rounded-xl">
                        <p className="text-xs text-gray-200 mb-2">{f.questionText}</p>
                        <p className="text-[10px] text-orange-300 flex items-center">
                          <span className="mr-1">💬</span> {f.warningMessage}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-green-500 font-bold mb-3">Dane prawidłowe (Zielone)</h4>
                <div className="flex flex-wrap gap-2">
                  {correctOnes.map((c, i) => (
                    <div key={i} className="bg-green-950/10 border border-green-900/30 px-3 py-1.5 rounded-full flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                      <span className="text-[9px] text-green-200 font-medium">#{c.id} {c.blockTitle}</span>
                    </div>
                  ))}
                  {correctOnes.length === 0 && <p className="text-[10px] text-gray-600 italic">Brak zapisanych punktów.</p>}
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl mx-auto mb-6 shadow-inner">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=MO_KREW_${Date.now()}`} alt="QR" className="w-32 h-32" />
              <p className="text-[9px] text-gray-400 text-center mt-3 font-bold">ZESKANUJ W GABINECIE</p>
            </div>

            <div className="text-center mb-8">
              <p className="text-sm font-bold text-gray-100">Pokaż ten ekran w gabinecie lekarskim w krwiobusie.</p>
              <p className="text-[10px] text-gray-500 mt-2">To przyspieszy Twoją kwalifikację do oddania krwi.</p>
            </div>

            <button onClick={() => setState(prev => ({ ...prev, phase: 'IDLE' }))} className="w-full bg-gray-800 py-4 rounded-xl font-bold mt-auto">Zakończ</button>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] text-gray-100 font-sans">
      {state.phase !== 'IDLE' && <Header title={getHeaderTitle()} onBack={handleBack} />}
      <div className="flex-grow overflow-y-auto">{renderKrewContent()}</div>
      {state.phase === 'IDLE' && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default App;
