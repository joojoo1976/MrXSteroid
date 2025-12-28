

export enum Language {
  AR = 'ar',
  EN = 'en',
  HE = 'he',
  FR = 'fr',
  ES = 'es',
  DE = 'de',
  IT = 'it',
  RU = 'ru',
  TR = 'tr',
  PT = 'pt',
  FA = 'fa',
  UR = 'ur'
}

declare global {
  interface Window {
    SpaceRemit: {
      Pay: (paymentDetails: Record<string, unknown>) => void;
    };
  }
}

export enum Currency {
  USD = 'USD',
  EGP = 'EGP'
}

export enum Page {
  HOME = 'home',
  MACRO = 'macro',
  INJECTION = 'injection',
  HALFLIFE = 'halflife',
  LAB = 'lab',
  GENETIC = 'genetic',
  CYCLE_ARCHITECT = 'cycle',
  SMART_LANDING = 'smart-landing',
  LOGIN = 'login',
  SIGNUP = 'signup'
}

export interface PricingTier {
  name: string;
  price: string;
  originalPrice?: string;
  description: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
  popularLabel?: string;
}

export interface TargetAudience {
  title: string;
  description: string;
  iconKey: 'athlete' | 'women' | 'coach' | 'truth' | 'shield';
}

export interface FeatureItem {
  title: string;
  description: string;
  iconKey: string;
}

export interface BenefitItem {
  title: string;
  description: string;
  iconKey: 'time' | 'science' | 'shield' | 'source' | 'health' | 'guide' | 'truth' | 'roi' | 'safety' | 'simplified' | 'smart';
}

export interface LabTest {
  id: string;
  name: string;
  category: string;
  description: string;
  range: string;
  unit: string;
  min: number;
  max: number;
  elevationMeaning: string;
  lowMeaning: string;
  management: string;
}

export interface SalesNotificationData {
  name: string;
  location: string;
}

export interface TimelinePhaseStats {
  strength: number; // 0-100
  hypertrophy: number; // 0-100
  waterRetention: number; // 0-100
  fatLoss: number; // 0-100
  mood: number; // 0-100
}

export interface TimelinePhase {
  week: string;
  title: string;
  shortDesc: string;
  iconKey: 'spark' | 'muscle' | 'trophy' | 'flag' | string;
  stats: TimelinePhaseStats;
  details: {
    biological: string; // What happens inside
    feeling: string; // What user feels
    action: string; // What user should do
  };
}

export interface Compound {
  id: string;
  name: string;
  halfLife: number; // in days
}

export interface InjectionLog {
  siteId: string;
  date: number; // Timestamp
  note?: string;
}

export interface InjectionSite {
  id: string;
  name: string;
  category: string;
  view: 'front' | 'back';
  needle: string;
  volume: string;
  recoveryDays: number; // How long until green again
  riskLevel: 'Low' | 'Medium' | 'High';
  warning?: string;
  description: string;
  steps?: string[]; // Detailed instructions
  painLevel?: string; // e.g. "Low (2/10)"
  bestFor?: string; // e.g. "High Volume, Oil Based"
  // SVG Coordinates for the heatmap
  pathD: string; // SVG Path Data
  icon?: string; // e.g. "💉"
  advice?: string; // e.g. "Rotation is key..."
}

export interface FaqItem {
  question: string;
  answer: string;
  category: 'safety' | 'general' | 'legal' | 'women' | 'strategy';
}

export interface MealItem {
  item: string;
  amount: string;
}

export interface DailyMeal {
  mealName: string;
  foods: MealItem[];
}

export interface QuizOption {
  text: string;
  score: number; // 0 for not ready, 1 for potentially ready
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
}

export interface QuizContent {
  title: string;
  subtitle: string;
  startBtn: string;
  questions: QuizQuestion[];
  questionLabel: string;
  totalLabel: string;
  results: {
    natural: {
      title: string;
      desc: string;
      cta: string;
    };
    enhanced: {
      title: string;
      desc: string;
      cta: string;
    };
  };
}

export interface IQQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DailyIQContent {
  title: string;
  subtitle: string;
  challengeLabel: string;
  winTitle: string;
  winDesc: string;
  loseTitle: string;
  loseDesc: string;
  explanationLabel: string;
  copySuccess: string;
  toastCorrect: string;
  couponLabel: string;
  claimBtn: string;
  expiresIn: string;
  comeBackTomorrow: string;
  questions: IQQuestion[];
}

export interface CycleArchitectContent {
  title: string;
  subtitle: string;
  presetsTitle: string;
  configLabel: string;
  stealthModeLabel: string;
  rotationLabel: string;
  pctLabel: string;
  toggleStealth: string;
  toggleRotation: string;
  togglePct: string;
  stealthAliases: string[];
  rotationSites: string[];
  presets: {
    beginnerBulk: string;
    cutting: string;
    trt: string;
  };
  form: {
    startDateLabel: string;
    compoundLabel: string;
    dosageLabel: string;
    frequencyLabel: string;
    weeksLabel: string;
    halfLifeLabel: string; // Added for PCT calc
    addCompoundBtn: string;
    removeBtn: string;
    frequencies: {
      daily: string;
      eod: string;
      twiceWeekly: string;
      weekly: string;
    };
  };
  premiumLock: {
    lockedTitle: string;
    lockedDesc: string;
    verifyBtn: string;
    exportBtn: string;
    placeholder: string;
    successMsg: string;
    errorMsg: string;
    demoHint: string;
  };
  pctEventSummary: string;
  pctEventDescription: string;
  stealthPctAlias: string;
}



export interface ContentStrings {
  // Auth
  loginSuccess?: string;
  signupSuccess?: string;
  invalidCredentials?: string;
  logout?: string; // Add logout here
  welcomeUser?: string; // Optional: for 'Welcome, User'
  loginWithGoogle?: string;
  loginWithMicrosoft?: string;
  orDivider?: string;

  // Navigation & Tools
  navAiTools: string;
  navPremiumResources: string;
  navFeatures: string;
  navToolNames: {
    macro: string;
    injection: string;
    halflife: string;
    lab: string;
    genetic: string;
    cycleArchitect: string;
  };
  themeNames: {
    light: string;
    dark: string;
    system: string;
  };
  backToHome: string;

  // SEO Specific Fields
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];

  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  downloadPreview: string;
  audioPreviewBtn: string;
  authorSection: string;
  authorName: string;
  authorBio: string;
  featuresTitle: string;
  sneakPeekTitle: string;
  sneakPeekSubtitle: string;
  unlockText: string;
  buyNow: string;
  contact: string;
  copyright: string;
  features: FeatureItem[];
  testimonials: {
    name: string;
    title: string;
    text: string;
  }[];
  testimonialsTitle: string;
  faqTitle: string;
  faqSubtitle: string;
  faqSearchPlaceholder: string;
  faqCategories: {
    all: string;
    safety: string;
    general: string;
    legal: string;
    women: string;
    strategy: string;
  };
  faqs: FaqItem[];
  privacyPolicy: string;
  termsOfService: string;
  refundPolicy: string;
  legalDisclaimer: string;
  aboutUs: string;
  legal: string;
  quickLinks: string;
  privacyPolicyContent: string;
  termsOfServiceContent: string;
  refundPolicyContent: string;
  pricingTitle: string;
  pricingSubtitle: string;
  pricingTiers: PricingTier[];
  disclaimerTitle: string;
  disclaimerContent: string;
  agreeButton: string;
  disclaimerAcknowledgement: string;
  importantDisclaimer: string;
  downloadFullBook: string;
  processing: string;
  purchaseSuccess: string;
  loginTitle: string;
  signupTitle: string;
  emailLabel: string;
  passwordLabel: string;
  nameLabel: string;
  loginBtn: string;
  signupBtn: string;
  noAccount: string;
  haveAccount: string;


  // Benefits Section
  benefitsTitle: string;
  benefitsSubtitle: string;
  benefits: BenefitItem[];

  // Smart Lab Reference
  labReference: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    noResults: string;
    analyzeBtn: string;
    analyzeTitle: string;
    enterValue: string;
    resultLabel: string;
    status: {
      low: string;
      normal: string;
      high: string;
    };
    categories: {
      all: string;
      hormones: string;
      organs: string;
      blood: string;
      vitamins: string;
      minerals: string;
      thyroid: string;
    };
    labels: {
      whatIsIt: string;
      normalRange: string;
      elevationMeaning: string;
      lowMeaning: string;
      management: string;
      cancel: string;
      high: string;
      low: string;
    };
    tests: LabTest[];
  };

  // New Section
  whoIsTitle: string;
  whoIsSubtitle: string;
  targetAudiences: TargetAudience[];
  whoIsClosing: string;
  whoIsCta: string;

  // Checkout Section
  checkoutTitle: string;
  billingDetails: string;
  fullName: string;
  emailAddress: string;
  paymentMethod: string;
  creditCard: string;
  cardNumber: string;
  expiryDate: string;
  cvc: string;
  payNow: string;
  cancel: string;
  orderSummary: string;
  total: string;
  secureCheckout: string;

  // About Page
  aboutPageTitle: string;
  aboutPageContent: string;
  aboutPageStoryTitle: string;
  aboutPageStory: string;
  aboutPageMissionTitle: string;
  aboutPageMission: string;

  // Contact Page
  contactPageTitle: string;
  contactPageSubtitle: string;
  contactFormNamePlaceholder: string;
  contactFormEmailPlaceholder: string;
  contactFormMessagePlaceholder: string;
  contactFormSubjectPlaceholder: string;
  contactFormSubmit: string;
  contactFormSuccessMessage: string;
  contactInfoAddress: string;
  contactInfoEmail: string;
  contactInfoPhone: string;
  contactInfoHours: string;
  homeLink: string;
  viewOnMap: string;

  // Cookie Consent
  cookieTitle: string;
  cookieMessage: string;
  cookieAccept: string;
  cookieReject: string;

  // Macro Calculator
  calcTitle: string;
  calcSubtitle: string;
  calcGender: string;
  calcMale: string;
  calcFemale: string;
  calcAge: string;
  calcWeight: string;
  calcHeight: string;
  calcActivity: string;
  calcTrainingStyle: string;
  calcGoal: string;
  calcCalculate: string;
  calcResults: string;
  calcCalories: string;
  calcProtein: string;
  calcCarbs: string;
  calcFats: string;
  calcCta: string;
  calcSmartMode: string;
  calcBodyFat: string;
  calcWater: string;
  calcLiters: string;
  calcRecalculate: string;
  calcGenerateMealPlan: string;
  calcGenerating: string;
  calcMealPlanTitle: string;
  calcMealPlanSubtitle: string;
  calcDisclaimer: string;
  calcTdeeLabel: string;
  calcBmrLabel: string;
  calcTefLabel: string;
  calcBeastTitle: string;
  calcPredictionTitle: string;
  calcWindowBtn: string;
  calcTrainingTime: string;
  calcTrainingWindows: {
    morning: string;
    afternoon: string;
    evening: string;
    advice: string;
  };
  calcAnalysisLabel: string;
  calcBmiStatusLabel: string;

  calcShuffleLabel: string;
  calcAwaitingInputLabel: string;
  calcAiEngineLabel: string;
  calcAnalyzingLabel: string;
  calcMetabolicActiveLabel: string;
  calcAnabolicPotentialLabel: string;
  calcBeastNames: {
    cut: string;
    maintain: string;
    bulk: string;
  };
  calcPredictions: {
    cut: string;
    maintain: string;
    bulk: string;
  };
  calcSelectGoal: {
    cut: string;
    maintain: string;
    bulk: string;
  };
  calcMealNames: string[];
  calcActivityLevels: {
    sedentary: string;
    light: string;
    moderate: string;
    active: string;
    veryActive: string;
  };
  calcTrainingStyles: {
    hypertrophy: string;
    strength: string;
    endurance: string;
  };

  // Genetic Potential Calculator
  geneticCalculator: {
    title: string;
    subtitle: string;
    labels: {
      height: string;
      wrist: string;
      ankle: string;
      bodyFat: string;
      frameSize: string;
      boneThickness: string;
      lowerBody: string;
      shoulders: string;
      chest: string;
      waist: string;
      thigh: string;
      calf: string;
      current: string;
      potential: string;
      analysis: string;
      roadmap: string;
      ffmi: string;
      goldenRatio: string;
      physiqueScore: string;
    };
    modelLabel: string;
    awaitingDataTitle: string;
    frameOptions: {
      small: string;
      medium: string;
      large: string;
    };
    unknownMeasurements: string;
    cta: string;
    reset: string;
    yourBodyType: string;
    resultTitle: string;
    naturalLabel: string;
    enhancedLabel: string;
    differenceLabel: string;
    disclaimer: string;
    unlockMsg: string;
    errorMsg: string;
    bodyTypes: {
      ecto: string;
      meso: string;
      endo: string;
    };
  };

  // Half-Life Visualizer
  halfLifeVisualizer: {
    title: string;
    subtitle: string;
    compoundLabel: string;
    dosageLabel: string;
    durationLabel: string;
    frequencyLabel: string;
    yAxis: string;
    xAxis: string;
    pctZone: string;
    pctStartMsg: string;
    peakLevelMsg: string;
    addToStackBtn: string;
    activeStackTitle: string;
    serumTitle: string;
    peakLabel: string;
    emptyStackMsg: string;
    compounds: Compound[];
    frequencies: {
      ed: string;
      eod: string;
      e3d: string;
      e7d: string;
    };
    tooltipDay: string;
    tooltipLevel: string;
    tooltipPctReady: string;
    tooltipWait: string;
    tooltipInject: string;
    analysis?: {
      title: string;
      prosTitle: string;
      consTitle: string;
      adviceTitle: string;
      pros: string[];
      cons: string[];
      advice: string;
    };
  };

  // Injection Map
  injectionMap: {
    labels: {
      left: string;
      right: string;
      days: string;
      injectionSteps: string;
      selectPoint: string;
      efficiency: string;
      recovery: string;
      bestFor: string;
      painLevel: string;
    };
    featureCards: {
      power: { title: string; desc: string };
      tissue: { title: string; desc: string };
      burn: { title: string; desc: string };
    };
    title: string;
    subtitle: string;
    viewFront: string;
    viewBack: string;
    needleSizeLabel: string;
    maxVolumeLabel: string;
    painLevelLabel: string;
    riskLevelLabel: string;
    recoveryLabel: string;
    lastInjectedLabel: string;
    logInjectionBtn: string;
    suggestBtn: string;
    suggesting: string;
    status: {
      ready: string;
      recovering: string;
      warning: string;
    };
    riskLevel: string;
    tapToExplore: string;
    interactiveMapLabel: string;
    medicalInsightLabel: string;
    riskLevels: {
      low: string;
      high: string;
    };
    goldenHourTitle: string;
    goldenHourDesc: string;
    goldenAdvice: string;
    rotationTrackerTitle: string;
    cumulativeGrowthLabel: string;
    efficiencyLabel: string;
    stimulatedCellsLabel: string;
    rotateHint: string;
    mrxInsightLabel: string;
    closeDetailsBtn: string;
    comfortableSpot: string;

    sites: InjectionSite[];
  };

  // AI Meal Plan Generator
  mealPlanTitle: string;
  mealPlanBtn: string;
  mealPlanLoading: string;
  mealPlanError: string;

  // Transformation Timeline
  timelineTitle: string;
  timelineSubtitle: string;
  timelinePhases: TimelinePhase[];
  timelineLabels: {
    strength: string;
    hypertrophy: string;
    water: string;
    fatLoss: string;
    mood: string;
    biologicalTitle: string;
    feelingTitle: string;
    actionTitle: string;
    phaseLabel: string;
  };
  timeUnits: {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  };
  offerExpired: string;
  heroEditions: Record<Language, string>;

  // Sales Toast
  salesToast: {
    purchased: string;
    verified: string;
    justNow: string;
    fromLabel: string;
  };

  // Audio Player
  audioPlayer: {
    title: string;
    subtitle: string;
    duration: string;
  };

  // AI Chat
  aiChat: {
    fabLabel: string;
    title: string;
    subtitle: string;
    placeholder: string;
    send: string;
    disclaimer: string;
    welcomeMessage: string;
  };

  // Readiness Quiz
  quiz: QuizContent;

  // Daily IQ Challenge
  dailyIQ: DailyIQContent;

  // Common Abbreviations & Units
  units: {
    mg: string;
    g: string;
    ml: string;
    kcal: string;
    days: string;
    weeks: string;
    percentage: string;
    liters: string;
    ed: string;
    eod: string;
    twiceWeekly: string;
    weekly: string;
  };

  // Cycle Architect (NEW)
  cycleArchitect: CycleArchitectContent;
}

export interface TableRow {
  col1: string;
  col2: string;
  col3: string;
}

export interface TeaserTableData {
  title: string;
  headers: string[];
  rows: TableRow[];
}