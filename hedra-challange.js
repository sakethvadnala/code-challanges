const { 
    Client, 
    PrivateKey, 
    TokenCreateTransaction, 
    TokenMintTransaction, 
    TokenAssociateTransaction, 
    TransferTransaction, 
    Hbar 
} = require("@hashgraph/sdk");

async function main() {
    // Step 1: Configure the Hedera client
    const client = Client.forTestnet();
    client.setOperator(process.env.OPERATOR_ID, process.env.OPERATOR_KEY);

    // Step 2: Define treasury account (operator account)
    const treasuryKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
    const treasuryId = process.env.OPERATOR_ID;

    // Step 3: Create a fungible token
    console.log("Creating token...");
    const tokenCreateTx = await new TokenCreateTransaction()
        .setTokenName("MyToken")
        .setTokenSymbol("MTK")
        .setDecimals(2)
        .setInitialSupply(1000) // 1000.00 tokens
        .setTreasuryAccountId(treasuryId)
        .setAdminKey(treasuryKey)
        .setSupplyKey(treasuryKey)
        .execute(client);

    const tokenCreateRx = await tokenCreateTx.getReceipt(client);
    const tokenId = tokenCreateRx.tokenId;
    console.log(`Token Created: MyToken (${tokenId})`);

    // Step 4: Transfer tokens from treasury to a recipient
    const recipientId = "0.0.xxxx"; // Replace with the recipient account ID
    console.log("Transferring tokens...");
    const transferTx = await new TransferTransaction()
        .addTokenTransfer(tokenId, treasuryId, -50) // Treasury loses 50 tokens
        .addTokenTransfer(tokenId, recipientId, 50) // Recipient gains 50 tokens
        .execute(client);

    await transferTx.getReceipt(client);
    console.log(`Treasury Balance: 950`);
    console.log(`Recipient Balance: 50`);

    // Step 5: Mint additional tokens
    console.log("Minting additional tokens...");
    const mintTx = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .setAmount(500) // Mint 500 new tokens
        .execute(client);

    await mintTx.getReceipt(client);
    console.log("Minted 500 additional tokens.");

    // Step 6: Distribute minted tokens to multiple accounts
    const recipient2Id = "0.0.yyyy"; // Replace with another recipient account ID
    console.log("Distributing tokens...");
    const distributeTx = await new TransferTransaction()
        .addTokenTransfer(tokenId, treasuryId, -250) // Treasury loses 250 tokens
        .addTokenTransfer(tokenId, recipientId, 100) // Recipient gains 100 tokens
        .addTokenTransfer(tokenId, recipient2Id, 150) // Recipient2 gains 150 tokens
        .execute(client);

    await distributeTx.getReceipt(client);
    console.log("Tokens distributed successfully.");
}

main().catch((err) => {
    console.error(err);
});
