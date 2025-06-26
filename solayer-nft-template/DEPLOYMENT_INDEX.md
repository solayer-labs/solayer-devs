# Deployment Index

The `deployment-index.json` file automatically tracks your NFT deployments for record-keeping and debugging purposes.

## Purpose

This file will be automatically populated when you deploy NFTs using the deployment scripts. It tracks:

- **Metadata preparation** steps with full metadata content
- **Transaction signatures** and mint addresses
- **Final deployment status** with on-chain confirmation
- **IPFS URLs** and explorer links
- **Deployment performance metrics**

## Structure

Each deployment creates multiple entries in the array, one for each step:

```json
[
  {
    "step": "metadata_prepared",
    "metadata": { /* NFT metadata */ },
    "metadataUri": "data:application/json;base64,...",
    "timestamp": "2025-06-26T09:37:20.447Z"
  },
  {
    "step": "transaction_sent", 
    "signature": "4PFLphpeeHNhCnknB3yw...",
    "mint": "8So3mNcdDT6jLtkrWWKtq49GL3CDzzLSoaZa8aHVkqYb",
    "timestamp": "2025-06-26T09:37:24.474Z"
  },
  {
    "step": "nft_deployed",
    "success": true,
    "mint": "8So3mNcdDT6jLtkrWWKtq49GL3CDzzLSoaZa8aHVkqYb",
    "tokenAccount": "5QGNN2gLgtVnqtWbUygLjVn1wMD7K9u4bepHSzGf7YfX",
    "signature": "4PFLphpeeHNhCnknB3yw...",
    "metadata": { /* Complete metadata */ },
    "explorer": "https://explorer.solana.com/tx/...",
    "timestamp": "2025-06-26T09:37:27.662Z"
  }
]
```

## Usage

- **Fresh installation**: File starts empty as `[]`
- **After deployment**: Automatically populated with deployment records
- **For debugging**: Review failed deployments and transaction details
- **For records**: Keep track of all your deployed NFTs

## File Management

- **Don't edit manually** - Let the scripts manage this file
- **Safe to delete** - Will be recreated on next deployment (though you'll lose deployment history)
- **Version control** - You may want to add this to `.gitignore` if you don't want to track deployment history
