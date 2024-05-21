import { BACKEND_URL } from "@/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import axios, { AxiosError } from "axios";
import { useEffect } from "react";
import { toast } from "sonner";

export function useWalletSession() {
  const wallet = useWallet();
  useEffect(() => {
    if (!wallet.publicKey || !wallet.signMessage) {
      return;
    }
    handleAuth(wallet.publicKey.toString(), wallet.signMessage);
  }, [wallet.publicKey]);
  return wallet;
}

function handleAuth(
  publicKey: string,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
) {
  axios
    .get(`${BACKEND_URL}/v1/worker/me`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    })
    .catch(async (err) => {
      toast("You are not authenticated, please log in.");
      if (err instanceof AxiosError && err.response?.status == 403) {
        const message = new TextEncoder().encode(
          "Sign into mechanical turks as a worker"
        );
        const signature = await signMessage(message);
        console.log(Array.from(signature));
        console.log(publicKey.toString());
        const response = await axios.post(`${BACKEND_URL}/v1/worker/signin`, {
          signature: Array.from(signature),
          publicKey: publicKey.toString(),
        });

        localStorage.setItem("token", response.data.token);

        toast.success("Logged In");
      } else {
        console.log(err);
        toast.error((err as Error).message);
        return;
      }
    });
}
