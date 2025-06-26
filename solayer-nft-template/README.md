# Solayer NFT Deployment Template

A secure, production-ready template for deploying NFTs on the Solayer network with IPFS storage and comprehensive deployment tracking.

> **Part of the [solayer-devs](https://github.com/solayer-labs/solayer-devs) repository** - This template provides everything you need to deploy NFTs on Solayer Devnet. 

## 🚀 Quick Start

### Option 1: Fork the Repository

1. **Fork** the `solayer-devs` repository on GitHub
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/solayer-devs.git
   cd solayer-devs/solayer-nft-template
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```

### Option 2: Copy the Template

1. **Download or copy** the `solayer-nft-template` folder from the solayer-devs repository
2. **Navigate to the template directory**:
   ```bash
   cd solayer-nft-template
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```

### Next Steps

4. **Configure your environment** (see [Configuration](#configuration))
5. **Deploy your NFT**:
   ```bash
   npm run deploy
   ```

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Solana wallet** with some SOL for transaction fees
- **Pinata account** (optional, for IPFS storage)
- **Image file** hosted on IPFS or accessible URL

## ⚙️ Configuration

### 1. Environment Setup

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

### 2. Required Environment Variables

```env
# Solana Configuration
SOLANA_RPC_URL=https://devnet-rpc.solayer.org
SOLANA_KEYPAIR_PATH=~/.config/solana/id.json
NETWORK=devnet

# IPFS Configuration (Optional - for metadata storage)
PINATA_JWT=your_pinata_jwt_token_here
PINATA_GATEWAY=https://gateway.pinata.cloud

# API Server Configuration
PORT=3000
NODE_ENV=development

# NFT Configuration
DEFAULT_METADATA_FILE=assets/nft-metadata.json
```

### 3. Keypair Setup

Ensure your Solana keypair file exists at the specified path:

```bash
# Check if keypair exists
ls ~/.config/solana/id.json

# If not, create one:
solana-keygen new --outfile ~/.config/solana/id.json
```

### 4. Wallet Funding

Fund your wallet with devnet SOL (at least 0.01 SOL for deployment):

```bash
# Using Solana CLI
solana airdrop 1 --url devnet

# Or visit: https://faucet.solana.com
```

## 🎨 NFT Metadata Configuration

Edit `assets/nft-metadata.json` with your NFT details:

```json
{
  "name": "Your NFT Name",
  "symbol": "YNN", 
  "description": "Description of your NFT",
  "image": "https://your-ipfs-gateway.com/ipfs/your-image-hash",
  "attributes": [
    {
      "trait_type": "Category",
      "value": "Art"
    },
    {
      "trait_type": "Rarity", 
      "value": "Rare"
    }
  ]
}
```

### Image Upload Options

1. **IPFS Upload**: Use the included script to upload your image:
   ```bash
   node scripts/upload_to_ipfs.js path/to/your/image.png
   ```

2. **Manual Upload**: Upload to Pinata or another IPFS service and use the resulting URL

3. **Alternative Storage**: Any publicly accessible URL works

## 🚀 Deployment

### Basic Deployment

Deploy using the default metadata file:

```bash
npm run deploy
```

### Custom Metadata File

Deploy with a specific metadata file:

```bash
node scripts/deploy_nft.js path/to/custom-metadata.json
```

### Deployment Process

The deployment script will:

1. ✅ Validate configuration and prerequisites
2. 🔍 Verify metadata and image accessibility  
3. 📤 Upload metadata to IPFS (if configured)
4. 🎯 Generate mint address and associated token account
5. 📝 Create and send transaction
6. ⏳ Wait for confirmation
7. 📊 Record deployment details

## 📊 Monitoring & Management

### API Server

Start the monitoring API server:

```bash
npm run server
```

Available endpoints:
- `GET /` - API information
- `GET /health` - Health check
- `GET /api/deployments` - All deployments
- `GET /api/deployments/latest` - Latest successful deployment
- `GET /api/stats` - Deployment statistics

### View NFT Details

View details of a deployed NFT:

```bash
node scripts/view_nft.js MINT_ADDRESS
```

### Verify Transaction

Verify a specific transaction:

```bash
node scripts/verify_transaction.js TRANSACTION_SIGNATURE
```

## 📁 Project Structure

```
solayer-nft-template/
├── assets/
│   └── nft-metadata.json          # NFT metadata template
├── config/
│   └── index.js                   # Configuration management
├── scripts/
│   ├── deploy_nft.js             # Main deployment script
│   ├── upload_to_ipfs.js         # IPFS upload utility
│   ├── view_nft.js               # NFT viewing utility
│   ├── verify_transaction.js     # Transaction verification
│   └── setup.js                  # Environment setup helper
├── server/
│   └── api.js                    # Monitoring API server
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── deployment-index.json         # Deployment history (auto-generated)
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## 🔧 Troubleshooting

### Common Issues

1. **"Missing required environment variables"**
   - Check your `.env` file exists and contains all required variables
   - Verify variable names match exactly

2. **"Solana keypair not found"**
   - Verify the keypair path in your `.env` file
   - Ensure the keypair file exists and is readable

3. **"Insufficient balance"**
   - Fund your wallet with devnet SOL
   - Check balance: `solana balance --url devnet`

4. **"Image not accessible"**
   - Verify your image URL is publicly accessible
   - Test the URL in a browser

5. **"Transaction confirmation timeout"**
   - Network congestion - try again
   - Check Solana status: https://status.solana.com

### Debug Mode

Enable detailed logging by setting:

```env
NODE_ENV=development
```

## 🔒 Security Best Practices

- ✅ Never commit your `.env` file
- ✅ Keep your keypair file secure and backed up
- ✅ Use different wallets for development and production
- ✅ Verify all URLs and metadata before deployment
- ✅ Test on devnet before mainnet deployment

## 🌐 Network Configuration

### Devnet (Default)
```env
SOLANA_RPC_URL=https://devnet-rpc.solayer.org
NETWORK=devnet
```

### Mainnet (Production)
```env
SOLANA_RPC_URL=https://mainnet-rpc.solayer.org
NETWORK=mainnet-beta
```

⚠️ **Warning**: Mainnet deployments use real SOL. Test thoroughly on devnet first!

## 📝 Deployment Records

All deployments are automatically logged in `deployment-index.json` with:

- Full metadata and transaction details
- Deployment timing and performance metrics
- Explorer links and error information
- Complete audit trail for compliance

See `DEPLOYMENT_INDEX.md` for more details.

## 🤝 Contributing

This template is designed to be customized for your specific needs:

1. Fork or copy this template
2. Customize the metadata structure in `assets/`
3. Modify deployment logic in `scripts/deploy_nft.js`
4. Add custom validation or post-deployment hooks
5. Extend the API server with custom endpoints

## 📄 License

ISC License - see package.json for details.

## 🆘 Support

For issues with this template:
1. Check the troubleshooting section above
2. Review the deployment logs in `deployment-index.json`
3. Test with minimal configuration first
4. Verify network connectivity and wallet setup

For Solayer-specific questions, visit: [Solayer Documentation](https://docs.solayer.org)

---

Happy NFT deployment! 🎉
