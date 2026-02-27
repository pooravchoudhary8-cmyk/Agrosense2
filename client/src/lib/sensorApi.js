import axios from "axios";

const API = axios.create({
  baseURL: "/api",
});

export const fetchSensorData = async () => {
  try {
    console.log("🔍 Fetching sensor data from:", API.defaults.baseURL + "/sensor-data?limit=1");
    const res = await API.get("/sensor-data?limit=1");
    console.log("✅ API Response:", res.data);

    // SAFETY CHECK
    if (!res.data || !res.data.data || res.data.data.length === 0) {
      console.warn("⚠️ No sensor data in response");
      return null;
    }

    console.log("✅ Returning sensor:", res.data.data[0]);
    return res.data.data[0];
  } catch (error) {
    console.error("❌ API Error:", error.message);
    console.error("❌ Full error:", error);
    return null;
  }
};
