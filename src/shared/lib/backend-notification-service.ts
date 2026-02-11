/**
 * BACKEND NOTIFICATION SERVICE
 * -----------------------------------------------------
 * This file contains server-side logic (e.g., for a Node.js backend or Supabase Edge Function).
 * DO NOT IMPORT THIS FILE IN CLIENT-SIDE CODE.
 *
 * It uses the secrets from .env to send SMS via Twilio.
 */

// NOTE: In a real Edge Function, you'd import from 'https://esm.sh/twilio' or similar Deno friendly imports.
// For this reference implementation, we assume a Node environment.

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export const sendSmsNotification = async (to: string, body: string) => {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
        throw new Error("Missing Twilio Credentials on Server");
    }

    // START PSEUDOCODE FOR SERVER IMPLEMENTATION
    /*
    try {
        const message = await client.messages.create({
            body: body,
            from: TWILIO_PHONE_NUMBER,
            to: to
        });
        return { success: true, sid: message.sid };
    } catch (error) {
        console.error("Twilio Error:", error);
        return { success: false, error };
    }
    */
    // END PSEUDOCODE

    console.log(`[SERVER-MOCK] Sending SMS to ${to}: ${body}`);
    return { success: true, mock: true };
};
