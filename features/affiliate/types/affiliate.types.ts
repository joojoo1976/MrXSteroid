export type AffiliateStatus = "pending" | "active" | "suspended" | "disabled";
export type AffiliateTier = "bronze" | "silver" | "gold" | "custom";
export type ReferralStatus = "pending" | "approved" | "reversed" | "chargeback" | "refunded";

export interface AffiliateProfile {
    id: string;
    referralCode: string;
    status: AffiliateStatus;
    currentBalance: number;
    lifetimeEarnings: number;
    totalReferrals: number;
    totalPaidReferrals: number;
    customCommissionRate: number | null;
    tier: AffiliateTier;
    monthlyPaidReferrals: number;
    createdAt: string;
}

export interface Referral {
    id: string;
    referralCode: string;
    amount: number;
    currency: string;
    commissionAmount: number;
    commissionRate: number;
    tier: AffiliateTier | "custom";
    status: ReferralStatus;
    createdAt: string;
}

export interface AffiliateState {
    enrolled: boolean;
    affiliate: AffiliateProfile | null;
    referrals: Referral[];
    totalReferrals: number;
    loading: boolean;
    error: string | null;
}
