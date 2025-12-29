
export interface Question {
  id: number;
  text: string;
  failCondition: 'TAK' | 'NIE';
  stopMessage: string;
  moreInfoPrompt: string;
  fixedInfo?: string;
  category?: string;
}

export interface QuestionBlock {
  title: string;
  questions: Question[];
}

export type QuizPhase = 'IDLE' | 'SERVICE_MAIN' | 'SZYBKA_5' | 'BENEFITS_VIEW' | 'DETAILED_INTRO' | 'DETAILED_SURVEY' | 'SUMMARY';

export interface FlaggedAnswer {
  questionId: number;
  questionText: string;
  userAnswer: 'TAK' | 'NIE';
  warningMessage: string;
  category?: string;
}

export interface QuizState {
  phase: QuizPhase;
  currentQuestionIndex: number; 
  currentBlockIndex: number;    
  flaggedAnswers: FlaggedAnswer[];
  answers: Record<number, 'TAK' | 'NIE' | null>;
  currentWarning: string | null;
}
