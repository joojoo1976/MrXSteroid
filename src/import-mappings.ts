/**
 * Import path mappings for restructured Mr. X Steroid application
 * This file maps old import paths to new import paths after restructuring
 */

// Old to new path mappings
export const importMappings = {
  // Components mappings
  './components/layout/Header': './shared/ui/Header',
  './components/layout/Hero': './shared/ui/Hero',
  './components/layout/Footer': './shared/ui/Footer',
  './components/layout/DynamicBrandLogo': './shared/ui/DynamicBrandLogo',
  './components/layout/FloatingSideIcon': './shared/ui/FloatingSideIcon',
  
  // Marketing components
  './components/marketing/Features': './features/marketing/Features',
  './components/marketing/BenefitsSection': './features/marketing/BenefitsSection',
  './components/marketing/ContactSection': './features/marketing/ContactSection',
  './components/marketing/FAQ': './features/marketing/FAQ',
  './components/marketing/Features': './features/marketing/Features',
  './components/marketing/LiveSchedule': './features/marketing/LiveSchedule',
  './components/marketing/PricingSection': './features/marketing/PricingSection',
  './components/marketing/SmartBookLanding': './features/marketing/SmartBookLanding',
  './components/marketing/ArabicVideoSection': './features/marketing/ArabicVideoSection',
  './components/marketing/AuthorSection': './features/marketing/AuthorSection',
  
  // Shared components
  './components/shared/AdPlaceholder': './shared/ui/AdPlaceholder',
  './components/shared/BrandLogo': './shared/ui/BrandLogo',
  './components/shared/ChatWidget': './shared/ui/ChatWidget',
  './components/shared/CurrencyPrice': './shared/ui/CurrencyPrice',
  './components/shared/EliteTable': './shared/ui/EliteTable',
  './components/shared/KineticCounter': './shared/ui/KineticCounter',
  './components/shared/RevealOnScroll': './shared/ui/RevealOnScroll',
  './components/shared/SalesToast': './shared/ui/SalesToast',
  './components/shared/StyledBrandName': './shared/ui/StyledBrandName',
  './components/shared/UnitToggle': './shared/ui/UnitToggle',
  './components/shared/WhatsAppButton': './shared/ui/WhatsAppButton',
  
  // UI components
  './components/ui/accordion': './shared/ui/accordion',
  './components/ui/alert-dialog': './shared/ui/alert-dialog',
  './components/ui/alert': './shared/ui/alert',
  './components/ui/aspect-ratio': './shared/ui/aspect-ratio',
  './components/ui/avatar': './shared/ui/avatar',
  './components/ui/badge': './shared/ui/badge',
  './components/ui/breadcrumb': './shared/ui/breadcrumb',
  './components/ui/button': './shared/ui/button',
  './components/ui/calendar': './shared/ui/calendar',
  './components/ui/card': './shared/ui/card',
  './components/ui/carousel': './shared/ui/carousel',
  './components/ui/chart': './shared/ui/chart',
  './components/ui/checkbox': './shared/ui/checkbox',
  './components/ui/collapsible': './shared/ui/collapsible',
  './components/ui/command': './shared/ui/command',
  './components/ui/dialog': './shared/ui/dialog',
  './components/ui/drawer': './shared/ui/drawer',
  './components/ui/dropdown-menu': './shared/ui/dropdown-menu',
  './components/ui/form': './shared/ui/form',
  './components/ui/hover-card': './shared/ui/hover-card',
  './components/ui/input': './shared/ui/input',
  './components/ui/label': './shared/ui/label',
  './components/ui/navigation-menu': './shared/ui/navigation-menu',
  './components/ui/pagination': './shared/ui/pagination',
  './components/ui/popover': './shared/ui/popover',
  './components/ui/progress': './shared/ui/progress',
  './components/ui/radio-group': './shared/ui/radio-group',
  './components/ui/resizable': './shared/ui/resizable',
  './components/ui/scroll-area': './shared/ui/scroll-area',
  './components/ui/select': './shared/ui/select',
  './components/ui/separator': './shared/ui/separator',
  './components/ui/sheet': './shared/ui/sheet',
  './components/ui/sidebar': './shared/ui/sidebar',
  './components/ui/skeleton': './shared/ui/skeleton',
  './components/ui/slider': './shared/ui/slider',
  './components/ui/sonner': './shared/ui/sonner',
  './components/ui/switch': './shared/ui/switch',
  './components/ui/table': './shared/ui/table',
  './components/ui/tabs': './shared/ui/tabs',
  './components/ui/textarea': './shared/ui/textarea',
  './components/ui/toast': './shared/ui/toast',
  './components/ui/toaster': './shared/ui/toaster',
  './components/ui/toggle-group': './shared/ui/toggle-group',
  './components/ui/toggle': './shared/ui/toggle',
  './components/ui/tooltip': './shared/ui/tooltip',
  './components/ui/form-context': './shared/ui/form-context',
  
  // Modal components
  './components/modals/BlockingDisclaimerModal': './features/modal/BlockingDisclaimerModal',
  './components/modals/LegalModal': './features/modal/LegalModal',
  './components/modals/CheckoutModal': './features/modal/CheckoutModal',
  './components/modals/DisclaimerModal': './features/modal/DisclaimerModal',
  './components/modals/PreferencesModal': './features/modal/PreferencesModal',
  
  // Auth components
  './components/auth/AuthGuard': './features/auth/AuthGuard',
  './components/auth/ProtectedLayout': './features/auth/ProtectedLayout',
  
  // Checkout components
  './components/checkout/CheckoutForm': './features/checkout/CheckoutForm',
  './components/checkout/OrderSummary': './features/checkout/OrderSummary',
  './components/checkout/ProductSelector': './features/checkout/ProductSelector',
  
  // Calculator components (moved to features)
  './components/tools/BodyFatCalculator': './features/calculator/BodyFatCalculator',
  './components/tools/CycleCalendarExporter': './features/calculator/CycleCalendarExporter',
  './components/tools/DailyIQChallenge': './features/calculator/DailyIQChallenge',
  './components/tools/GeneticPotentialCalculator': './features/calculator/GeneticPotentialCalculator',
  './components/tools/HalfLifeVisualizer': './features/calculator/HalfLifeVisualizer',
  './components/tools/InjectionMap': './features/calculator/InjectionMap',
  './components/tools/MacroCalculator': './features/calculator/MacroCalculator',
  './components/tools/MasterCalculator': './features/calculator/MasterCalculator',
  './components/tools/SmartLabReference': './features/calculator/SmartLabReference',
  './components/tools/SteroidReadinessQuiz': './features/calculator/SteroidReadinessQuiz',
  './components/tools/TransformationTimeline': './features/calculator/TransformationTimeline',
  
  // Other components
  './components/CountdownTimer': './shared/ui/CountdownTimer',
  './components/MedicalDisclaimerPage': './shared/ui/MedicalDisclaimerPage',
  './components/Settings': './shared/ui/Settings',
  
  // Pages (these might need to be moved to features as well)
  './pages/LoginPage': './features/auth/LoginPage',
  './pages/SignupPage': './features/auth/SignupPage',
  './pages/ResetPasswordPage': './features/auth/ResetPasswordPage',
  './pages/ProfilePage': './features/profile/ProfilePage',
  './pages/Dashboard': './features/dashboard/DashboardPage',
  './pages/CheckoutPage': './features/checkout/CheckoutPage',
  './pages/AboutPage': './features/content/AboutPage',
  './pages/SitemapPage': './features/content/SitemapPage',
  './pages/AccessibilityPage': './features/content/AccessibilityPage',
  './pages/GDPRPage': './features/content/GDPRPage',
  './pages/CCPAPage': './features/content/CCPAPage',
  './pages/BlogPage': './features/content/BlogPage',
  './pages/ShippingPolicyPage': './features/content/ShippingPolicyPage',
  './pages/ReturnPolicyPage': './features/content/ReturnPolicyPage',
  './pages/CookiePolicyPage': './features/content/CookiePolicyPage',
  './pages/SupportPage': './features/content/SupportPage',
  './pages/CareersPage': './features/content/CareersPage',
  './pages/FAQPage': './features/content/FAQPage',
  './pages/ContactPage': './features/content/ContactPage',
  './pages/PrivacyPage': './features/content/PrivacyPage',
  './pages/TermsPage': './features/content/TermsPage',
  './pages/RefundPage': './features/content/RefundPage',
  './pages/LegalDisclaimerPage': './features/content/LegalDisclaimerPage',
  './pages/DiagnosticPage': './features/diagnostics/DiagnosticPage',
  './pages/SuccessPage': './features/checkout/SuccessPage',
  './pages/CancelPage': './features/checkout/CancelPage',
  './pages/PaymentPendingPage': './features/checkout/PaymentPendingPage',
  './pages/RepresentativePage': './features/admin/RepresentativePage',
  './pages/AdminDashboard': './features/admin/AdminDashboard',
  './pages/AuthCallbackPage': './features/auth/AuthCallbackPage',
  
  // Utils mappings
  './utils/aiToolsAdapter': './shared/lib/aiToolsAdapter',
  './utils/backend-notification-service': './shared/lib/backend-notification-service',
  './utils/calculators': './shared/lib/calculators',
  './utils/contextOptimization': './shared/lib/contextOptimization',
  './utils/cryptoUtils': './shared/lib/cryptoUtils',
  './utils/database-optimization': './shared/lib/database-optimization',
  './utils/geminiService': './shared/lib/geminiService',
  './utils/health-check': './shared/lib/health-check',
  './utils/i18n-utils': './shared/lib/i18n-utils',
  './utils/keywordGenerator': './shared/lib/keywordGenerator',
  './utils/logger': './shared/lib/logger',
  './utils/logic': './shared/lib/logic',
  './utils/openaiService': './shared/lib/openaiService',
  './utils/performance-optimization': './shared/lib/performance-optimization',
  './utils/secureStorage': './shared/lib/secureStorage',
  './utils/toolSynthesizer': './shared/lib/toolSynthesizer',
  './utils/user-experience-enhancements': './shared/lib/user-experience-enhancements',
  
  // Security mappings
  './security/security-enhancements': './shared/lib/security-enhancements',
  
  // Testing mappings
  './testing/testing-framework': './shared/lib/testing-framework',
  './testing/sample-tests': './shared/lib/sample-tests',
  
  // Services mappings
  './services/auth-service': './shared/lib/auth-service',
  './services/payment.service': './shared/lib/payment.service',
  './services/RealtimeSyncService': './shared/lib/RealtimeSyncService',
  
  // Lib mappings
  './lib/error-handler': './shared/lib/error-handler',
  './lib/i18n': './shared/lib/i18n',
  './lib/linkage-inspector': './shared/lib/linkage-inspector',
  './lib/schemas': './shared/lib/schemas',
  './lib/schemas.test': './shared/lib/schemas.test',
  './lib/supabase': './shared/lib/supabase',
  './lib/utils': './shared/lib/utils',
  
  // Hooks mappings
  './hooks/use-toast': './shared/hooks/use-toast',
  './hooks/useCurrency': './shared/hooks/useCurrency',
  './hooks/useReducedMotion': './shared/hooks/useReducedMotion',
  
  // Types mappings
  './types': './shared/types/types',
  './types/db_types': './shared/types/db_types',
  
  // Calculator hooks mappings
  './features/calculator/hooks/useBodyFatCalculator': './features/calculator/hooks/useBodyFatCalculator',
  './features/calculator/hooks/useCycleCalendarExporter': './features/calculator/hooks/useCycleCalendarExporter',
  './features/calculator/hooks/useDailyIQChallenge': './features/calculator/hooks/useDailyIQChallenge',
  './features/calculator/hooks/useGeneticPotential': './features/calculator/hooks/useGeneticPotential',
  './features/calculator/hooks/useHalfLifeVisualizer': './features/calculator/hooks/useHalfLifeVisualizer',
  './features/calculator/hooks/useInjectionMap': './features/calculator/hooks/useInjectionMap',
  './features/calculator/hooks/useMacroCalculator': './features/calculator/hooks/useMacroCalculator',
  './features/calculator/hooks/useMasterCalculator': './features/calculator/hooks/useMasterCalculator',
  './features/calculator/hooks/usePricing': './features/calculator/hooks/usePricing',
  './features/calculator/hooks/useReadinessQuiz': './features/calculator/hooks/useReadinessQuiz',
  './features/calculator/hooks/useSmartLabReference': './features/calculator/hooks/useSmartLabReference',
  './features/calculator/hooks/useTransformationTimeline': './features/calculator/hooks/useTransformationTimeline',
  
  // Auth hooks mappings
  './features/auth/hooks/useLogin': './features/auth/hooks/useLogin',
  './features/auth/hooks/useSignup': './features/auth/hooks/useSignup',
  
  // Checkout hooks mappings
  './features/checkout/hooks/useCheckout': './features/checkout/hooks/useCheckout',
  
  // Chat hooks mappings
  './features/chat/hooks/useChat': './features/chat/hooks/useChat',
};

// Create reverse mappings for easy lookup
export const reverseMappings = Object.entries(importMappings).reduce((acc, [oldPath, newPath]) => {
  acc[newPath] = oldPath;
  return acc;
}, {} as Record<string, string>);