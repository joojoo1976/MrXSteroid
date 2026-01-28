import { createLoginSchema, createSignupSchema } from './schemas';
import { ZodError } from 'zod';

// Simple test runner since we might not have a full test suite setup
async function runTests() {
    console.log("🧪 Starting Validation Logic Tests...");

    // Test 1: Valid Login
    console.log("\n[Test 1] Valid Login Input");
    const loginSchemaEn = createLoginSchema(false);
    const validLogin = { email: "test@example.com", password: "password123" };
    const result1 = loginSchemaEn.safeParse(validLogin);
    if (result1.success) {
        console.log("✅ PASS: Valid login accepted");
    } else {
        console.error("❌ FAIL: Valid login rejected", result1.error);
    }

    // Test 2: Invalid Email
    console.log("\n[Test 2] Invalid Email Input");
    const invalidEmail = { email: "not-an-email", password: "password123" };
    const result2 = loginSchemaEn.safeParse(invalidEmail);
    if (!result2.success) {
        console.log("✅ PASS: Invalid email rejected");
        console.log("   Error:", result2.error.errors[0].message);
    } else {
        console.error("❌ FAIL: Invalid email accepted");
    }

    // Test 3: Password Mismatch (Signup)
    console.log("\n[Test 3] Signup Password Mismatch");
    const signupSchemaEn = createSignupSchema(false);
    const mismatchSignup = {
        fullName: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "Password123",
        confirmPassword: "Password124" // Mismatch
    };
    const result3 = signupSchemaEn.safeParse(mismatchSignup);
    if (!result3.success) {
        console.log("✅ PASS: Password mismatch rejected");
        console.log("   Error:", result3.error.errors[0].message);
    } else {
        console.error("❌ FAIL: Password mismatch accepted");
    }

    // Test 4: RTL Messages
    console.log("\n[Test 4] RTL (Arabic) Error Messages");
    const loginSchemaAr = createLoginSchema(true); // isRTL = true
    const invalidLoginAr = { email: "bad-email", password: "123" };
    const result4 = loginSchemaAr.safeParse(invalidLoginAr);
    if (!result4.success) {
        const msg = result4.error.errors[0].message;
        if (msg === "بريد إلكتروني غير صحيح") {
            console.log("✅ PASS: Arabic error message correct");
        } else {
            console.error(`❌ FAIL: Expected Arabic message, got '${msg}'`);
        }
    }

    console.log("\n🏁 Validation Tests Completed.");
}

// Execute logic (in a real env this would be run by a test runner)
runTests().catch(console.error);
