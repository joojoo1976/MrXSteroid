// lib/adapters/googleAdsTrendsAdapter.ts

export interface KeywordTrendResult {
  keyword: string;
  avgMonthlySearches: number;
  competition: string;
}

/**
 * بديل ذكي لجلب اتجاهات الكلمات والطلب البحثي عبر Google Ads API
 */
export async function fetchKeywordTrends(keywords: string[]): Promise<KeywordTrendResult[]> {
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, '');
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;

  if (!customerId || !clientId || !clientSecret || !refreshToken) {
    throw new Error('Google Ads Environment Variables are missing!');
  }

  // 1. توليد Access Token جديد باستخدام الـ Refresh Token المتوفر
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok) {
    throw new Error(`Failed to refresh Google Token: ${tokenData.error_description || tokenData.error}`);
  }

  const accessToken = tokenData.access_token;

  // 2. طلب أحجام البحث واتجاهات الكلمات المفتاحية عبر Endpoint: generateKeywordIdeas
  const url = `https://googleads.googleapis.com/v18/customers/${customerId}:generateKeywordIdeas`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || 'YOUR_DEVELOPER_TOKEN',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      language: 'languageConstants/1000', // اللغة الإنجليزية (أو 1019 للعربية)
      keywordSeed: {
        keywords: keywords,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Google Ads API Error:', data);
    return [];
  }

  // 3. تنسيق النتائج المرجعة للمحرك (Weekly Engine)
  return (data.results || []).map((item: any) => ({
    keyword: item.text,
    avgMonthlySearches: item.keywordIdeaMetrics?.avgMonthlySearches || 0,
    competition: item.keywordIdeaMetrics?.competition || 'UNKNOWN',
  }));
}