import { ContentStrings, LabTest, InjectionSite, Compound, TimelinePhase, IQQuestion, QuizContent, DailyIQContent, CycleArchitectContent } from '../types';
import { seoKeywordsEnglish, footerKeywordsPoolEn, salesDataEn, fullEnglishDisclaimer, commonCompounds } from './data';

export const labTestsEn: LabTest[] = [
    {
        id: "test_total",
        name: "Total Testosterone",
        category: "hormones",
        description: "The primary male sex hormone, responsible for muscle growth and libido.",
        range: "300 - 1000 ng/dL",
        unit: "ng/dL",
        min: 300,
        max: 1000,
        elevationMeaning: "High levels can lead to acne, hair loss, and mood changes. Common on cycle.",
        lowMeaning: "Low levels cause fatigue, muscle loss, and low libido.",
        management: "Monitor LH/FSH and consider TRT if persistently low."
    },
    {
        id: "test_free",
        name: "Free Testosterone",
        category: "hormones",
        description: "The bioavailable testosterone not bound to SHBG or albumin.",
        range: "5 - 21 pg/mL",
        unit: "pg/mL",
        min: 5,
        max: 21,
        elevationMeaning: "Commonly elevated during exogenous testosterone use.",
        lowMeaning: "Often a better indicator of low-T symptoms than total test.",
        management: "Address SHBG levels to optimize free T ratio."
    },
    {
        id: "e2",
        name: "Estradiol (E2)",
        category: "hormones",
        description: "The primary form of estrogen. Vital for bone health and libido in men.",
        range: "20 - 45 pg/mL",
        unit: "pg/mL",
        min: 20,
        max: 45,
        elevationMeaning: "High E2 causes water retention, gyno, and emotional instability.",
        lowMeaning: "Low E2 causes joint pain, low libido, and dry skin.",
        management: "Use Aromatase Inhibitors (AI) carefully to maintain balance."
    },
    {
        id: "lh",
        name: "Luteinizing Hormone (LH)",
        category: "hormones",
        description: "Signals the testes to produce testosterone.",
        range: "1.7 - 8.6 mIU/mL",
        unit: "mIU/mL",
        min: 1.7,
        max: 8.6,
        elevationMeaning: "High levels can indicate primary testicular failure.",
        lowMeaning: "Low levels indicate HPTA suppression (common during cycles).",
        management: "Key marker for post-cycle recovery status."
    },
    {
        id: "fsh",
        name: "FSH",
        category: "hormones",
        description: "Follicle Stimulating Hormone; essential for sperm production.",
        range: "1.5 - 12.4 mIU/mL",
        unit: "mIU/mL",
        min: 1.5,
        max: 12.4,
        elevationMeaning: "Elevated levels suggest primary testicular failure.",
        lowMeaning: "Suppressed during drug-induced hormonal cycles.",
        management: "Crucial for fertility monitoring."
    },
    {
        id: "prolactin",
        name: "Prolactin",
        category: "hormones",
        description: "Hormone that can affect libido and cause gyno if elevated.",
        range: "4 - 15 ng/mL",
        unit: "ng/mL",
        min: 4,
        max: 15,
        elevationMeaning: "Can be elevated by 19-nor compounds (Deca/Tren). Causes libido issues.",
        lowMeaning: "Low levels are rare and usually of no concern.",
        management: "Consider P5P or dopamine agonists if persistently high."
    },
    {
        id: "shbg",
        name: "SHBG",
        category: "hormones",
        description: "Protein that binds to testosterone, making it inactive.",
        range: "16 - 55 nmol/L",
        unit: "nmol/L",
        min: 16,
        max: 55,
        elevationMeaning: "High SHBG lowers free testosterone levels.",
        lowMeaning: "Low SHBG is common on oral steroids and increases free T.",
        management: "Monitor to understand total/free T relationship."
    },
    {
        id: "alt",
        name: "ALT (SGPT)",
        category: "organs",
        description: "Primary liver enzyme; high levels indicate hepatic stress or damage.",
        range: "10 - 40 U/L",
        unit: "U/L",
        min: 10,
        max: 40,
        elevationMeaning: "Typically elevated by oral 17-alpha-alkylated steroids.",
        lowMeaning: "No clinical significance.",
        management: "Use TUDCA/NAC and discontinue oral compounds."
    },
    {
        id: "ast",
        name: "AST (SGOT)",
        category: "organs",
        description: "Enzyme in liver and heart; can also rise from muscle damage.",
        range: "10 - 40 U/L",
        unit: "U/L",
        min: 10,
        max: 40,
        elevationMeaning: "Rises with liver stress or intense muscular training.",
        lowMeaning: "No clinical significance.",
        management: "Compare with ALT to differentiate liver vs muscle stress."
    },
    {
        id: "ggt",
        name: "GGT",
        category: "organs",
        description: "Specific enzyme for liver and bile duct health.",
        range: "0 - 60 U/L",
        unit: "U/L",
        min: 0,
        max: 60,
        elevationMeaning: "Indicates serious liver stress or alcohol/drug toxicity.",
        lowMeaning: "Normal.",
        management: "Highly specific marker for liver pathology."
    },
    {
        id: "creatinine",
        name: "Creatinine",
        category: "organs",
        description: "Waste product of muscle breakdown; primary kidney marker.",
        range: "0.7 - 1.3 mg/dL",
        unit: "mg/dL",
        min: 0.7,
        max: 1.3,
        elevationMeaning: "May indicate kidney stress, dehydration, or very high muscle mass.",
        lowMeaning: "Can indicate muscle wasting or very low protein intake.",
        management: "Stay hydrated and use Cystatin-C for accurate kidney assessment."
    },
    {
        id: "urea",
        name: "Urea / BUN",
        category: "organs",
        description: "Measures nitrogen in blood; reflects protein metabolism.",
        range: "7 - 20 mg/dL",
        unit: "mg/dL",
        min: 7,
        max: 20,
        elevationMeaning: "High protein intake, dehydration, or kidney issues.",
        lowMeaning: "Low protein diet or severe liver disease.",
        management: "Ensure adequate hydration during high-protein cycles."
    },
    {
        id: "hdl",
        name: "HDL (Good)",
        category: "blood",
        description: "High-density lipoprotein; protects the cardiovascular system.",
        range: "> 40 mg/dL",
        unit: "mg/dL",
        min: 40,
        max: 100,
        elevationMeaning: "Ideal for cardiovascular health.",
        lowMeaning: "Extremely common side effect of almost all AAS cycles.",
        management: "Use Omega-3s, Krill oil, and maintain cardio."
    },
    {
        id: "ldl",
        name: "LDL (Bad)",
        category: "blood",
        description: "Low-density lipoprotein; high levels increase plaque risk.",
        range: "< 130 mg/dL",
        unit: "mg/dL",
        min: 0,
        max: 130,
        elevationMeaning: "Increases risk of atherosclerosis and heart disease.",
        lowMeaning: "Optimal for heart health.",
        management: "Monitor ratio with HDL and adjust saturated fat intake."
    },
    {
        id: "hematocrit",
        name: "Hematocrit",
        category: "blood",
        description: "Volume percentage of red blood cells in blood.",
        range: "38 - 50 %",
        unit: "%",
        min: 38,
        max: 50,
        elevationMeaning: "High levels (Polycythemia) increase blood viscosity and clot risk.",
        lowMeaning: "Anemia; reduced oxygen carrying capacity.",
        management: "Frequent blood donation may be required if > 52%."
    },
    {
        id: "hemoglobin",
        name: "Hemoglobin",
        category: "blood",
        description: "Protein in red blood cells that carries oxygen.",
        range: "13.5 - 17.5 g/dL",
        unit: "g/dL",
        min: 13.5,
        max: 17.5,
        elevationMeaning: "Common on cycle; indicates thickened blood.",
        lowMeaning: "Potential anemia and low endurance.",
        management: "Stay well hydrated and monitor blood pressure."
    },
    {
        id: "tsh",
        name: "TSH",
        category: "thyroid",
        description: "Thyroid Stimulating Hormone; regulates metabolic rate.",
        range: "0.4 - 4.0 mIU/L",
        unit: "mIU/L",
        min: 0.4,
        max: 4.0,
        elevationMeaning: "Indicates hypothyroidism (underactive thyroid).",
        lowMeaning: "Indicates hyperthyroidism (overactive thyroid).",
        management: "Crucial if using T3 or certain AAS like Trenbolone."
    },
    {
        id: "vit_d",
        name: "Vitamin D",
        category: "vitamins",
        description: "Essential for bone health and hormone synthesis.",
        range: "30 - 100 ng/mL",
        unit: "ng/mL",
        min: 30,
        max: 100,
        elevationMeaning: "Vitamin D toxicity (very rare).",
        lowMeaning: "Extremely common; linked to low testosterone levels.",
        management: "Supplement with 5,000+ IU daily if low."
    },
    {
        id: "ferritin",
        name: "Ferritin",
        category: "minerals",
        description: "Reflects body's total iron stores.",
        range: "30 - 400 ng/mL",
        unit: "ng/mL",
        min: 30,
        max: 400,
        elevationMeaning: "Can indicate inflammation or iron overload.",
        lowMeaning: "Iron deficiency anemia.",
        management: "Essential to track if making frequent blood donations."
    },
    {
        id: "hs_crp",
        name: "hs-CRP",
        category: "inflammation",
        description: "High-sensitivity CRP; a precise marker of systemic inflammation.",
        range: "0 - 3.0 mg/L",
        unit: "mg/L",
        min: 0,
        max: 3.0,
        elevationMeaning: "Chronic inflammation, overtraining, or heart strain.",
        lowMeaning: "Status: Optimal. Low systemic inflammation.",
        management: "Prioritize rest and anti-inflammatory nutrition if high."
    },
    {
        id: "hba1c",
        name: "HbA1c",
        category: "metabolic",
        description: "Average blood sugar levels over the past 3-4 months.",
        range: "4.0 - 5.6 %",
        unit: "%",
        min: 4.0,
        max: 5.6,
        elevationMeaning: "Insulin resistance or poor glucose management.",
        lowMeaning: "Chronic low-carb stress or hypoglycemic tendency.",
        management: "Optimize carb timing and fiber intake."
    },
    {
        id: "cystatin_c",
        name: "Cystatin C",
        category: "kidney",
        description: "High-precision kidney marker, unaffected by muscle mass.",
        range: "0.6 - 1.0 mg/L",
        unit: "mg/L",
        min: 0.6,
        max: 1.0,
        elevationMeaning: "Decreased kidney filtration rate.",
        lowMeaning: "Optimal kidney health.",
        management: "Gold standard for athletes with high creatinine."
    },
    {
        id: "nt_probnp",
        name: "NT-proBNP",
        category: "heart",
        description: "Marker for cardiac wall stress and fluid overload.",
        range: "0 - 125 pg/mL",
        unit: "pg/mL",
        min: 0,
        max: 125,
        elevationMeaning: "Heart strain, potentially from high BP or PED use.",
        lowMeaning: "Optimal. Minimal heart stress.",
        management: "Monitor BP closely and optimize cardio health."
    },
    {
        id: "uric_acid",
        name: "Uric Acid",
        category: "metabolic",
        description: "Biproduct of protein breakdown; high levels cause gout.",
        range: "3.5 - 7.2 mg/dL",
        unit: "mg/dL",
        min: 3.5,
        max: 7.2,
        elevationMeaning: "Dehydration, high protein, or metabolic stress.",
        lowMeaning: "Status: Normal. No clinical concern.",
        management: "Increase water intake and manage dietary purines."
    },
    {
        id: "igf1",
        name: "IGF-1",
        category: "hormones",
        description: "Growth factor primarily responsible for muscle cell growth.",
        range: "115 - 350 ng/mL",
        unit: "ng/mL",
        min: 115,
        max: 350,
        elevationMeaning: "High levels common during HGH or Insulin secretagogue use.",
        lowMeaning: "Reduced muscle growth potential and recovery.",
        management: "Marker for growth hormone efficacy."
    }
];

export const injectionSitesEn: InjectionSite[] = [
    {
        id: "delt_side",
        name: "Lateral Deltoid",
        category: "Upper Body",
        view: "front",
        needle: '25G - 27G (0.5 - 1")',
        volume: "Up to 1.0ml",
        recoveryDays: 4,
        riskLevel: 'Low',
        description: "The side of the shoulder. Very convenient for small volumes and TRT. Easy to reach for self-injection.",
        pathD: "M 90,120 Q 110,120 115,145 Q 110,180 85,170 Q 75,140 90,120",
        painLevel: "Medium (4/10)",
        bestFor: "Small Volumes, TRT",
        steps: ["Locate the midpoint between the acromion process and the deltoid insertion.", "Clean with alcohol.", "Insert needle at 90 degrees.", "Inject slowly."],
        advice: "Avoid injecting too high into the acromion process to prevent joint irritation."
    },
    {
        id: "pecs",
        name: "Upper Pectorals",
        category: "Upper Body",
        view: "front",
        needle: '25G (0.5 - 1")',
        volume: "Up to 1.0ml",
        recoveryDays: 5,
        riskLevel: 'Medium',
        description: "The upper part of the chest. Fast absorption but higher pain due to density.",
        pathD: "M 40,30 Q 50,30 50,40 Q 40,45 35,40 Q 35,35 40,30",
        painLevel: "High (6/10)",
        bestFor: "Fast Absorption",
        steps: ["Flex the chest to find the thickest part.", "Relax before injecting.", "Use a short needle to avoid hitting the rib cage.", "Apply pressure after withdrawal."],
        advice: "Proceed with caution. The chest is highly sensitive and prone to muscle twitching."
    },
    {
        id: "pecs_lower",
        name: "Lower Pectorals",
        category: "Upper Body",
        view: "front",
        needle: '25G (0.5 - 1")',
        volume: "Up to 1.5ml",
        recoveryDays: 5,
        riskLevel: 'Medium',
        description: "The lower, outer part of the chest. Similar to upper pecs but can handle slightly more volume.",
        pathD: "M 45,45 Q 55,45 55,55 Q 45,60 40,55 Q 40,50 45,45",
        painLevel: "High (5/10)",
        bestFor: "Bodybuilding Cycles",
        steps: ["Target the outer lower quadrant of the pectoral muscle.", "Maintain steady hand.", "Aspirate to ensure no blood return."],
        advice: "Keep the chest relaxed. Tension during injection increases pain and tissue trauma."
    },
    {
        id: "biceps",
        name: "Biceps",
        category: "Upper Body",
        view: "front",
        needle: '25G - 27G (0.5")',
        volume: "Up to 0.5ml",
        recoveryDays: 4,
        riskLevel: 'Medium',
        description: "Small muscle group. High precision required. Mostly used for localized growth or small doses.",
        pathD: "M 30,33 Q 35,33 35,38 Q 30,40 25,38 Q 25,35 30,33",
        painLevel: "High (7/10)",
        bestFor: "Small Doses, Localized Growth",
        steps: ["Locate the peak of the bicep.", "Use a short insulin-style needle.", "Inject extremely slowly."],
        advice: "Warning: High risk of hitting veins. Aspirate carefully. Expect PIP (Post Injection Pain) for 24-48 hours."
    },
    {
        id: "glute_ventro",
        name: "Ventrogluteal (Side Glute)",
        category: "Lower Body",
        view: "front",
        needle: '23G - 25G (1.0")',
        volume: "Up to 2.5ml",
        recoveryDays: 5,
        riskLevel: 'Low',
        description: "The safest injection site medical-wise. Deep IM, far from major nerves and vessels.",
        pathD: "M 130,280 Q 145,280 145,310 Q 140,330 120,320 Q 110,300 130,280",
        painLevel: "Very Low (1/10)",
        bestFor: "High Safety, Regular Rotation",
        steps: ["Place the heel of your hand on the greater trochanter.", "Spread your fingers to form a V.", "Inject into the center of the V."],
        advice: "The gold standard for safety. If you rotate here, your scar tissue formation will be minimal."
    },
    {
        id: "quad_outer",
        name: "Vastus Lateralis (Outer Thigh)",
        category: "Lower Body",
        view: "front",
        needle: '23G - 25G (1.0")',
        volume: "Up to 2.0ml",
        recoveryDays: 6,
        riskLevel: 'Medium',
        description: "Very easy to reach for self-injection. One of the most common sites for beginners.",
        pathD: "M 130,420 Q 155,420 160,500 Q 150,580 120,580 Q 100,500 130,420",
        painLevel: "High (6/10)",
        bestFor: "Beginners, Self-Injection",
        steps: ["Divide the thigh into three parts.", "Target the outer middle third.", "Inject at a 90-degree angle."],
        advice: "Prone to 'Quad Twitch' during insertion. Keep the leg fully locked and relaxed."
    },
    {
        id: "traps",
        name: "Trapezius",
        category: "Upper Body",
        view: "back",
        needle: '25G (0.5 - 1.0")',
        volume: "Up to 1.0ml",
        recoveryDays: 5,
        riskLevel: 'Medium',
        description: "The upper shoulder region. Requires good reach or a partner. Rare but effective for rotation.",
        pathD: "M 35,23 Q 45,23 45,28 Q 35,30 30,28 Q 30,25 35,23",
        painLevel: "Medium (4/10)",
        bestFor: "Advanced Rotation",
        steps: ["Locate the thickest part of the upper trap.", "Relax the neck.", "Inject vertically."],
        advice: "Do not inject near the spine or neck. Stay on the muscular upper ridge."
    },
    {
        id: "delt_rear",
        name: "Rear Deltoid",
        category: "Upper Body",
        view: "back",
        needle: '25G (0.5 - 1.0")',
        volume: "Up to 1.0ml",
        recoveryDays: 4,
        riskLevel: 'Low',
        description: "The back of the shoulder. Excellent for small oil-based injections.",
        pathD: "M 29,31 Q 35,31 35,36 Q 29,38 24,36 Q 24,33 29,31",
        painLevel: "Low (3/10)",
        bestFor: "Clean Muscle Growth",
        steps: ["Reach across your body to locate the rear delt.", "Clean site.", "Inject with a steady hand."],
        advice: "Great for rotation when side delts are sore. Surprisingly low pain."
    },
    {
        id: "triceps",
        name: "Triceps (Lateral Head)",
        category: "Upper Body",
        view: "back",
        needle: '25G - 27G (0.5 - 1.0")',
        volume: "Up to 1.5ml",
        recoveryDays: 5,
        riskLevel: 'Medium',
        description: "The outer part of the tricep. Effective for lean compounds.",
        pathD: "M 45,31 Q 50,31 50,36 Q 45,38 40,36 Q 40,33 45,31",
        painLevel: "Medium (5/10)",
        bestFor: "Frequent Small Pins",
        steps: ["Extend arm fully and locate the lateral head.", "Flex to confirm, then relax.", "Inject safely."],
        advice: "Avoid the inner tricep where major nerves reside. Stick to the outer half."
    },
    {
        id: "lats",
        name: "Lats (Latissimus Dorsi)",
        category: "Back",
        view: "back",
        needle: '25G (1.0")',
        volume: "Up to 2.0ml",
        recoveryDays: 6,
        riskLevel: 'Low',
        description: "Large back muscle. Very safe but requires a partner for most people.",
        pathD: "M 37,33 Q 42,33 42,43 Q 37,48 32,43 Q 32,38 37,33",
        painLevel: "Low (2/10)",
        bestFor: "High Volume Rotation",
        steps: ["Reach high to stretch the lat.", "Clean the large muscular area.", "Inject deep into the meat."],
        advice: "Excellent absorption due to high blood flow. Often neglected but very safe."
    },
    {
        id: "glute_dorso",
        name: "Gluteus Maximus (Main Glute)",
        category: "Lower Body",
        view: "back",
        needle: '23G - 25G (1.5")',
        volume: "Up to 4.0ml",
        recoveryDays: 7,
        riskLevel: 'Low',
        description: "The standard site for large oil injections. Thick muscle, few nerves.",
        pathD: "M 180,310 Q 200,310 215,340 Q 215,380 180,380 Q 150,380 145,340 Q 145,310 180,310",
        painLevel: "Very Low (1/10)",
        bestFor: "Large Volumes (3ml+)",
        steps: ["Target the upper outer quadrant.", "Use a 1.5 inch needle for deep delivery.", "Inject slowly."],
        advice: "Watch out for the sciatic nerve. Never inject in the inner or lower quadrants."
    },
    {
        id: "calves",
        name: "Gastrocnemius (Calves)",
        category: "Lower Body",
        view: "back",
        needle: '25G (0.5 - 1.0")',
        volume: "Up to 0.5ml",
        recoveryDays: 5,
        riskLevel: 'High',
        description: "Muscle on the back of the lower leg. High risk of PIP and limited mobility for days.",
        pathD: "M 35,81 Q 40,81 40,86 Q 35,88 30,86 Q 30,83 35,81",
        painLevel: "Extreme (9/10)",
        bestFor: "Advanced Users ONLY",
        steps: ["Inject into the lateral (outer) head of the calf.", "Use low volume.", "Rest the leg afterwards."],
        advice: "Crucial Warning: Can lead to severe hobbling. Only use as a last resort in rotation."
    }
];

export const enContent: ContentStrings = {
    navAiTools: "Smart Bodybuilding Tools",
    navPremiumResources: "Exclusive Resources",
    navFeatures: "Features",
    navToolNames: {
        macro: "Macro Calculator",
        bodyfat: "Body Fat Calculator",
        injection: "Interactive Injection Map",
        halflife: "Half-Life Simulator",
        lab: "Smart Lab Reference",
        genetic: "Genetic Potential Calculator",
        cycleArchitect: "Cycle Calendar Exporter",
    },
    themeNames: {
        light: "Light Mode",
        dark: "Dark Mode",
        system: "System Mode",
    },
    backToHome: "Back to Home",
    seoTitle: "Mr. X-Steroid | The Ultimate Bodybuilding & Steroid Guide",
    seoDescription: "Discover the world's most powerful guide for muscle building and hormonal cycles. Mr. X-Steroid by George Mourice offers clear protocols, safety guides, and supplement bibles.",
    seoKeywords: seoKeywordsEnglish,

    heroTitle: "Mr. X-Steroid",
    heroSubtitle: "Discover the ultimate muscle-building guide and hormonal cycle book: a comprehensive, scientifically-backed roadmap designed with detailed tables and simple, easy-to-understand charts. It introduces you to the world of anabolic hormones and brings the most complex strategies to your fingertips through clear, actionable plans, supporting your journey toward power and a carved, majestic physique.",
    heroCta: "Get Your Copy Now",
    downloadPreview: "Download Free Preview (PDF)",
    audioPreviewBtn: "Listen to Intro",
    authorSection: "About Author",
    authorName: "George Mourice: The Mastermind Behind \"Mr. X\"",
    authorBio: "Have you ever wondered where danger ends and science begins in the world of bodybuilding? George Mourice is not just an author; he is the navigator venturing into the forbidden zones many fear to tread. Through his controversial book, \"Mr. X-Steroid,\" George breaks the silence, fusing a raw passion for the \"Iron Game\" with the intricate science of longevity and modern medicine. While others settle for traditional limits, George seeks the impossible equation: How do we reach the absolute peak of human strength without paying the price with our lifespan? Driven by deep research and relentless passion, George Mourice (through the Mr. X persona) presents a guide that defies myths. Backed by cutting-edge tech tools and a sharp vision, he transforms hormones and training from a \"random gamble\" into an \"exact science.\" He doesn’t just offer a book; he hands you the keys to the physique you’ve always dreamed of, with the eye of an expert and the mind of a scientist. \"From knowledge to muscle, build stronger, smarter.\"",
    featuresTitle: "What's Inside This Book?",
    sneakPeekTitle: "An Exclusive Peek Inside",
    sneakPeekSubtitle: "See how professional tables look. Part 1 is available, the rest is encrypted to protect content.",
    unlockText: "Buy the book to unlock the full table and dosages",
    buyNow: "Buy the Book",
    contact: "Contact Us",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
    sendResetLink: "Send Reset Link",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    passwordResetSuccess: "Password updated successfully!",
    passwordResetError: "Failed to update password. Link might be expired.",
    emailSentSuccess: "Reset link sent! Please check your inbox.",
    backToLogin: "Back to Login",
    resetPasswordTitle: "Set New Password",
    resetPasswordDesc: "Please enter your new secure password below.",
    loginTitle: "Welcome Back",
    signupTitle: "Join the Elite",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    nameLabel: "Full Name",
    loginBtn: "Login",
    signupBtn: "Create Account",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    usernameLabel: "Username",
    profileTitle: "My Profile",
    logout: "Log Out",
    loginSuccess: "Logged in successfully!",
    signupSuccess: "Account created successfully!",
    invalidCredentials: "The email or password you entered is incorrect.",
    features: [
        {
            title: "Comprehensive Hormonal Outlines",
            description: "No more guessing or relying on random gym 'recipes'. Detailed protocols from beginner to advanced levels.",
            iconKey: "chart"
        },
        {
            title: "The Art of 'Safe Exit': Strict PCT",
            description: "Learn how to protect your hormonal system and recover testosterone production quickly to avoid crashes.",
            iconKey: "exit"
        },
        {
            title: "Supplement Bible: Truth Without Marketing",
            description: "Save your money. A brutal guide to what actually works and what is just a waste of your hard-earned cash.",
            iconKey: "shield"
        }
    ],
    testimonials: [
        { name: "John S.", title: "Aspiring Bodybuilder", text: "I was lost in a sea of misinformation. This book put me on the right track and saved me years of trial and error." },
        { name: "Michael A.", title: "Personal Trainer", text: "An indispensable reference for any coach who wants to be honest with clients and protect their health." },
        { name: "Kevin M.", title: "Local Champion", text: "The tables in the book are very precise and helped me reach the best shape of my life." }
    ],
    testimonialsTitle: "What Readers Say",
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "Direct answers to the most common queries",
    faqSearchPlaceholder: "Search for a question...",
    faqCategories: { all: "All", safety: "Safety", general: "General", legal: "Legal", women: "Women", strategy: "Strategy" },
    faqs: [
        {
            question: "Is this book suitable for absolute beginners?",
            answer: "Yes, we start from ground zero. We explain medical terms in simple language before moving to complex protocols, ensuring you build a safe foundation before your first pin.",
            category: "general"
        },
        {
            question: "Do I really need PCT (Post Cycle Therapy) for every cycle?",
            answer: "Absolutely. Never compromise your natural HPTA axis. PCT is the bridge that ensures you keep your gains while restoring your natural testosterone production. We provide detailed SERM and HCG protocols for every scenario.",
            category: "safety"
        },
        {
            question: "How do I manage Gynaecomastia (Gyno) if it starts?",
            answer: "Early detection is key. We cover the use of AI (Aromatase Inhibitors) and SERMs like Tamoxifen to block estrogen receptors instantly. The book includes a 'Emergency Gyno Protocol' section.",
            category: "safety"
        },
        {
            question: "Is the use of these substances legal?",
            answer: "Legality varies drastically by country. In many regions, they are prescription-only. This book is for educational and harm-reduction purposes only, not an endorsement of illegal activity.",
            category: "legal"
        },
        {
            question: "Can women use the protocols in this book?",
            answer: "We have a dedicated 'Women's Wellness' chapter. Females have different hormonal structures, so many male protocols are dangerous. We focus on low-androgen variants like Anavar or Primobolan for female athletes.",
            category: "women"
        },
        {
            question: "What is the difference between Orals and Injectables?",
            answer: "Orals are convenient but often more liver-toxic due to 17-alpha alkylation. Injectables are usually safer for long-term health but require proper technique. We detail the pros/cons of both delivery systems.",
            category: "general"
        },
        {
            question: "How often should I perform bloodwork?",
            answer: "At minimum: Pre-cycle (Baseline), Mid-cycle (Stability check), and Post-PCT (Recovery check). Our 'Smart Lab Reference' tool helps you interpret these results instantly.",
            category: "safety"
        },
        {
            question: "Are natural 'Test Boosters' enough for PCT?",
            answer: "No. Herbal boosters are for natural athletes. Once you use exogenous hormones, you need pharmaceutical-grade SERMs (Clomid/Nolvadex) to restart your pituitary gland. Anything else is a risk.",
            category: "safety"
        },
        {
            question: "Will I lose my fertility permanently?",
            answer: "While temporary suppression is guaranteed, permanent infertility is rare IF proper HCG and PCT protocols are followed. The book details how to maintain 'Leydig cell' activity during a cycle.",
            category: "general"
        },
        {
            question: "What is the best time to take oral steroids?",
            answer: "Most have short half-lives. We suggest splitting the dose to keep blood levels stable, or taking the full dose 60-90 minutes before training for a maximum strength boost.",
            category: "strategy"
        },
        {
            question: "How can I identify fake or underdosed products?",
            answer: "We provide a 'Counterfeit Bible' section that shows you how to check batch codes, packaging quality, and perform simple DIY lab tests to ensure your gear is legitimate.",
            category: "legal"
        },
        {
            question: "Do steroids cause heart enlargement?",
            answer: "Chronic high-dose use can lead to LVH (Left Ventricular Hypertrophy). We explain how to manage blood pressure and use specific cardio protocols to keep your heart healthy.",
            category: "safety"
        },
        {
            question: "Can I drink alcohol while on cycle?",
            answer: "Highly discouraged, especially with orals. Both process through the liver. Adding alcohol significantly increases the risk of jaundice and hepatic stress.",
            category: "safety"
        },
        {
            question: "Is 'Blast and Cruise' safer than 'Cycle and PCT'?",
            answer: "It depends on your long-term goals. B&C provides stability but makes recovery harder. C&P allows the body to reset but involves more hormonal fluctuations. We compare both in Chapter 12.",
            category: "strategy"
        },
        {
            question: "How do I deal with 'Post-Cycle Crash' (Depression)?",
            answer: "The crash is often caused by low estrogen and zero testosterone. A proper PCT minimizes this time. We suggest specific supplements to support neurotransmmiters during this phase.",
            category: "safety"
        }
    ],
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service & User Agreement",
    refundPolicy: "Refund Policy",
    legalDisclaimer: "Legal Disclaimer",
    aboutUs: "About Us",
    legal: "Legal",
    quickLinks: "Quick Links",
    privacyPolicyContent: "We respect your privacy and are committed to protecting your personal data...",
    termsOfServiceContent: `<h2>Terms of Service & User Agreement</h2>
<p><strong>Last Updated:</strong> 01-01-2026</p>

<p><strong>1. Acceptance of Terms</strong><br>
By accessing, browsing, or using the website <strong>https://www.mrxsteroid.com</strong> ("the Site") and purchasing the book "Mr. X-Steroid" ("the Product"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms"). These terms are a legal agreement between you and <strong>INSTITUTION OF GEORGE MOURICE</strong>.</p>

<p><strong>2. Age Restriction (Strictly 18+)</strong><br>
This Site and its products are strictly intended for users who are at least <strong>18 years of age</strong> or the legal age of majority in their jurisdiction. By accessing the Site, you represent and warrant that you are of legal age.</p>

<p><strong>3. Nature of Content (Educational Only)</strong><br>
The content provided on this Site and within "Mr. X-Steroid" (ISBN: 9781326746728) is for <strong>educational, informational, and harm-reduction purposes only</strong> within the Sports category.<br>
* <strong>Not Medical Advice:</strong> Nothing on this Site constitutes medical advice.<br>
* <strong>No Endorsement:</strong> The Site does not endorse the use of illegal substances.</p>

<p><strong>4. Zero Tolerance Policy: No Sale of Illicit Substances</strong><br>
To be explicitly clear for all users, payment processors (Stripe/PayPal), and regulatory bodies:<br>
<strong>INSTITUTION OF GEORGE MOURICE and https://www.mrxsteroid.com do NOT sell, distribute, manufacture, or ship anabolic steroids, controlled substances, or any pharmaceuticals.</strong><br>
We sell <strong>digital and physical books/information</strong> only. Any inquiries regarding the purchase of illegal substances will be ignored, and the user account may be banned immediately.</p>

<p><strong>5. Intellectual Property Rights</strong><br>
All content on this Site, including the book "Mr. X-Steroid" (ISBN: 9781326746728), text, graphics, logos, and code, is the exclusive property of <strong>George Mourice</strong> and <strong>INSTITUTION OF GEORGE MOURICE</strong>. All Rights Reserved - Standard Copyright License.<br>
* <strong>Prohibitions:</strong> You may not reproduce, distribute, or sell any content without express written permission from the author. Piracy will result in legal action.</p>

<p><strong>6. Payment and Refunds</strong><br>
* <strong>Currency:</strong> All prices are listed in <strong>USD</strong>.<br>
* <strong>Digital Products:</strong> All sales of digital downloads are final and non-refundable due to the nature of the product.</p>

<p><strong>7. Governing Law</strong><br>
These Terms shall be governed and construed in accordance with the laws of <strong>Egypt</strong>. Any legal action or proceeding related to this Site shall be brought exclusively in a competent court sitting in <strong>Alexandria, Egypt</strong>.</p>
`,
    refundPolicyContent: `<h2>Refund & Return Policy</h2>
<p><strong>Last Updated:</strong> 01-01-2026</p>

<p>Thank you for purchasing from <strong>https://www.mrxsteroid.com</strong>, operated by <strong>INSTITUTION OF GEORGE MOURICE</strong>.</p>
<p>Please read this policy carefully. This is the Return and Refund Policy of INSTITUTION OF GEORGE MOURICE. By making a purchase, you agree to the terms outlined below.</p>

<h3>1. Digital Products (E-books / PDF)</h3>
<p>Due to the nature of digital content, all sales of the digital version of "Mr. X-Steroid" are considered <strong>final and non-refundable</strong> once the download link has been generated or sent to the customer.</p>
<ul>
    <li><strong>No "Change of Mind":</strong> We do not offer refunds for digital products if you simply change your mind or decide the content is not for you.</li>
    <li><strong>Defective Files:</strong> If you experience technical issues downloading or opening the file, please contact us immediately. We will ensure you receive a working copy of the file.</li>
</ul>

<h3>2. Physical Products (Paperback / Hardcover)</h3>
<p>For physical copies of books shipped globally, we offer a refund or replacement strictly under the following conditions:</p>
<ul>
    <li><strong>Damaged or Defective Items:</strong> If the book arrives damaged, torn, or with printing errors, you must contact us within <strong>14 days</strong> of receipt.</li>
    <li><strong>Incorrect Item:</strong> If you received the wrong book, we will ship the correct item at no additional cost.</li>
</ul>
<p>To initiate a return for a physical item, please email us with your Order ID and photos of the damage. <strong>Do not return the item before contacting us for approval.</strong></p>

<h3>3. Refunds Process</h3>
<p>Once your return is received and inspected (for physical goods), we will notify you of the approval or rejection of your refund.</p>
<ul>
    <li>If approved, your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment (USD) within 7-10 business days.</li>
    <li>Shipping costs are non-refundable unless the return is due to our error.</li>
</ul>

<h3>4. Chargebacks & Disputes</h3>
<p>By purchasing from our site, you agree to contact <strong>INSTITUTION OF GEORGE MOURICE</strong> support first to resolve any issues. Initiating a chargeback with your bank for a valid transaction (especially for non-refundable digital goods) is considered fraud and will be disputed with evidence of this policy and your download logs.</p>

<h3>5. Contact Us</h3>
<p>If you have any questions about our Returns and Refunds Policy, please contact us:</p>
<ul>
    <li><strong>Company:</strong> INSTITUTION OF GEORGE MOURICE</li>
    <li><strong>Location:</strong> Alexandria, Egypt</li>
    <li><strong>Website:</strong> https://www.mrxsteroid.com</li>
</ul>`,
    pricingTitle: "Choose Your Plan",
    pricingSubtitle: "A small investment in your knowledge will save you thousands of dollars and countless health risks.",
    pricingTiers: [
        {
            id: 'digital',
            name: "Basic (Digital E-Book)",
            price: 49.99,
            originalPrice: "$72.00",
            description: "Full .epub / PDF version + Instant Access",
            features: ["Full Book (300+ Pages)", "Instant Email Delivery", "Lifetime Free Updates", "High-Resolution Graphics"],
            buttonText: "Get Digital Now",
            requiresShipping: false,
            requiresBodyStats: false,
            includesEbook: true,
            includesAudiobook: false,
            includesCoaching: false
        },
        {
            id: 'paperback',
            name: "Standard (Glossy Paperback Bundle)",
            price: 72.00,
            originalPrice: "$142.00",
            description: "Physical Book + Digital + Audiobook",
            features: ["High-Quality Glossy Paperback", "Full E-Book included (FREE)", "Full Audiobook included", "Home Workout PDF Bonus"],
            buttonText: "Order Bundle",
            isPopular: true,
            popularLabel: "Best Value",
            requiresShipping: true,
            requiresBodyStats: false,
            includesEbook: true,
            includesAudiobook: true,
            includesCoaching: false
        },
        {
            id: 'hardcover',
            name: "Professional (Hardcover & Coaching)",
            price: 249.99,
            description: "Premium Hardcover + Full Coaching Access",
            features: ["Luxury Hardcover Edition", "Full Hormonal Course Access", "VIP Community Membership", "Priority Global Shipping"],
            buttonText: "Join the Elite",
            requiresShipping: true,
            requiresBodyStats: true,
            includesEbook: true,
            includesAudiobook: true,
            includesCoaching: true
        }
    ],
    disclaimerTitle: "IMPORTANT DISCLAIMER",
    disclaimerContent: fullEnglishDisclaimer,
    agreeButton: "I Agree & Take Full Responsibility (18+)",
    disclaimerAcknowledgement: "By clicking the button below, you acknowledge that you have read, understood and agreed to all terms above.",
    importantDisclaimer: "Important Notice",
    downloadFullBook: "Download Full Book",
    processing: "Processing...",
    purchaseSuccess: "Purchase Successful! Welcome to the inner circle of Mr. X-Steroid.",
    shippingAddress: "Shipping Address",
    city: "City",
    zipCode: "ZIP / Postal Code",
    shippingProvider: "Shipping Provider",
    weight: "Weight (kg)",
    height: "Height (cm)",
    age: "Age",
    goal: "Fitness Goal",
    securePaymentMessage: "100% secure and encrypted payment via SpaceRemit",
    orderSummary: "Order Summary",
    subtotal: "Subtotal",
    shipping: "Shipping",
    transactionFee: "Transaction Fee",
    total: "Total",
    payNow: "Pay Now",
    secureCheckout: "100% Secure & Encrypted via SpaceRemit",
    fullName: "Full Name",
    emailAddress: "Email Address",
    benefitsTitle: "Why is 'Mr. X-Steroid' your best investment?",
    benefitsSubtitle: "We don't just sell pages; we sell years of compressed experience to accelerate your path to the top.",
    benefits: [
        {
            title: "1. Comprehensive Hormonal Blueprints: From Beginner to \"Beast\"",
            description: "Stop guessing or relying on random gym \"recipes.\" The book provides precise, detailed cycle schedules designed with a scientific methodology that takes you from beginner to advanced levels safely. You’ll find clear plans for Bulking to build massive muscle mass and Cutting to carve out sharp definition, all backed by specific dosages and timing.",
            iconKey: "chart"
        },
        {
            title: "2. The Art of \"Safe Exit\": Strict PCT Protocols",
            description: "Starting a cycle is easy, but exiting safely is the pro’s secret. The book reveals Post-Cycle Therapy (PCT) secrets on how to restore natural testosterone and protect your body from hormonal crashes. Learn how to use HCG and SERMs (like Nolvadex and Clomid) with critical timing to keep your hard-earned muscle gains.",
            iconKey: "exit"
        },
        {
            title: "3. Protection Shield Against \"Death Dealers\" & Side Effects",
            description: "This book isn’t just a guide; it’s a warning cry and a shield against exploitation and ignorance. Get transparent insights into potential side effects—from liver stress and heart issues to hair loss and gyno—and learn how to manage or avoid them. Understand the importance of comprehensive blood work before, during, and after cycles to ensure you're building your body, not destroying your health.",
            iconKey: "safety"
        },
        {
            title: "4. \"Femininity & Power\" Files: The Exclusive Women's Guide",
            description: "An exclusive, taboo-breaking section for women seeking strength and beauty without sacrificing their femininity. The book explains how to use specific substances like Anavar and Primobolan at safe dosages to avoid virilization and voice changes. It also covers sculpting secrets and enhancing feminine curves (like glutes) through smart training and hormonal balance.",
            iconKey: "women"
        },
        {
            title: "5. Secrets of \"Injection & Fusion\": Practical Stacking Masterclass",
            description: "Learn the professional language of stacking active compounds. The book explains how to combine different types (like Testosterone, Deca, Trenbolone) for a synergistic effect that multiplies results. Plus, get a detailed illustrated guide on correct injection techniques across different muscles to avoid pain and abscesses, as well as safe dosage preparation.",
            iconKey: "injection"
        },
        {
            title: "6. Unmasking the Truth: Supplement Secrets & Counterfeit Gear",
            description: "In a market full of deception, arm yourself with knowledge to distinguish real hormones from fakes, including a history of major names like British Dragon. Discover the truth behind \"magic supplements\" and how to choose what actually works for weight gain or fat loss. It also includes detection time tables to keep you informed on how long substances stay in your system.",
            iconKey: "truth"
        }
    ],
    labReference: {
        title: "Smart Lab Reference",
        subtitle: "Understand your medical data. This guide helps you read results and identify red flags.",
        searchPlaceholder: "Search test name (e.g., Test, ALT)...",
        noResults: "No results found",
        analyzeBtn: "Analyze Result",
        analyzeTitle: "Enter Your Value",
        enterValue: "Value",
        resultLabel: "Status",
        status: { low: "Low", normal: "Normal", high: "High" },
        categories: { all: "All", hormones: "Hormones", organs: "Organs", blood: "Blood & Heart", vitamins: "Vitamins", minerals: "Minerals", thyroid: "Thyroid" },
        labels: { whatIsIt: "What is it?", normalRange: "Normal Range", elevationMeaning: "High Meaning", lowMeaning: "Low Meaning", management: "Management", cancel: "Cancel", high: "High", low: "Low" },
        tests: labTestsEn,
    },
    whoIsTitle: "Who is this book for?",
    whoIsSubtitle: "This content is carefully designed to serve specific groups effectively",
    targetAudiences: [
        { title: "Aspiring Bodybuilder", description: "Who wants to shortcut the path and build a perfect physique on scientific grounds.", iconKey: "athlete" },
        { title: "Professional Coach", description: "Looking for a reliable scientific reference to design client programs.", iconKey: "coach" },
        { title: "Truth Seeker", description: "Tired of misinformation and myths spreading in the gym.", iconKey: "truth" },
        { title: "Health Conscious", description: "Who wants to understand hormonal impact and how to prevent damage.", iconKey: "shield" }
    ],
    whoIsClosing: "If you are one of these, this book is your smartest investment.",
    whoIsCta: "Start Your Journey",
    aboutPageTitle: "About Mr. X-Steroid",
    aboutPageContent: "The Mr. X-Steroid project is the fruit of years of research...",
    aboutPageStoryTitle: "Our Story",
    aboutPageStory: "We started as a small blog...",
    aboutPageMissionTitle: "Our Mission",
    aboutPageMission: "Spreading science and fighting hormonal ignorance...",
    contactPageTitle: "Contact Us",
    contactPageSubtitle: "We are here to help and answer your queries",
    contactFormNamePlaceholder: "Your Name",
    contactFormEmailPlaceholder: "Your Email",
    contactFormMessagePlaceholder: "How can we help?",
    contactFormSubjectPlaceholder: "Subject",
    contactFormSubmit: "Send Message",
    contactFormSuccessMessage: "Message sent successfully! We'll reply soon.",
    contactInfoAddress: "",
    contactInfoEmail: "",
    contactInfoPhone: "",
    contactInfoHours: "24/7 Support via WhatsApp",
    homeLink: "Home",
    viewOnMap: "Location",
    cookieTitle: "Cookies",
    cookieMessage: "We use cookies to improve experience.",
    cookieAccept: "Accept",
    cookieReject: "Reject",
    calcTitle: "MacroCalc Pro - Intelligent Nutrition",
    calcSubtitle: "Advanced Multi-dimensional Analysis & Predictive Ecosystem",
    calcGender: "Gender",
    calcMale: "Male",
    calcFemale: "Female",
    calcAge: "Age",
    calcWeight: "Weight (kg)",
    calcHeight: "Height (cm)",
    calcActivity: "Activity Level",
    calcTrainingStyle: "Training Style",
    calcGoal: "Goal",
    calcCalculate: "Calculate Now",
    calcResults: "Your Daily Results",
    calcCalories: "Calories (kcal)",
    calcProtein: "Protein (g)",
    calcCarbs: "Carbs (g)",
    calcFats: "Fats (g)",
    calcCta: "Generate Meal Plan",
    calcSmartMode: "Smart Mode",
    calcBodyFat: "Body Fat %",
    calcWater: "Water Need",
    calcLiters: "L",
    calcRecalculate: "Recalculate",
    calcGenerateMealPlan: "Generate AI Meal Plan",
    calcGenerating: "Generating...",
    calcMealPlanTitle: "Your Suggested Meal Plan",
    calcMealPlanSubtitle: "Generated by AI based on your macros",
    calcDisclaimer: "These figures are estimates based on formulas. Consult a nutritionist.",
    calcTdeeLabel: "Total Daily Energy Expenditure (TDEE)",
    calcBmrLabel: "Basal Metabolic Rate (BMR)",
    calcTefLabel: "Thermic Effect of Food (TEF)",
    calcBeastTitle: "Dormant Beast Classification",
    calcAnalysisLabel: "SMART ENGINE ANALYSIS",
    calcBmiStatusLabel: "BMI Status",
    calcDistributionTitle: "Daily Macro Distribution",

    calcShuffleLabel: "Shuffle Meals",
    calcAwaitingInputLabel: "Awaiting Muscle Input",
    calcAiEngineLabel: "AI POWERED ENGINE",
    calcAnalyzingLabel: "Analyzing Data...",
    calcMetabolicActiveLabel: "Metabolic Drive Active",
    calcAnabolicPotentialLabel: "EXPECTED ANABOLIC POTENTIAL",
    calcWindowBtn: "Metabolic Window Insight",
    calcTrainingTime: "Preferred Training Time",
    calcTrainingWindows: {
        morning: "Morning",
        afternoon: "Afternoon",
        evening: "Evening",
        advice: "Since you train in the {time}, focus 40% of your carbs around the workout window."
    },
    calcPredictionTitle: "12-Week Body Prediction",
    calcBeastNames: {
        cut: "Shredded Beast",
        maintain: "Hybrid Warrior",
        bulk: "Anabolic Titan"
    },
    calcPredictions: {
        cut: "Your muscles will look sharp, with stubborn fat around the waist disappearing. You'll see details you've never seen before.",
        maintain: "Significant improvement in muscle density while maintaining low body fat. A powerful and symmetrical athletic physique.",
        bulk: "Massive increase in muscle mass and strength. You'll look bigger in clothes with obvious muscle fullness in shoulders and chest."
    },
    calcSelectGoal: { cut: "Cutting (Fat Loss)", maintain: "Maintenance", bulk: "Bulking (Muscle Gain)" },
    calcMealNames: ["Breakfast", "Lunch", "Pre-Workout", "Dinner"],
    calcActivityLevels: { sedentary: "Sedentary (No exercise)", light: "Light (1-3 days/week)", moderate: "Moderate (3-5 days/week)", active: "Active (6-7 days/week)", veryActive: "Very Active (2x daily)" },
    calcTrainingStyles: { hypertrophy: "Hypertrophy", strength: "Strength", endurance: "Endurance" },
    geneticCalculator: {
        title: "Genetic Potential Calculator",
        subtitle: "Discover your natural maximum muscular potential based on the Casey Butt model.",
        labels: {
            height: "Height (cm)",
            wrist: "Wrist Girth (cm)",
            ankle: "Ankle Girth (cm)",
            bodyFat: "Target Body Fat (%)",
            frameSize: "Frame Size",
            boneThickness: "Bone thickness",
            lowerBody: "Lower body structure",
            shoulders: "Shoulder Girth (cm)",
            chest: "Chest Girth (cm)",
            waist: "Waist (cm)",
            thigh: "Thigh Girth (cm)",
            calf: "Calf Girth (cm)",
            current: "Current",
            potential: "Potential",
            analysis: "Casey Butt Analysis",
            roadmap: "Muscular Roadmap",
            ffmi: "Fat Free Mass Index (FFMI)",
            goldenRatio: "Golden Ratio",
            physiqueScore: "Physique Score"
        },
        modelLabel: "Based on Casey Butt Model",
        awaitingDataTitle: "Awaiting Data...",
        frameOptions: { small: "Small", medium: "Medium", large: "Large" },
        unknownMeasurements: "Don't know measurements? Estimate",
        cta: "Analyze Potential",
        reset: "Reset",
        yourBodyType: "Your Body Type",
        resultTitle: "Muscular Potential Analysis",
        naturalLabel: "Max Natural Weight",
        enhancedLabel: "Max Enhanced Weight",
        differenceLabel: "Expected Difference",
        disclaimer: "These calculations are estimates based on statistical models. Individual genetics play a huge role.",
        unlockMsg: "To reach this level, you need the right knowledge.",
        errorMsg: "Please ensure all fields are filled correctly.",
        bodyTypes: {
            ecto: "Ectomorph",
            meso: "Mesomorph",
            endo: "Endomorph"
        }
    },
    halfLifeVisualizer: {
        title: "Half-Life Plotter",
        subtitle: "Visualize hormone accumulation and avoid instability.",
        compoundLabel: "Compound",
        dosageLabel: "Dosage (mg)",
        durationLabel: "Duration (weeks)",
        startWeekLabel: "Starts at week",
        frequencyLabel: "Frequency",
        yAxis: "Blood Level",
        xAxis: "Days",
        pctZone: "PCT Safe Zone",
        pctStartMsg: "Start PCT Here",
        peakLevelMsg: "Peak Level",
        addToStackBtn: "Add to Stack",
        activeStackTitle: "Active Compounds",
        serumTitle: "Serum Concentration",
        peakLabel: "Peak",
        saturationTitle: "Time to Saturation",
        stabilityTitle: "Stability Index",
        consistencyLabel: "Stability Score",
        mgSerumLabel: "mg/serum",
        loadLevelLabel: "Load Level",
        estrogenRisk: "Estrogen Risk",
        prolactinRisk: "Prolactin Alert",
        riskLevels: { low: "Optimal", med: "Caution", high: "Critical" },
        emptyStackMsg: "Add compounds to visualize the cycle",
        compounds: commonCompounds,
        frequencies: { ed: "Every Day (ED)", eod: "Every Other Day (EOD)", e3d: "Every 3 Days (E3D)", e7d: "Weekly (E7D)" },
        tooltipDay: "Day",
        tooltipLevel: "Level",
        tooltipPctReady: "PCT Ready",
        tooltipWait: "Wait",
        tooltipInject: "Injection",
        analysis: {
            title: "Cycle Analysis",
            prosTitle: "Expected Benefits",
            consTitle: "Potential Risks",
            adviceTitle: "Mr. X's Verdict",
            stabilityAdviceTitle: "For Better Stability",
            safetyAdviceTitle: "For Better Safety",
            pctTableTitle: "Suggested PCT Protocol",
            pros: ["Stable blood levels", "Convenient injection frequency", "Lower risk of acute side effects"],
            cons: ["Slow saturation", "Long clearance time", "Requires careful PCT planning"],
            advice: "This chart visualizes how compounds accumulate in your blood. Stability is key to avoiding side effects. Note when PCT starts.",
            pctNote: "This intelligent protocol is calculated based on cycle load and total hormonal displacement. Clinical testing is recommended to confirm HPTA recovery.",
            protocolLevelLabel: "Protocol Level",
            recoveryPowerLabel: "Recovery Power",
            tableHeaders: {
                compound: "Product",
                first10Days: "First 10 Days",
                weeks2to4: "Weeks 2-4",
                frequency: "Frequency"
            }
        }
    },
    timeUnits: {
        days: "Days",
        hours: "Hours",
        minutes: "Mins",
        seconds: "Secs"
    },
    offerExpired: "Offer Expired!",
    heroEditions: {
        ar: "نسخة عربية",
        en: "English Edition",
        de: "Deutsche Ausgabe",
        ja: "日本語版"
    },
    injectionMap: {
        labels: {
            left: "Left",
            right: "Right",
            days: "Days",
            injectionSteps: "Injection Steps",
            selectPoint: "Select Injection Point",
            efficiency: "Absorption Efficiency",
            recovery: "Recovery Time",
            bestFor: "Best For",
            painLevel: "Pain Level"
        },
        featureCards: {
            power: { title: "Power Explosion", desc: "Within minutes, the compound begins circulating to maximize protein synthesis." },
            tissue: { title: "Tissue Building", desc: "Muscle fibers begin nitrogen retention, drastically accelerating recovery." },
            burn: { title: "Burn & Define", desc: "Metabolism spikes, resulting in a drier, more defined and vascular physique." }
        },
        title: "Safe Injection Map",
        subtitle: "Interactive guide for IM injection sites, risks, and tools.",
        viewFront: "Front View",
        viewBack: "Back View",
        needleSizeLabel: "Needle Size",
        maxVolumeLabel: "Max Volume",
        painLevelLabel: "Pain Level",
        riskLevelLabel: "Risk Level",
        recoveryLabel: "Recovery Time",
        lastInjectedLabel: "Last Injected",
        logInjectionBtn: "Log Injection",
        suggestBtn: "Suggest Site",
        suggesting: "Suggesting...",
        status: { ready: "Ready", recovering: "Recovering", warning: "Avoid" },
        riskLevel: "Risk Level",
        tapToExplore: "Tap any muscle for details",
        interactiveMapLabel: "Interactive 3D Map",
        medicalInsightLabel: "Medical Insight",
        riskLevels: {
            low: "Low",
            high: "High"
        },
        goldenHourTitle: "Post-Injection (The Golden Hour)",
        goldenHourDesc: "Transformation begins immediately! The compound flows to reshape your tissues, instantly boosting protein synthesis, turning your next workout into an explosion of power.",
        goldenAdvice: "Rotation is key. Don't exhaust one muscle; make your body a balanced map of growth.",
        rotationTrackerTitle: "Smart Rotation Tracker",
        cumulativeGrowthLabel: "Cumulative Growth",
        efficiencyLabel: "Absorption Efficiency",
        stimulatedCellsLabel: "Stimulated Cells",
        rotateHint: "Slide to Rotate ↔️",
        mrxInsightLabel: "MR. X INSIGHT",
        closeDetailsBtn: "Close Details",
        comfortableSpot: "Most Comfortable",
        sites: injectionSitesEn,
    },
    mealPlanTitle: "Meal Plan",
    mealPlanBtn: "Generate Plan",
    mealPlanLoading: "Preparing...",
    mealPlanError: "Error occurred",
    timelineTitle: "Transformation Timeline",
    timelineSubtitle: "What happens inside your body week by week? A full biological journey.",
    timelinePhases: [
        { week: "1-2", title: "The Kickstart", shortDesc: "Initial saturation and first changes", iconKey: "spark", stats: { strength: 20, hypertrophy: 10, waterRetention: 30, fatLoss: 5, mood: 80 }, details: { biological: "Sharp rise in blood androgen levels. Nitrogen retention increases.", feeling: "High libido, improved mood, constant pumps.", action: "Stick to diet 100%. Drink 4L water daily." } },
        { week: "3-6", title: "Hypertrophy Surge", shortDesc: "Rapid growth and weight gain", iconKey: "muscle", stats: { strength: 60, hypertrophy: 70, waterRetention: 50, fatLoss: 10, mood: 90 }, details: { biological: "Receptor saturation. Protein synthesis at max.", feeling: "Insane strength. Clothes get tight. High appetite.", action: "Increase weights. Monitor BP and Estrogen." } },
        { week: "7-10", title: "Hardening Phase", shortDesc: "Weight stabilizes, fat burning starts", iconKey: "trophy", stats: { strength: 90, hypertrophy: 90, waterRetention: 40, fatLoss: 40, mood: 70 }, details: { biological: "Blood levels stable. Body uses fat for fuel efficiently.", feeling: "Muscles look harder and more detailed.", action: "Start regular cardio. Monitor liver values." } },
        { week: "11-12", title: "Peaking", shortDesc: "Final touches before exit", iconKey: "flag", stats: { strength: 100, hypertrophy: 100, waterRetention: 20, fatLoss: 60, mood: 60 }, details: { biological: "Max muscle density. Preparing for withdrawal.", feeling: "Slight fatigue. Fully ready.", action: "Plan PCT. Slight calorie deficit." } }
    ],
    timelineLabels: { strength: "Strength", hypertrophy: "Size", water: "Water", fatLoss: "Fat Loss", mood: "Mood", biologicalTitle: "Biological Impact", feelingTitle: "How You Feel", actionTitle: "Action Plan", phaseLabel: "Phase", chartTitle: "Cumulative Evolution Plot", chartSubtitle: "AI-Driven Biometric & Performance Tracking" },
    salesToast: { purchased: "purchased Full Version", verified: "Verified", justNow: "Just Now", fromLabel: "from" },
    audioPlayer: { title: "Author's Intro", subtitle: "Listen to a special message from George", duration: "02:15" },
    aiChat: {
        fabLabel: "AI Assistant",
        title: "Mr. X AI",
        subtitle: "Your intelligent assistant for all questions",
        placeholder: "Type your question here...",
        send: "Send",
        disclaimer: "AI can make mistakes. Always consult a doctor.",
        label: "AI Chat With",
        suggestions: ["How to bulk?", "What is PCT?", "Best workout plan", "Explain Hormones"],
        welcomeMessage: "Hey Champ. I am the AI version of Mr. X. How can I help you with your training or nutrition today?"
    },
    quiz: {
        title: "Are You Ready?",
        subtitle: "A quick quiz to determine your level and whether you are ready to enter the hormonal world or need more foundation.",
        startBtn: "Start Quiz",
        questionLabel: "Question",
        totalLabel: "Total",
        questions: [
            {
                question: "How many years of consistent training do you have?",
                options: [
                    { text: "Less than 3 years", score: 0 },
                    { text: "More than 5 years", score: 1 }
                ]
            },
            {
                question: "What is your current body fat percentage?",
                options: [
                    { text: "Over 15% (visible fat)", score: 0 },
                    { text: "Under 12% (visible abs)", score: 1 }
                ]
            },
            {
                question: "Do you weigh your food and track calories daily?",
                options: [
                    { text: "Sometimes / I just eat healthy", score: 0 },
                    { text: "Yes, every gram is tracked", score: 1 }
                ]
            },
            {
                question: "Do you know what PCT (Post Cycle Therapy) is?",
                options: [
                    { text: "Heard of it / Don't know much", score: 0 },
                    { text: "Yes, I know SERMs & HCG protocols", score: 1 }
                ]
            },
            {
                question: "Have you done bloodwork (Kidney, Liver, Hormones) recently?",
                options: [
                    { text: "No / A long time ago", score: 0 },
                    { text: "Yes, and I know my baseline", score: 1 }
                ]
            }
        ],
        results: {
            natural: {
                title: "Stay Natural (For Now)",
                desc: "You have great potential for natural growth. Using hormones now might hurt you more than help because your foundation (Diet/Training) needs tuning. This book will help you max out your natural genetic potential first.",
                cta: "Get the Book to Maximize Gains"
            },
            enhanced: {
                title: "You Are Ready for the Next Step",
                desc: "You have the experience and a solid foundation. The next step requires precise science to protect you. You don't need random advice; you need the strict scientific protocols in this book.",
                cta: "Get the Book & Start Your Cycle"
            }
        }
    },
    dailyIQ: {
        title: "Daily Steroid IQ Challenge",
        subtitle: "New question every 24h. Answer correctly to unlock an instant discount.",
        challengeLabel: "DAILY CHALLENGE",
        winTitle: "Correct! You're sharp.",
        winDesc: "You proved your knowledge. Here is your discount code (Valid for 60 mins).",
        loseTitle: "Incorrect",
        loseDesc: "Don't worry, learning is part of the game. Come back tomorrow for a new question.",
        explanationLabel: "Explanation:",
        copySuccess: "Code copied!",
        toastCorrect: "Awesome! Discount code applied successfully.",
        couponLabel: "Discount Code",
        claimBtn: "Copy & Buy Now",
        expiresIn: "Offer expires in:",
        comeBackTomorrow: "Next question in:",
        questions: [
            {
                id: 1,
                question: "What is the primary difference between Nolvadex and Clomid in PCT?",
                options: ["They are exactly the same", "Nolvadex is better for Gyno, Clomid is stronger for LH stimulation", "Clomid stops Gyno better than Nolvadex", "Nolvadex is an Aromatase Inhibitor (AI)"],
                correctIndex: 1,
                explanation: "Nolvadex blocks estrogen at the breast tissue (stopping Gyno), while Clomid acts more potently on the pituitary gland to restart LH and Testosterone."
            },
            {
                id: 2,
                question: "What is the approximate half-life of Testosterone Enanthate?",
                options: ["24 Hours", "2-3 Days", "4.5-5 Days", "14 Days"],
                correctIndex: 2,
                explanation: "Testosterone Enanthate has a half-life of roughly 4.5 to 5 days, making it suitable for twice-weekly injections."
            },
            {
                id: 3,
                question: "Which of these is considered the most hepatotoxic (Liver Toxic)?",
                options: ["Testosterone Propionate", "Injectable Primobolan", "Dianabol (Oral)", "Deca Durabolin"],
                correctIndex: 2,
                explanation: "Oral steroids like Dianabol are 17-alpha-alkylated to survive liver metabolism, causing significant liver stress compared to injectables."
            }
        ]
    },
    cycleArchitect: {
        title: "Smart Cycle Synchronizer",
        subtitle: "Design your protocol with precision. Get a live executable schedule (ICS) with injection rotation, stealth mode, and PCT calculation.",
        presetsTitle: "Presets:",
        configLabel: "Configuration",
        stealthModeLabel: "Stealth Mode (Privacy)",
        rotationLabel: "Auto-Rotate Injection Sites",
        pctLabel: "Auto-Calculate PCT Start",
        toggleStealth: "Toggle Stealth Mode",
        toggleRotation: "Toggle Injection Rotation",
        togglePct: "Toggle Auto PCT",
        stealthAliases: ["Gym Session", "Vitamin Shot", "Work Meeting", "Physio", "Cardio"],
        rotationSites: ["Right Glute (Dorso)", "Left Glute (Dorso)", "Right Delt", "Left Delt", "Right Quad", "Left Quad"],
        presets: {
            beginnerBulk: "Beginner Bulking",
            cutting: "Advanced Cutting",
            trt: "TRT Protocol"
        },
        form: {
            startDateLabel: "Start Date",
            compoundLabel: "Compound",
            dosageLabel: "Dosage (mg)",
            frequencyLabel: "Frequency",
            weeksLabel: "Duration (Weeks)",
            halfLifeLabel: "Half-Life (Days) - For PCT",
            addCompoundBtn: "Add Compound",
            removeBtn: "Remove",
            frequencies: {
                daily: "Daily (ED)",
                eod: "Every Other Day (EOD)",
                twiceWeekly: "Twice Weekly (Mon/Thu)",
                weekly: "Weekly (Once)"
            }
        },
        premiumLock: {
            lockedTitle: "Premium Feature Locked",
            lockedDesc: "Exporting the full schedule to your phone's calendar with Smart Rotation, Stealth Mode & Auto-PCT is exclusive to Verified Customers.",
            verifyBtn: "Verify Purchase to Unlock",
            exportBtn: "Export Smart Calendar (.ics)",
            placeholder: "Enter Email or Order ID",
            successMsg: "Verified! Feature Unlocked.",
            errorMsg: "Order not found.",
            demoHint: "Try \"demo\" to unlock instantly"
        },
        pctEventSummary: "🔰 START PCT PROTOCOL 🔰",
        pctEventDescription: "Clearance time passed. Begin SERMs protocol now.",
        stealthPctAlias: "Recovery Phase Start"
    },
    units: {
        mg: "mg",
        g: "g",
        ml: "ml",
        kcal: "kcal",
        days: "days",
        weeks: "weeks",
        percentage: "%",
        liters: "liters",
        ed: "Daily",
        eod: "EOD",
        twiceWeekly: "Twice Weekly",
        weekly: "Weekly"
    },
    calcAiInsightTitle: "AI Nutrition Assistant",
    calcAiInsightText: "Based on deep analysis, your metabolic rate is 8% higher than average. We suggest increasing complex carbohydrate intake.",
    calcPredictiveAccuracy: "Prediction Accuracy: 92.4%",
    calcEcosystemStatus: "Wearable Device Synced",
    calcMealBalanceLabel: "Evolutionary Nutrient Balance",
    calcRecipeStepsLabel: "Interactive Preparation Steps",
    calcPatternAnalysisLabel: "Dietary Pattern Analysis",
    calcMetabolicEfficiencyLabel: "Dynamic Metabolic Efficiency",
    calcSimulateBtn: "Start Predictive Simulation",
    adLabel: "Advertisement",
    macroEcosystem: {
        syncStatus: "Syncing with Ecosystem...",
        analysisTitle: "Multidimensional Analysis",
        evolutionaryTitle: "Evolutionary Meal Plan",
        aiInsightTitle: "Neural Nexus Insight",
        stepsLabel: "Smart Preparation Steps",
        ingredientsLabel: "Bio-Active Ingredients"
    },
    checkoutAgree: "I agree to the [Terms of Service], [Privacy Policy], and [Medical & Legal Disclaimer].",
    medicalDisclaimerPage: {
        title: "Medical Disclaimer & High-Risk Warning",
        sections: [
            {
                title: "1. General Medical Disclaimer",
                content: `The content provided on <strong>https://www.mrxsteroid.com</strong>, including but not limited to the book "Mr. X-Steroid" (ISBN: 9781326746728), text, graphics, images, videos, and other material contained herein (collectively, "Content"), is for <strong>informational, educational, and research purposes only</strong> within the Sports category.<br>The Content is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on this website.`
            },
            {
                title: "2. No Doctor-Patient Relationship",
                content: `The author of "Mr. X-Steroid" (<strong>George Mourice</strong>), the website owners (<strong>INSTITUTION OF GEORGE MOURICE</strong>), and the contributors are <strong>not</strong> licensed medical doctors, physicians, or healthcare professionals. Your use of this website, purchase of our products, or communication with our support team does <strong>not</strong> create a doctor-patient relationship.<br>Any specific protocols, dosages, or cycle examples discussed are theoretical or anecdotal based on community data and should never be attempted without strict medical supervision.`
            },
            {
                title: "3. High-Risk Warning: Anabolic Androgenic Steroids (AAS)",
                content: `You explicitly acknowledge and understand that the use of Anabolic Androgenic Steroids (AAS), Performance Enhancing Drugs (PEDs), and related pharmaceutical compounds carries <strong>severe health risks</strong>, both acute and long-term.<br>These risks include, but are not limited to: cardiovascular damage, liver toxicity, hormonal suppression, psychological disturbances, and permanent infertility.<br><strong>Legal Disclaimer:</strong> The possession, sale, and administration of anabolic steroids without a valid prescription are illegal in many jurisdictions, including the United States, Egypt, and parts of Europe. This website <strong>does not condone, encourage, or advocate</strong> the use of illegal substances. All information is provided strictly for the purpose of <strong>Harm Reduction</strong> and education.`
            },
            {
                title: "4. FDA & Regulatory Disclaimer",
                content: `The statements made regarding supplements or specific compounds on this website have not been evaluated by the Food and Drug Administration (FDA) or any equivalent international regulatory body. The products and information mentioned are not intended to diagnose, treat, cure, or prevent any disease.`
            },
            {
                title: "5. Assumption of Risk",
                content: `By accessing <strong>https://www.mrxsteroid.com</strong> and purchasing "Mr. X-Steroid", you agree that you constitute a rational adult (18+ years of age) and that you are voluntarily engaging in these activities. You assume full responsibility for any risks, injuries, or damages, known or unknown, which you might incur as a result of using the information provided.<br><strong>INSTITUTION OF GEORGE MOURICE</strong> explicitly disclaims liability for any adverse effects resulting from the use or application of the information contained herein.`
            },
            {
                title: "6. Accuracy of Information",
                content: "While we strive to provide accurate and up-to-date information based on the latest research and community findings, the field of endocrinology and sports science is constantly evolving. We do not warrant that the information on this website is complete, reliable, current, or error-free."
            }
        ]
    },

    nav: {
        home: "Home",
        about: "About Us",
        macro: "Macro Calculator",
        injection: "Injection Map",
        halflife: "Half-Life Visualizer",
        lab: "Lab Reference",
        genetic: "Genetic Potential",
        cycle: "Cycle Architect",
        sitemap: "Sitemap",
        login: "Login",
        signup: "Sign Up"
    },
    accessibilityTitle: "Accessibility Statement",
    gdprTitle: "GDPR Compliance",
    ccpaTitle: "CCPA Compliance",
    blogTitle: "Scientific Blog",
    shippingPolicyTitle: "Shipping Policy",
    returnPolicyTitle: "Return & Exchange Policy",
    cookiePolicyTitle: "Cookie Policy",
    complianceLinks: "Global Compliance",
    commercialLinks: "Commercial",
    generalLinks: "General Menu",
    internationalLegalLinks: "International Legal",
    supportTitle: "Support & Help Center",
    careersTitle: "Careers & Opportunities",
    faqPageTitle: "Frequently Asked Questions",
    privacyTitle: "Privacy Policy",
    termsTitle: "Terms of Service",
    refundTitle: "Refund Policy",
    legalDisclaimerTitle: "Legal Disclaimer",
    supportLinks: "Support & Help",
    pricingPlans: [
        {
            id: 'digital',
            name: "Digital Protocol",
            description: "Immediate Access. Zero Friction.",
            features: ["eBook (PDF/EPUB)", "Instant Delivery", "Basic Cycle Templates"],
            cta: "Instant Access"
        },
        {
            id: 'bundle',
            name: "Tactical Bundle",
            description: "Maximum Value. The Complete Arsenal.",
            features: ["Glossy Paperback", "Digital Copy Included", "Bonus: Audiobook", "Home Workout PDF", "Free Shipping"],
            cta: "Get The Bundle"
        },
        {
            id: 'coaching',
            name: "Smart Professional",
            description: "Elite Status. Full Optimization.",
            features: ["Hardcover Premium Edition", "VIP Community Access", "Priority Global Shipping", "Safe Exit Protocol"],
            upsellFeatures: ["1-on-1 Cycle Coaching (1 Full Cycle)", "Bloodwork Analysis", "Custom PCT Protocol"],
            cta: "Get Pro Edition"
        }
    ],
    checkout: {
        validation: {
            nameRequired: "Name must be at least 3 characters",
            emailInvalid: "Invalid email address",
            countryRequired: "Country is required",
            addressRequired: "Address is required for physical shipping",
            cityRequired: "City is required",
            zipRequired: "ZIP Code is required",
            shippingRequired: "Please select a shipping provider",
            weightRequired: "Weight is required for coaching",
            heightRequired: "Height is required for coaching",
            termsRequired: "You must agree to the terms and medical disclaimer"
        },
        placeholders: {
            fullName: "John Doe",
            email: "mrx@example.com",
            address: "Street name, building, apartment"
        }
    }
};
