"use client";
import {
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '@/utils';

export const Appbar = () => {
    const { publicKey , signMessage} = useWallet();
    const [balance, setBalance] = useState(0);

    async function signAndSend() {
        if (!publicKey) {
            return;
        }
        const message = new TextEncoder().encode("Sign into mechanical turks as a worker");
        const signature = await signMessage?.(message);
        console.log(signature)
        console.log(publicKey)
        const response = await axios.post(`${BACKEND_URL}/v1/worker/signin`, {
            signature,
            publicKey: publicKey?.toString()
        });

        setBalance(response.data.amount)

        localStorage.setItem("token", response.data.token);
    }

    useEffect(() => {
        signAndSend()
    }, [publicKey]);

    return <div className="flex justify-between border-b pb-2 pt-2">
        <div className="text-2xl pl-4 flex justify-center pt-2">
            Turkify
        </div>
        <div className="text-xl pr-4 flex" >
            <button onClick={() => {
                axios.post(`${BACKEND_URL}/v1/worker/payout`, {
                    
                }, {
                    headers: {
                        "Authorization": localStorage.getItem("token")
                    }
                })
            }} className="m-2 mr-4 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">Pay me out ({balance}) SOL</button>
            {publicKey  ? <WalletDisconnectButton /> : <WalletMultiButton />}
        </div>
    </div>
}