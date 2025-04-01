import { axiosInstance } from "./axios";

export const translateText = async (text, targetLang) => {
  try {
    const response = await axiosInstance.post("/messages/translate", {
      text,
      targetLang,
    });
    return response.data;
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
}; 