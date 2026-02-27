import axios from "axios";

const API = axios.create({
  baseURL: "/api",
});

export const sendPumpStatus = async (payload) => {
  await API.post("/pump-status", payload);
};
