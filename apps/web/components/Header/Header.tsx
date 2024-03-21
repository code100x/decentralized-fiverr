'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React from 'react';
import '@solana/wallet-adapter-react-ui/styles.css';

export default function Header() {
  return (
    <div className="flex items-center justify-between py-2 px-4">
      {/* Left section */}
      <div>
        <h1 className="text-xl font-semibold">de-fiverr</h1>
      </div>

      <WalletMultiButton />
    </div>
  );
}
