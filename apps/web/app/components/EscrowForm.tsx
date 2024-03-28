'use client' ;
import React, { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { initiateTransfer, revertTransfer, dispenseTransfer } from '../../../programs/escrow/escrow/app/solana/utils';

const EscrowForm = () => {
  const [providerAddress, setProviderAddress] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [amount, setAmount] = useState(0);
  const [treasuryPercentage, setTreasuryPercentage] = useState(5);
  const [escrowAccountAddress, setEscrowAccountAddress] = useState('');
  const [treasuryAddress, setTreasuryAddress] = useState('');
  
  
  const handleInitiateTransfer = async () => {
    try {
      await initiateTransfer(new PublicKey(providerAddress), new PublicKey(receiverAddress), amount);
      console.log('Transfer initiated successfully!');
    } catch (error) {
      console.error('Error initiating transfer:', error);
    }
  };

  const handleRevertTransfer = async () => {
    try {
      await revertTransfer(new PublicKey(providerAddress), escrowAccountAddress);
      console.log('Transfer reverted successfully!');
    } catch (error) {
      console.error('Error reverting transfer:', error);
    }
  };

  const handleDispenseTransfer = async () => {
    try {
     
      await dispenseTransfer(new PublicKey(receiverAddress), escrowAccountAddress, treasuryAddress, treasuryPercentage);
      console.log('Transfer dispensed successfully!');
    } catch (error) {
      console.error('Error dispensing transfer:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Provider Address"
        value={providerAddress}
        onChange={(e) => setProviderAddress(e.target.value)}
      />
      <input
        type="text"
        placeholder="Receiver Address"
        value={receiverAddress}
        onChange={(e) => setReceiverAddress(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <input
        type="number"
        placeholder="Treasury Percentage"
        value={treasuryPercentage}
        onChange={(e) => setTreasuryPercentage(Number(e.target.value))}
      />
      <button onClick={handleInitiateTransfer}>Initiate Transfer</button>
      <button onClick={handleRevertTransfer}>Revert Transfer</button>
      <button onClick={handleDispenseTransfer}>Dispense Transfer</button>
    </div>
  );
};

export default EscrowForm;