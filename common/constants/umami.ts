export const dynamic = 'force-dynamic';
export const revalidate = 0; 
export const UMAMI_ACCOUNT = {
  username: "Syarif32",
  api_key: process.env.UMAMI_API_KEY,
  base_url: "https://api.umami.is/v1/websites",
  endpoint: {
    page_views: "/pageviews",
    sessions: "/sessions/stats",
  },
  parameters: {
    startAt: 1717174800000, 
    endAt: 1830297599001, 
    unit: "month",
    timezone: "Asia/Jakarta",
  },
  is_active: true,
  websites: [
    {
      domain: "zaeeon-site.vercel.app",
      website_id: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
      umami_url: "https://cloud.umami.is/share/ID_SHARE_BOS", 
    },
  ],
};