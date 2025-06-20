const { Client, Hbar, TokenMintTransaction, TokenId, PrivateKey, AccountId } = require('@hashgraph/sdk');
const { ethers } = require('ethers');

// Hardcoded credentials for quick testing ONLY!
const OPERATOR_ID = "0.0.5772303";
const OPERATOR_KEY = "0xffb33aeb152a1544a72d5e6d0d3f8d10af44c51d0cfc65deacc4072636c67b7d";
const WALLET_ID = "YOUR_WALLET_ID"; // <-- IMPORTANT: Replace with the wallet ID
const TOKEN_ID = "YOUR_TOKEN_ID";   // <-- IMPORTANT: Replace with the TOKEN ID of the Gossip token

// Client
let client;
try {
    const operatorPrivateKey = PrivateKey.fromStringED25519(OPERATOR_KEY);
    const operatorAccountId = AccountId.fromString(OPERATOR_ID);
    client = Client.forTestnet().setOperator(operatorAccountId, operatorPrivateKey);
} catch (error) {
    console.error("Error setting up client:", error);
    process.exit(1);
}

async function mintZeropointNFT(accountId, name, tokenId) {
    try {
        console.log(`📝 Attempting to Mint Zeropoint I.D.: ${name} to wallet ${accountId} under token ${tokenId}...`);
        const tokenMintTx = new TokenMintTransaction()
            .setTokenId(tokenId)
            .addMetadata(Buffer.from(`Gossip Name Service (GNS): ${name} for ${accountId}`))
            .setMaxTransactionFee(new Hbar(10));

        const tokenMintSubmit = await tokenMintTx.execute(client);
        const tokenMintReceipt = await tokenMintSubmit.getReceipt(client);
        const serialNumber = tokenMintReceipt.serials[0].toNumber();

        console.log(`🎉 Minted Zeropoint I.D.! Serial Number: ${serialNumber} under Token ID: ${tokenId}`);
        console.log(`🔗 Check: https://hashscan.io/testnet/token/${tokenId}`);
        return serialNumber;

    } catch (error) {
        console.error("Error minting NFT:", error);
        return null;
    } finally {
        client.close();
    }
}

(async () => {
    console.log('🎲 Gossip: Attempting to Mint Zeropoint I.D. 🎲');
    const name = 'mike@zeropoint.id.gossip';
    const walletId = WALLET_ID;
    const tokenId = TOKEN_ID;

    if (walletId === "YOUR_WALLET_ID" || tokenId === "YOUR_TOKEN_ID") {
        console.error("⚠️ Please replace 'YOUR_WALLET_ID' and 'YOUR_TOKEN_ID' with your actual values!");
        process.exit(1);
    }

    await mintZeropointNFT(walletId, name, tokenId);
})();
