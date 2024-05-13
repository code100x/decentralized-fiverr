"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/utils";
import dynamic from "next/dynamic";
const WalletButton = dynamic(() => import("./WalletButton"), { ssr: false });

export const Appbar = () => {
  const { publicKey, signMessage } = useWallet();

  async function signAndSend() {
    if (!publicKey || !signMessage || !window) {
      return;
    }
    if (window.localStorage.getItem("token")) {
      return;
    }
    const message = new TextEncoder().encode("Sign into mechanical turks");
    const signature = await signMessage(message);
    console.log(signature.toString());
    console.log(publicKey.toString());
    const response = await axios.post(`${BACKEND_URL}/v1/user/signin`, {
      signature: signature.toString(),
      publicKey: publicKey.toString(),
    });

    localStorage.setItem("token", response.data.token);
  }

  useEffect(() => {
    signAndSend();
  }, [publicKey]);

  return (
    <div className="flex justify-between border-b pb-2 pt-2">
      <div className="text-2xl pl-4 flex justify-center pt-3">Turkify</div>
      <div className="text-xl pr-4 pb-2">
        <WalletButton publicKey={publicKey?.toString()}></WalletButton>
      </div>
    </div>
  );
};
