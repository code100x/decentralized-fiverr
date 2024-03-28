"use strict";

import * as anchor from '@project-serum/anchor';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { web3,Provider } from '@project-serum/anchor';

const solanaNetwork = clusterApiUrl('devnet');
const connection = new Connection(solanaNetwork);

const escrowProgramId = new PublicKey('Fyy4D9ht44sXxTdwQEUH8DDQg2WuM3zF8sUR6pBVLjaq'); // Update your p ID
const wallet = new anchor.Wallet(web3.Keypair.generate());

const  provider = new anchor.Provider(connection, wallet);
anchor.setProvider(provider);

const escrowProgram = anchor.workspace.Escrow;

export const initiateTransfer = async (
  providerAddress: PublicKey,
  receiverAddress: PublicKey,
  amount: number
) => {
  const escrowAccount = anchor.web3.Keypair.generate();
  const tx = await escrowProgram.methods
    .initiateTransfer(providerAddress, receiverAddress, new anchor.BN(amount))
    .accounts({
      escrowAccount: escrowAccount.publicKey,
      providerAccount: providerAddress,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([escrowAccount])
    .rpc();
  console.log(`Transaction: ${tx}`);
};

export const revertTransfer = async (
  providerAddress: PublicKey,
  escrowAccountAddress: PublicKey
) => {
  const escrowAccount = await escrowProgram.account.escrowAccount.fetch(escrowAccountAddress);
  const tx = await escrowProgram.methods
    .revertTransfer()
    .accounts({
      escrowAccount: escrowAccountAddress,
      providerAccount: providerAddress,
    })
    .rpc();
  console.log(`Transaction: ${tx}`);
};

export const dispenseTransfer = async (
  receiverAddress: PublicKey,
  escrowAccountAddress: PublicKey,
  treasuryAddress: PublicKey,
  treasuryPercentage: number
) => {
  const escrowAccount = await escrowProgram.account.escrowAccount.fetch(escrowAccountAddress);
  const tx = await escrowProgram.methods
    .dispenseTransfer(treasuryPercentage)
    .accounts({
      escrowAccount: escrowAccountAddress,
      receiverAccount: receiverAddress,
      treasuryAccount: treasuryAddress,
    })
    .rpc();
  console.log(`Transaction: ${tx}`);
};