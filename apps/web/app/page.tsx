'use client';
import { useSession } from 'next-auth/react';
import Landing from '../components/landing';
import { Skeleton } from '@repo/ui/components/ui/skeleton';

function Main() {
  return <div>Main //working on homepage</div>;
}

export default function Home() {
  const { data: session, status } = useSession();
  return (
    <main>
      {status === 'unauthenticated' ? (
        <Landing />
      ) : status === 'loading' ? (
        <>
          <h1 className='text-center '>Loading...</h1>
        </>
      ) : (
        <Main />
      )}
    </main>
  );
}
