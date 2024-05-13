import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import React from "react";

export default function WalletButton({
  publicKey,
}: {
  publicKey: string | null | undefined;
}) {
  return (
    <>
      {publicKey ? (
        <WalletDisconnectButton
          onClick={() => {
            window.localStorage.removeItem("token");
          }}
        />
      ) : (
        <WalletMultiButton />
      )}
    </>
  );
}
