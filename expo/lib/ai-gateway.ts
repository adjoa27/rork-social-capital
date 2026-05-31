import { createGateway } from "ai";

const TOOLKIT_URL = process.env["EXPO_PUBLIC_TOOLKIT_URL"]!;
const SECRET_KEY = process.env["EXPO_PUBLIC_RORK_TOOLKIT_SECRET_KEY"]!;

export const gateway = createGateway({
  baseURL: `${TOOLKIT_URL}/v2/vercel/v3/ai`,
  apiKey: SECRET_KEY,
});
