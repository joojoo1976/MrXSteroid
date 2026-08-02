

export enum Language {
  AR = 'ar',
  EN = 'en'
}



export enum Currency {
  USD = 'USD',
  EGP = 'EGP',
  SAR = 'SAR'
}

export enum Theme {
  LIGHT  = 'light',
  DARK   = 'dark',
  SYSTEM = 'system',
}

export enum Page {
  HOME = 'home',
  MACRO = 'macro',
  BODYFAT = 'bodyfat',
  INJECTION = 'injection',
  HALFLIFE = 'halflife',
  LAB = 'lab',
  GENETIC = 'genetic',
  CYCLE_ARCHITECT = 'cycle',
  MASTER_CALCULATOR = 'master-calculator',
  SMART_LANDING = 'smart-landing',
  LOGIN = 'login',
  SIGNUP = 'signup',
  PROFILE = 'profile',
  MEDICAL_DISCLAIMER = 'medical_disclaimer',
  RESET_PASSWORD = 'reset_password',
  CHECKOUT = 'checkout',
  DASHBOARD = 'dashboard',
  DIAGNOSTIC = 'diagnostic',
  ABOUT = 'about',
  SITEMAP = 'sitemap',
  ACCESSIBILITY = 'accessibility',
  GDPR = 'gdpr',
  CCPA = 'ccpa',
  BLOG = 'blog',
  SHIPPING_POLICY = 'shipping_policy',
  RETURN_POLICY = 'return_policy',
  COOKIE_POLICY = 'cookie_policy',
  SUPPORT = 'support',
  CAREERS = 'careers',
  FAQ = 'faq',
  CONTACT = 'contact',
  PRIVACY = 'privacy',
  TERMS = 'terms',
  REFUND = 'refund',
  LEGAL_DISCLAIMER_PAGE = 'legal_disclaimer_page',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_CANCEL = 'payment_cancel',
  PAYMENT_PENDING = 'payment_pending',
  REPRESENTATIVE = 'representative',
  ADMIN_DASHBOARD = 'admin_dashboard',
  AUTH_CALLBACK = 'auth_callback',
  PAYMENT_CONFIG_DIAGNOSTIC = 'payment-config-diagnostic'
}

export type ProductVariant = 'digital' | 'paperback' | 'hardcover' | 'bundle' | 'coaching' | 'coaching_plus';
export type ShippingZone = 'egypt' | 'global';

export interface CheckoutState {
  variant: ProductVariant;
  quantity: number;
  shippingZone: ShippingZone;
}

export interface PricingTier {
  id: ProductVariant;
  name: string;
  price: number;
  originalPrice?: string;
  description: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
  popularLabel?: string;
  requiresShipping: boolean;
  requiresBodyStats: boolean;
  includesEbook: boolean;
  includesAudiobook: boolean;
  includesCoaching: boolean;
  selectedLanguage?: 'en' | 'ar';
  selectedLocation?: 'EG' | 'GLOBAL';
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
  iconKey: 'time' | 'science' | 'shield' | 'source' | 'health' | 'guide' | 'truth' | 'roi' | 'safety' | 'simplified' | 'smart' | 'chart' | 'exit' | 'women' | 'injection' | string;
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
  /** Numeric start week — powers the live computation engine. */
  weekStart: number;
  /** Numeric end week — powers the live computation engine. */
  weekEnd: number;
  title: string;
  shortDesc: string;
  /** Premium marketing tagline shown under the title. */
  tagline: string;
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
  nameAr?: string;
  halfLife: number; // in days
  esterWeight?: number; // 0.0 - 1.0 (percentage of active hormone)
  tips?: string[];
  warnings?: string[];
  medicalAlert?: string;
  medicalAlertAr?: string;
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
  steps?: string[];
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
  retakeBtn: string;
  ctaPricingLabel: string;
  discountCodeLabel: string;
  discountCopiedLabel: string;
  discountHint: string;
  results: {
    natural: {
      title: string;
      badge: string;
      desc: string;
      cta: string;
    };
    enhanced: {
      title: string;
      badge: string;
      desc: string;
      cta: string;
      discountPrefix: string;
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
  gatekeeperTitle?: string;
  gatekeeperSubtitle?: string;
  gatekeeperBtn?: string;
  loginSuccess?: string;
  signupSuccess?: string;
  invalidCredentials?: string;
  confirmPasswordLabel?: string;
  loginLockoutMessage?: string;
  emailPlaceholder?: string;
  passwordPlaceholder?: string;
  usernamePlaceholder?: string;
  fullNamePlaceholder?: string;
  logout?: string; // Add logout here
  welcomeUser?: string; // Optional: for 'Welcome, User'
  forgotPassword?: string;
  resetPassword?: string;
  sendResetLink?: string;
  newPassword?: string;
  confirmNewPassword?: string;
  passwordResetSuccess?: string;
  passwordResetError?: string;
  emailSentSuccess?: string;
  backToLogin?: string;
  resetPasswordTitle?: string;
  resetPasswordDesc?: string;

  // Navigation & Tools
  navAiTools: string;
  navPremiumResources: string;
  navFeatures: string;
  navToolNames: {
    macro: string;
    bodyfat: string;
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
  backToHome?: string;
  viewFullDatabase?: string;
  eliteSchedulesTitle?: string;
  eliteSchedulesSubtitle?: string;
  expertProtocol?: string;
  allTopics?: string;
  noFaqsFound?: string;
  resetScan?: string;
  liveData?: string;
  noActiveSchedules?: string;

  // SEO Specific Fields
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];

  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  downloadPreview: string;
  audioPreviewBtn: string;
  authorSection: string;
  authorName: string;
  authorBio?: string;
  featuresTitle?: string;
  sneakPeekTitle: string;
  sneakPeekSubtitle: string;
  unlockText: string;
  buyNow?: string;
  contact?: string;
  copyright?: string;
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
  privacyPolicy?: string;
  termsOfService?: string;
  refundPolicy?: string;
  legalDisclaimer?: string;
  aboutUs: string;
  legal: string;
  quickLinks: string;
  privacyPolicyContent: string;
  termsOfServiceContent: string;
  refundPolicyContent: string;
  pricingTitle: string;
  pricingSubtitle: string;
  pricingTiers: PricingTier[];
  disclaimerTitle?: string;
  disclaimerContent?: string;
  agreeButton?: string;
  disclaimerAcknowledgement?: string;
  importantDisclaimer?: string;
  downloadFullBook: string;
  processing: string;
  purchaseSuccess: string;
  // Checkout & Shipping
  billingAddress?: string;
  shippingAddress?: string;
  city?: string;
  zipCode?: string;
  shippingProvider?: string;
  weight?: string;
  height?: string;
  age?: string;
  goal?: string;
  securePaymentMessage?: string;
  orderSummary?: string;
  subtotal?: string;
  shipping?: string;
  transactionFee?: string;
  total?: string;
  payNow?: string;
  secureCheckout?: string;
  fullName?: string;
  emailAddress?: string;
  checkoutTitle?: string;
  billingDetails?: string;
  paymentMethod?: string;
  cancel?: string;
  loginTitle?: string;
  signupTitle?: string;
  emailLabel?: string;
  passwordLabel?: string;
  nameLabel?: string;
  loginBtn?: string;
  signupBtn?: string;
  noAccount?: string;
  haveAccount?: string;
  usernameLabel?: string;
  profileTitle?: string;


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


  // About Page
  aboutPageTitle?: string;
  aboutPageContent?: string;
  accessibilityTitle?: string;
  gdprTitle?: string;
  ccpaTitle?: string;
  blogTitle?: string;
  shippingPolicyTitle?: string;
  returnPolicyTitle?: string;
  cookiePolicyTitle?: string;
  complianceLinks?: string;
  commercialLinks?: string;
  generalLinks?: string;
  internationalLegalLinks?: string;
  supportTitle?: string;
  careersTitle?: string;
  faqPageTitle?: string;
  privacyTitle?: string;
  termsTitle?: string;
  refundTitle?: string;
  legalDisclaimerTitle?: string;
  supportLinks?: string;
  pricingPlans: {
    id: ProductVariant;
    name: string;
    description: string;
    features: string[];
    upsellFeatures?: string[];
    cta: string;
  }[];
  checkout: {
    validation: {
      nameRequired: string;
      emailInvalid: string;
      countryRequired: string;
      addressRequired: string;
      cityRequired: string;
      zipRequired: string;
      shippingRequired: string;
      weightRequired: string;
      heightRequired: string;
      termsRequired: string;
    };
    placeholders: {
      fullName: string;
      email: string;
      address: string;
    };
  };
  nav?: {
    home: string;
    about: string;
    macro: string;
    injection: string;
    halflife: string;
    lab: string;
    genetic: string;
    cycle: string;
    sitemap: string;
    login: string;
    signup: string;
  };
  aboutPageStoryTitle?: string;
  aboutPageStory?: string;
  aboutPageMissionTitle?: string;
  aboutPageMission?: string;


  // Contact Page
  contactPageTitle?: string;
  contactPageSubtitle?: string;
  contactFormNamePlaceholder?: string;
  contactFormEmailPlaceholder?: string;
  contactFormMessagePlaceholder?: string;
  contactFormSubjectPlaceholder?: string;
  contactFormSubmit?: string;
  contactFormSuccessMessage?: string;
  contactInfoAddress?: string;
  contactInfoEmail?: string;
  contactInfoPhone?: string;
  contactInfoHours?: string;
  homeLink?: string;
  viewOnMap?: string;

  // Branded Contact Form
  contactOperatorIdentityLabel?: string;
  contactSignalHashLabel?: string;
  contactMissionTypeLabel?: string;
  contactTransmissionReferenceLabel?: string;
  contactTransmissionHeaderLabel?: string;
  toastLocalizationTitle?: string;
  toastLocalizationDesc?: string;
  changeButton?: string;
  errorNetwork?: string;
  errorPayment?: string;
  errorAuth?: string;
  errorUnknown?: string;
  contactMissionPayloadLabel?: string;
  contactExecuteTransmissionBtn?: string;
  contactSynchronizingBtn?: string;
  contactTransmissionReceivedTitle?: string;
  contactTransmissionReceivedDesc?: string;
  contactTransmissionInterrupted?: string;
  contactSocialInstagram?: string;
  contactSocialTwitter?: string;
  contactSocialYoutube?: string;
  contactDirectSecureLine?: string;
  contactSupportCommandCenter?: string;
  contactLeadArchitectLabel?: string;
  contactRelayActiveLabel?: string;
  contactTransmissionProtocolLabel?: string;
  contactEncryptedLabel?: string;
  contactSelectTopicPlaceholder?: string;
  contactTopicGeneral?: string;
  contactTopicOrder?: string;
  contactTopicTechnical?: string;
  contactTopicWholesale?: string;
  contactTopicConsultation?: string;
  contactMedicalDisclaimerTitle?: string;
  contactMedicalDisclaimerCheckbox?: string;
  contactResponseTimeLabel?: string;
  contactGlobalRelayLabel?: string;
  contactSystemStatusLabel?: string;
  contactCopySuccess?: string;
  contactErrorName?: string;
  contactErrorEmail?: string;
  contactErrorSubject?: string;
  contactErrorMessage?: string;
  contactErrorOrderId?: string;
  contactErrorDisclaimer?: string;

  // Support & FAQ Additional
  supportHeroDesc?: string;
  supportSearchPlaceholder?: string;
  supportQuickLinksTitle?: string;
  supportUserGuide?: string;
  supportNotFoundText?: string;
  supportContactDirect?: string;
  supportEmailTitle?: string;
  supportWhatsAppTitle?: string;
  supportHoursTitle?: string;
  supportHoursValue?: string;
  faqAnotherQuestion?: string;
  faqExpertHelpText?: string;
  faqContactBtn?: string;
  faqSupportBtn?: string;
  aboutValueSafety?: string;
  aboutValueScience?: string;
  aboutValueExcellence?: string;
  aboutValueCommunity?: string;
  faqsData?: Array<{ q: string; a: string; category: string }>;
  returnPolicyExchangeAllowed?: string;
  returnPolicyExchangeReason1?: string;
  returnPolicyExchangeReason2?: string;
  returnPolicyExchangeReason3?: string;
  returnPolicyNonReturnable?: string;
  returnPolicyNonReturnableReason1?: string;
  returnPolicyNonReturnableReason2?: string;
  returnPolicyNonReturnableReason3?: string;
  returnPolicyHowToStepsTitle?: string;
  returnPolicyHowToStepsText?: string;
  scheduleData?: {
    id: number;
    phase: string;
    focus: string;
    protocol: string;
    status: string;
    intensity: string;
  }[];
  scheduleTableTitle?: string;
  scheduleTableDescription?: string;
  scheduleHeaders?: {
    phase: string;
    focus: string;
    protocol: string;
    status: string;
  };
  hlTotal?: string;
  hlStartsDay?: string;
  hlRecoveryPower?: string;
  hlDrug?: string;
  hlFirst10Days?: string;
  hlWeeks2to4?: string;
  hlFreq?: string;
  hlNaturalZone?: string;
  hlBlastZone?: string;
  hlPctAdvice?: string;
  hlProtocolLevel?: string;
  hlUltraLevel?: string;
  hlModerateLevel?: string;
  hlLiteLevel?: string;
  hlEffectiveDose?: string;
  hlHalfLifeLabel?: string;
  hlClearanceLabel?: string;
  hlActiveDays?: string;
  hlAvgPeak?: string;
  hlClearStack?: string;
  hlClearStackConfirm?: string;
  hlUnitToggleLabel?: string;
  hlMetric?: string;
  hlImperial?: string;


  // Privacy & Terms
  privacyCollectionTitle?: string;
  privacyCollectionDesc?: string;
  privacySecurityTitle?: string;
  privacySecurityDesc?: string;
  privacyRightsTitle?: string;
  privacyRightsDesc?: string;
  privacyComplianceNote?: string;
  termsEligibilityTitle?: string;
  termsEligibilityDesc?: string;
  termsPropertyTitle?: string;
  termsPropertyDesc?: string;
  termsLiabilityTitle?: string;
  termsLiabilityDesc?: string;
  termsAgreeBtn?: string;

  // Landing & Pricing Polish
  landingAvailableIn?: string;
  landingSubtitle?: string;
  landingDescription?: string;
  landingFlashSale?: string;
  landingSavePercentage?: string;
  landingSecurePayment?: string;
  landingClaimDownload?: string;
  landingLiveTrends?: string;
  landingWeekIndex?: string;
  landingTrendsDisclaimer?: string;
  landingExclusiveSecrets?: string;
  landingMoneyBackGuarantee?: string;
  pricingInitialize?: string;
  pricingBestValue?: string;
  pricingBilledInUsd?: string;
  pricingAddCoaching?: string;
  pricingCoachingRate?: string;
  pricingRequiresStats?: string;
  pricingCoachingUnlock?: string;

  // Cookie Consent
  cookieTitle?: string;
  cookieMessage?: string;
  cookieAccept?: string;
  cookieReject?: string;

  medicalDisclaimerPage: {
    title: string;
    sections: {
      title: string;
      content: string;
    }[];
  };

  // Macro Calculator
  calcTitle: string;
  calcSubtitle: string;
  calcFeatures?: { title: string; desc: string }[];
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
  calcHidePlan: string;
  calcShowPlan: string;
  calcGenerateMealPlan: string;
  calcGenerating: string;
  calcMealPlanTitle: string;
  calcMealPlanSubtitle: string;
  calcDisclaimer: string;
  calcTdeeLabel: string;
  calcBmrLabel: string;
  calcTefLabel: string;
  calcBmiStatuses: {
    underweight: string;
    healthy: string;
    overweight: string;
    obese: string;
  };
  calcMealSteps: {
    preheat: string;
    season: string;
    cook: string;
    prepare: string;
    combine: string;
  };

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
  calcDistributionTitle: string;
  calcProteinDesc: string;
  calcCarbsDesc: string;
  calcFatsDesc: string;
  calcPredictiveAccuracyVal: string;

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
  calcAiInsightTitle: string;
  calcAiInsightText: string;
  calcPredictiveAccuracy: string;
  calcEcosystemStatus: string;
  calcMealBalanceLabel: string;
  calcRecipeStepsLabel: string;
  calcPatternAnalysisLabel: string;
  calcMetabolicEfficiencyLabel: string;
  calcSimulateBtn: string;
  macroEcosystem: {
    syncStatus: string;
    analysisTitle: string;
    evolutionaryTitle: string;
    aiInsightTitle: string;
    stepsLabel: string;
    ingredientsLabel: string;
  };

  // Body Fat Calculator
  bfTitle: string;
  bfSubtitle: string;
  bfGender: string;
  bfMale: string;
  bfFemale: string;
  bfAge: string;
  bfWeight: string;
  bfHeight: string;
  bfWaist: string;
  bfHip: string;
  bfNeck: string;
  bfCalculate: string;
  bfAnalyzing: string;
  bfCategoryTitle: string;
  bfFormulaNote: string;
  bfPercentageLabel: string;
  bfMassLabel: string;
  bfLeanMassLabel: string;
  bfCalculateMacros: string;
  bfGeneticPotential: string;
  bfAwaitingData: string;
  bfCategories: {
    essential: string;
    athletes: string;
    fitness: string;
    average: string;
    obese: string;
  };
  bfCategoryDescriptions: {
    male: {
      essential: string;
      athletes: string;
      average: string;
      obese: string;
    };
    female: {
      essential: string;
      athletes: string;
      average: string;
      obese: string;
    };
  };

  // Timeline
  timelineWeekLabel: string;

  // Smart Lab Reference Extra
  labRestartScan: string;
  labClose: string;

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
      boundariesLabel: string;
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
    caseyExplainTitle: string;
    caseyExplainIntro: string;
    caseyFormulaLabel: string;
    caseyFormula: string;
    caseyStepsTitle: string;
    caseySteps: string[];
    radarLegendTitle: string;
    radarLegendIntro: string;
    radarLegend: { key: string; label: string; note: string }[];
    boundariesIntro: string;
    boundariesDetailsTitle: string;
    boundariesDetails: string[];
    advice: {
      title: string;
      eyebrow: string;
      body: string;
      points: string[];
      footer: string;
    };
    awaitingSubtitle: string;
    currentVsPotential: string;
    potentialCeiling: string;
    bodyTypes: {
      ecto: string;
      meso: string;
      endo: string;
    };
  };

  // Half-Life Visualizer
  adLabel: string;
  halfLifeVisualizer: {
    title: string;
    subtitle: string;
    compoundLabel: string;
    dosageLabel: string;
    durationLabel: string;
    startWeekLabel: string;
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
    saturationTitle: string;
    stabilityTitle: string;
    estrogenRisk: string;
    prolactinRisk: string;
    riskLevels: {
      low: string;
      med: string;
      high: string;
    };
    emptyStackMsg: string;
    emptyStackDesc: string;
    hazardWarning: string;
    effectiveDoseLabel?: string;
    halfLifeInfoLabel?: string;
    clearanceInfoLabel?: string;
    peakTimelineTitle?: string;
    compoundBreakdownTitle?: string;
    clearanceChartLabel?: string;
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
      stabilityAdviceTitle: string;
      safetyAdviceTitle: string;
      pctTableTitle: string;
      pros: string[];
      cons: string[];
      advice: string;
      pctNote: string;
      protocolLevelLabel: string;
      recoveryPowerLabel: string;
      tableHeaders: {
        compound: string;
        first10Days: string;
        weeks2to4: string;
        frequency: string;
      };
      stabilityExcellent: string;
      stabilityFluctuation: string;
      safetySafe: string;
      safety19nor: string;
      safetyAromatization: string;
      pctStartPrefix: string;
      pctStartSuffix: string;
      pctHeavy: string;
      pct19nor: string;
      pctDaily: string;
      pctEod: string;
      pctNolvadex: string;
      pctClomid: string;
      pctHcg: string;
    };
    consistencyLabel: string;
    mgSerumLabel: string;
    loadLevelLabel: string;
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

    medicalAdvice: {
      eyebrow: string;
      title: string;
      intro: string;
      points: string[];
      warning: string;
      footer: string;
    };

    editPoints: {
      eyebrow: string;
      title: string;
      intro: string;
      dragHint: string;
      saveHint: string;
      enableBtn: string;
      disableBtn: string;
      resetBtn: string;
      saveBtn: string;
      savedToast: string;
      resetToast: string;
      activeLabel: string;
      inactiveLabel: string;
    };

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
    chartTitle: string;
    chartSubtitle: string;
    // Live computation engine labels
    engineTitle: string;
    engineSubtitle: string;
    startWeightLabel: string;
    bodyFatLabel: string;
    trainingAgeLabel: string;
    trainingNovice: string;
    trainingIntermediate: string;
    trainingAdvanced: string;
    weeklyFatLoss: string;
    weeklyMuscleGain: string;
    cumulativeMuscle: string;
    projectedFatPct: string;
    metric: string;
    imperial: string;
    perWeek: string;
    disclaimer: string;
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
    label: string;
    suggestions: string[];
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
  checkoutAgree: string;
  disclaimerStep1Title?: string;
  disclaimerStep2Title?: string;
  disclaimerStep3Title?: string;
  nextStepLabel?: string;
  ageVerificationRequired?: string;
  ageVerificationDesc?: string;
  medicalDisclaimerPoint1?: string;
  medicalDisclaimerPoint2?: string;
  medicalDisclaimerPoint3?: string;

  masterCalc?: {
    title: string;
    subtitle: string;
    configTitle: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    saveBtn: string;
    vaultMsg: string;
    resultDosage: string;
    unitWeek: string;
    intensityLabel: string;
    safetyLabel: string;
    riskLabel: string;
    optimal: string;
    reduced: string;
    high: string;
    low: string;
    adviceTitle: string;
    logicAccuracy: string;
    unitSystem: string;
    metabolicSaturation: string;
    stabilityIndex: string;
    loadingVault: string;
  };
  // Macro Calculator Additional Labels
  calcPreparationStepsLabel?: string;
  calcExpertAdviceLabel?: string;
  calcMealAdvice?: string;
  calcOptimizedForStack?: string;
  // Master Calculator Additional Labels
  labTestsEn?: string;
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