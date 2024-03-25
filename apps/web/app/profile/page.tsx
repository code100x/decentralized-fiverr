'use client';
import React from 'react';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/components/ui/button';
import { Badge } from '@repo/ui/components/ui/badge';
export default function Profile() {
  const { data: session } = useSession();
  const router = useRouter();
  return (
    <div>
      <div className=' mx-auto px-4 py-8'>
        <Button onClick={() => router.back()}>Back</Button>
        <h1 className='text-2xl font-bold my-4'>Profile Page</h1>
        {session && session.user && (
          <div className='flex items-center gap-5 border rounded-2xl border-gray-400 p-4 '>
            {session.user.image && (
              <img
                src={session.user.image}
                alt='User'
                className='w-10 h-10 rounded-full'
              />
            )}
            <p className='text-xl'>
              <span className='font-bold '>Address:</span> {session.user.name}
            </p>
          </div>
        )}
        {!session && (
          <p className='text-red-500'>
            You need to sign in to view your profile.
          </p>
        )}
      </div>
    </div>
  );
}
