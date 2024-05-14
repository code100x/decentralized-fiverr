"use client";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { UploadImage } from "@/components/UploadImage";
import { BACKEND_URL, NEXT_PUBLIC_PARENT_WALLET_ADDRESS } from "@/utils";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { WalletAdapterProps } from "@solana/wallet-adapter-base";

export const Upload = ({
  publicKey,
  sendTransaction,
}: {
  publicKey: PublicKey | null;
  sendTransaction: WalletAdapterProps["sendTransaction"];
}) => {
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sig, setSig] = useState<string | null>(null);
  const { connection } = useConnection();
  const router = useRouter();

  async function handleSubmit() {
    if (!sig) {
      console.log("Signature not found");
      return;
    }
    setLoading(true);
    const tl = toast.loading("Submiting task to workers");
    try {
      const response = await axios.post(
        `${BACKEND_URL}/v1/user/task`,
        {
          options: images.map((image) => ({
            imageUrl: image,
          })),
          title,
          signature: sig,
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      toast.dismiss(tl);
      toast.success("Successfully submitted the task", {
        description: `TASK ID: ${response.data.id}`,
      });
      router.push(`/task/${response.data.id}`);
    } catch (error) {
      toast.dismiss(tl);
      toast.error((error as Error).message);
      console.log(error);
    }

    setLoading(false);
  }
  async function makePayment() {
    if (!publicKey || !sendTransaction) {
      return;
    }

    setLoading(true);
    let tl;
    try {
      if (!NEXT_PUBLIC_PARENT_WALLET_ADDRESS) {
        throw new Error("Set parent wallet address");
      }
      if (!title) {
        throw new Error("Add Title");
      }
      if (images.length < 2) {
        throw new Error("Upload Minimum Two Images");
      }
      tl = toast.loading("Making Payement...");
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(NEXT_PUBLIC_PARENT_WALLET_ADDRESS),
          lamports: 100000000,
        })
      );
      const signature = await sendTransaction(transaction, connection, {
        preflightCommitment: "confirmed",
        skipPreflight: false,
      });
      toast.dismiss(tl);
      toast.success("Payment successful", {
        description: `Signature: ${signature}`,
      });
      setSig(signature);
    } catch (error) {
      toast.dismiss(tl);
      toast.error((error as Error).message);
      console.log(error);
    }
    setLoading(false);
  }

  return (
    <div className="flex justify-center">
      <div className="max-w-screen-lg w-full">
        <div className="text-2xl text-left pt-20 w-full pl-4">
          Create a task
        </div>

        <label className="pl-4 block mt-2 text-md font-medium text-gray-900 text-black">
          Task details
        </label>

        <input
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          type="text"
          id="first_name"
          className="ml-4 mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          placeholder="What is your task?"
          required
        />

        <label className="pl-4 block mt-8 text-md font-medium text-gray-900 text-black">
          Add Images
        </label>
        <div className="flex justify-center pt-4 max-w-screen-lg">
          {images.map((image, index) => (
            <UploadImage
              image={image}
              key={index}
              onImageAdded={(imageUrl) => {
                setImages((i) => [...i, imageUrl]);
              }}
            />
          ))}
        </div>

        <div className="ml-4 pt-2 flex justify-center">
          <UploadImage
            onImageAdded={(imageUrl) => {
              setImages((i) => [...i, imageUrl]);
            }}
          />
        </div>

        <div className="flex justify-center">
          {loading ? (
            <button
              disabled={true}
              type="button"
              className="mt-4 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
            >
              {"Loading..."}
            </button>
          ) : sig ? (
            <button
              onClick={handleSubmit}
              type="button"
              disabled={loading}
              className="mt-4 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
            >
              {loading ? "Sumbiting..." : "Submit Task"}
            </button>
          ) : (
            <button
              onClick={makePayment}
              type="button"
              className="mt-4 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
            >
              {"Submit Task for 0.1 sol"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
