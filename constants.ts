
import { Question, QuestionBlock } from './types';

export const SZYBKA_5: Question[] = [
  {
    id: 1,
    text: "Czy samopoczucie jest dziś w pełni dobre?",
    failCondition: 'NIE',
    stopMessage: "Dobre samopoczucie to podstawa. Odpocznij i wróć do nas, gdy poczujesz się w pełni sił.",
    moreInfoPrompt: "Dlaczego stan zdrowia w dniu donacji jest kluczowy?"
  },
  {
    id: 2,
    text: "Czy masz dziś za sobą lekki posiłek?",
    failCondition: 'NIE',
    stopMessage: "Oddawanie krwi na czczo jest zabronione. Zjedz coś lekkiego i wróć za godzinę.",
    moreInfoPrompt: "Co najlepiej zjeść przed oddaniem krwi?"
  },
  {
    id: 3,
    text: "Czy dziś udało się wypić co najmniej 0,5 l wody?",
    failCondition: 'NIE',
    stopMessage: "Nawodnienie ułatwia pobranie krwi i zapobiega omdleniom.",
    moreInfoPrompt: "Rola nawodnienia w procesie donacji."
  },
  {
    id: 4,
    text: "Czy w ciągu ostatnich 24 godzin spożyto alkohol albo inne substancje toksyczne?",
    failCondition: 'TAK',
    stopMessage: "Alkohol wyklucza donację na 24h. Zapraszamy jutro.",
    moreInfoPrompt: "Wpływ alkoholu na parametry krwi."
  },
  {
    id: 5,
    text: "Czy w ostatnich 2 tygodniach wystąpiła infekcja, gorączka lub przyjmowano antybiotyk?",
    failCondition: 'TAK',
    stopMessage: "Infekcja, nawet lekka, dyskwalifikuje dawcę do czasu pełnego wyleczenia.",
    moreInfoPrompt: "Karencja po infekcjach."
  }
];

export const DETAILED_BLOCKS: QuestionBlock[] = [
  {
    title: "Parametry i zabiegi",
    questions: [
      {
        id: 101,
        text: "Czy masa ciała wynosi co najmniej 50 kg?",
        failCondition: 'NIE',
        stopMessage: "Lekarz zapyta Cię o dokładną masę ciała.",
        moreInfoPrompt: "Waga a objętość krwi."
      },
      {
        id: 102,
        text: "Czy w ciągu ostatnich 6 miesięcy był wykonany tatuaż, piercing, akupunktura lub makijaż permanentny?",
        failCondition: 'TAK',
        stopMessage: "Lekarz sprawdzi datę wykonania zabiegu.",
        moreInfoPrompt: "Ryzyko zakażeń krwiopochodnych."
      },
      {
        id: 103,
        text: "Czy w ciągu ostatnich 6 miesięcy odbyła się operacja, zabieg chirurgiczny lub badanie endoskopowe (np. gastroskopia)?",
        failCondition: 'TAK',
        stopMessage: "Wymagana weryfikacja rodzaju zabiegu.",
        moreInfoPrompt: "Okres karencji po zabiegach."
      },
      {
        id: 104,
        text: "Czy w ciągu ostatnich 7 dni wystąpiło usunięcie zęba lub leczenie kanałowe?",
        failCondition: 'TAK',
        stopMessage: "Stan zapalny jamy ustnej wymaga przerwy.",
        moreInfoPrompt: "Zabiegi stomatologiczne."
      }
    ]
  },
  {
    title: "Leki i szczepienia",
    questions: [
      {
        id: 201,
        text: "Czy przyjmowane są na stałe jakiekolwiek leki (np. na ciśnienie, tarczycę, serce)?",
        failCondition: 'TAK',
        stopMessage: "Przygotuj listę przyjmowanych leków.",
        moreInfoPrompt: "Leki a skład krwi."
      },
      {
        id: 202,
        text: "Czy w ciągu ostatnich 3 dni nastąpiło przyjęcie leków przeciwbólowych (np. Aspiryna, Ibuprom)?",
        failCondition: 'TAK',
        stopMessage: "Niektóre leki wpływają na krzepliwość.",
        moreInfoPrompt: "Leki przeciwzapalne."
      },
      {
        id: 203,
        text: "Czy w ciągu ostatnich 4 tygodni wykonano jakiekolwiek szczepienie ochronne?",
        failCondition: 'TAK',
        stopMessage: "Szczepienia wymagają okresu odczekania.",
        moreInfoPrompt: "Reakcja po szczepionce."
      },
      {
        id: 204,
        text: "Czy prowadzona jest terapia z powodu cukrzycy, astmy lub chorób tarczycy?",
        failCondition: 'TAK',
        stopMessage: "Choroby przewlekłe wymagają opinii lekarza.",
        moreInfoPrompt: "Przeciwwskazania stałe i czasowe."
      }
    ]
  },
  {
    title: "Podróże i kontakty",
    questions: [
      {
        id: 301,
        text: "Czy w ciągu ostatnich 6 miesięcy miał miejsce pobyt poza granicami Polski?",
        failCondition: 'TAK',
        stopMessage: "Lekarz sprawdzi czy region był bezpieczny.",
        moreInfoPrompt: "Choroby tropikalne."
      },
      {
        id: 302,
        text: "Czy w ciągu ostatnich 6 miesięcy nastąpił kontakt z osobą chorą zakaźnie lub biorcą krwi?",
        failCondition: 'TAK',
        stopMessage: "Ryzyko ekspozycji na patogeny.",
        moreInfoPrompt: "Okres wylęgania chorób."
      },
      {
        id: 303,
        text: "Czy kiedykolwiek stwierdzono zachorowanie na żółtaczkę, choroby weneryczne lub obecność wirusa HIV?",
        failCondition: 'TAK',
        stopMessage: "Wymagana poufna rozmowa z lekarzem.",
        moreInfoPrompt: "Trwałe dyskwalifikacje."
      }
    ]
  },
  {
    title: "Kobiety (jeśli dotyczy)",
    questions: [
      {
        id: 401,
        text: "Czy występuje obecnie ciąża lub czy w ciągu ostatnich 6 miesięcy nastąpił poród?",
        failCondition: 'TAK',
        stopMessage: "Ciąża i połóg to czas na regenerację.",
        moreInfoPrompt: "Gospodarka żelazem."
      },
      {
        id: 402,
        text: "Czy trwa obecnie miesiączka lub czy wystąpiła ona w ciągu ostatnich 3 dni?",
        failCondition: 'TAK',
        stopMessage: "Zalecane odczekanie 3 dni po okresie.",
        moreInfoPrompt: "Poziom hemoglobiny."
      }
    ]
  }
];

export const SYSTEM_INSTRUCTION = `Jesteś ekspertem ds. krwiodawstwa. 
Odpowiadaj krótko i merytorycznie (max 2-3 zdania).
Skup się na bezpieczeństwie dawcy i biorcy.`;
