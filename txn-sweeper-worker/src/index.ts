import express, { Request, Response } from "express";
import { z } from "zod";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
import { Connection } from "@solana/web3.js";
const prismaClient = new PrismaClient();
const connection = new Connection(
  process.env.RPC_URL ?? "https://api.devnet.solana.com"
);

const app = express();

app.use(express.json());
app.use(cors());

const validateInput = z.object({
  payout: z.object({
    id: z.number(),
    user_id: z.number(),
    amount: z.number(),
    signature: z.string(),
    status: z.enum(["Processing", "Success", "Failure"]),
  }),
});
app.post("/sweep-tx", async (req: Request, res: Response) => {
  const body = req.body;
  const parsedBody = validateInput.safeParse(body);
  if (!parsedBody.success) {
    return res.json({ message: "Invalid Input" });
  }
  const {
    payout: { amount, id, signature, status, user_id },
  } = parsedBody.data;
  if (status === "Success" || status === "Failure") {
    return res.json({ message: "Payout has already been confirmed" });
  }
  let timerId;
  let intervalId = setInterval(async () => {
    const transaction = await connection.getSignatureStatus(signature);
    if (!transaction.value) {
      return res.status(400).json({ message: "Invalid Signature" });
    }
    if (transaction.value.confirmationStatus === "confirmed") {
      await prismaClient.$transaction(async (tx) => {
        // clear lock amount
        await tx.worker.update({
          where: {
            id: user_id,
          },
          data: {
            locked_amount: {
              decrement: amount,
            },
          },
        });
        // update the payout check
        await tx.payouts.update({
          where: { id },
          data: {
            status: "Success",
          },
        });
      });

      clearInterval(intervalId);
      return res.status(200);
    }
  }, 3000);
  // send the locked_amount back to pending amount and make user sign a new transaction
  timerId = setTimeout(async () => {
    clearInterval(intervalId);
    await prismaClient.$transaction(async (tx) => {
      await tx.worker.update({
        where: {
          id: user_id,
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
      await tx.payouts.update({
        where: {
          id,
        },
        data: {
          status: "Failure",
        },
      });
    });
    return res.status(408).json({ message: "Transaction timed out" });
  }, 1000 * 60 * 3); // try for maximum three minutes
});

app.listen(7777);
