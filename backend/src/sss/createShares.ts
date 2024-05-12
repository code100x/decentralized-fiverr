// @ts-ignore
import sss from "shamirs-secret-sharing";
import { SHARES, THRESHOLD } from "../config";
import fs from "fs";
/**
 * Call this function to generate an env file which will have all shares
 */
export function createShares(privateKey: string) {
  const secret = Buffer.from(privateKey);
  let data = "";
  const shares = sss.split(secret, { shares: SHARES, threshold: THRESHOLD });
  shares.forEach((share: Buffer, index: number) => {
    const number = index + 1;
    const shareString = new Uint8Array(share).toString();
    data = data.concat(`# SHARE_${number} \n SHARE="${shareString}" \n`);
  });
  fs.writeFileSync("./src/sss/.env", data);
}
