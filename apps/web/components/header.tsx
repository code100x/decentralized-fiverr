'use client';
import React from 'react';
import Link from 'next/link';
import { getCsrfToken, signIn, signOut, useSession } from 'next-auth/react';
import { Button } from '@repo/ui/components/ui/button';
import { ModeToggle } from '@repo/ui/components/theme-toggle';
import { Skeleton } from '@repo/ui/components/ui/skeleton';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { SigninMessage } from '../utils/signin-message';
import bs58 from 'bs58';

export default function Header() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  const wallet = useWallet();
  const walletModal = useWalletModal();

  const handleSignIn = async () => {
    try {
      if (!wallet.connected) {
        walletModal.setVisible(true);
      }

      const csrf = await getCsrfToken();
      if (!wallet.publicKey || !csrf || !wallet.signMessage) return;

      const message = new SigninMessage({
        domain: window.location.host,
        publicKey: wallet.publicKey?.toBase58(),
        statement: `Sign this message to sign in to the app.`,
        nonce: csrf,
      });

      const data = new TextEncoder().encode(message.prepare());
      const signature = await wallet.signMessage(data);
      const serializedSignature = bs58.encode(signature);

      signIn('credentials', {
        message: JSON.stringify(message),
        redirect: false,
        signature: serializedSignature,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <nav className='border-b border-gray-300 p-1'>
      <div className='max-w-7xl mx-auto  py-2 flex  items-center'>
        <div>
          <Link className='text-xl font-medium' href='/'>
            Decentralized Fiverr
          </Link>
        </div>
        <div className='flex gap-4 ml-auto'>
          <ModeToggle />
          <div className='flex items-center'>
            {loading ? (
              <Skeleton className='h-10 w-32 rounded-xl'></Skeleton>
            ) : (
              <>
                {!session && (
                  <Button onClick={handleSignIn}>Connect Wallet</Button>
                )}
                {session?.user && (
                  <div className='flex items-center'>
                    {session.user.image && (
                      <Link
                        href={`/profile`}
                        className='flex items-center mr-4'
                      >
                        {/* <img
                        src={session.user.image}
                        alt='User'
                        className='w-10 h-10 rounded-full mr-2 cursor-pointer'
                      /> */}
                        <p className='text-gray-700 dark:text-gray-300'>
                          Profile
                        </p>
                      </Link>
                    )}
                  </div>
                )}
                {session && (
                  <Link
                    href={`/api/auth/signout`}
                    onClick={(e) => {
                      e.preventDefault();
                      signOut();
                    }}
                    className='underline'
                  >
                    <Button>Sign out</Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
