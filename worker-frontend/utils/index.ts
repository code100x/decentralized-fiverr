import dotenv from "dotenv";
dotenv.config();
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_MAIN_BACKEND_URL ?? "http://localhost:3000";
export const CLOUDFRONT_URL = process.env.NEXT_PUBLIC_CLOUDFRONT_URL;
if (!CLOUDFRONT_URL) {
  throw new Error("Set cloudfront url in env");
}
