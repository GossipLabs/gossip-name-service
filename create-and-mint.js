const {
  Hbar,
  Client,
  AccountId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  PrivateKey,
} = require("@hashgraph/sdk");

async function createAndMintZeroPointToken(client, walletId, name, metadataBuffer) {
  try {
    // Step 1: Create NFT
    console.log(`📝 Creating Zeropoint I.D. Token: ${name}`);
    const tokenCreateTx = await new TokenCreateTransaction()
      .setTokenName(`Gossip Zeropoint I.D.: ${name}`)
      .setTokenSymbol('Ⓝ')
      .setTokenType(TokenType.NonFungibleUnique)
      .setSupplyType(TokenSupplyType.Finite)
      .setDecimals(0)
      .setInitialSupply(0)
      .setMaxSupply(1)
      .setTreasuryAccountId(AccountId.fromString(walletId))
      .setAdminKey(client.operatorPublicKey)
      .setSupplyKey(client.operatorPublicKey)
      .setMaxTransactionFee(new Hbar(50))
      .freezeWith(client);

    // Sign and execute
    const tokenCreateSign = await tokenCreateTx.sign(client.operatorPrivateKey);
    const tokenCreateSubmit = await tokenCreateSign.execute(client);
    const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(client);
    const tokenId = tokenCreateReceipt.tokenId.toString();
    console.log(`✅ Created NFT with Token ID: ${tokenId}`);

    // Step 2: Mint NFT
    const mintTx = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata([metadataBuffer]) // Pass an array of Buffers
      .freezeWith(client);

    const mintSign = await mintTx.sign(client.operatorPrivateKey);
    const mintSubmit = await mintSign.execute(client);
    const mintReceipt = await mintSubmit.getReceipt(client);
    console.log(`✅ Minted NFT with serial: ${mintReceipt.serials}`);

    return tokenId;
  } catch (error) {
    console.error("Error creating and minting NFT:", error);
    throw error;
  }
}
