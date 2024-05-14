"use client";
import { useMemo, useState } from "react";
import axios, { AxiosError } from "axios";
import { BACKEND_URL } from "@/utils";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { ToastLTSBalance } from "./Balance";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
const WalletButton = dynamic(() => import("./WalletButton"), { ssr: false });

export const Appbar = () => {
  const [loading, setLoading] = useState(false);
  const { publicKey } = useWallet();
  const pubKey = useMemo(() => {
    const walletAddress = publicKey?.toString();
    return walletAddress?.slice(0, 4) + ".." + walletAddress?.slice(-4);
  }, [publicKey]);
  return (
    <div className="flex justify-between border-b pb-2 pt-2">
      <div className="text-2xl pl-4 flex justify-center items-center pt-2">
        Turkify
      </div>
      <div className="text-xl pr-4 flex">
        <Link href={"/payout"} className="m-2 text-white bg-gray-800 hover:bg-gray-900 hover:underline focus:outline-none focus:ring-1 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">
          My Payouts
        </Link>
        <button
          onClick={async () => {
            await ToastLTSBalance();
          }}
          className="m-2 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
        >
          Check Balance
        </button>
        {loading ? (
          <button
            disabled={loading}
            className="m-2 mr-4 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
          >
            Locking SOL...
          </button>
        ) : (
          <button
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              const response = await axios
                .post(
                  `${BACKEND_URL}/v1/worker/payout`,
                  {},
                  {
                    headers: {
                      Authorization: localStorage.getItem("token"),
                    },
                  }
                )
                .catch((err) => {
                  const data = (err as AxiosError).response?.data;
                  toast((data as { message: string }).message);
                  console.log(err);
                });
              if (response) {
                toast.success("Your payout is processing...", {
                  description: response.data.message,
                });
                console.log(response.data);
              }
              setLoading(false);
            }}
            className="m-2 mr-4 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
          >
            Pay me out
          </button>
        )}
        <div className="m-2 text-white cursor-default bg-gray-800  focus:outline-none focus:ring-1 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 dark:bg-gray-800  dark:focus:ring-gray-700 dark:border-gray-700">
          {pubKey}
        </div>
        <WalletButton></WalletButton>
      </div>
    </div>
  );
};
