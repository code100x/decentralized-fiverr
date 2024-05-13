import { PrismaClient } from "@prisma/client";
import { PublicKey } from "@solana/web3.js";
import Bull from "bull";
import { Router } from "express";
import jwt from "jsonwebtoken";
import nacl from "tweetnacl";
import {
  TOTAL_DECIMALS,
  TOTAL_SUBMISSIONS,
  WORKER_JWT_SECRET,
} from "../config";
import { getNextTask } from "../db";
import { workerMiddleware } from "../middleware";
import { createSubmissionInput } from "../types";
import { process_Queue } from "./_process-payout";

const prismaClient = new PrismaClient();
const router = Router();

const payoutQueue = new Bull("payoutQueue", {
  redis: { port: 6379, host: "127.0.0.1" },
});
payoutQueue.process(process_Queue);
router.post("/payout", workerMiddleware, async (req, res) => {
  // @ts-ignore
  const userId = Number(req.userId);
  payoutQueue.add({ userId });
  return res.status(201).json({
    message: "Added Payout Request In The Queue...",
  });
});

router.get("/balance", workerMiddleware, async (req, res) => {
  // @ts-ignore
  const userId: string = req.userId;

  const worker = await prismaClient.worker.findFirst({
    where: {
      id: Number(userId),
    },
  });

  res.json({
    pendingAmount: worker?.pending_amount,
    lockedAmount: worker?.pending_amount,
  });
});

router.post("/submission", workerMiddleware, async (req, res) => {
  // @ts-ignore
  const userId = req.userId;
  const body = req.body;
  const parsedBody = createSubmissionInput.safeParse(body);

  if (parsedBody.success) {
    const task = await getNextTask(Number(userId));
    if (!task || task?.id !== Number(parsedBody.data.taskId)) {
      return res.status(411).json({
        message: "Incorrect task id",
      });
    }

    const amount = (Number(task.amount) / TOTAL_SUBMISSIONS).toString();

    const submission = await prismaClient.$transaction(async (tx) => {
      const submission = await tx.submission.create({
        data: {
          option_id: Number(parsedBody.data.selection),
          worker_id: userId,
          task_id: Number(parsedBody.data.taskId),
          amount: Number(amount),
        },
      });

      await tx.worker.update({
        where: {
          id: userId,
        },
        data: {
          pending_amount: {
            increment: Number(amount),
          },
        },
      });

      return submission;
    });

    const nextTask = await getNextTask(Number(userId));
    res.json({
      nextTask,
      amount,
    });
  } else {
    res.status(411).json({
      message: "Incorrect inputs",
    });
  }
});

router.get("/nextTask", workerMiddleware, async (req, res) => {
  // @ts-ignore
  const userId: string = req.userId;

  const task = await getNextTask(Number(userId));

  if (!task) {
    res.status(411).json({
      message: "No more tasks left for you to review",
    });
  } else {
    res.json({
      task,
    });
  }
});

router.post("/signin", async (req, res) => {
  const { publicKey, signature } = req.body;
  const message = new TextEncoder().encode(
    "Sign into mechanical turks as a worker"
  );

  const result = nacl.sign.detached.verify(
    message,
    new Uint8Array(signature.data),
    new PublicKey(publicKey).toBytes()
  );

  if (!result) {
    return res.status(411).json({
      message: "Incorrect signature",
    });
  }

  const existingUser = await prismaClient.worker.findFirst({
    where: {
      address: publicKey,
    },
  });

  if (existingUser) {
    const token = jwt.sign(
      {
        userId: existingUser.id,
      },
      WORKER_JWT_SECRET
    );

    res.json({
      token,
      amount: existingUser.pending_amount / TOTAL_DECIMALS,
    });
  } else {
    const user = await prismaClient.worker.create({
      data: {
        address: publicKey,
        pending_amount: 0,
        locked_amount: 0,
      },
    });

    const token = jwt.sign(
      {
        userId: user.id,
      },
      WORKER_JWT_SECRET
    );

    res.json({
      token,
      amount: 0,
    });
  }
});

export default router;
