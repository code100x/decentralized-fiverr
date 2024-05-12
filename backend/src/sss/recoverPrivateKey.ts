// @ts-ignore
import sss from "shamirs-secret-sharing";
import { THRESHOLD } from "../config";

/**
 * Call this function by sending atleast 3 shares to get back private key 
 */
function recoverPrivateKey(sharesArray: Array<Uint8Array | number>) {
  if (!sharesArray || sharesArray.length < THRESHOLD) {
    throw new Error("Minimum threshold required");
  }
  try {
    const recovered = sss.combine(sharesArray);
    return recovered.toString();
  } catch (error) {
    throw new Error(
      "Could not recover the private key, send a valid uint8 array"
    );
  }
}
/**
 * Each server will use this reusable function to get the share it holds and sends it via server
 * shareString = process.env.SHARE
 */
function convertShareStringtoArray(shareString: string) {
  const share = shareString.split(",").map(Number);
  return share;
}
