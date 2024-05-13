import dotenv from "dotenv";
dotenv.config();
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_MAIN_BACKEND_URL ?? "http://localhost:3000";
export const CLOUDFRONT_URL = process.env.NEXT_PUBLIC_CLOUDFRONT_URL;
export const NEXT_PUBLIC_PARENT_WALLET_ADDRESS =
  process.env.NEXT_PUBLIC_PARENT_WALLET_ADDRESS;
