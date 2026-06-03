import axios from "axios";
import { BASE_URL } from "../constants/api";
import { supabase } from "../lib/supabase";

export const apiClient = axios.create({
  baseURL: BASE_URL,
});

apiClient.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
