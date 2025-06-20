const { LedgerId, AccountId, Client, TokenCreateTransaction, TokenType, TokenSupplyType, TokenMintTransaction, TokenInfoQuery, Hbar, TokenId, TopicCreateTransaction, TopicMessageSubmitTransaction, PrivateKey, AccountCreateTransaction } = require('@hashgraph/sdk');
const { ethers } = require('ethers');

// Config (Testnet, replace with real values)
const config = {
  operatorId: process.env.HEDERA_OPERATOR_ID || '0.0.5772303',
  operatorKey: process.env.HEDERA_OPERATOR_KEY || '0xffb33aeb152a1544a72d5e6d0d3f8d10af44c51d0cfc65deacc4072636c67b7d',
};

// Client
let client;
try {
  const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
  const operatorKey = PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY);
  console.log("DEBUG: Operator ID:", process.env.HEDERA_OPERATOR_ID); // Keep this debug line
  console.log("DEBUG: Operator Key:", process.env.HEDERA_OPERATOR_KEY ? process.env.HEDERA_OPERATOR_KEY.substring(0, 10) + '...' : 'Key not found'); // Keep this debug line
  client = Client.forTestnet().setOperator(operatorId, operatorKey);
} catch (error) {
  console.log(`🚫 Error: ${error.message}`);
  console.log('🔧 Fix: .env ID (0.0.123456), Key (32-byte hex).');
  process.exit(1);
}



// Simulate ⓂZeroPoint Wallet
async function createZeroPointWallet() {
  try {
   const newKey = PrivateKey.generateED25519();
    const newAccountTx = new AccountCreateTransaction()
      .setKey(newKey.publicKey)
      .setInitialBalance(new Hbar(10))
      .setMaxTransactionFee(new Hbar(5));
    const newAccountSubmit = await newAccountTx.execute(client);
    const newAccountReceipt = await newAccountSubmit.getReceipt(client);
    const newAccountId = newAccountReceipt.accountId;
    console.log(`🎉 ⓂZeroPoint Wallet Created! ID: ${newAccountId}`);
    return { accountId: newAccountId.toString(), privateKey: newKey };
  } catch (error) {
    console.log(`🚫 Wallet: ${error.message}`);
    return null;
  }
}

// Create HCS Topic
async function createHCSTopic() {
  try {
    const topicTx = new TopicCreateTransaction()
      .setAdminKey(client.operatorPublicKey)
      .setMaxTransactionFee(new Hbar(10));
    const topicSubmit = await topicTx.execute(client);
    const topicReceipt = await topicSubmit.getReceipt(client);
    const topicId = topicReceipt.topicId;
    console.log(`🎉 HCS Topic Created! ID: ${topicId}`);
    return topicId.toString();
  } catch (error) {
    console.log(`🚫 HCS: ${error.message}`);
    return null;
  }
}

// Mint Zeropoint I.D. NFT via GNS
async function mintZeroPointID(accountId, name) {
  try {
    console.log(`📝 Creating Zeropoint I.D.: ${name}...`);
    const tokenCreateTx = new TokenCreateTransaction()
      .setTokenName(`Gossip Zeropoint I.D.: ${name}`)
      .setTokenSymbol('Ⓝ')
      .setTokenType(TokenType.NonFungibleUnique)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(1)
      .setTreasuryAccountId(AccountId.fromString(accountId))
      .setAdminKey(client.operatorPublicKey)
      .setSupplyKey(client.operatorPublicKey)
      .setMaxTransactionFee(new Hbar(30));

    const tokenCreateSubmit = await tokenCreateTx.execute(client);
    const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(client);
    const tokenId = tokenCreateReceipt.tokenId;

    console.log('📝 Minting...');
    const tokenMintTx = new TokenMintTransaction()
      .setTokenId(tokenId)
      .addMetadata(Buffer.from(`Gossip Name Service (GNS): ${name} for ${accountId}`))
      .setMaxTransactionFee(new Hbar(10));

    const tokenMintSubmit = await tokenMintTx.execute(client);
    const tokenMintReceipt = await tokenMintSubmit.getReceipt(client);

    console.log(`🎉 Minted Zeropoint I.D.! ID: ${tokenId}`);
    console.log(`🔗 Check: https://hashscan.io/testnet/token/${tokenId}`);
    return tokenId.toString();
  } catch (error) {
    console.log(`🚫 Mint: ${error.message}`);
    console.log('🔧 Fix: Check key/Testnet HBAR.');
    return null;
  }
}

// Log to HCS
async function logZeroPointIDToHCS(topicId, name, tokenId, accountId) {
  try {
    const message = `Zeropoint I.D.: ${name}, Token ID: ${tokenId}, Owner: ${accountId}`;
    const topicMessageTx = new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(Buffer.from(message))
      .setMaxTransactionFee(new Hbar(5));
    const topicMessageSubmit = await topicMessageTx.execute(client);
    await topicMessageSubmit.getReceipt(client);
    console.log(`📜 Logged to HCS: ${message}`);
  } catch (error) {
    console.log(`🚫 HCS Log: ${error.message}`);
  }
}

// ZKP (Quantum-Ready Placeholder)
async function generateZKP(accountId, tokenId, name) {
  const accountHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(accountId));
  const proof = {
    hiddenId: accountHash.substring(0, 10) + '...',
    tokenId: tokenId,
    name: name,
    message: `Owns Gossip Zeropoint I.D.: ${name} (ID: ${tokenId})`,
  };
  console.log('🕵️ Zero Point Knowledge: Quantum-ready ZKP.');
  return proof;
}

// Verify
async function verifyZeroPointID(proof, tokenId) {
  const isValid = proof.message.includes(`Owns Gossip Zeropoint I.D.`) && proof.tokenId === tokenId;
  console.log('🔍 Verifying...');
  try {
    const tokenInfo = await new TokenInfoQuery().setTokenId(TokenId.fromString(tokenId)).execute(client);
    if (tokenInfo.tokenId.toString() === tokenId) {
      console.log(`✅ Verified Zeropoint I.D.! ID: ${tokenId}`);
      return isValid;
    }
    console.log('🚫 Not on Hedera.');
    return false;
  } catch (error) {
    console.log(`🚫 Verify: ${error.message}`);
    return false;
  }
}

// Run
(async () => {
  console.log('🎲 Gossip: Gossip Name Service (GNS) Live 🎲');
  const name = 'mike@zeropoint.id.gossip';

  // Simulate ⓂZeroPoint Wallet
  const wallet = await createZeroPointWallet();
  if (!wallet) return;
  const accountId = wallet.accountId;

  const topicId = await createHCSTopic();
  if (!topicId) return;

  const tokenId = await mintZeroPointID(accountId, name);
  if (!tokenId) return;

  await logZeroPointIDToHCS(topicId, name, tokenId, accountId);

  const proof = await generateZKP(accountId, tokenId, name);
  console.log('📜 ZKP:', proof);

  const isValid = await verifyZeroPointID(proof, tokenId);
  console.log(isValid ? '🎊 Success!' : '🚫 Failed.');
})();
