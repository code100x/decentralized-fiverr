import dotenv from "dotenv";
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET ?? "kirat123";
export const WORKER_JWT_SECRET = JWT_SECRET + "worker";

export const TOTAL_DECIMALS = 1000_000;

// 1/1000_000_000_000_000_000
export const TOTAL_SUBMISSIONS = 100;

export const SHARES = 5;
export const THRESHOLD = 3;
export const SWEEPER_WORKER_ENDPOINT =
  process.env.SWEEPER_WORKER_ENDPOINT ?? "http://localhost:7777";

export const SERVER_1_ENDPOINT =
  process.env.SERVER_1_ENDPOINT ?? "http://localhost:8080";
export const SERVER_2_ENDPOINT =
  process.env.SERVER_2_ENDPOINT ?? "http://localhost:7070";
export const SERVER_3_ENDPOINT =
  process.env.SERVER_3_ENDPOINT ?? "http://localhost:6060";
export const SERVER_4_ENDPOINT =
  process.env.SERVER_4_ENDPOINT ?? "http://localhost:5050";
export const SERVER_5_ENDPOINT =
  process.env.SERVER_5_ENDPOINT ?? "http://localhost:4040";

export const DISTRIBUTED_SERVER_ENDPOINTS = [
  SERVER_1_ENDPOINT,
  SERVER_2_ENDPOINT,
  SERVER_3_ENDPOINT,
  SERVER_4_ENDPOINT,
  SERVER_5_ENDPOINT,
];

export const RPC_URL = process.env.RPC_URL ?? "https://api.devnet.solana.com";

export const PARENT_WALLET_PUBLIC_KEY = process.env.PARENT_WALLET_PUBLIC_KEY;

export const REGION = process.env.REGION ?? "us-east-1";
export const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID ?? "";
export const ACCESS_SECRET = process.env.ACCESS_SECRET ?? "";
export const BUCKET_NAME = process.env.BUCKET_NAME ?? "";
