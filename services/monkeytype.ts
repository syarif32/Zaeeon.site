import { MONKEYTYPE_ACCOUNT } from "@/common/constants/monkeytype";

const { username } = MONKEYTYPE_ACCOUNT;
const USER_ENDPOINT = `https://api.monkeytype.com/users/${username}/profile`;

export const getMonkeytypeData = async () => {
  // Kita tarik kunci langsung dari .env untuk memastikan tidak 'undefined'
  const apiKey = process.env.MONKEYTYPE_API_KEY;

  try {
    const response = await fetch(USER_ENDPOINT, {
      method: "GET",
      headers: {
        Authorization: `ApeKey ${apiKey}`,
      },
      // Cache data 1 menit agar tidak spam API Monkeytype
      next: { revalidate: 60 }
    });

    const responseJson = await response.json();

    // RADAR PELACAK JIKA GAGAL
    if (!response.ok) {
      console.error("[MONKEYTYPE ERROR]:", responseJson);
      throw new Error(responseJson.message || "Gagal fetch API Monkeytype");
    }

    return { status: response.status, data: responseJson.data };
  } catch (error: any) {
    console.error(" [SYSTEM ERROR]:", error.message);
    throw error;
  }
};
