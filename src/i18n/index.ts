// ============================================================
// SYNAPSA — i18n / Localization
// ============================================================

export type Locale = 'as' | 'bn' | 'hi' | 'en';

export type Strings = {
  appName: string;
  greeting: string;
  playMemoryGame: string;
  dailyRoutine: string;
  talkToSynapsa: string;
  calmSpace: string;
  caregiver: string;
  home: string;
  games: string;
  routine: string;
  calm: string;
  correct: string;
  tryAgain: string;
  excellent: string;
  wellDone: string;
  drinkWater: string;
  takeMedicine: string;
  morningWalk: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  eveningRest: string;
  listening: string;
  thinking: string;
  speaking: string;
  justAMoment: string;
  tapToSpeak: string;
  holdToSpeak: string;
  complete: string;
  skip: string;
  next: string;
  back: string;
  level: string;
  score: string;
  memorize: string;
  whatWasMissing: string;
  patternGame: string;
  memoryGame: string;
  whatComesNext: string;
  reminder: string;
  done: string;
  hydration: string;
  medication: string;
  activity: string;
  performance: string;
  trends: string;
  offline: string;
  online: string;
  syncing: string;
  synced: string;
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  startGame: string;
  relaxHere: string;
};

const translations: Record<Locale, Strings> = {
  en: {
    appName: 'Synapsa',
    greeting: 'Hello! I am NOVA. How are you today?',
    playMemoryGame: 'Memory Game',
    dailyRoutine: 'Daily Routine',
    talkToSynapsa: 'Talk to NOVA',
    calmSpace: 'Calm Space',
    caregiver: 'Caregiver',
    home: 'Home',
    games: 'Games',
    routine: 'Routine',
    calm: 'Calm',
    correct: 'Correct! Well done.',
    tryAgain: 'Try again. You can do it.',
    excellent: 'Excellent!',
    wellDone: 'Well done!',
    drinkWater: 'Drink Water',
    takeMedicine: 'Take Medicine',
    morningWalk: 'Morning Walk',
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    eveningRest: 'Evening Rest',
    listening: 'Listening…',
    thinking: 'Just a moment…',
    speaking: 'Speaking…',
    justAMoment: 'Just a moment…',
    tapToSpeak: 'Tap to speak',
    holdToSpeak: 'Hold to speak',
    complete: 'Complete',
    skip: 'Skip',
    next: 'Next',
    back: 'Back',
    level: 'Level',
    score: 'Score',
    memorize: 'Look and remember',
    whatWasMissing: 'What is missing?',
    patternGame: 'Pattern Game',
    memoryGame: 'Memory Game',
    whatComesNext: 'What comes next?',
    reminder: 'Reminder',
    done: 'Done',
    hydration: 'Hydration',
    medication: 'Medication',
    activity: 'Activity',
    performance: 'Performance',
    trends: 'Trends',
    offline: 'Offline',
    online: 'Online',
    syncing: 'Syncing…',
    synced: 'Synced',
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    startGame: 'Start Game',
    relaxHere: 'Relax here',
  },
  as: {
    appName: 'স্মাৰণি',
    greeting: 'নমস্কাৰ! মই স্মাৰণি। আপুনি আজি কেনে আছে?',
    playMemoryGame: 'স্মৃতি খেল',
    dailyRoutine: 'দৈনিক ৰুটিন',
    talkToSynapsa: 'স্মাৰণিৰ সৈতে কথা',
    calmSpace: 'শান্ত ঠাই',
    caregiver: 'পৰিচালক',
    home: 'ঘৰ',
    games: 'খেল',
    routine: 'ৰুটিন',
    calm: 'শান্তি',
    correct: 'শুদ্ধ! ভালদৰে কৰিলে।',
    tryAgain: 'আকৌ চেষ্টা কৰক।',
    excellent: 'অসাধাৰণ!',
    wellDone: 'ভালদৰে কৰিলে!',
    drinkWater: 'পানী খাওক',
    takeMedicine: 'দৰব খাওক',
    morningWalk: 'ৰাতিপুৱা খোজকঢ়া',
    breakfast: 'জলপান',
    lunch: 'দুপৰীয়া আহাৰ',
    dinner: 'ৰাতিৰ আহাৰ',
    eveningRest: 'গধূলিৰ বিশ্ৰাম',
    listening: 'শুনিছো…',
    thinking: 'এক মুহূৰ্ত…',
    speaking: 'কৈছো…',
    justAMoment: 'এক মুহূৰ্ত…',
    tapToSpeak: 'কথা ক\'বলৈ টেপ কৰক',
    holdToSpeak: 'কথা ক\'বলৈ ধৰক',
    complete: 'সম্পূৰ্ণ',
    skip: 'এৰি দিয়ক',
    next: 'পৰৱৰ্তী',
    back: 'পিছলৈ',
    level: 'স্তৰ',
    score: 'নম্বৰ',
    memorize: 'চাওক আৰু মনত ৰাখক',
    whatWasMissing: 'কি নাইকিয়া হ\'ল?',
    patternGame: 'ধাৰণা খেল',
    memoryGame: 'স্মৃতি খেল',
    whatComesNext: 'পৰৱৰ্তী কি?',
    reminder: 'স্মৰণ',
    done: 'সম্পন্ন',
    hydration: 'পানীয়',
    medication: 'দৰব',
    activity: 'কাৰ্যকলাপ',
    performance: 'প্ৰদৰ্শন',
    trends: 'ধাৰা',
    offline: 'অফলাইন',
    online: 'অনলাইন',
    syncing: 'সমন্বয়…',
    synced: 'সমন্বয় হ\'ল',
    goodMorning: 'শুভ ৰাতিপুৱা',
    goodAfternoon: 'শুভ দুপৰীয়া',
    goodEvening: 'শুভ গধূলি',
    startGame: 'খেল আৰম্ভ',
    relaxHere: 'ইয়াত আৰাম কৰক',
  },
  bn: {
    appName: 'স্মারণি',
    greeting: 'নমস্কার! আমি স্মারণি। আজকে কেমন আছেন?',
    playMemoryGame: 'স্মৃতি খেলা',
    dailyRoutine: 'দৈনিক রুটিন',
    talkToSynapsa: 'স্মারণির সাথে কথা',
    calmSpace: 'শান্ত স্থান',
    caregiver: 'পরিচর্যাকারী',
    home: 'হোম',
    games: 'খেলা',
    routine: 'রুটিন',
    calm: 'শান্তি',
    correct: 'সঠিক! খুব ভালো।',
    tryAgain: 'আবার চেষ্টা করুন।',
    excellent: 'অসাধারণ!',
    wellDone: 'খুব ভালো!',
    drinkWater: 'জল পান করুন',
    takeMedicine: 'ওষুধ নিন',
    morningWalk: 'সকালের হাঁটা',
    breakfast: 'জলখাবার',
    lunch: 'দুপুরের খাবার',
    dinner: 'রাতের খাবার',
    eveningRest: 'সন্ধ্যার বিশ্রাম',
    listening: 'শুনছি…',
    thinking: 'একটু অপেক্ষা করুন…',
    speaking: 'বলছি…',
    justAMoment: 'একটু অপেক্ষা…',
    tapToSpeak: 'কথা বলতে ট্যাপ করুন',
    holdToSpeak: 'কথা বলতে ধরুন',
    complete: 'সম্পূর্ণ',
    skip: 'এড়িয়ে যান',
    next: 'পরবর্তী',
    back: 'পিছনে',
    level: 'স্তর',
    score: 'নম্বর',
    memorize: 'দেখুন এবং মনে রাখুন',
    whatWasMissing: 'কোনটি নেই?',
    patternGame: 'ধরন খেলা',
    memoryGame: 'স্মৃতি খেলা',
    whatComesNext: 'পরবর্তীটি কি?',
    reminder: 'স্মরণ',
    done: 'সম্পন্ন',
    hydration: 'জলপান',
    medication: 'ওষুধ',
    activity: 'কার্যকলাপ',
    performance: 'কর্মক্ষমতা',
    trends: 'প্রবণতা',
    offline: 'অফলাইন',
    online: 'অনলাইন',
    syncing: 'সমন্বয়…',
    synced: 'সমন্বয় হয়েছে',
    goodMorning: 'শুভ সকাল',
    goodAfternoon: 'শুভ দুপুর',
    goodEvening: 'শুভ সন্ধ্যা',
    startGame: 'খেলা শুরু',
    relaxHere: 'এখানে বিশ্রাম নিন',
  },
  hi: {
    appName: 'स्मारणी',
    greeting: 'नमस्ते! मैं स्मारणी हूँ। आज आप कैसे हैं?',
    playMemoryGame: 'याददाश्त खेल',
    dailyRoutine: 'दैनिक दिनचर्या',
    talkToSynapsa: 'स्मारणी से बात करें',
    calmSpace: 'शांत स्थान',
    caregiver: 'देखभालकर्ता',
    home: 'होम',
    games: 'खेल',
    routine: 'दिनचर्या',
    calm: 'शांति',
    correct: 'सही! बहुत अच्छा।',
    tryAgain: 'फिर से कोशिश करें।',
    excellent: 'उत्कृष्ट!',
    wellDone: 'बहुत अच्छा!',
    drinkWater: 'पानी पिएं',
    takeMedicine: 'दवाई लें',
    morningWalk: 'सुबह की सैर',
    breakfast: 'नाश्ता',
    lunch: 'दोपहर का खाना',
    dinner: 'रात का खाना',
    eveningRest: 'शाम का आराम',
    listening: 'सुन रहा हूँ…',
    thinking: 'एक पल…',
    speaking: 'बोल रहा हूँ…',
    justAMoment: 'एक पल…',
    tapToSpeak: 'बोलने के लिए टैप करें',
    holdToSpeak: 'बोलने के लिए दबाएँ',
    complete: 'पूर्ण',
    skip: 'छोड़ें',
    next: 'अगला',
    back: 'वापस',
    level: 'स्तर',
    score: 'स्कोर',
    memorize: 'देखें और याद करें',
    whatWasMissing: 'क्या गायब था?',
    patternGame: 'पैटर्न खेल',
    memoryGame: 'याददाश्त खेल',
    whatComesNext: 'आगे क्या आता है?',
    reminder: 'याद दिलाना',
    done: 'हो गया',
    hydration: 'पानी',
    medication: 'दवाई',
    activity: 'गतिविधि',
    performance: 'प्रदर्शन',
    trends: 'रुझान',
    offline: 'ऑफलाइन',
    online: 'ऑनलाइन',
    syncing: 'सिंक हो रहा है…',
    synced: 'सिंक हो गया',
    goodMorning: 'सुप्रभात',
    goodAfternoon: 'शुभ दोपहर',
    goodEvening: 'शुभ संध्या',
    startGame: 'खेल शुरू करें',
    relaxHere: 'यहाँ आराम करें',
  },
};

export function getStrings(locale: Locale): Strings {
  return translations[locale] ?? translations['en'];
}

export function getGreeting(locale: Locale): string {
  const hour = new Date().getHours();
  const strings = getStrings(locale);
  if (hour < 12) return strings.goodMorning;
  if (hour < 17) return strings.goodAfternoon;
  return strings.goodEvening;
}
