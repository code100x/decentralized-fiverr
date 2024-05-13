import nacl from "tweetnacl";
import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { S3Client } from "@aws-sdk/client-s3";
import jwt from "jsonwebtoken";
import {
  ACCESS_KEY_ID,
  ACCESS_SECRET,
  BUCKET_NAME,
  JWT_SECRET,
  PARENT_WALLET_PUBLIC_KEY,
  REGION,
  RPC_URL,
  TOTAL_DECIMALS,
} from "../config";
import { authMiddleware } from "../middleware";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { createTaskInput } from "../types";
import { Connection, PublicKey } from "@solana/web3.js";
import { z } from "zod";

const connection = new Connection(RPC_URL);

const DEFAULT_TITLE = "Select the most clickable thumbnail";

const s3Client = new S3Client({
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: ACCESS_SECRET,
  },
  region: REGION,
});

const router = Router();

const prismaClient = new PrismaClient();

router.get("/task", authMiddleware, async (req, res) => {
  // @ts-ignore
  const taskId: string = req.query.taskId;
  // @ts-ignore
  const userId: string = req.userId;
  if(!taskId || !userId){
    return res.status(411).json({message:"Send task Id"});;
  }
  const taskDetails = await prismaClient.task.findFirst({
    where: {
      user_id: Number(userId),
      id: Number(taskId),
    },
    include: {
      options: true,
    },
  });

  if (!taskDetails) {
    return res.status(411).json({
      message: "You dont have access to this task",
    });
  }

  // Todo: Can u make this faster?
  const responses = await prismaClient.submission.findMany({
    where: {
      task_id: Number(taskId),
    },
    include: {
      option: true,
    },
  });

  const result: Record<
    string,
    {
      count: number;
      option: {
        imageUrl: string;
      };
    }
  > = {};

  taskDetails.options.forEach((option) => {
    result[option.id] = {
      count: 0,
      option: {
        imageUrl: option.image_url,
      },
    };
  });

  responses.forEach((r) => {
    result[r.option_id].count++;
  });

  res.json({
    result,
    taskDetails,
  });
});

router.post("/task", authMiddleware, async (req, res) => {
  //@ts-ignore
  const userId = req.userId;
  // validate the inputs from the user;
  const body = req.body;
  const parseData = createTaskInput.safeParse(body);

  const user = await prismaClient.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!parseData.success) {
    return res.status(411).json({
      message: "You've sent the wrong inputs",
    });
  }

  const transaction = await connection.getTransaction(
    parseData.data.signature,
    {
      commitment: "confirmed",
    }
  );

  if (!transaction || !transaction.meta) {
    return res.status(404).json({ message: "Transaction not found." });
  }

  if (
    transaction.meta.postBalances[1] - transaction.meta.preBalances[1] !==
    100000000
  ) {
    return res.status(411).json({
      message: "Transaction signature/amount incorrect",
    });
  }
  if (!PARENT_WALLET_PUBLIC_KEY) {
    return res.json({ message: "Set the Parent Wallet Public Key" });
  }
  if (
    transaction?.transaction.message.getAccountKeys().get(1)?.toString() !==
    PARENT_WALLET_PUBLIC_KEY
  ) {
    return res.status(411).json({
      message: "Transaction sent to wrong address",
    });
  }

  if (
    transaction?.transaction.message.getAccountKeys().get(0)?.toString() !==
    user?.address
  ) {
    return res.status(411).json({
      message: "Transaction sent to wrong address",
    });
  }
  // was this money paid by this user address or a different address?

  // parse the signature here to ensure the person has paid 0.1 SOL
  // const transaction = Transaction.from(parseData.data.signature);

  let response = await prismaClient.$transaction(async (tx) => {
    const response = await tx.task.create({
      data: {
        title: parseData.data.title ?? DEFAULT_TITLE,
        amount: 0.1 * TOTAL_DECIMALS,
        //TODO: Signature should be unique in the table else people can reuse a signature
        signature: parseData.data.signature,
        user_id: userId,
      },
    });

    await tx.option.createMany({
      data: parseData.data.options.map((x) => ({
        image_url: x.imageUrl,
        task_id: response.id,
      })),
    });

    return response;
  });

  console.log("task ID :", response.id);
  res.json({
    id: response.id,
  });
});

router.get("/presignedUrl", authMiddleware, async (req, res) => {
  // @ts-ignore
  const userId = req.userId;

  try {
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: BUCKET_NAME,
      Key: `fiver/${userId}/${Math.random()}/image.jpg`,
      Conditions: [
        ["content-length-range", 0, 5 * 1024 * 1024], // 5 MB max
      ],
      Expires: 3600,
    });

    return res.json({
      preSignedUrl: url,
      fields,
    });
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
});

router.post("/signin", async (req, res) => {
  const { success, data } = z
    .object({
      publicKey: z.string(),
      signature: z.string(),
    })
    .safeParse(req.body);
  if (!success) {
    return res.status(411).json({ message: "Invalid Inputs" });
  }
  const { publicKey, signature } = data;
  try {
    const sig = new Uint8Array(signature.split(",").map(Number));
    const message = new TextEncoder().encode("Sign into mechanical turks");

    const result = nacl.sign.detached.verify(
      message,
      sig,
      new PublicKey(publicKey).toBytes()
    );

    if (!result) {
      return res.status(411).json({
        message: "Incorrect signature",
      });
    }

    const existingUser = await prismaClient.user.findFirst({
      where: {
        address: publicKey,
      },
    });

    if (existingUser) {
      const token = jwt.sign(
        {
          userId: existingUser.id,
        },
        JWT_SECRET
      );

      res.json({
        token,
      });
    } else {
      const user = await prismaClient.user.create({
        data: {
          address: publicKey,
        },
      });

      const token = jwt.sign(
        {
          userId: user.id,
        },
        JWT_SECRET
      );

      res.json({
        token,
      });
    }
  } catch (error) {
    console.log("INTERNAL_SERVER_ERROR, SIGNIN FAILED");
    return res.status(500).json({
      message: "INTERNAL_SERVER_ERROR, SIGNIN FAILED",
      description: (error as Error).message,
    });
  }
});

export default router;
