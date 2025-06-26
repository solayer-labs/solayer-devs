import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'SOLANA_RPC_URL',
  'SOLANA_KEYPAIR_PATH'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please check your .env file');
  process.exit(1);
}

// Expand tilde in keypair path
function expandPath(filepath) {
  if (filepath.startsWith('~/')) {
    return path.join(process.env.HOME, filepath.slice(2));
  }
  return filepath;
}

const config = {
  solana: {
    rpcUrl: process.env.SOLANA_RPC_URL,
    keypairPath: expandPath(process.env.SOLANA_KEYPAIR_PATH),
    network: process.env.NETWORK || 'devnet',
    commitment: 'confirmed'
  },
  
  ipfs: {
    pinataJwt: process.env.PINATA_JWT,
    gateway: process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud'
  },
  
  api: {
    port: parseInt(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  
  nft: {
    defaultMetadataFile: process.env.DEFAULT_METADATA_FILE || 'assets/nft-metadata.json'
  },
  
  // File paths
  deploymentIndex: 'deployment-index.json',
  
  // Validation helper
  validate() {
    // Check if keypair file exists
    if (!fs.existsSync(this.solana.keypairPath)) {
      throw new Error(`Solana keypair not found at: ${this.solana.keypairPath}`);
    }
    
    console.log('✅ Configuration validated');
    return true;
  },
  
  // Display configuration (without sensitive data)
  display() {
    console.log('📋 Configuration:');
    console.log(`   Network: ${this.solana.network}`);
    console.log(`   RPC URL: ${this.solana.rpcUrl}`);
    console.log(`   Keypair: ${this.solana.keypairPath}`);
    console.log(`   API Port: ${this.api.port}`);
    console.log(`   IPFS Configured: ${this.ipfs.pinataJwt ? 'Yes' : 'No'}`);
  }
};

export default config;
