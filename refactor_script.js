const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    "src/pages/ProfilePage.tsx",
    "src/pages/BookLandingPage.tsx",
    "src/context/PreferencesProvider.tsx",
    "src/components/Footer.tsx",
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

const COMPONENT_IMPORT = `import { StyledBrandName } from '../components/StyledBrandName';`;
// For pages, it might be ../../components/StyledBrandName
const COMPONENT_IMPORT_DEEP = `import { StyledBrandName } from '@/components/StyledBrandName';`;


function updateFile(filePath) {
    const fullPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
        console.log("Skipping missing file:", fullPath);
        return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let originalPlugin = content;

    // 1. Replace Import
    // Regex to find import { ..., renderStyledBrandName, ... } from ...
    // This is simple if it is the only import, hard if mixed. 
    // Most occurrences are single line: import { renderStyledBrandName } from '../utils/logic';

    // Pattern 1: Standalone import
    content = content.replace(/import\s*\{\s*renderStyledBrandName\s*\}\s*from\s*['"](\.\.\/)+utils\/logic['"];?/g, (match) => {
        // Determine relative path depth
        if (filePath.startsWith('src/pages')) return `import { StyledBrandName } from '../components/StyledBrandName';`; // Adjust relative path manually or use alias
        return `import { StyledBrandName } from './StyledBrandName';`.replace('./', '../components/');
    });

    // Fix imports if simpler regex failed or if mixed
    if (content.includes('renderStyledBrandName')) {
        // handle mixed imports: import { foo, renderStyledBrandName } from ...
        content = content.replace(/import\s*\{(.*),\s*renderStyledBrandName\s*(.*)\}\s*from/g, "import { $1, $2 } from");
        content = content.replace(/import\s*\{\s*renderStyledBrandName\s*,(.*)\}\s*from/g, "import { $1 } from");

        // Add new import
        const relativePath = filePath.includes('pages/') ? '../components/StyledBrandName' : '../components/StyledBrandName';
        // Adjust if same directory imports are used, but we know the structure.
        // Let's us @ imports for safety if configured, else relative.
        // Given usage, let's inject it at top.

        if (!content.includes('import { StyledBrandName }')) {
            const importStatement = `import { StyledBrandName } from '@/components/StyledBrandName';\n`;
            content = importStatement + content;
        }
    }

    // 2. Replace Usage
    // Case A: {renderStyledBrandName('string')} -> <StyledBrandName text={'string'} />
    // Case B: {renderStyledBrandName(variable)} -> <StyledBrandName text={variable} />

    // We look for: renderStyledBrandName(ARG)
    // And replace with: <StyledBrandName text={ARG} />

    // Regex for function call: renderStyledBrandName\(([^)]+)\)
    // Note: this assumes no nested parenthesis in ARG. Simple args mostly.

    content = content.replace(/renderStyledBrandName\(([^)]+)\)/g, (match, arg) => {
        return `<StyledBrandName text={${arg}} />`;
    });

    // Cleanup: Check if we left any broken imports (empty braces)
    content = content.replace(/import\s*\{\s*\}\s*from\s*['"].*['"];?\n?/g, "");

    // Path fix: if we injected @/components/StyledBrandName, make sure tsconfig supports it. 
    // Typically strict updates:
    if (filePath.startsWith('src/components/')) {
        content = content.replace("@/components/StyledBrandName", "./StyledBrandName");
    }

    if (content !== originalPlugin) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log("Updated:", filePath);
    }
}

filesToUpdate.forEach(updateFile);
console.log("Refactor complete.");
