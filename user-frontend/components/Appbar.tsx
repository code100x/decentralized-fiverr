"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo } from "react";
const WalletButton = dynamic(() => import("./WalletButton"), { ssr: false });

export const Appbar = () => {
  const { publicKey } = useWallet();
  const pubKey = useMemo(() => {
    const walletAddress = publicKey?.toString();
    return walletAddress?.slice(0, 4) + ".." + walletAddress?.slice(-4);
  }, [publicKey]);
  return (
    <div className="flex justify-between border-b pb-2 pt-2">
      <div className="text-2xl pl-4 flex justify-center pt-3 cursor-pointer">
        <Link href={"/"}>Turkify</Link>
      </div>
      <div className="text-xl pr-4 pb-2 flex items-center">
        <button className="m-2 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">
          <Link href={"/task/all"}>All Tasks</Link>
        </button>
        <div className="m-2 text-white cursor-default bg-gray-800  focus:outline-none focus:ring-1 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 dark:bg-gray-800  dark:focus:ring-gray-700 dark:border-gray-700">
          {pubKey}
        </div>
        <WalletButton></WalletButton>
      </div>
    </div>
  );
};
