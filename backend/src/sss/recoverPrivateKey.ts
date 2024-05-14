// @ts-ignore
import sss from "shamirs-secret-sharing";
import { DISTRIBUTED_SERVER_ENDPOINTS, THRESHOLD } from "../config";
import { Keypair } from "@solana/web3.js";
import { decode } from "bs58";
import axios from "axios";

/**
 * Call this function by sending atleast 3 shares to get back private key
 */
export function recoverPrivateKey(sharesArray: Array<Uint8Array | number[]>) {
  if (!sharesArray || sharesArray.length < THRESHOLD) {
    throw new Error("Minimum threshold required");
  }
  try {
    const recovered = sss.combine(sharesArray);
    const keypair = Keypair.fromSecretKey(decode(recovered.toString()));
    return keypair;
  } catch (error) {
    throw new Error(
      "Could not recover the private key, send a valid uint8 array"
    );
  }
}

export async function fetchShares() {
  const sharesArray = [] as Array<number[]>;
  const requests = DISTRIBUTED_SERVER_ENDPOINTS.map((endpoint) =>
    axios
      .get(`${endpoint}/share`)
      .then((res) => {
        const share = res.data.share as string;
        if (share) {
          const shareArray = share.split(",").map(Number);
          sharesArray.push(shareArray);
        }
      })
      .catch((err) => console.log(err.message))
  );

  const a = await Promise.all(requests).then(() => {
    return sharesArray;
  });
  return a;
}
