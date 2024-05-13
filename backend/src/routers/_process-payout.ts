import { $Enums, PrismaClient } from "@prisma/client";
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
  const { userId } = job.data as {
    userId: number;
  };
  const worker = (await prismaClient.worker.findUnique({
    where: { id: userId },
  }))!;
  const amount = worker.pending_amount;
  await prismaClient.worker.update({
    where: {
      id: userId,
    },
    data: {
      pending_amount: {
        decrement: amount,
      },
      locked_amount: {
        increment: amount,
      },
    },
  });
  let payout: null | {
    id: number;
    user_id: number;
    amount: number;
    signature: string;
    status: $Enums.TxnStatus;
  } = null;
  try {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(PARENT_WALLET_PUBLIC_KEY),
        toPubkey: new PublicKey(worker.address),
        lamports: (1000_000_000 * amount) / TOTAL_DECIMALS,
      })
    );

    const keypair = recoverPrivateKey(await fetchShares());
    const signature = await connection.sendTransaction(transaction, [keypair], {
      skipPreflight: true, // skip the preflight checks just send the transaction
    });
    const p = await prismaClient.payouts.create({
      data: {
        user_id: userId,
        amount: amount,
        status: "Processing",
        signature: signature,
      },
    });
    payout = p;

    await axios.post(`${SWEEPER_WORKER_ENDPOINT}/sweep-tx`, {
      payout,
    });
    done(null, { p });
  } catch (error) {
    console.log(`INTERNAL_SERVER_ERROR: ${(error as Error).message} `);
    // send money back from locked to pending stage and make user sign again
    await prismaClient.$transaction(async (tx) => {
      await prismaClient.worker.update({
        where: {
          id: userId,
        },
        data: {
          pending_amount: {
            increment: amount,
          },
          locked_amount: {
            decrement: amount,
          },
        },
      });
      if (payout) {
        await prismaClient.payouts.update({
          where: { id: payout.id },
          data: {
            status: "Failure",
          },
        });
      }
    });
    done(new Error((error as Error).message));
  }
};
