
import { SalesNotificationData } from './types';

// Expanded Keyword Lists
const brandKeywords = "MrXSteroid, Mr.X-Steroid, Mr. X-Steroid, mrxsteroid, Mr X Steroid, MrX-Steroid, MR.X.STEROID, Mr.XSteroid, MisterXSteroid, Mister X Steroid, Mr. X, Mr. Steroid, MrSteroid, X-Steroid, XSteroid, George Mourice, جورج موريس, مستر اكس, مستر أكس, مستر اكس سترويد, مستر أكس سترويد, كابتن جورج";

const englishTerms = "steroid, steroids, Anabolic, Anabolic Steroid, Anabolic Steroids, Bodybuilding, Bodybuilder, Body Building, BodyBuilder, Body Builder, Muscle Building, Muscle Builder, build your body, build muscle, Harmon, Hormone, Hormones, Testosterone, Test, Testo, Anabolics, PED, PEDs, Performance Enhancing Drugs, Gear, Juice, Cycle, Cycles, Steroid Cycle, Bulking, Cutting, Bulk, Cut, Mass Gain, Mass Building, Muscle Mass, Lean Muscle, Gym, Fitness, Weight Training, Strength Training, Powerlifting, Power Lifting, Training, Workout, Exercise, Sports, Athletic, Athlete, Supplement, Supplements, Protein, Creatine, Pre-Workout, Post-Workout, Nutrition, Diet, Meal Plan, PCT, Post Cycle Therapy, Stack, Stacking, Primo, Deca, Tren, Dbol, Dianabol, Equipoise, EQ, Winstrol, Anadrol, Anavar, Clenbuterol, Clen, HGH, Growth Hormone";

const arabicTerms = "سترويد, استرويد, ستيرويد, كمال الاجسام, كمال أجسام, بناء العضلات, بناء الأجسام, لاعب كمال اجسام, هرمونات, هرمون, تستوستيرون, أنابوليك, منشطات, دورة هرمونية, ضخامة, تنشيف, قوة, جيم, لياقة, تمارين, جدول تمارين, تغذية, مكملات";

const hebrewTerms = "פיתוח גוף, סטרואידים, הורמונים, בניית שריר, חיטוב, מסה, קרוספיט, כושר, בריאות, תזונה, סייקל, חלבון, קריאטין, אימון, תוספי תזונה, טסטוסטרון, אנבולי, שיפור ביצועים, מר איקס, ג'ורג' מוריס";

export const seoKeywordsArabic = `${brandKeywords}, ${arabicTerms}, ${englishTerms}`;
export const seoKeywordsEnglish = `${brandKeywords}, ${englishTerms}, ${arabicTerms}`;
export const seoKeywordsHebrew = `${brandKeywords}, ${hebrewTerms}, ${englishTerms}`;

export const footerKeywordsPoolAr = [
  // Brand
  "MrXSteroid", "Mr.X-Steroid", "Mr. X-Steroid", "mrxsteroid", "Mr X Steroid", "MrX-Steroid", "MR.X.STEROID", "Mr.XSteroid", "MisterXSteroid", "Mister X Steroid", "Mr. X", "Mr. Steroid", "MrSteroid", "X-Steroid", "XSteroid",
  // Arabic Core
  "كمال أجسام", "هرمونات", "كورس تضخيم", "كورس تنشيف", "تيستوستيرون", "ديكا دورابولين", "ترينبولون", "أنافار",
  "بريموبولان", "كلينبوتيرول", "هرمون النمو", "إنسولين", "ببتيدات", "سارم", "مكملات غذائية", "واي بروتين",
  "كرياتين", "أمينو أسيد", "بي سي ايه ايه", "جلوتامين", "حوارق دهون", "دايت", "تغذية", "سعرات حرارية",
  "ماكروز", "تمارين صدر", "تمارين ظهر", "تمارين رجل", "تمارين كتف", "تمارين ذراع", "جورج موريس", "كتاب مستر إكس",
  "شرح الهرمونات", "أضرار الهرمونات", "حماية الكبد", "نولفاديكס", "כלומד", "برجنيل", "تحاليل هرمونات", "تثدي",
  "صلע וراثי", "علاج التثدي", "تنظيف بعد الكورس", "حماية الخصية", "زيادة القوة", "تحمل عضلي", "لياقة بدنية",
  "تنشيف عضلات", "برنامج غذائي", "جدول تدريبي", "تضخيم عضل صافي", "ضخامة عضلية", "تمرين منזلي", "جيم", "فتنس",
  "مدרب شخصي", "أونلاين كوتشينج", "تجهيز بطولات", "مسرح كمال أجسام", "أولمبياد", "مסטר أولمبيا", "كابتن جورج",
  "تخسيس", "نحت الجسم", "شد الترهلات", "عضلات البطن", "سكس باك", "كارديו", "هيت", "مقاومة الأنسولين", "حساسية الأنسولين",
  "تغذية علاجية", "إصابات ملاعب", "استشفاء عضلي", "نوم", "راحة", "مياه", "فيتامينات", "معادن", "أوميجا 3",
  "زما", "تريبولوس", "מחפזת تيست", "صحة جنسية", "רغبة جنسية", "אنتصاب", "حيوانات منوية", "خصوبة", "عقم",
  "تجارב هرمونات", "قصص نجاح", "تحفيز", "موتيفيشن", "عضلات", "قوة", "سرعة", "مرونة", "توازن",
  // Additional Arabic Variations
  "مסטר اكس", "مסטר أكس", "مסטר اكس سترოيد", "مסטר أكس سترოيد", "سترოيد", "אستרוيد", "סטيرويد", "كمال الاجسام", "بناء الأجسام", "لاعب كمال اجسام", "هرمون", "أنابوليك", "منشطات", "دورة هرمونية", "ضخامة", "تنشيف", "قوة", "جيم", "لياقة", "تمارين"
];

export const footerKeywordsPoolHe = [
  // Brand
  "MrXSteroid", "Mr.X-Steroid", "Mr. X-Steroid", "mrxsteroid", "Mr X Steroid", "MrX-Steroid", "MR.X.STEROID", "Mr.XSteroid", "MisterXSteroid", "Mister X Steroid", "Mr. X", "Mr. Steroid", "MrSteroid", "X-Steroid", "XSteroid",
  // Hebrew Core
  "פיתוח גוף", "סטרואידים", "סייקל מסה", "סייקל חיטוב", "טסטוסטרון", "דקה דוראבולין", "טרנבולון", "אנאבר",
  "פרימובולן", "קלנבוטרול", "הורמון גדילה", "אינסולין", "פפטידים", "סארמס", "תוספי תזונה", "חלבון מי גבינה",
  "קריאטין", "חומצות אמינו", "BCAA", "גלוטמין", "שורפי שומן", "דיאטה", "תזונה", "קלוריות",
  "מאקרו", "אימון חזה", "אימון גב", "אימון רגליים", "אימון כתפיים", "אימון ידיים", "ג'ורג' מוריס", "הספר של מר איקס",
  "מדריך סטרואידים", "תופעות לוואי", "הגנה על הכבד", "נולבדקס", "כלומייד", "פרגניל", "בדיקות דם", "גינקומסטיה",
  "נשירת שיער", "ניתוח ג'ינו", "PCT", "תמיכה באשכים", "עלייה בכוח", "סיבולת", "כושר",
  "חיטוב שריר", "תפריט תזונה", "תוכנית אימונים", "מסה נקייה", "עלייה במסה", "אימון ביתי", "חדר כושר", "פיטנס",
  "מאמן אישי", "ליווי אונליין", "הכנה לתחרויות", "במה של פיתוח גוף", "אולימפיה", "מר אולימפיה", "קואץ' ג'ורג'",
  "ירידה במשקל", "חיטוב הגוף", "מיצוק העור", "קוביות", "סיקס פאק", "אירובי", "HIIT", "תנגודת אינסולין", "רגישות לאינסולין",
  "תזונה קלינית", "פציעות ספורט", "התאוששות", "שינה", "מנוחה", "מים", "ויטמינים", "מינרלים", "אומגה 3",
  "ZMA", "טריבולוס", "מאיצי טסט", "בריאות מינית", "ליבידו", "זיקפה", "ספירת זרע", "פוריות", "אי פריון",
  "ניסיון בסטרואידים", "סיפורי הצלחה", "מוטיבציה", "מוטיבציה לחדר כושר", "שרירים", "כוח", "מהירות", "גמישות", "שיווי משקל",
  // Variations
  "מר איקס", "סטרואידים אנבוליים", "שיפור ביצועים", "תוספי ספורט", "פרוטוקול הגנה", "בניית שרירים"
];

export const footerKeywordsPoolEn = [
  // Brand
  "MrXSteroid", "Mr.X-Steroid", "Mr. X-Steroid", "mrxsteroid", "Mr X Steroid", "MrX-Steroid", "MR.X.STEROID", "Mr.XSteroid", "MisterXSteroid", "Mister X Steroid", "Mr. X", "Mr. Steroid", "MrSteroid", "X-Steroid", "XSteroid",
  // English Core
  "Bodybuilding", "Steroids", "Bulking Cycle", "Cutting Cycle", "Testosterone", "Deca Durabolin", "Trenbolone", "Anavar",
  "Primobolan", "Clenbuterol", "HGH", "Insulin", "Peptides", "SARMs", "Supplements", "Whey Protein",
  "Creatine", "Amino Acids", "BCAA", "Glutamine", "Fat Burners", "Diet", "Nutrition", "Calories",
  "Macros", "Chest Workout", "Back Workout", "Leg Workout", "Shoulder Workout", "Arm Workout", "George Mourice", "Mr. X Book",
  "Steroid Guide", "Side Effects", "Liver Support", "Nolvadex", "Clomid", "Pregnyl", "Bloodwork", "Gynecomastia",
  "Hair Loss", "Gyno Surgery", "PCT", "Testicle Support", "Strength Gain", "Endurance", "Fitness",
  "Muscle Cutting", "Meal Plan", "Training Split", "Lean Bulk", "Mass Gain", "Home Workout", "Gym", "Fit",
  "Personal Trainer", "Online Coaching", "Contest Prep", "Bodybuilding Stage", "Olympia", "Mr Olympia", "Coach George",
  "Weight Loss", "Body Sculpting", "Skin Tightening", "Abs", "Six Pack", "Cardio", "HIIT", "Insulin Resistance", "Insulin Sensitivity",
  "Clinical Nutrition", "Sports Injuries", "Recovery", "Sleep", "Rest", "Water", "Vitamins", "Minerals", "Omega 3",
  "ZMA", "Tribulus", "Test Boosters", "Sexual Health", "Libido", "Erection", "Sperm Count", "Fertility", "Infertility",
  "Steroid Experience", "Success Stories", "Motivation", "Gym Motivation", "Muscles", "Power", "Speed", "Flexibility", "Balance",
  // Additional English Variations
  "Anabolic", "Anabolic Steroid", "Anabolic Steroids", "Bodybuilder", "Body Building", "BodyBuilder", "Body Builder", "Muscle Building", "Muscle Builder", "build your body", "build muscle", "Harmon", "Hormone", "Hormones", "Test", "Testo", "Anabolics", "PED", "PEDs", "Performance Enhancing Drugs", "Gear", "Juice", "Cycle", "Cycles", "Steroid Cycle", "Bulking", "Cutting", "Bulk", "Cut", "Mass Gain", "Mass Building", "Muscle Mass", "Lean Muscle", "Weight Training", "Strength Training", "Powerlifting", "Power Lifting", "Training", "Workout", "Exercise", "Sports", "Athletic", "Athlete", "Supplement", "Pre-Workout", "Post-Workout", "Meal Plan", "Post Cycle Therapy", "Stack", "Stacking", "Primo", "Deca", "Tren", "Dbol", "Dianabol", "Equipoise", "EQ", "Winstrol", "Anadrol", "Clen", "Growth Hormone"
];

export const salesDataAr: SalesNotificationData[] = [
  { name: "أحمد م.", location: "القاهرة، مصر" },
  { name: "سارة ع.", location: "جدة، السعودية" },
  { name: "خالد س.", location: "دبي، الإمارات" },
  { name: "عمر ف.", location: "الرياض، السعودية" },
  { name: "يوسف ك.", location: "عمان، الأردن" },
  { name: "محمود ن.", location: "الكويت" },
  { name: "كريم ط.", location: "الدوحة، قطر" },
  { name: "فادي ج.", location: "المنامة، البحرين" }
];

export const salesDataHe: SalesNotificationData[] = [
  { name: "אבי כ.", location: "תל אביב, ישראל" },
  { name: "יניב ל.", location: "חיפה, ישראל" },
  { name: "דניאל ס.", location: "ירושלים, ישראל" },
  { name: "מיכל א.", location: "ראשון לציון, ישראל" },
  { name: "עומר ב.", location: "באר שבע, ישראל" },
  { name: "רועי פ.", location: "נתניה, ישראל" },
  { name: "איתי מ.", location: "אשדות, ישראל" },
  { name: "גיא ר.", location: "חולון, ישראל" }
];

export const salesDataEn: SalesNotificationData[] = [
  { name: "Ahmed M.", location: "Cairo, Egypt" },
  { name: "Sarah A.", location: "Jeddah, KSA" },
  { name: "Khaled S.", location: "Dubai, UAE" },
  { name: "Omar F.", location: "Riyadh, KSA" },
  { name: "Youssef K.", location: "Amman, Jordan" },
  { name: "Mahmoud N.", location: "Kuwait City" },
  { name: "Karim T.", location: "Doha, Qatar" },
  { name: "Fadi G.", location: "Manama, Bahrain" }
];

export const fullArabicDisclaimer = `إخلاء المسؤولية

يقدم لكم السيد جورج موريس (George Mourice) أكبر قدر ممكن من البيانات حول الستيرويدات الابتنائية (Anabolic Androgenic Steroids - AAS)، هرمون النمو البشري (HGH)، الببتيدات، وغيرها من المواد ذات الصلة. الستيرويدات الابتنائية هي عقاقير بنائية (لبناء العضلات) معروفة على نطاق واسع، وهي غير قانونية في جميع الدول بدون وصفة طبية. يمكن أن تكون الستيرويدات الابتنائية خطيرة على صحتكم وقد تؤدي إلى أنواع مختلفة من الآثار الجانبية الجسيمة. لدينا قسم مفصل بشكل استثنائي حول الآثار الجانبية للستيرويدات الابتنائية ويجب قراءته مرة واحدة على الأقل. يجب استخدام الستيرويدات الابتنائية فقط تحت إشراف طبيب مختص. لدينا العديد من الملفات التعريفية عن الستيرويدات الابتنائية في قسم "ملف الستيرويد" في كتابنا. في حال لم تتمكن من العثور على الإجابات التي تبحث عنها حول ستيرويد معين، يرجى الاطلاع على منتديات النقاش المفتوح الخاص بالاسترويد. يوجد العديد من الأفراد عبر الإنترنت للإجابة على استفساراتكم. نرجو منكم عدم توجيه الأسئلة المتعلقة بالستيرويدات الابتنائية إلينا مباشرة، حيث لا يمكننا ولن نجيب على هذه الأسئلة. تختلف قوانين الستيرويد في جميع أنحاء العالم، ومع ذلك، تعتبر الستيرويدات الابتنائية غير قانونية بدون وصفة طبية. نرجو منكم عدم الطلب منا بيع أو إرسال الستيرويدات الابتنائية إليكم. في حال وجدتم أخطاء في كتابنا، يرجى التواصل معنا لإبلاغنا. إذا كنتم بحاجة إلى مساعدة طبية بسبب استخدام الستيرويدات الابتنائية، يرجى استشارة طبيبكم على الفور.

هذا الكتاب بعنوان "Mr. X-Steroid: The Ultimate Steroid Guide" مقدم بالكامل من قبل السيد/ جورج موريس (George Mourice). تعبر هذه الصفحة عن الشروط التي يمكنك بموجبها استخدام الكتاب. يرجى قراءة هذه الصفحة بعناية. إذا كنت لا توافق على الشروط المذكورة هنا، فلا يجوز لك استخدام الكتاب. قد تتم مراجعة هذه الشروط في أي وقت عن طريق تحديث هذا المنشور. يجب عليك زيارة هذه الصفحة من الكتاب من وقت لآخر لمراجعة الشروط، لأنها ملزمة لك. باستخدامك لهذا الكتاب، فإنك توافق على جميع الشروط والأحكام الواردة أدناه.

القسم الأول: الغرض من الكتاب وإخلاء مسؤولية المؤلف عن المخاطر والمحتوى التعليمي
بموجب هذا، أنت تقر بأن عمرك لا يقل عن ثمانية عشر (18) عاماً، أو سن الرشد القانوني الكامل في ولايتك القضائية أيهما أعلى، وأنك تتمتع بالأهلية القانونية الكاملة والكفاءة العقلية لفهم هذا الإخلاء وشروطه والموافقة عليها بشكل ملزم. استخدام هذا الكتاب مخصص للبالغين فقط. يقدم هذا الكتاب للعملاء معلومات من أنواع وأنماط مختلفة فيما يتعلق بالستيرويدات الابتنائية (AAS)، بما في ذلك على سبيل المثال لا الحصر: النصوص، الجداول، المخططات، البروتوكولات، الجرعات المذكورة، أوقات الكشف (Detection Times)، طرق الحقن، والصور التوضيحية، مُقدَّم لأغراض معلوماتية وتثقيفية وتاريخية وبحثية أكاديمية بحتة. هذا الكتاب لا يوصي باستخدام أي شخص للستيرويدات، بل هو كتاب يقدم معلومات فقط. إن استخدام الستيرويدات بدون وصفة طبية من متخصص يعد انتهاكاً للوائح الحكومية. علاوة على ذلك، فإن استخدام الستيرويدات أو أي دواء بدون وصفة طبية وإرشادات من متخصص يمكن أن يكون له آثار جانبية شديدة على صحتكم قد تصل إلى الوفاة. المؤلف لم يقم بإنشاء أي من هذه البيانات في هذا الكتاب. يتم تقديمها هنا من مصادر متنوعة، والمؤلف أو الناشر لا يشهد أو يضمن بأي حال من الأحوال دقة أي من المعلومات الواردة في الكتاب. قد تحتوي المواد والمعلومات الواردة في الكتاب على أخطاء واقعية و/أو أخطاء مطبعية. لا يقدم المؤلف أي تعهدات بشأن دقة المواد أو موثوقيتها أو اكتمالها أو حداثتها. إن استخدام الكتاب وما يتبعه من استخدام لأي بيانات تظهر فيه يتم على مسؤوليتك الشخصية والكاملة على الرغم من الخطر الواضح. بقبول هذه الشروط وإقرارك أدناه، فإنك كعميل تقر صراحةً بأنه قد تم إعلامك وتوافق على أنك لن تعتبر المؤلف مسؤولاً بأي شكل من الأشكال، ولن يقوم أي شخص نيابة عنك باعتبار المؤلف مسؤولاً عن أي استخدام للبيانات أو المواد الواردة في هذا الكتاب. يتم إجراء تغييرات بشكل دوري على الكتاب وقد يتم إجراؤها في أي وقت. لا يضمن المؤلف أو الناشر أن الكتاب سيعمل خالياً من الأخطاء أو أن هذا الكتاب وخادمه (السيرفر) خاليان من فيروسات الكمبيوتر أو غيرها من البرامج الضارة. إذا كان استخدامك للكتاب أو المواد يؤدي إلى الحاجة إلى صيانة أو استبدال المعدات أو البيانات، فالمؤلف ليس مسؤولاً عن تلك التكاليف. يتم تقديم الكتاب والمادة على أساس "كما هي" (AS IS) دون أي ضمانات من أي نوع. يتنصل المؤلف وموردوه، إلى أقصى حد يسمح به القانون، من جميع الضمانات، بما في ذلك ضمان القابلية للتسويق (Merchantability)، وعدم التعدي على حقوق الغير (Non-Infringement)، وضمان الملاءمة لغرض معين (Fitness for a Particular Purpose). لا يقدم المؤلف وموردوه أي ضمانات بشأن دقة أو موثوقية أو اكتمال أو حداثة المواد والخدمات ونصوص البرامج والتصاميم والروابط. المحتوى المقدم لا يشكل بأي حال من الأحوال، ولا يجب اعتباره: استشارة طبية أو علاجية أو تشخيصية؛ نصيحة قانونية أو تنظيمية؛ إرشادات فردية لتعزيز الأداء الرياضي أو الجسدي؛ توصية بشراء أو استخدام أو توزيع أي مواد خاضعة للرقابة. المؤلف والناشر (جورج موريس George Mourice) لا يقدم أية ضمانات صريحة أو ضمنية بخصوص دقة أو اكتمال أو موثوقية أو ملاءمة المعلومات الواردة، ويُخلي مسؤوليته بالكامل عن أي أخطاء أو سهو في هذا المحتوى.

القسم الثاني: إخلاء المسؤولية الطبي والصحي.
المعلومات الواردة في هذا الكتاب، ليس مشورة طبية (NOT MEDICAL ADVICE) بما في ذلك أي مناقشات حول الهرمونات الابتنائية الأندروجينية (Anabolic Androgenic Steroids - AAS)، هرمون النمو البشري (HGH)، الببتيدات، أو أي مواد أخرى لتعزيز الأداء، لا تحل محل أو تغني عن استشارة طبيب متخصص أو مقدم رعاية صحية مرخص. يجب على القارئ دائماً وبدون استثناء استشارة طبيب مؤهل قبل: البدء في أي نظام علاجي أو دوائي أو هرموني؛ تغيير النظام الغذائي أو البرنامج التدريبي؛ استخدام أي دواء أو مكمل غذائي أو هرمون أو مادة كيميائية. مخاطر صحية جسيمة وقاتلة (SERIOUS AND POTENTIALLY FATAL HEALTH RISKS). يُقر القارئ ويفهم تماماً أن استخدام المنشطات الابتنائية والهرمونات والمواد المذكورة في هذا الكتاب لأغراض غير علاجية (مثل تعزيز الأداء الرياضي أو بناء العضلات) وبجرعات تتجاوز المستويات الفسيولوجية الطبيعية (Supraphysiological Doses) يحمل مخاطر صحية خطيرة جداً ومحتملة، بما في ذلك على سبيل المثال لا الحصر: تلف حاد ومزمن للكبد والكلى؛ أمراض القلب والأوعية الدموية الخطيرة (جلطات دموية، سكتات دماغية، نوبات قلبية، تضخم القلب، ارتفاع ضغط الدم الخبيث)؛ اضطرابات هرمونية دائمة (قصور الغدد التناسلية، ضمور الخصيتين، العقم الدائم، التثدي)؛ اضطرابات نفسية وعصبية خطيرة (عدوانية شديدة، اكتئاب حاد، قلق، ذهان، ميول انتحارية)؛ أضرار دائمة ولا رجعة فيها للجهاز التناسلي والعصبي والغدد الصماء؛ السرطان (خاصة سرطان الكبد والبروستاتا)؛ الوفاة المفاجئة. المؤلف والناشر (جورج موريس George Mourice) يُخلي مسؤوليته بالكامل وبشكل مطلق عن أي عواقب صحية، سواء كانت مؤقتة أو دائمة أو مميتة، تنتج بشكل مباشر أو غير مباشر عن قراءة أو تطبيق أو إساءة تطبيق المعلومات الواردة في هذا الكتاب. نفي مطلق لضمان النتائج (ABSOLUTE NO GUARANTEE OF RESULTS). المؤلف والناشر (جورج موريس George Mourice) لا يضمن بأي شكل من الأشكال أي نتائج محددة من تطبيق أي بروتوكولات أو جداول زمنية (Cycles) أو جرعات أو تمارين أو أنظمة غذائية أو مكملات مذكورة في هذا الكتاب. الاستجابة الجسدية للهرمونات والمواد المذكورة تختلف بشكل جذري وكبير من فرد لآخر وتعتمد على عوامل وراثية فردية، وبيئية، ونمط حياة، وحالة صحية أولية، وتفاعلات دوائية، وعوامل أخرى لا يمكن التنبؤ بها. الإشراف الطبي الإلزامي (MANDATORY MEDICAL SUPERVISION). يجب على أي شخص يفكر في استخدام أي من المواد المذكورة إجراء فحوصات طبية شاملة ومتخصصة (تحاليل دم كاملة، تقييم القلب والأوعية الدموية، فحص وظائف الكبد والكلى، تقييم هرموني كامل، فحوصات تصويرية) قبل وأثناء وبعد الاستخدام، وذلك تحت إشراف طبي مباشر ومستمر من طبيب متخصص. لتواكب التطورات العلمية، يُنصح بالرجوع إلى أحدث الدراسات الطبية حول مخاطر AAS، مثل تلك المنشورة في مجلات مثل The New England Journal of Medicine أو التحديثات من منظمة الصحة العالمية (WHO) بشأن آثار الهرمونات على الصحة طويلة الأمد.

القسم الثالث: إخلاء المسؤولية القانوني والتنظيمي
المنشطات الابتنائية مواد خاضعة للرقابة الصارمة. يُقر القارئ ويفهم بشكل كامل أن المنشطات الابتنائية (Anabolic Steroids) والعديد من المواد الأخرى المذكورة في هذا الكتاب هي مواد خاضعة للرقابة (Controlled Substances) من الدرجة الثالثة (Schedule III) بموجب القانون الفيدرالي الأمريكي (Anabolic Steroid Control Act of 1990 and 2004)، وكذلك بموجب قوانين مشابهة في معظم دول العالم، بما في ذلك اتفاقيات الأمم المتحدة لمكافحة المخدرات (UN Conventions on Narcotic Drugs) وتحديثاتها حتى عام 2025 التي تشدد على الرقابة الدولية على التوزيع عبر الإنترنت. حيازة، أو استخدام، أو شراء، أو بيع، أو توزيع، أو استيراد، أو تصدير هذه المواد بدون وصفة طبية صالحة من طبيب مرخص لمؤشر طبي معتمد رسمياً من قبل إدارة الغذاء والدواء (FDA) أو الجهات التنظيمية المعادلة يُعتبر جريمة جنائية فيدرالية خطيرة قد تؤدي إلى السجن والغرامات الكبيرة. مسؤولية الامتثال القانوني الكاملة على القارئ. يتحمل القارئ المسؤولية الكاملة والمطلقة والوحيدة عن التحقق والامتثال الصارم لجميع القوانين واللوائح والتشريعات المحلية والوطنية والدولية السارية في ولايته القضائية (دولته، إقليمه، ولايته، مدينته) فيما يتعلق بـ: حيازة المواد المذكورة؛ استخدامها الشخصي؛ استيرادها أو تصديرها عبر الحدود؛ شرائها أو بيعها؛ توزيعها أو نقلها. لا تشجيع أو دعم مطلقاً لأي استخدام غير قانوني. المؤلف والناشر (جورج موريس George Mourice) لا يشجع، ولا يدعو، ولا يدعم، ولا يسهل، ولا يوصي بأي شكل من الأشكال بالاستخدام غير القانوني أو إساءة استخدام أي مادة مذكورة في هذا الكتاب. جميع المعلومات الواردة حول "الكورسات" (Cycles)، أو "الجرعات"، أو "أوقات الكشف" (Detection Times)، أو "طرق الحقن"، أو "استراتيجيات تجنب الاختبارات"، أو "التكديس أى التخزين" (Stacking) هي مقدمة حصرياً لأغراض تعليمية وتاريخية وبحثية أكاديمية بحتة حول ما هو موجود ومتداول في الأدبيات العلمية والطبية والممارسات المعروفة (سواء كانت قانونية أو غير قانونية)، ولا تمثل بأي حال دعوة أو إرشاداً عملياً أو تشجيعاً على تطبيقها. القوانين الرياضية والمنافسات الدولية. يُقر القارئ بشكل صريح أن استخدام المنشطات الابتنائية والمواد المذكورة محظور تماماً من قبل جميع المنظمات الرياضية الدولية والوطنية والمحلية تقريباً، بما في ذلك على سبيل المثال لا الحصر: الوكالة العالمية لمكافحة المنشطات (WADA - World Anti-Doping Agency) وتحديثاتها لعام 2025 التي تشمل مواد جديدة مثل بعض الببتيدات الاصطناعية؛ اللجنة الأولمبية الدولية (IOC)؛ جميع الاتحادات الرياضية المحترفة (NFL, NBA, MLB, NHL, UFC, FIFA، إلخ)؛ الاتحادات الرياضية الجامعية (NCAA، إلخ). استخدام هذه المواد في سياق المنافسات الرياضية يُعتبر غشاً وخداعاً وانتهاكاً صارخاً للقواعد الأخلاقية وقد يؤدي إلى عقوبات صارمة جداً (إيقاف مدى الحياة، غرامات مالية ضخمة، سحب الألقاب والميداليات والجوائز، تدمير السمعة المهنية).

القسم الرابع: استخدام المادة ومشاركات المستخدمين ورسائل المراسلات
يخولك المؤلف بمشاهدة وتنزيل نسخة واحدة من المادة الموجودة في هذا الكتاب حصرياً لاستخدامك الشخصي وغير التجاري. قد تنطبق معايير خاصة على استخدام برامج معينة وعناصر أخرى متوفرة في الكتاب. يتم تسجيل أي من هذه الإرشادات الخاصة في هذا الكتاب ويتم دمجها في هذه الاتفاقية بالرجوع إليها. إن محتويات هذا الكتاب، مثل النصوص والتصاميم والصور وغيرها من المواد، محمية بموجب قوانين حقوق النشر (Copyright Laws). قد يؤدي الاستخدام غير المصرح به للمادة إلى انتهاك حقوق النشر والعلامات التجارية (Trademarks) واللوائح الأخرى. يجب عليك الاحتفاظ بجميع إشعارات حقوق النشر والإشعارات الخاصة الأخرى الواردة في المادة الأصلية على أي نسخة تقوم بإنشائها من المادة. لا يجوز لك بيع أو تعديل المادة أو تقليدها أو عرضها علناً أو توزيعها أو استخدامها بأي شكل من الأشكال لأي غرض عام أو تجاري. يُحظر استخدام المادة في أي كتاب آخر أو في بيئة حاسوبية متصلة بشبكة لأي غرض. إذا انتهكت أياً من هذه الشروط، فإن إذنك باستخدام المادة ينتهي تلقائياً ويجب عليك التخلص فوراً من أي نسخ قمت بإنشائها من المادة. بشكل عام، تعتبر أي مراسلات تنشرها في الكتاب غير سرية. إذا سمحت صفحات معينة في الكتاب بتقديم مراسلات سيعاملها المؤلف على أنها سرية، فسيتم ذكر هذه الحقيقة في "إشعارات قانونية" على تلك الصفحات. من خلال تقديم المراسلات إلى الكتاب، فإنك تمنح المؤلف تلقائياً ترخيصاً غير حصري، دائم، غير قابل للإلغاء، وخالي من حقوق الملكية (Royalty-Free) لاستخدام، إعادة إنتاج، تعديل، نشر، تحرير، ترجمة، توزيع، أداء، وعرض المراسلات بمفردها أو كجزء من أعمال أخرى بأي شكل أو وسائط أو تقنية معروفة حالياً أو سيتم تطويرها فيما بعد، وترخيص هذه الحقوق من خلال مستويات متعددة من المرخص لهم من الباطن. كمستخدم، أنت مسؤول عن مراسلاتك الخاصة وعن عواقب نشرها. يجب عليك عدم القيام بالأمور التالية: نشر مواد محمية بحقوق الطبع والنشر، ما لم تكن مالك حقوق الطبع والنشر أو لديك إذن من مالك حقوق الطبع والنشر لنشرها؛ نشر مواد تكشف عن أسرار تجارية، ما لم تكن تمتلكها أو لديك إذن من المالك؛ نشر مواد تنتهك أي حقوق ملكية فكرية أخرى (Intellectual Property Rights) للآخرين أو حقوق الخصوصية أو الدعاية للآخرين؛ نشر مواد بذيئة أو تشهيرية أو تهديدية أو مزعجة أو مسيئة أو بغيضة أو محرجة لمستخدم آخر أو أي شخص أو كيان آخر؛ نشر صورة إباحية صريحة؛ نشر إعلانات أو طلبات تجارية؛ نشر رسائل غير مرغوب فيها أو مخططات هرمية؛ أو انتحال شخصية شخص آخر. لا يتناول المؤلف أو يضمن نزاهة أو دقة أو موثوقية أي من المراسلات التي ينشرها مستخدمون آخرون أو يؤيد أي آراء يعبر عنها المستخدمون. أنت تقر بأن أي اعتماد على المواد التي ينشرها مستخدمون آخرون سيكون على مسؤوليتك الخاصة. لا يقوم المؤلف بفحص المراسلات مسبقاً وليس مسؤولاً عن فحص أو مراقبة المواد التي ينشرها المستخدمون. إذا أُبلغ من قبل مستخدم عن مراسلات يُزعم أنها لا تتوافق مع هذه الاتفاقية، فقد يحقق المؤلف في الادعاء ويقرر بحسن نية وبمحض إرادته ما إذا كان سيزيل أو يطلب إزالة المراسلات. لا يتحمل المؤلف أي مسؤولية أو التزام تجاه المستخدمين عن أداء أو عدم أداء مثل هذه الأنشطة. يحتفظ المؤلف بالحق في طرد المستخدمين ومنع وصولهم الإضافي إلى الكتاب لانتهاكهم هذه الاتفاقية أو القانون، والحق في إزالة المراسلات التي تكون مسيئة أو غير قانونية أو مزعجة.

القسم الخامس: روابط لمواقع أخرى وتراخيص البرامج وتحديد المسؤولية
يحتوي الكتاب على روابط لمواقع طرف ثالث. يتم توفير هذه الروابط فقط لراحتك وليس كتأييد من المؤلف لمحتويات هذه المواقع. المؤلف ليس مسؤولاً عن محتوى مواقع الطرف الثالث المرتبطة ولا يقدم أي تعهدات بشأن محتوى أو دقة المواد على هذه المواقع. إذا قررت الوصول إلى مواقع الطرف الثالث المرتبطة، فإنك تفعل ذلك على مسؤوليتك الخاصة. جميع البرامج المتاحة للتنزيل من الكتاب محمية بحقوق الطبع والنشر وقد تكون محمية بحقوق أخرى. يخضع استخدام هذه البرامج لشروط اتفاقية ترخيص البرنامج أو المعينة المصاحبة لهذه البرامج. يخضع تنزيل واستخدام هذه البرامج لموافقتك على الالتزام ببنود اتفاقية الترخيص. ما لم ينص صراحة على خلاف ذلك في ترخيص منتج أو إشعار قانوني، فإن المسؤولية الإجمالية للمؤلف تجاهك عن جميع المطالبات الناشئة عن استخدام المواد (بما في ذلك البرامج) تقتصر على 100 دولار أمريكي. لن يكون المؤلف أو موردوه أو أي أطراف ثالثة مذكورة في هذا الكتاب مسؤولين بأي حال من الأحوال عن أي أضرار على الإطلاق (بما في ذلك، على سبيل المثال لا الحصر، الأضرار العرضية والتبعية، فوات الأرباح، أو الأضرار الناتجة عن فقدان البيانات أو توقف العمل) الناتجة عن استخدام أو عدم القدرة على استخدام الكتاب والمادة، سواء كان ذلك بناءً على ضمان أو عقد أو ضرر أو أي نظرية قانونية أخرى، وسواء تم إبلاغ المؤلف بإمكانية حدوث مثل هذه الأضرار أم لا.

القسم السادس: إقرار القارئ وتحمل المسؤولية الكاملة والتعويض
بمجرد شراء أو تحميل أو قراءة أو استخدام أو الاطلاع على هذا الكتاب بأي شكل من الأشكال، فإن القارئ يقر صراحةً وبشكل لا رجعة فيه بما يلي: المسؤولية الكاملة والمطلقة (FULL AND ABSOLUTE RESPONSIBILITY) يتحمل القارئ المسؤولية الكاملة والمطلقة والوحيدة عن: أي قرارات أو أفعال أو إجراءات يتخذها بناءً على المعلومات الواردة في هذا الكتاب؛ أي أضرار، أو إصابات جسدية، أو أمراض، أو عواقب سلبية (صحية، نفسية، قانونية، مالية، اجتماعية، مهنية، أو غير ذلك) قد تنجم بشكل مباشر أو غير مباشر عن قراءة أو تطبيق أو إساءة تطبيق أو سوء فهم المحتوى. شرط التعويض الكامل وإبراء الذمة المطلق (FULL INDEMNIFICATION AND ABSOLUTE HOLD HARMLESS) يوافق القارئ بشكل نهائي ولا رجعة فيه وملزم قانونياً على: الدفاع الكامل عن المؤلف والناشر (جورج موريس George Mourice)؛ تعويضهما بالكامل عن أي خسائر أو تكاليف؛ إبراء ذمتهما وإعفاءهما التام من أي مسؤولية قانونية أو أخلاقية (Hold Harmless) من وضد أي وجميع: المطالبات القانونية (Claims)؛ الدعاوى القضائية المدنية أو الجنائية (Lawsuits)؛ الخسائر المالية (Losses)؛ الأضرار الجسدية أو المعنوية (Damages)؛ النفقات والتكاليف (بما في ذلك أتعاب المحاماة والتمثيل القانوني)؛ الالتزامات من أي نوع (Liabilities) الناشئة عن أو المتعلقة بأي شكل من الأشكال بـ: استخدام القارئ أو تطبيقه أو إساءة تطبيقه للمحتوى؛ انتهاك القارئ لأي قوانين أو لوائح محلية أو وطنية أو دولية؛ إهمال القارئ أو تقصيره أو سوء تقديره؛ أي أفعال أو قرارات متهورة أو غير مسؤولة من القارئ. أنت توافق على الدفاع عن المؤلف ومسؤوليه ومديريه وموظفيه ووكلائه وتعويضهم وحمايتهم من أي وجميع المطالبات أو الإجراءات أو الطلبات، بما في ذلك على سبيل المثال لا الحصر الرسوم القانونية والمحاسبية المعقولة، التي تقدمها أنت أو أي شخص نيابة عنك أو أي فرد أو كيان آخر، مدعياً ضرراً أو أذى من أي نوع، سواء للممتلكات أو للأفراد، ناتجاً عن استخدامك أو الاستخدام المزعوم للمادة أو البيانات الموجودة في الكتاب (بما في ذلك البرامج) أو خرقك لشروط هذه الاتفاقية. سيقوم المؤلف بإشعارك على الفور. تحمل المخاطر الطوعي والواعي (VOLUNTARY AND INFORMED ASSUMPTION OF RISK). يُقر القارئ بشكل واضح وصريح بأنه: تلقى تحذيرات واضحة وكافية ومفصلة حول المخاطر الصحية الجسيمة والمخاطر القانونية الخطيرة؛ يفهم تماماً وبشكل كامل هذه المخاطر وعواقبها المحتملة؛ يتحمل طوعياً وبإرادته الحرة الكاملة ووعيه التام جميع المخاطر المرتبطة باستخدام أو تطبيق المعلومات الواردة؛ يتنازل عن أي حق في مقاضاة أو مطالبة المؤلف والناشر بأي تعويض. السن القانوني والأهلية القانونية الكاملة (LEGAL AGE AND FULL LEGAL CAPACITY). يُقر القارئ ويضمن بأنه: بلغ السن القانوني (18 عاماً على الأقل، أو سن الرشد القانوني الكامل في ولايته القضائية، أيهما أعلى)؛ يتمتع بالأهلية القانونية الكاملة والكفاءة العقلية لفهم هذا الإخلاء وشروطه والموافقة عليها بشكل ملزم؛ لم يتم إكراهه أو خداعه أو التلاعب به للموافقة على هذا الإخلاء.

القسم السابع: تحديث المعلومات وعدم الالتزام بالتحديث
قد يحتوي هذا الكتاب على أخطاء طباعية أو فنية أو علمية أو معلوماتية. المعلومات الواردة قد تصبح قديمة أو غير دقيقة أو غير كاملة مع مرور الوقت بسبب التطورات السريعة في الأبحاث العلمية والطبية، أو تغييرات في القوانين واللوائح التنظيمية، أو ظهور معلومات جديدة أو أدلة علمية جديدة، مثل التحديثات الأخيرة في قوائم المواد المحظورة من WADA أو التغييرات في قوانين الاتحاد الأوروبي للأدوية (EU Medicines Law) التي تشدد على الرقابة الرقمية للمواد الخاضعة للرقابة. المؤلف والناشر (جورج موريس George Mourice) غير ملزم بأي شكل من الأشكال بتحديث المحتوى أو تصحيحه أو مراجعته ليواكب هذه التغييرات المستقبلية أو ليصحح أي أخطاء.

القسم الثامن: الفصل والإنفاذ والموافقة النهائية والملزمة
إذا تبين أن أي جزء أو بند أو شرط من هذا الإخلاء غير قابل للتنفيذ أو باطل أو غير صالح بموجب أي قانون سارٍ في أي ولاية قضائية، فإن: هذا الجزء يُعدَّل أو يُفسَّر بأضيق نطاق ممكن ليصبح قابلاً للتنفيذ بأقصى قدر يسمح به القانون؛ بقية الأحكام والشروط تظل سارية المفعول بالكامل وملزمة قانونياً. هذا الإخلاء يشكل جزءاً لا يتجزأ وأساسياً من الكتاب والاتفاق الملزم قانونياً بين القارئ والمؤلف والناشر. بقراءتك أو شرائك أو تحميلك أو استخدامك لهذا الكتاب بأي شكل من الأشكال، فإنك تؤكد وتضمن أنك: قرأت هذا الإخلاء بالكامل وبعناية؛ فهمت جميع الشروط والأحكام والمخاطر المذكورة؛ توافق عليها بشكل كامل ومطلق ودون أي تحفظ أو شرط؛ تلتزم بها بشكل ملزم قانونياً. إذا كنت لا توافق على أي جزء من هذا الإخلاء، فيجب عليك: التوقف فوراً عن قراءة أو استخدام الكتاب؛ حذف أي نسخة رقمية؛ إعادة أي نسخة مادية للحصول على استرداد كامل (إن أمكن).

تاريخ النشر: 2025
المؤلف والناشر: جورج موريس (George Mourice)
© 2025 George Mourice. All Rights Reserved.`;

export const fullEnglishDisclaimer = `Disclaimer
Mr. George Mourice provides you with the maximum possible amount of data on Anabolic Androgenic Steroids (AAS), Human Growth Hormone (HGH), peptides, and other related substances. Anabolic steroids are widely known anabolic (muscle-building) drugs and are illegal in all countries without a medical prescription. Anabolic steroids can be dangerous to your health and may lead to various types of serious side effects. We have an exceptionally detailed section on the side effects of anabolic steroids which must be read at least once. Anabolic steroids should only be used under the supervision of a qualified physician. We have many steroid profiles in the “Steroid Profile” section of our book. If you are unable to find the answers you are looking for regarding a particular steroid, please refer to the open discussion forums on steroids. There are many individuals online who can answer your inquiries. Please do not direct steroid-related questions to us personally, as we cannot and will not answer such questions. Steroid laws differ across the world; however, anabolic steroids are considered illegal without a prescription. Please do not ask us to sell or ship anabolic steroids to you. If you find any errors in our book, please contact us to let us know. If you require medical assistance due to the use of anabolic steroids, please consult your doctor immediately.
This book, entitled “Mr. X-Steroid: The Ultimate Steroid Guide”, is provided in its entirety by Mr. George Mourice. This page sets out the terms under which you may use the book. Please read this page carefully. If you do not agree with the terms set out herein, you are not permitted to use the book. These terms may be revised at any time by updating this notice. You should visit this page of the book from time to time to review the terms, as they are binding upon you. By using this book, you agree to all of the terms and conditions set out below.

Section One: Purpose of the Book and Author’s Disclaimer of Risk and Educational Content
By this, you acknowledge that you are at least eighteen (18) years of age, or of full legal age of majority in your jurisdiction, whichever is higher, and that you possess full legal capacity and mental competence to understand this disclaimer and its terms and to agree to them in a binding manner. Use of this book is intended for adults only. This book provides readers with various types and forms of information regarding Anabolic Androgenic Steroids (AAS), including but not limited to: texts, tables, charts, protocols, cited dosages, detection times, injection methods, and illustrative images, provided purely for informational, educational, historical, and academic research purposes. This book does not recommend that anyone use steroids; it is an informational resource only. The use of steroids without a prescription from a specialist constitutes a violation of governmental regulations. Furthermore, the use of steroids or any drug without a prescription and guidance from a specialist may have severe side effects on your health, up to and including death.
The author has not created any of the data in this book. It is presented here from various sources, and the author or publisher does not in any way certify or guarantee the accuracy of any of the information contained in the book. The materials and information contained in the book may contain factual and/or typographical errors. The author makes no representations as to the accuracy, reliability, completeness, or timeliness of the materials. Your use of the book and any subsequent use of any data contained therein is entirely and solely at your own risk, notwithstanding the obvious danger. By accepting these terms and your acknowledgment below, you as the reader expressly recognize and agree that you will not in any way hold the author liable, and that no one on your behalf shall hold the author liable, for any use of the data or materials contained in this book.
Changes are made periodically to the book and may be made at any time. The author or publisher does not warrant that the book will operate error‑free or that this book and its server are free of computer viruses or other harmful code. If your use of the book or the materials results in the need for servicing or replacement of equipment or data, the author is not responsible for those costs. The book and its materials are provided on an “as is” basis without any warranties of any kind. To the fullest extent permitted by law, the author and his suppliers disclaim all warranties, including warranties of merchantability, non‑infringement of third‑party rights, and fitness for a particular purpose. The author and his suppliers make no warranties as to the accuracy, reliability, completeness, or timeliness of the materials, services, software texts, designs, or links.
The content provided does not in any way constitute, and should not be regarded as: medical, therapeutic, or diagnostic advice; legal or regulatory advice; individualized guidance for enhancing athletic or physical performance; or a recommendation to purchase, use, or distribute any controlled substances. The author and publisher (George Mourice) make no express or implied warranties regarding the accuracy, completeness, reliability, or suitability of the information provided, and fully disclaim any responsibility for any errors or omissions in this content.

Section Two: Medical and Health Disclaimer
The information contained in this book is NOT MEDICAL ADVICE, including any discussions of Anabolic Androgenic Steroids (AAS), Human Growth Hormone (HGH), peptides, or any other performance‑enhancing substances, and does not replace or substitute for consultation with a qualified physician or licensed healthcare provider. The reader must always, without exception, consult a qualified doctor before: starting any therapeutic, pharmaceutical, or hormonal regimen; changing diet or training program; using any medication, dietary supplement, hormone, or chemical substance.
Serious and Potentially Fatal Health Risks.
The reader acknowledges and fully understands that the use of anabolic steroids, hormones, and the substances mentioned in this book for non‑therapeutic purposes (such as enhancing athletic performance or building muscle) and at supraphysiological doses (beyond normal physiological levels) carries very serious and potentially life‑threatening health risks, including but not limited to: acute and chronic liver and kidney damage; serious cardiovascular disease (blood clots, strokes, heart attacks, cardiac hypertrophy, malignant hypertension); permanent hormonal disorders (hypogonadism, testicular atrophy, permanent infertility, gynecomastia); severe psychological and neurological disorders (extreme aggression, major depression, anxiety, psychosis, suicidal tendencies); permanent and irreversible damage to the reproductive, nervous, and endocrine systems; cancer (particularly liver and prostate cancer); sudden death.
The author and publisher (George Mourice) fully and absolutely disclaim any responsibility for any health consequences, whether temporary, permanent, or fatal, arising directly or indirectly from reading, applying, misapplying, or misunderstanding the information contained in this book.
Absolute No Guarantee of Results (ABSOLUTE NO GUARANTEE OF RESULTS).
The author and publisher (George Mourice) do not in any way guarantee any specific results from the application of any protocols, cycles, dosages, training programs, diets, or supplements mentioned in this book. The bodily response to the hormones and substances described varies radically and substantially from one individual to another and depends on individual genetic, environmental, lifestyle, baseline health, drug‑interaction, and other unpredictable factors.
Mandatory Medical Supervision (MANDATORY MEDICAL SUPERVISION).
Anyone considering the use of any of the substances mentioned must undergo comprehensive and specialized medical examinations (full blood work, cardiovascular assessment, liver and kidney function tests, complete hormonal evaluation, imaging studies) before, during, and after use, under direct and continuous medical supervision by a specialist physician. To keep pace with scientific developments, it is recommended to consult the latest medical studies on AAS risks, such as those published in journals like The New England Journal of Medicine or updates from the World Health Organization (WHO) on the long‑term health effects of hormones.

Section Three: Legal and Regulatory Disclaimer
Anabolic steroids are strictly controlled substances. The reader acknowledges and fully understands that anabolic steroids and many of the other substances mentioned in this book are Schedule III Controlled Substances under U.S. federal law (Anabolic Steroid Control Act of 1990 and 2004), as well as under similar laws in most countries worldwide, including the UN Conventions on Narcotic Drugs and their updates up to 2025, which tighten international control over online distribution. Possession, use, purchase, sale, distribution, import, or export of these substances without a valid prescription from a licensed physician for an FDA‑approved medical indication (or equivalent regulatory authority) constitutes a serious federal criminal offense that may lead to imprisonment and substantial fines.
Full Legal Compliance Solely the Reader’s Responsibility.
The reader bears full, absolute, and sole responsibility for verifying and strictly complying with all applicable local, national, and international laws, regulations, and legislation in his or her jurisdiction (country, region, state, city) regarding: possession of the mentioned substances; their personal use; their import or export across borders; their purchase or sale; their distribution or transfer.
No Encouragement or Support for Any Illegal Use.
The author and publisher (George Mourice) do not encourage, promote, support, facilitate, or recommend in any way the illegal use or misuse of any substance mentioned in this book. All information provided regarding “cycles,” “dosages,” “detection times,” “injection methods,” “test‑avoidance strategies,” or “stacking” is presented solely for educational, historical, and purely academic research purposes about what exists and is discussed in scientific and medical literature and known practices (whether legal or illegal), and does not in any way constitute an invitation, practical guidance, or encouragement to implement them.
Sports Laws and International Competitions.
The reader explicitly acknowledges that the use of anabolic steroids and the substances mentioned is strictly prohibited by virtually all international, national, and local sports organizations, including but not limited to: the World Anti‑Doping Agency (WADA) and its 2025 updates, which include new substances such as certain synthetic peptides; the International Olympic Committee (IOC); all professional sports federations (NFL, NBA, MLB, NHL, UFC, FIFA, etc.); and collegiate sports federations (NCAA, etc.). The use of these substances in the context of sports competitions is considered cheating, deception, and a flagrant violation of ethical rules and may result in extremely severe sanctions (lifetime bans, large financial penalties, stripping of titles, medals, and awards, and destruction of professional reputation).

Section Four: Use of Material, User Submissions, and Correspondence
The author grants you permission to view and download a single copy of the material contained in this book solely for your own personal, non‑commercial use. Special rules may apply to the use of certain software and other items provided in the book. Any such special guidelines are noted in this book and are incorporated into this agreement by reference.
The contents of this book—such as text, designs, images, and other material—are protected by copyright laws. Unauthorized use of the material may violate copyright, trademark, and other regulations. You must retain all copyright notices and other proprietary notices contained in the original material on any copy you make of the material. You may not sell, modify, reproduce, publicly display, distribute, or otherwise use the material in any way for any public or commercial purpose. Use of the material in any other book or in a networked computer environment for any purpose is prohibited. If you violate any of these terms, your permission to use the material terminates automatically, and you must immediately destroy any copies of the material that you have made.
In general, any correspondence you post in the book is considered non‑confidential. If particular pages in the book permit the submission of correspondence that the author will treat as confidential, this will be stated in the “Legal Notices” on those pages. By submitting correspondence to the book, you automatically grant the author a non‑exclusive, perpetual, irrevocable, royalty‑free license to use, reproduce, modify, publish, edit, translate, distribute, perform, and display such correspondence alone or as part of other works in any form, media, or technology now known or later developed, and to sublicense such rights through multiple tiers of sublicensees.
As a user, you are responsible for your own correspondence and for the consequences of posting it. You must not: post material protected by copyright unless you are the copyright owner or have permission from the copyright owner to post it; post material that discloses trade secrets unless you own them or have permission from the owner; post material that infringes any other intellectual property rights, or the privacy or publicity rights of others; post obscene, defamatory, threatening, harassing, abusive, hateful, or embarrassing material about another user or any other person or entity; post explicit pornographic images; post advertisements or commercial solicitations; post junk mail or pyramid schemes; or impersonate another person.
The author does not endorse and is not responsible for the accuracy or reliability of any correspondence posted by users or for any opinions expressed by users. You acknowledge that any reliance on material posted by other users will be at your own risk. The author does not pre‑screen user correspondence and is not responsible for screening or monitoring material posted by users. If notified by a user of correspondence allegedly not in compliance with this agreement, the author may investigate the allegation and determine in good faith and in his sole discretion whether to remove or request the removal of such correspondence. The author has no liability or responsibility to users for the performance or non‑performance of such activities. The author reserves the right to expel users and prevent their further access to the book for violating this agreement or the law, and the right to remove correspondence that is abusive, illegal, or disruptive.

Section Five: Links to Other Sites, Software Licenses, and Limitation of Liability
The book contains links to third‑party websites. These links are provided solely as a convenience to you and not as an endorsement by the author of the content of such websites. The author is not responsible for the content of linked third‑party sites and makes no representations regarding the content or accuracy of materials on such sites. If you decide to access linked third‑party websites, you do so at your own risk.
All software available for download from the book is protected by copyright and may be protected by other rights. Use of such software is governed by the terms of the software license agreement or notice accompanying or included with the software. Downloading and using such software is conditioned on your agreement to comply with the terms of the license agreement.
Unless expressly stated otherwise in a product license or legal notice, the author’s total liability to you for all claims arising from the use of the materials (including software) is limited to 100 U.S. dollars. In no event shall the author, his suppliers, or any third parties mentioned in this book be liable for any damages whatsoever (including, without limitation, incidental and consequential damages, lost profits, or damages resulting from lost data or business interruption) resulting from the use of or inability to use the book and the materials, whether based on warranty, contract, tort, or any other legal theory, and whether or not the author has been advised of the possibility of such damages.

Section Six: Reader’s Acknowledgment, Full Assumption of Responsibility, and Indemnification
By purchasing, downloading, reading, using, or accessing this book in any manner whatsoever, the reader expressly and irrevocably acknowledges the following:
Full and Absolute Responsibility (FULL AND ABSOLUTE RESPONSIBILITY).
The reader bears full, absolute, and sole responsibility for:

* any decisions, actions, or measures taken based on the information contained in this book;
* any harms, bodily injuries, illnesses, or adverse consequences (health‑related, psychological, legal, financial, social, professional, or otherwise) that may arise directly or indirectly from reading, applying, misapplying, or misunderstanding the content.

Full Indemnification and Absolute Hold Harmless (FULL INDEMNIFICATION AND ABSOLUTE HOLD HARMLESS).
The reader agrees, definitively, irrevocably, and in a legally binding manner, to:

* fully defend the author and publisher (George Mourice);
* fully indemnify them for any losses or costs;
* fully hold them harmless and release them from any legal or ethical liability from and against any and all:

legal claims;
civil or criminal lawsuits;
financial losses;
physical or moral damages;
expenses and costs (including attorneys’ fees and legal representation);
liabilities of any kind,
arising out of or in any way related to:


* the reader’s use, application, or misapplication of the content;
* the reader’s violation of any local, national, or international laws or regulations;
* the reader’s negligence, omission, or poor judgment;
* any reckless or irresponsible acts or decisions by the reader.

You agree to defend, indemnify, and hold harmless the author, his officers, directors, employees, and agents from and against any and all claims, actions, or demands, including, without limitation, reasonable legal and accounting fees, brought by you or any person on your behalf, or by any other individual or entity, alleging harm or damage of any kind, whether to property or individuals, arising from your use or alleged use of the materials or data in the book (including software), or your breach of the terms of this agreement. The author will notify you promptly.
Voluntary and Informed Assumption of Risk (VOLUNTARY AND INFORMED ASSUMPTION OF RISK).
The reader clearly and expressly acknowledges that he or she:

* has received clear, sufficient, and detailed warnings about serious health risks and significant legal risks;
* fully and completely understands these risks and their potential consequences;
* voluntarily, of his or her own free will and with full awareness, assumes all risks associated with the use or application of the information provided;
* waives any right to sue or seek compensation from the author or publisher.

Legal Age and Full Legal Capacity (LEGAL AGE AND FULL LEGAL CAPACITY).
The reader represents and warrants that he or she:

* has reached legal age (at least 18 years old, or the full legal age of majority in his or her jurisdiction, whichever is higher);
* possesses full legal capacity and mental competence to understand this disclaimer and its terms and to agree to them in a binding manner;
* has not been coerced, deceived, or manipulated into agreeing to this disclaimer.


Section Seven: Updates to Information and No Obligation to Update
This book may contain typographical, technical, scientific, or informational errors. The information provided may become outdated, inaccurate, or incomplete over time due to rapid developments in scientific and medical research, changes in laws and regulatory frameworks, or the emergence of new information or new scientific evidence, such as recent updates to the WADA banned substances lists or changes in EU Medicines Law that tighten digital control over controlled substances. The author and publisher (George Mourice) are under no obligation whatsoever to update, correct, or revise the content to reflect such future changes or to correct any errors.

Section Eight: Severability, Enforcement, and Final Binding Acceptance
If any part, clause, or provision of this disclaimer is found to be unenforceable, void, or invalid under any applicable law in any jurisdiction, then:

* that part shall be modified or interpreted as narrowly as possible so as to become enforceable to the maximum extent permitted by law;
* the remaining provisions and terms shall remain in full force and legally binding.

This disclaimer constitutes an integral and essential part of the book and the legally binding agreement between the reader and the author and publisher. By reading, purchasing, downloading, or using this book in any way, you represent and warrant that you:

* have read this disclaimer in full and carefully;
* understand all the terms, conditions, and risks described;
* fully and absolutely agree to them without any reservation or condition;
* are legally bound to comply with them.

If you do not agree with any part of this disclaimer, you must:

* immediately cease reading or using the book;
* delete any digital copy;
* return any physical copy for a full refund (if applicable).

Publication Date: 2025
Author and Publisher: George Mourice
© 2025 George Mourice. All Rights Reserved.`;
