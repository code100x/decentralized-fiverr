"use client";
import { Appbar } from "@/components/Appbar";
import { Hero } from "@/components/Hero";
import { Upload } from "@/components/Upload";
import { useWalletSession } from "@/components/auth";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Home() {
  const { publicKey, sendTransaction } = useWallet();
  return (
    <main>
      <Appbar />
      <Hero />
      <Upload publicKey={publicKey} sendTransaction={sendTransaction} />
    </main>
  );
}
