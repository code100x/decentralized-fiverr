import { PrismaClient } from "@prisma/client";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { DoneCallback, Job } from "bull";
import { PARENT_WALLET_PUBLIC_KEY } from "../config";
import { RPC_URL, SWEEPER_WORKER_ENDPOINT, TOTAL_DECIMALS } from "../config";
import { fetchShares, recoverPrivateKey } from "../sss";
import axios from "axios";
const prismaClient = new PrismaClient();
const connection = new Connection(RPC_URL);

export const process_Queue = async (job: Job, done: DoneCallback) => {
  const { workerId } = job.data as {
    workerId: number;
  };
  console.log("\n\nInitializing Transaction");
  await prismaClient.$transaction(async (tx) => {
    const worker = await tx.worker.findUnique({
      where: { id: workerId },
    });

    let signature: string;
    try {
      if (!worker) {
        throw new Error("Worker Not Found");
      }
      if (!PARENT_WALLET_PUBLIC_KEY) {
        throw new Error("Set parent public key");
      }
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(PARENT_WALLET_PUBLIC_KEY),
          toPubkey: new PublicKey(worker.address),
          lamports: (1000_000_000 * worker.locked_amount) / TOTAL_DECIMALS,
        })
      );

      const keypair = recoverPrivateKey(await fetchShares());
      // long running
      signature = await connection.sendTransaction(transaction, [keypair], {
        preflightCommitment: "confirmed",
        skipPreflight: false,
      });
      console.log(
        `User ${workerId} was payed, ${
          (1000_000_000 * worker.locked_amount) / TOTAL_DECIMALS
        } lamports, signature: ${signature}`
      );
    } catch (error) {
      console.log((error as Error).message);
      return;
    }
    await tx.worker.update({
      where: { id: workerId },
      data: { locked_amount: { decrement: worker.locked_amount } },
    });
    await tx.payouts.create({
      data: {
        worker_id: workerId,
        amount: worker.locked_amount,
        status: "Success",
        signature: signature,
      },
    });
    console.log(
      "Worker's locked amount and payout is cleared, Transaction Successful.\n\n"
    );
  });
};
