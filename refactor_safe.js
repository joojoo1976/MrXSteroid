const fs = require('fs');
const path = require('path');

// List derived from grep search + tsc errors
const files = [
    "src/pages/ProfilePage.tsx",
    "src/pages/BookLandingPage.tsx",
    "src/context/PreferencesProvider.tsx",
    // "src/components/Footer.tsx", // Alread updated manually
    "src/components/InjectionMap.tsx",
    "src/components/DisclaimerModal.tsx",
    "src/components/TransformationTimeline.tsx",
    "src/components/SteroidReadinessQuiz.tsx",
    "src/components/SmartLabReference.tsx",
    "src/components/SmartBookLanding.tsx",
    "src/components/Hero.tsx",
    "src/components/HalfLifeVisualizer.tsx",
    "src/components/GeneticPotentialCalculator.tsx",
    "src/components/Features.tsx",
    "src/components/FAQ.tsx",
    "src/components/DailyIQChallenge.tsx",
    "src/components/ContactSection.tsx",
    "src/components/Contact.tsx",
    "src/components/CheckoutModal.tsx",
    "src/components/ChatWidget.tsx",
    "src/components/AuthorSection.tsx",
    "src/components/BenefitsSection.tsx",
    "src/components/BlockingDisclaimerModal.tsx"
];

function run() {
    files.forEach(file => {
        const fullPath = path.resolve(process.cwd(), file);
        if (!fs.existsSync(fullPath)) return;

        console.log(`Processing ${file}...`);
        let content = fs.readFileSync(fullPath, 'utf8');

        // 1. Remove renderStyledBrandName from import
        // Pattern: import { ..., renderStyledBrandName, ... } from '../utils/logic';
        // Note: simplified regex handling
        if (content.includes("renderStyledBrandName") && content.includes("utils/logic")) {
            content = content.replace(/,\s*renderStyledBrandName/, ""); // Remove from middle or end
            content = content.replace(/renderStyledBrandName\s*,\s*/, ""); // Remove from start
            content = content.replace(/import\s*\{\s*renderStyledBrandName\s*\}\s*from\s*['"]\.\.\/utils\/logic['"];?/, ""); // Remove standalone
        }

        // 2. Add new import 
        // Heuristic: Check relative depth
        const depth = file.split('/').length - 1;
        let relativePath = "../components/StyledBrandName";
        if (depth === 2) relativePath = "./StyledBrandName"; // src/components/File.tsx -> ./StyledBrandName
        if (depth === 3) relativePath = "../components/StyledBrandName"; // src/pages/File.tsx -> ../components

        // Strict mapping based on knowledge
        if (file.startsWith('src/components/')) relativePath = "./StyledBrandName";
        if (file.startsWith('src/pages/')) relativePath = "../components/StyledBrandName";
        if (file.startsWith('src/context/')) relativePath = "../components/StyledBrandName";

        if (!content.includes('StyledBrandName')) {
            const importStmt = `import { StyledBrandName } from '${relativePath}';\n`;
            content = importStmt + content;
        }

        // 3. Replace usage
        // {renderStyledBrandName('Val')} -> <StyledBrandName text={'Val'} />
        // {renderStyledBrandName(variable)} -> <StyledBrandName text={variable} />

        content = content.replace(/\{renderStyledBrandName\(([^)]+)\)\}/g, (match, arg) => {
            return `<StyledBrandName text={${arg}} />`;
        });

        // Handle case without braces if any (unlikely in JSX usually wrapped)
        // Check for direct calls inside map or logic?
        // Let's stick to safe replacements.

        fs.writeFileSync(fullPath, content, 'utf8');
    });
    console.log("Done.");
}

run();
