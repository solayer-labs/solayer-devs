# Solayer Token Deployment Guide

This guide provides step-by-step instructions for deploying SPL tokens on the Solayer network using the devnet RPC endpoint.

## Prerequisites

- Agave (Solana CLI) installed (version 2.2.0 or higher)
- SPL Token CLI installed (version 5.3.0 or higher)
- Basic understanding of Solana tokens and accounts

## Installation and Setup

### 1. Install Required Tools

```bash
# Install Agave (Solana CLI) - Latest stable version
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# Install SPL Token CLI
cargo install spl-token-cli

# Verify installations
solana --version
spl-token --version
```

### 2. Configure Solana CLI for Solayer Devnet

```bash
# Set cluster to Solayer devnet
solana config set --url https://devnet-rpc.solayer.org

# Set commitment level (recommended: finalized for production, processed for testing)
solana config set --commitment finalized

# Verify configuration
solana config get
```

## Wallet Setup

### 1. Create a New Wallet (if needed)

```bash
# Generate new keypair
solana-keygen new --outfile ~/.config/solana/id.json

# Or use existing wallet
solana config set --keypair ~/.config/solana/id.json
```

### 2. Fund Your Wallet

```bash
# Check current balance
solana balance

# Request airdrop (if available on devnet)
solana airdrop 2

# Verify balance
solana balance
```

**Note**: Ensure you have at least 1-2 SOL for token creation and operations.

## Token Deployment Process

### 1. Create Token Mint

```bash
# Create a new token mint
spl-token create-token

# Example output:
# Creating token 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHU
```

### 2. Create Token Account

```bash
# Create token account for your wallet
spl-token create-account [MINT_ADDRESS]

# Example:
# spl-token create-account 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHU
```

### 3. Mint Tokens

```bash
# Mint tokens to your account
spl-token mint [MINT_ADDRESS] [AMOUNT] [TOKEN_ACCOUNT]

# Example:
# spl-token mint 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHU 1000
```

### 4. Transfer Tokens

```bash
# Transfer tokens to another account
spl-token transfer [MINT_ADDRESS] [AMOUNT] [RECIPIENT] --allow-unfunded-recipient --fund-recipient

# Example:
# spl-token transfer 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHU 100 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --allow-unfunded-recipient --fund-recipient
```

## Token Management Commands

### Check Token Balance

```bash
# Check balance of a specific token
spl-token balance [MINT_ADDRESS]

# Example:
# spl-token balance 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHU
```

### Check Token Supply

```bash
# Check total supply of a token
spl-token supply [MINT_ADDRESS]

# Example:
# spl-token supply 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHU
```

### List All Token Accounts

```bash
# List all token accounts for your wallet
spl-token accounts
```

## Advanced Token Operations

### Freeze Token Account

```bash
# Freeze a token account (requires freeze authority)
spl-token freeze [TOKEN_ACCOUNT]
```

### Thaw Token Account

```bash
# Thaw a frozen token account (requires freeze authority)
spl-token thaw [TOKEN_ACCOUNT]
```

### Disable Mint Authority

```bash
# Disable minting (permanently)
spl-token authorize [MINT_ADDRESS] mint --disable
```

### Set New Authority

```bash
# Set new mint authority
spl-token authorize [MINT_ADDRESS] mint [NEW_AUTHORITY]

# Set new freeze authority
spl-token authorize [MINT_ADDRESS] freeze [NEW_AUTHORITY]
```

## Troubleshooting

### Common Issues and Solutions

1. **Transaction Confirmation Delays**
   - Wait a few seconds between operations
   - Try switching commitment levels: `solana config set --commitment processed`

2. **Account Not Found Errors**
   - Wait for network propagation (10-30 seconds)
   - Verify account addresses are correct
   - Check if the transaction was confirmed

3. **Insufficient Funds**
   - Ensure wallet has enough SOL for transaction fees
   - Account creation requires ~0.002 SOL rent

4. **Network Connectivity Issues**
   - Verify RPC endpoint: `solana config get`
   - Try different commitment levels
   - Check network status

### Commitment Levels

- **finalized**: Highest security, slower confirmation
- **confirmed**: Balanced security and speed
- **processed**: Fastest, lower security (good for testing)

```bash
# Change commitment level
solana config set --commitment processed
```

## Best Practices

1. **Test with small amounts** before large operations
3. **Keep track of mint addresses** and token accounts
4. **Backup your wallet keypair** securely
5. **Monitor transaction confirmations** before proceeding
6. **Use appropriate commitment levels** for your use case

## Network Information

- **RPC Endpoint**: `https://devnet-rpc.solayer.org`
- **Network**: Solayer Devnet
- **Recommended Commitment**: `finalized` for production, `processed` for testing

## Cost Estimates

- Token mint creation: ~0.00144 SOL
- Token account creation: ~0.00204 SOL
- Token minting: ~0.00001 SOL per transaction
- Token transfer: ~0.00001 SOL per transaction

## Security Considerations

1. **Never share your private key** or seed phrase
2. **Use hardware wallets** for production deployments
3. **Test thoroughly** on devnet before mainnet
4. **Keep authorities secure** (mint, freeze, etc.)
5. **Consider multi-signature** for high-value tokens

## Example Complete Workflow

Here's a complete example of creating and managing a token:

```bash
# 1. Configure environment
solana config set --url https://devnet-rpc.solayer.org
solana config set --commitment finalized

# 2. Create token
TOKEN_MINT=$(spl-token create-token | grep "Creating token" | awk '{print $3}')
echo "Token mint: $TOKEN_MINT"

# 3. Create token account
TOKEN_ACCOUNT=$(spl-token create-account $TOKEN_MINT | grep "Creating account" | awk '{print $3}')
echo "Token account: $TOKEN_ACCOUNT"

# 4. Mint tokens
spl-token mint $TOKEN_MINT 1000 $TOKEN_ACCOUNT

# 5. Check balance
spl-token balance $TOKEN_MINT

# 6. Check supply
spl-token supply $TOKEN_MINT
```

## Support and Resources

- **Solayer Documentation**: [Official Docs]
- **SPL Token Documentation**: [Solana SPL Token Guide]
- **Agave (Solana) CLI Reference**: [Anza CLI Docs](https://docs.anza.xyz/cli)
- **Anza GitHub**: [Agave Repository](https://github.com/anza-xyz/agave)

---

This guide provides a comprehensive overview of token deployment on Solayer devnet. Always test thoroughly and follow security best practices when deploying tokens.
