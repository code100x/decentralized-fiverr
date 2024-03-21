import Header from '@/components/Header/Header';
import WalletContextProvider from '@/components/WalletContextProvider';

export default function Home() {
  return (
    <main className="">
      <WalletContextProvider>
        <Header />
      </WalletContextProvider>
    </main>
  );
}
