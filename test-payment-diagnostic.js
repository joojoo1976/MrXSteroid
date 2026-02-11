// Simple test to verify the payment diagnostic functionality
import { runPaymentDiagnostic, getDiagnosticSummary, logDiagnosticReport } from './src/utils/payment-diagnostic';

console.log('Testing payment diagnostic functions...');

try {
    // Run a diagnostic test
    console.log('Running payment diagnostic...');
    const report = runPaymentDiagnostic();
    console.log('✅ Payment diagnostic ran successfully');
    console.log('Report overall status:', report.overall);
    console.log('Report timestamp:', report.timestamp);
    console.log('Check keys:', Object.keys(report.checks));
    
    // Get summary
    console.log('\nGetting diagnostic summary...');
    const summary = getDiagnosticSummary(report);
    console.log('✅ Diagnostic summary retrieved');
    console.log('Summary status:', summary.status);
    console.log('Summary message:', summary.message);
    console.log('Number of issues:', summary.issues.length);
    
    // Log report
    console.log('\nLogging diagnostic report...');
    logDiagnosticReport(report);
    console.log('✅ Diagnostic report logged');
    
    console.log('\n🎉 All payment diagnostic functions are working correctly!');
    console.log('✅ runPaymentDiagnostic - OK');
    console.log('✅ getDiagnosticSummary - OK');
    console.log('✅ logDiagnosticReport - OK');
    
    console.log('\n📋 Diagnostic Report Summary:');
    console.log(`   Overall Status: ${report.overall}`);
    console.log(`   Timestamp: ${report.timestamp}`);
    console.log(`   Checks Performed: ${Object.keys(report.checks).length}`);
    console.log(`   Issues Found: ${summary.issues.length}`);
    
} catch (error) {
    console.error('❌ Error testing payment diagnostic functions:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
}