import { WAKATIME_ACCOUNT } from "@/common/constants/wakatime";
import axios from "axios";
import { unstable_cache } from "next/cache";

const { api_key, base_url, all_time_endpoint, stats_endpoint } =
  WAKATIME_ACCOUNT;

const getAuthorization = () => {
  if (!api_key?.trim()) throw new Error("WAKATIME_ACCESS_TOKEN is not configured");
  return "Bearer " + api_key.trim();
};

const logWakatimeError = (context: string, error: unknown) => {
  // Never log Axios request headers, which contain the access token.
  console.error(context, axios.isAxiosError(error)
    ? { status: error.response?.status, code: error.code }
    : { message: error instanceof Error ? error.message : "Unknown error" });
};

const fetchReadStats = async () => {
  try {
    const response = await axios.get(
      `${base_url}${stats_endpoint}/last_7_days`,
      {
        // headers: { Authorization: `Basic ${api_key}` },
        headers: { Authorization: getAuthorization() },
        timeout: 15000,
      },
    );

    if (response.status !== 200 || !response.data?.data) {
      throw new Error("WakaTime data is not ready");
    }
    const getData = response.data;
    return {
      data: {
        start_date: getData?.data?.start,
        end_date: getData?.data?.end,
        last_update: getData?.data?.modified_at,
        best_day: {
          date: getData?.data?.best_day?.date,
          text: getData?.data?.best_day?.text,
        },
        human_readable_daily_average:
          getData?.data?.human_readable_daily_average_including_other_language,
        human_readable_total:
          getData?.data?.human_readable_total_including_other_language,
        languages: getData?.data?.languages?.slice(0, 6),
        editors: getData?.data?.editors,
      },
    };
  } catch (error) {
    logWakatimeError("Wakatime Stats Error:", error);
    throw new Error("Unable to load WakaTime stats");
  }
};

const fetchAllTimeSinceToday = async () => {
  try {
    const response = await axios.get(`${base_url}${all_time_endpoint}`, {
      // headers: { Authorization: `Basic ${api_key}` },
      headers: { Authorization: getAuthorization() },
        timeout: 15000,
    });

    if (response.status !== 200 || !response.data?.data) {
      throw new Error("WakaTime data is not ready");
    }
    const getData = response.data;
    return {
      data: {
        text: getData?.data?.text,
        total_seconds: getData?.data?.total_seconds,
      },
    };
  } catch (error) {
    logWakatimeError("Wakatime All Time Error:", error);
    throw new Error("Unable to load WakaTime all-time stats");
  }
};

export const getReadStats = unstable_cache(
  async () => fetchReadStats(),
  ["wakatime-read-stats-v2"],
  { revalidate: 3600, tags: ["wakatime-stats-tag"] },
);

export const getAllTimeSinceToday = unstable_cache(
  async () => fetchAllTimeSinceToday(),
  ["wakatime-all-time-v2"],
  { revalidate: 3600, tags: ["wakatime-all-time-tag"] },
);
