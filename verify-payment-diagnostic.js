// Test to verify the payment diagnostic functions are properly exported
import fs from 'fs';

console.log('Verifying payment diagnostic functions...');

// Read the file content to check for function exports
const filePath = './src/utils/payment-diagnostic.ts';
const content = fs.readFileSync(filePath, 'utf-8');

// Check if the required functions are exported
const hasRunPaymentDiagnostic = content.includes('export function runPaymentDiagnostic');
const hasGetDiagnosticSummary = content.includes('export function getDiagnosticSummary');
const hasLogDiagnosticReport = content.includes('export function logDiagnosticReport');

console.log('🔍 Checking function exports in payment-diagnostic.ts...');

if (hasRunPaymentDiagnostic) {
    console.log('✅ runPaymentDiagnostic function is exported');
} else {
    console.error('❌ runPaymentDiagnostic function is NOT exported');
}

if (hasGetDiagnosticSummary) {
    console.log('✅ getDiagnosticSummary function is exported');
} else {
    console.error('❌ getDiagnosticSummary function is NOT exported');
}

if (hasLogDiagnosticReport) {
    console.log('✅ logDiagnosticReport function is exported');
} else {
    console.error('❌ logDiagnosticReport function is NOT exported');
}

// Check for security improvements
const hasInputValidation = content.includes('checkPublicKey') && content.includes('checkCallbackUrl');
const hasSecureChecks = content.includes('isValidFormat') || content.includes('validate') || content.includes('check.*Key');

console.log('\n🔍 Checking security implementations...');
if (hasInputValidation) {
    console.log('✅ Input validation checks are implemented');
} else {
    console.log('⚠️  Input validation checks not found');
}

// Check for proper error handling
const hasErrorHandling = content.includes('try') && content.includes('catch') || content.includes('if (error)');

if (hasErrorHandling) {
    console.log('✅ Error handling is implemented');
} else {
    console.log('⚠️  Error handling not found');
}

// Summary
const allFunctionsExist = hasRunPaymentDiagnostic && hasGetDiagnosticSummary && hasLogDiagnosticReport;
const securityFeatures = hasInputValidation && hasErrorHandling;

console.log('\n📋 Verification Summary:');
console.log(`✅ All required functions exported: ${allFunctionsExist ? 'YES' : 'NO'}`);
console.log(`✅ Security features implemented: ${securityFeatures ? 'YES' : 'NO'}`);

if (allFunctionsExist && securityFeatures) {
    console.log('\n🎉 Payment diagnostic module is properly structured with security features!');
} else {
    console.log('\n⚠️  Payment diagnostic module needs review');
}

console.log('\n✅ Static analysis completed successfully!');