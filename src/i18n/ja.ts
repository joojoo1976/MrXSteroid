import { ContentStrings, LabTest, InjectionSite, TeaserTableData } from '../types';
import { commonCompounds, fullJapaneseDisclaimer } from './data';

export const teaserTablesJA: TeaserTableData[] = [
    {
        title: "初心者向けバルクアップサイクル（サンプル）",
        headers: ["週", "化合物", "用量"],
        rows: [
            { col1: "1-5", col2: "テストステロン・エナンセート", col3: "500mg / 週" },
            { col1: "1-5", col2: "ダイアナボル (キックスタート)", col3: "30mg / 日" },
            { col1: "1-12", col2: "アリミデックス", col3: "0.5mg / 隔日" },
            { col1: "6-12", col2: "テストステロン・エナンセート", col3: "500mg / 週" },
            { col1: "13-15", col2: "クリアランス期間", col3: "化合物なし" },
            { col1: "16-17", col2: "PCT: ノルバデックス", col3: "40mg / 日" },
            { col1: "18-19", col2: "PCT: クロミッド", col3: "50mg / 日" }
        ]
    },
    {
        title: "上級者向けカッティングサイクル（サンプル）",
        headers: ["週", "化合物", "用量"],
        rows: [
            { col1: "1-4", col2: "テストステロン・プロピオネート", col3: "100mg / 隔日" },
            { col1: "1-4", col2: "トレンボロン・アセテート", col3: "75mg / 隔日" },
            { col1: "1-8", col2: "マスタロン・プロピオネート", col3: "100mg / 隔日" },
            { col1: "5-10", col2: "ウィンストロール (注射用)", col3: "50mg / 隔日" },
            { col1: "1-10", col2: "T3 (サイトメル)", col3: "25mcg (ピラミッド法)" },
            { col1: "11-14", col2: "PCTプロトコル", col3: "HCG + SERMs" }
        ]
    }
];

export const injectionSitesJa: InjectionSite[] = [
    {
        id: 'glute_dorso', name: '臀部（後部）', category: 'Lower Body', view: 'back', needle: '23G - 25G (1.5")', volume: '3.0 - 4.0 ml', recoveryDays: 7, riskLevel: 'Low', description: 'ゴールドスタンダード。巨大な筋肉で、神経が少なく、大量の投与にも耐えられます。', pathD: 'M 180,310 Q 200,310 215,340 Q 215,380 180,380 Q 150,380 145,340 Q 145,310 180,310',
        painLevel: '低 (1/10)',
        bestFor: '大容量、油性薬剤',
        steps: ['お尻を4つの象限に分けます。', '「上外側」の象限を狙います。', '針を90度で挿入します。', '吸引して血液がないことを確認し、ゆっくり注入します。'],
        advice: "これがあなたの安全地帯です。最初は考えすぎず、常にここから始めてください。筋肉は巨大でミスを許容してくれますが、坐骨神経には注意してください。常に上外側の象限に、誠実に注入してください。"
    },
    {
        id: 'glute_ventro', name: '臀部（腹側/中殿筋）', category: 'Lower Body', view: 'front', needle: '23G - 25G (1.5")', volume: '2.5 - 3.0 ml', recoveryDays: 7, riskLevel: 'Low', description: '医学的に最も安全。坐骨神経から遠く、ローテーションに最適。', pathD: 'M 130,280 Q 145,280 145,310 Q 140,330 120,320 Q 110,300 130,280',
        painLevel: '低 (2/10)',
        bestFor: '安全性、毎日のローテーション',
        steps: ['横向きに寝て、手のひらを股関節に置きます。', '親指と人差し指を広げてV字を作ります。', '指の間の筋肉に注入します。', '医学的に最も安全な部位です。'],
        advice: "これであなたもプロのようです。この場所は医学的に最も安全で痛みが少ないです。ここをマスターすれば、瘢痕組織から遠く離れたホルモンの快適さを手に入れることができるでしょう。"
    }
];

export const labTestsJa: LabTest[] = [
    { id: 'test_total', name: '総テストステロン', category: 'hormones', range: '300 - 1000', unit: 'ng/dL', min: 300, max: 1000, description: '主要な男性ホルモンであり、筋肉の成長と性欲を司ります。', elevationMeaning: '高値はニキビ、脱毛、気分の変化を引き起こす可能性があります。サイクル中は一般的です。', lowMeaning: '低値は疲労、筋肉の喪失、性欲減退を引き起こします。', management: 'LH/FSHを監視し、継続的に低い場合はTRTを検討してください。' },
    { id: 'test_free', name: '遊離テストステロン', category: 'hormones', range: '5 - 21', unit: 'pg/mL', min: 5, max: 21, description: 'SHBGやアルブミンに結合していない、生体利用可能なテストステロン。', elevationMeaning: '外因性テストステロンの使用中は一般的に上昇します。', lowMeaning: '総テストステロンよりも低T症状の優れた指標となることがよくあります。', management: 'フリーT比率を最適化するためにSHBGレベルに対処してください。' },
    { id: 'e2', name: 'エストラジオール (E2)', category: 'hormones', range: '20 - 45', unit: 'pg/mL', min: 20, max: 45, description: 'エストロゲンの主要な形態。男性の骨の健康と性欲に不可欠です。', elevationMeaning: '高E2は水分貯留、女性化乳房、感情的な不安定さを引き起こします。', lowMeaning: '低E2は関節痛、低性欲、乾燥肌を引き起こします。', management: 'バランスを保つために、アロマターゼ阻害剤（AI）を慎重に使用してください。' },
    { id: 'lh', name: '黄体形成ホルモン (LH)', category: 'hormones', range: '1.7 - 8.6', unit: 'mIU/mL', min: 1.7, max: 8.6, description: '精巣にテストステロンを生成するよう信号を送ります。', elevationMeaning: '高レベルは原発性精巣不全を示す可能性があります。', lowMeaning: '低レベルはHPTA抑制を示します（サイクル中は一般的）。', management: 'サイクル後の回復状態の重要なマーカー。' },
    { id: 'fsh', name: '卵胞刺激ホルモン (FSH)', category: 'hormones', range: '1.5 - 12.4', unit: 'mIU/mL', min: 1.5, max: 12.4, description: '精子の生産に不可欠です。', elevationMeaning: 'レベルの上昇は原発性精巣不全を示唆しています。', lowMeaning: '薬物によるホルモンサイクル中は抑制されます。', management: '生殖能力のモニタリングに不可欠です。' },
    { id: 'prolactin', name: 'プロラクチン', category: 'hormones', range: '4 - 15', unit: 'ng/mL', min: 4, max: 15, description: '上昇すると性欲に影響を与え、女性化乳房を引き起こす可能性のあるホルモン。', elevationMeaning: '19-nor化合物（デカ/トレン）によって上昇する可能性があります。性欲の問題を引き起こします。', lowMeaning: '低レベルはまれであり、通常は心配ありません。', management: '継続的に高い場合は、P5Pまたはドーパミン作動薬を検討してください。' },
    { id: 'shbg', name: 'SHBG', category: 'hormones', range: '16 - 55', unit: 'nmol/L', min: 16, max: 55, description: 'テストステロンに結合し、それを不活性にするタンパク質。', elevationMeaning: '高いSHBGは遊離テストステロンレベルを低下させます。', lowMeaning: '低いSHBGは経口ステロイドで一般的であり、遊離Tを増加させます。', management: '総Tと遊離Tの関係を理解するために監視します。' },
    { id: 'alt', name: 'ALT (SGPT)', category: 'organs', range: '10 - 40', unit: 'U/L', min: 10, max: 40, description: '主要な肝酵素。高レベルは肝臓のストレスまたは損傷を示します。', elevationMeaning: '経口17-アルファ-アルキル化ステロイドによって一般的に上昇します。', lowMeaning: '臨床的意義はありません。', management: 'TUDCA/NACを使用し、経口化合物を中止してください。' },
    { id: 'ast', name: 'AST (SGOT)', category: 'organs', range: '10 - 40', unit: 'U/L', min: 10, max: 40, description: '肝臓と心臓の酵素。筋肉の損傷によっても上昇する可能性があります。', elevationMeaning: '肝臓のストレスまたは激しい筋力トレーニングで上昇します。', lowMeaning: '臨床的意義はありません。', management: 'ALTと比較して、肝臓と筋肉のストレスを区別します。' },
    { id: 'ggt', name: 'GGT', category: 'organs', range: '0 - 60', unit: 'U/L', min: 0, max: 60, description: '肝臓と胆管の健康のための特定の酵素。', elevationMeaning: '深刻な肝臓のストレスまたはアルコール/薬物毒性を示します。', lowMeaning: '正常。', management: '肝病理学のための非常に特異的なマーカー。' },
    { id: 'creatinine', name: 'クレアチニン', category: 'organs', range: '0.7 - 1.3', unit: 'mg/dL', min: 0.7, max: 1.3, description: '筋肉分解の老廃物。主要な腎臓マーカー。', elevationMeaning: '腎臓のストレス、脱水、または非常に高い筋肉量を示す可能性があります。', lowMeaning: '筋肉の消耗または非常に低いタンパク質摂取量を示す可能性があります。', management: '水分補給を維持し、正確な腎臓評価のためにシスタチンCを使用してください。' },
    { id: 'urea', name: '尿素 / BUN', category: 'organs', range: '7 - 20', unit: 'mg/dL', min: 7, max: 20, description: '血液中の窒素を測定します。タンパク質代謝を反映します。', elevationMeaning: '高タンパク質摂取、脱水、または腎臓の問題。', lowMeaning: '低タンパク質食または重度の肝疾患。', management: '高タンパク質サイクル中は十分な水分補給を確保してください。' },
    { id: 'hdl', name: 'HDL (善玉)', category: 'blood', range: '> 40', unit: 'mg/dL', min: 40, max: 100, description: '高密度リポタンパク質。心血管系を保護します。', elevationMeaning: '心臓の健康に理想的です。', lowMeaning: 'ほぼすべてのアナボリックステロイドサイクルの非常に一般的な副作用。', management: 'オメガ3、クリルオイルを使用し、有酸素運動を維持してください。' },
    { id: 'ldl', name: 'LDL (悪玉)', category: 'blood', range: '< 130', unit: 'mg/dL', min: 0, max: 130, description: '低密度リポタンパク質。高レベルはプラークのリスクを高めます。', elevationMeaning: 'アテローム性動脈硬化症や心臓病のリスクを高めます。', lowMeaning: '心臓の健康に最適です。', management: 'HDLとの比率を監視し、飽和脂肪の摂取量を調整してください。' },
    { id: 'hematocrit', name: 'ヘマトクリット', category: 'blood', range: '38 - 50', unit: '%', min: 38, max: 50, description: '血液中の赤血球の体積割合。', elevationMeaning: '高レベル（多血症）は血液の粘度と血栓のリスクを高めます。', lowMeaning: '貧血; 酸素運搬能力の低下。', management: '52%を超える場合、頻繁な献血が必要になることがあります。' },
    { id: 'hemoglobin', name: 'ヘモグロビン', category: 'blood', range: '13.5 - 17.5', unit: 'g/dL', min: 13.5, max: 17.5, description: '酸素を運ぶ赤血球中のタンパク質。', elevationMeaning: 'サイクル中によく見られます。血液が濃くなっていることを示します。', lowMeaning: '潜在的な貧血と低い持久力。', management: '十分に水分を補給し、血圧を監視してください。' },
    { id: 'tsh', name: 'TSH', category: 'thyroid', range: '0.4 - 4.0', unit: 'mIU/L', min: 0.4, max: 4.0, description: '甲状腺刺激ホルモン。代謝率を調節します。', elevationMeaning: '甲状腺機能低下症（甲状腺の活動低下）を示します。', lowMeaning: '甲状腺機能亢進症（甲状腺の活動過多）を示します。', management: 'T3やトレンボロンなどの特定のAASを使用する場合に重要です。' },
    { id: 'vit_d', name: 'ビタミンD', category: 'vitamins', range: '30 - 100', unit: 'ng/mL', min: 30, max: 100, description: '骨の健康とホルモン合成に不可欠です。', elevationMeaning: 'ビタミンD中毒（非常にまれ）。', lowMeaning: '非常に一般的。低テストステロンレベルに関連しています。', management: '低い場合は毎日5,000+ IUを補給してください。' },
    { id: 'ferritin', name: 'フェリチン', category: 'minerals', range: '30 - 400', unit: 'ng/mL', min: 30, max: 400, description: '体内の総鉄貯蔵量を反映します。', elevationMeaning: '炎症や鉄過剰症を示す可能性があります。', lowMeaning: '鉄欠乏性貧血。', management: '頻繁に献血する場合は追跡が不可欠です。' },
    { id: 'hs_crp', name: 'hs-CRP', category: 'inflammation', range: '0 - 3.0', unit: 'mg/L', min: 0, max: 3.0, description: '高感度CRP。全身性炎症の精密マーカー。', elevationMeaning: '慢性炎症、オーバートレーニング、または心臓への負担。', lowMeaning: '状態：最適。全身性炎症が少ない。', management: '高い場合は休息と抗炎症性の栄養を優先してください。' },
    { id: 'hba1c', name: 'HbA1c', category: 'metabolic', range: '4.0 - 5.6', unit: '%', min: 4.0, max: 5.6, description: '過去3〜4か月の平均血糖値。', elevationMeaning: 'インスリン抵抗性または不十分なグルコース管理。', lowMeaning: '慢性の低炭水化物ストレスまたは低血糖傾向。', management: '炭水化物のタイミングと食物繊維の摂取を最適化してください。' },
    { id: 'cystatin_c', name: 'シスタチンC', category: 'kidney', range: '0.6 - 1.0', unit: 'mg/L', min: 0.6, max: 1.0, description: '筋肉量の影響を受けない高精度の腎臓マーカー。', elevationMeaning: '腎濾過率の低下。', lowMeaning: '最適な腎臓の健康。', management: 'クレアチニンが高いアスリートのためのゴールドスタンダード。' },
    { id: 'nt_probnp', category: 'heart', range: '0 - 125', unit: 'pg/mL', min: 0, max: 125, description: '心壁ストレスと体液過剰のマーカー。', elevationMeaning: '高血圧またはPEDの使用による心臓への負担の可能性。', lowMeaning: '最適。最小限の心臓ストレス。', management: '血圧を綿密に監視し、心臓の健康を最適化してください。', name: 'NT-proBNP' },
    { id: 'uric_acid', name: '尿酸', category: 'metabolic', range: '3.5 - 7.2', unit: 'mg/dL', min: 3.5, max: 7.2, description: 'タンパク質分解の副産物。高レベルは痛風を引き起こします。', elevationMeaning: '脱水症、高タンパク質、または代謝ストレス。', lowMeaning: '状態：正常。臨床的な懸念はありません。', management: '水分摂取量を増やし、食事中のプリン体を管理してください。' },
    { id: 'igf1', name: 'IGF-1', category: 'hormones', range: '115 - 350', unit: 'ng/mL', min: 115, max: 350, description: '主に筋肉細胞の成長を担う成長因子。', elevationMeaning: 'HGHまたはインスリン分泌促進剤の使用中によく見られる高レベル。', lowMeaning: '筋肉の成長の可能性と回復力の低下。', management: '成長ホルモンの有効性のマーカー。' }
];

export const jaContent: Partial<ContentStrings> = {
    // Navigation
    navAiTools: "ボディビルダー向けAIツール",
    navPremiumResources: "プレミアムリソース",
    navFeatures: "機能",
    navToolNames: {
        macro: "MacroCalc Pro - インテリジェント栄養",
        bodyfat: "体脂肪計算機",
        injection: "注射マップ",
        halflife: "半減期プロッター",
        lab: "スマート検査値リファレンス",
        genetic: "遺伝的ポテンシャル",
        cycleArchitect: "サイクルカレンダーエクスポート",
    },
    themeNames: {
        light: "ライト",
        dark: "ダーク",
        system: "システム",
    },
    backToHome: "ホームに戻る",

    // SEO
    seoTitle: "Mr. X-Steroid | 究極のボディビルディング＆ステロイドガイド",
    seoDescription: "筋肉増強とホルモンサイクルのための世界で最も強力なガイドを発見してください。Mr. X-Steroidは、明確なプロトコル、安全ガイド、サプリメントのバイブルを提供します。",

    // Hero
    heroTitle: "Mr. X-Steroid",
    heroSubtitle: "究極の筋肉増強ガイドとホルモンサイクルハンドブックを発見：詳細なチャートと理解しやすい表に裏付けられた包括的な科学的アプローチ。",
    heroCta: "今すぐコピーを入手",
    downloadPreview: "無料プレビューをダウンロード (PDF)",
    audioPreviewBtn: "イントロを聴く",
    heroEditions: {
        ar: "アラビア語版",
        en: "英語版",
        de: "ドイツ語版",
        ja: "日本語版"
    },

    // Author
    authorSection: "著者について",
    authorName: "ジョージ・モーリス",
    authorBio: "著者でありカバーデザイナーであるジョージは、単なる情報ではないガイドを提供します - それは盾です。この本は、知識と科学が卓越性の基盤であると信じるすべてのコーチとアスリートへのメッセージです。",

    // Features
    featuresTitle: "中身は何ですか？",
    features: [
        {
            title: "包括的なホルモンチャート",
            description: "もう推測する必要はありません。初心者からプロまでの詳細なプロトコル。",
            iconKey: "chart"
        },
        {
            title: "「安全な出口」の芸術",
            description: "ホルモンシステムを保護し、生産を迅速に回復する方法を学びます。",
            iconKey: "exit"
        },
        {
            title: "サプリメントバイブル",
            description: "お金を節約しましょう。何が本当に機能するかについての残酷なガイド。",
            iconKey: "shield"
        }
    ],

    // Benefits
    benefitsTitle: "なぜ「Mr. X-Steroid」が最高の投資なのか？",
    benefitsSubtitle: "私たちはページを売っているだけではありません。数年の凝縮された経験を売っています。",
    benefits: [
        { title: "最大のROI 💰", description: "試行錯誤に何年も無駄にしないでください。正確な公式を入手してください。", iconKey: "roi" },
        { title: "医学的安全性 🛡️", description: "副作用を管理し、プロのようにPCTを通過する方法を学びます。", iconKey: "safety" },
        { title: "0% 神話、100% 現実 🧪", description: "生のフィルタリングされていないデータ。チャンピオンが実際に使用する科学的事実。", iconKey: "truth" },
        { title: "複雑な科学、シンプルに 🚀", description: "内分泌学を視覚的な青写真に分解し、簡単に追跡できるようにしました。", iconKey: "simplified" },
        { title: "「スマートサイクル」の利点 🧠", description: "ホルモンがピークに達したときに、栄養とトレーニングもピークに達するようにします。", iconKey: "smart" }
    ],

    // Testimonials
    testimonialsTitle: "読者の声",
    testimonials: [
        { name: "John S.", title: "ボディビルダー志望", text: "誤った情報の海で迷っていました。この本は私を正しい軌道に乗せてくれました。" },
        { name: "Michael A.", title: "パーソナルトレーナー", text: "クライアントに正直でありたいコーチにとって不可欠なリファレンスです。" },
        { name: "Kevin M.", title: "ローカルチャンピオン", text: "本の表は非常に正確で、人生で最高の体型に到達するのに役立ちました。" }
    ],

    // FAQ
    faqTitle: "よくある質問 (FAQ)",
    faqSubtitle: "最も一般的な質問への直接的な回答",
    faqSearchPlaceholder: "質問を検索...",
    faqCategories: { all: "すべて", safety: "安全性", general: "一般", legal: "法的", women: "女性", strategy: "戦略" },
    faqs: [
        { question: "この本は完全な初心者にも適していますか？", answer: "はい、基礎から始まり、複雑なチャートに入る前に医学用語やジム用語を簡単な言葉で説明しています。", category: "general" },
        { question: "栄養計画は含まれていますか？", answer: "はい、ホルモンに焦点を当てていますが、サイクル中の適切な栄養、カロリー計算、マクロに関する完全な章が含まれています。", category: "strategy" }
    ],
    privacyPolicy: "プライバシーポリシー",
    termsOfService: "利用規約",
    refundPolicy: "返金ポリシー",
    legalDisclaimer: "法的免責事項",
    aboutUs: "私たちについて",
    legal: "法的",
    quickLinks: "クイックリンク",
    pricingTitle: "プランを選択",
    pricingSubtitle: "あなたの健康と知識への少額의 投資が、数千ドルと数え切れないほどの健康リスクを節約します。",
    pricingTiers: [
        {
            id: 'digital',
            name: "ベーシック (デジタル電子書籍)",
            price: 49.99,
            description: "フル電子書籍 + 即時アクセス",
            features: ["全300ページ以上の書籍", "メールでの即時配信", "無期限の無料アップデート", "高解像度グラフィックス"],
            buttonText: "デジタル版を入手",
            requiresShipping: false,
            requiresBodyStats: false,
            includesEbook: true,
            includesAudiobook: false,
            includesCoaching: false
        },
        {
            id: 'paperback',
            name: "スタンダード (ペーパーバック・バンドル)",
            price: 72.00,
            description: "実体本 + デジタル + オーディオブック",
            features: ["高品質なペーパーバック", "デジタル版電子書籍付き", "フルオーディオブック付き", "自宅トレーニングPDF特典"],
            buttonText: "バンドルを注文",
            isPopular: true,
            popularLabel: "最もお得",
            requiresShipping: true,
            requiresBodyStats: false,
            includesEbook: true,
            includesAudiobook: true,
            includesCoaching: false
        },
        {
            id: 'hardcover',
            name: "プロフェッショナル (ハードカバー & コーチング)",
            price: 249.99,
            description: "プレミアム・ハードカバー + フルコーチング・アクセス",
            features: ["豪華ハードカバー版", "ホルモンコース全編アクセス", "VIPコミュニティ・メンバーシップ", "優先グローバル配送"],
            buttonText: "エリートに参加",
            requiresShipping: true,
            requiresBodyStats: true,
            includesEbook: true,
            includesAudiobook: true,
            includesCoaching: true
        }
    ],
    disclaimerTitle: "重要な警告と免責事項",
    disclaimerContent: fullJapaneseDisclaimer,
    agreeButton: "同意し、全責任を負い、18歳以上です",
    disclaimerAcknowledgement: "以下のボタンをクリックすることにより、上記のすべての条件を読み、理解し、同意したことを認めたことになります。",
    importantDisclaimer: "重要な警告",
    downloadFullBook: "完全版をダウンロード",
    processing: "処理中...",
    purchaseSuccess: "購入が完了しました！Mr. X-Steroid のインナーサークルへようこそ。",
    shippingAddress: "配送先住所",
    city: "市区町村",
    zipCode: "郵便番号",
    shippingProvider: "配送業者",
    weight: "体重 (kg)",
    height: "身長 (cm)",
    age: "年齢",
    goal: "フィットネス目標",
    securePaymentMessage: "SpaceRemit による 100% 安全で暗号化された支払い",
    orderSummary: "ご注文内容",
    subtotal: "小計",
    shipping: "配送料",
    transactionFee: "決済手数料",
    total: "合計",
    payNow: "今すぐ支払う",
    secureCheckout: "安全なチェックアウト",
    fullName: "フルネーム",
    emailAddress: "メールアドレス",
    loginTitle: "ログイン",
    signupTitle: "サインアップ",
    emailLabel: "メールアドレス",
    passwordLabel: "パスワード",
    nameLabel: "フルネーム",
    loginBtn: "ログイン",
    signupBtn: "アカウント作成",
    noAccount: "アカウントをお持ちでないですか？",
    haveAccount: "すでにアカウントをお持ちですか？",

    calcTitle: "MacroCalc Pro - インテリジェント栄養",
    calcSubtitle: "多次元分析エンジンと高度な予測システム",
    calcGender: "性別",
    calcMale: "男性",
    calcFemale: "女性",
    calcAge: "年齢",
    calcWeight: "体重 (kg)",
    calcHeight: "身長 (cm)",
    calcActivity: "活動レベル",
    calcGoal: "目標",
    calcCalculate: "計算する",
    calcResults: "あなたの毎日の結果",
    calcCalories: "カロリー",
    calcProtein: "タンパク質",
    calcCarbs: "炭水化物",
    calcFats: "健康的な脂肪",
    calcSmartMode: "スマートモード",
    calcBodyFat: "体脂肪",
    calcWater: "必要水分量",
    calcLiters: "リットル",
    calcRecalculate: "再計算",
    calcGenerateMealPlan: "AI食事プラン生成",
    calcGenerating: "生成中...",
    calcSelectGoal: { cut: "カッティング (脂肪燃焼)", maintain: "維持", bulk: "バルクアップ (筋肉増強)" },
    calcActivityLevels: {
        sedentary: "座りがち (運動なし)",
        light: "軽い (週1-3日)",
        moderate: "中程度 (週3-5日)",
        active: "活発 (週6-7日)",
        veryActive: "非常に活発 (1日2回トレーニング)"
    },
    labReference: {
        title: "スマート検査値リファレンス",
        subtitle: "自分の医療データを理解する。このガイドは、検査結果を読み、危険信号を特定するのに役立ちます。",
        searchPlaceholder: "テスト名を検索 (例: Test, ALT)...",
        noResults: "結果が見つかりません",
        analyzeBtn: "結果を分析",
        analyzeTitle: "結果を入力",
        enterValue: "値",
        resultLabel: "分類",
        status: { low: "低い", normal: "正常", high: "高い" },
        categories: { all: "すべて", hormones: "ホルモン", organs: "臓器機能", blood: "血液と免疫", vitamins: "ビタミン", minerals: "ミネラル", thyroid: "甲状腺" },
        labels: { whatIsIt: "それは何ですか？", normalRange: "正常範囲", elevationMeaning: "高いとどうなる？", lowMeaning: "低いとどうなる？", management: "対処法", cancel: "キャンセル", high: "高い", low: "低い" },
        tests: labTestsJa,
    }
};
