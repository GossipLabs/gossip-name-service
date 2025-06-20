const { Client, TokenCreateTransaction, AccountId, PrivateKey, Hbar } = require('@hashgraph/sdk');
const fs = require('fs');
const { TokenSupplyType } = require("@hashgraph/sdk");

// Config (Testnet, hardcoded)
const config = {
  operatorId: '0.0.5772303',
  operatorKey: 'ffb33aeb152a1544a72d5e6d0d3f8d10af44c51d0cfc65deacc4072636c67b7d', // Your HEX ED25519 key
  walletId: '0.0.5984005',
};

// Initialize client with ED25519 key
let client;
try {
  const privateKey = PrivateKey.fromStringED25519(config.operatorKey);
  client = Client.forTestnet().setOperator(AccountId.fromString(config.operatorId), privateKey);
  console.log('🔗 Client ready, operator ID:', config.operatorId);
} catch (error) {
  console.log(`🚫 Client Error: ${error.message}`);
  console.log('🔧 Fix: Check operatorKey is 64-char HEX ED25519 (not ECDSA/DER). Get it from https://portal.hedera.com/.');
  process.exit(1);
}

// Create Zeropoint I.D. Token
async function createZeroPointToken(walletId, name) {
  try {
    console.log(`📝 Creating Zeropoint I.D. Token: ${name}...`);
    const createTx = new TokenCreateTransaction({
          tokenName: "Zeropoint I.D. Token",
          tokenSymbol: "Ⓜ",
          supplyKey: 0xffb33aeb152a1544a72d5e6d0d3f8d10af44c51d0cfc65deacc4072636c67b7d,
          decimals: 8,
          supplyType: TokenSupplyType.Finite, // <-- This is required!
          initialSupply: 10_000_000,
          maxSupply: 10_000_000,
          treasuryAccountId: "0.0.5772303",
          tokenMemo: "mike@zeropoint.id.gossip",
});
    const tokenCreateTx = await new TokenCreateTransaction()
    .setTokenName("Zeropoint I.D. Token")
    .setTokenSymbol("ZID")
    .setTreasuryAccountId("0.0.5772303")
    .setInitialSupply(1000)
    .freezeWith(client);
    const tokenCreateSubmit = await tokenCreateTx.execute(client);
    const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(client);
    const tokenId = tokenCreateReceipt.tokenId.toString();

    console.log(`🎉 Token Created! ID: ${tokenId}`);
    console.log(`🔗 Check: https://hashscan.io/testnet/token/${tokenId}`);

    // Save token ID
    fs.writeFileSync('token-id.json', JSON.stringify({ tokenId, name, walletId }));
    console.log('📜 Token ID saved to token-id.json');

    return tokenId;
  } catch (error) {
    console.log(`🚫 Token Create Error: ${error.message}`);
    console.log('🔧 Fix: Check HBAR balance, key, wallet ID, or HTS settings. Visit https://portal.hedera.com/.');
    return null;
  }
}

// Run
(async () => {
  console.log('🎲 Gossip: Creating Zeropoint I.D. Token 🎲');
  const name = 'mike@zeropoint.id.gossip';
  await createZeroPointToken(config.walletId, name);
})();
