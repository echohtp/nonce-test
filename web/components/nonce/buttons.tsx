'use client'
import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Keypair, NONCE_ACCOUNT_LENGTH, PublicKey, SystemProgram, Transaction, TransactionInstruction, TransactionMessage, VersionedTransaction, sendAndConfirmRawTransaction, sendAndConfirmTransaction } from '@solana/web3.js';

const NonceButtons: React.FC = () => {

    const wallet = useWallet()
    const { connection } = useConnection()

    const sendMemo = async () => {
        if (!wallet.publicKey || !wallet.signTransaction) return

        console.log(`create memo`)

        const memoIxs = [
            new TransactionInstruction({
                keys: [{ pubkey: wallet.publicKey, isSigner: true, isWritable: true }],
                data: Buffer.from("Data to send in transaction", "utf-8"),
                programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
            })
        ]

        // create v0 compatible message
        const messageV0 = new TransactionMessage({
            payerKey: wallet.publicKey,
            recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
            instructions: memoIxs,
        }).compileToV0Message();

        const tx = new VersionedTransaction(messageV0);

        const signed = await wallet.signTransaction(tx);
        const signature = await connection.sendTransaction(signed)
        console.log(`txhash: ${signature}`);



    }

    const createNonce = async () => {
        if (!wallet.publicKey || !wallet.signTransaction) return

        const nonceAccount = Keypair.generate();
        console.log(`nonce account: ${nonceAccount.publicKey.toBase58()}`);

        const ixs = [
            SystemProgram.createAccount({
                fromPubkey: wallet.publicKey,
                newAccountPubkey: nonceAccount.publicKey,
                lamports: await connection.getMinimumBalanceForRentExemption(
                    NONCE_ACCOUNT_LENGTH
                ),
                space: NONCE_ACCOUNT_LENGTH,
                programId: SystemProgram.programId,
            }),
            // init nonce account
            // SystemProgram.nonceInitialize({
            //     noncePubkey: nonceAccount.publicKey, // nonce account pubkey
            //     authorizedPubkey: wallet.publicKey
            // })
        ]

        // create v0 compatible message
        // const messageV0 = new TransactionMessage({
        //     payerKey: wallet.publicKey,
        //     recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
        //     instructions: ixs,
        // }).compileToV0Message();

        // const tx = new VersionedTransaction(messageV0);
        // const signed = await wallet.signTransaction(tx);
        // tx.addSignature(nonceAccount.publicKey, nonceAccount.secretKey)
        // const signature = await connection.sendTransaction(signed)
        // console.log(`txhash: ${signature}`);


        // from the demo code
        const tx = new Transaction().add(...ixs)
        
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
        tx.feePayer = wallet.publicKey
        
        tx.partialSign(nonceAccount)
        // await wallet.signTransaction(tx)
        const sig = await wallet.sendTransaction(tx, connection)
        console.log(`txhash: ${sig}`);




    }

    const closeNonce = async () => {
        if (!wallet.publicKey || !wallet.signTransaction) return

        const nonceAccount = Keypair.generate();
        console.log(`nonce account: ${nonceAccount.publicKey.toBase58()}`);

        const nonceAuthority = process.env.NEXT_PUBLIC_NONCE_AUTHORITY!

        const tx = new Transaction().add(
            // get nonce account information


            // init nonce account
            // SystemProgram.nonceWithdraw( {
            //     /** Nonce account */
            //     noncePubkey: PublicKey,
            //     /** Public key of the nonce authority */
            //     authorizedPubkey: new PublicKey(nonceAuthority),
            //     /** Public key of the account which will receive the withdrawn nonce account balance */
            //     toPubkey: wallet.publicKey,
            //     /** Amount of lamports to withdraw from the nonce account */
            //     lamports: number,
            // })
        )
        const blockhash = await connection.getLatestBlockhash()
        tx.recentBlockhash = blockhash.blockhash
        tx.feePayer = wallet.publicKey
        wallet.signTransaction(tx)
    }


    return (
        <div className="flex space-x-4">

            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={sendMemo}
            >
                Send Memo
            </button>

            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={createNonce}
            >
                Create
            </button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Advance
            </button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={closeNonce}
            >
                Close
            </button>
        </div>
    );
};

export default NonceButtons;
