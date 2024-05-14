"use client";
import { BACKEND_URL } from "@/utils";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

type Payout = {
  id: number;
  worker_id: number;
  amount: number;
  signature: string;
  status: string;
};
export default function Page() {
  const [payouts, setPayouts] = useState<Payout[] | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/v1/worker/payout`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((res) => {
        console.log(res.data[0].id);
        setPayouts(res.data);
      })
      .catch((err) => {
        console.log(err);
        // @ts-ignore
        if ((err as AxiosError).response?.status == "403") {
          return toast.error("You are unauthenticated, please log in");
        }
        // @ts-ignore
        toast.error((err as AxiosError).message);
      });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex justify-center flex-col">
        <div className="w-full flex justify-center text-xl">Loading...</div>
      </div>
    );
  }
  if (!payouts || payouts?.length == 0) {
    return (
      <div className="h-screen flex justify-center flex-col">
        <div className="w-full flex justify-center text-xl">
          You have no payouts.
        </div>
      </div>
    );
  }

  return (
    <table className="w-full table-auto">
      <thead>
        <tr className="bg-[#F0F0F0] text-gray-600">
          <th className="py-3 px-4 text-left">Id</th>
          <th className="py-3 px-4 text-left">Signature</th>
          <th className="py-3 px-4 text-left">Status</th>
          <th className="py-3 px-4 text-left">Amount</th>
        </tr>
      </thead>
      {payouts.map((payout) => (
        <tbody>
          <tr className="border-b">
            <td className="py-3 px-4">
              <div className="flex items-center gap-2">
                <span>{payout.id}</span>
              </div>
            </td>
            <Link
              target="_blank"
              href={`https://explorer.solana.com/tx/${payout.signature}`}
            >
              <td className="py-3 px-4 hover:underline">{payout.signature}</td>
            </Link>
            <td className="py-3 px-4">{payout.status}</td>
            <td className="py-3 px-4">{payout.amount / 1000_000} SOL</td>
          </tr>
        </tbody>
      ))}
    </table>
  );
}
