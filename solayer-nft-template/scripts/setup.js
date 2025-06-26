import { execSync } from 'child_process';
import fs from 'fs';
import config from '../config/index.js';

async function checkSolanaInstallation() {
  try {
    const version = execSync('solana --version', { encoding: 'utf8' });
    console.log('✅ Solana CLI installed:', version.trim());
    return true;
  } catch (error) {
    console.error('❌ Solana CLI not found. Please install it:');
    console.error('   curl -sSf https://release.solana.com/v1.18.26/install | sh');
    return false;
  }
}

async function checkKeypair() {
  try {
    if (!fs.existsSync(config.solana.keypairPath)) {
      console.log('🔑 No keypair found. Generating new keypair...');
      execSync(`solana-keygen new --outfile ${config.solana.keypairPath} --no-bip39-passphrase`, { stdio: 'inherit' });
    }
    
    const address = execSync('solana address', { encoding: 'utf8' }).trim();
    console.log('✅ Wallet address:', address);
    return address;
  } catch (error) {
    console.error('❌ Failed to setup keypair:', error.message);
    return null;
  }
}

async function configureSolana() {
  try {
    console.log('⚙️ Configuring Solana CLI...');
    execSync(`solana config set --url ${config.solana.rpcUrl} --commitment ${config.solana.commitment}`, { stdio: 'inherit' });
    console.log('✅ Solana CLI configured');
  } catch (error) {
    console.error('❌ Failed to configure Solana CLI:', error.message);
  }
}

async function checkBalance() {
  try {
    const balance = execSync('solana balance', { encoding: 'utf8' }).trim();
    console.log('💰 Current balance:', balance);
    
    if (balance.includes('0 SOL') || balance.includes('0.00')) {
      console.log('🪂 Requesting airdrop...');
      execSync('solana airdrop 1', { stdio: 'inherit' });
      
      // Wait a moment and check again
      await new Promise(resolve => setTimeout(resolve, 3000));
      const newBalance = execSync('solana balance', { encoding: 'utf8' }).trim();
      console.log('💰 New balance:', newBalance);
    }
  } catch (error) {
    console.error('❌ Failed to check balance:', error.message);
  }
}

async function createSampleMetadata() {
  const metadataPath = config.nft.defaultMetadataFile;
  
  if (!fs.existsSync(metadataPath)) {
    console.log('📄 Creating sample metadata file...');
    
    const sampleMetadata = {
      name: "My First Solayer NFT",
      symbol: "SLYR1",
      description: "My first NFT deployed on Solayer devnet using secure deployment",
      image: "https://gateway.pinata.cloud/ipfs/YOUR_IPFS_HASH_HERE",
      attributes: [
        {
          trait_type: "Network",
          value: "Solayer Devnet"
        },
        {
          trait_type: "Deployment",
          value: "Secure"
        },
        {
          trait_type: "Storage",
          value: "IPFS"
        }
      ]
    };
    
    fs.writeFileSync(metadataPath, JSON.stringify(sampleMetadata, null, 2));
    console.log(`✅ Sample metadata created at: ${metadataPath}`);
    console.log('⚠️  Remember to replace YOUR_IPFS_HASH_HERE with your actual IPFS hash');
  } else {
    console.log('✅ Metadata file already exists');
  }
}

async function main() {
  console.log('🚀 Setting up Solayer NFT deployment environment...\n');
  
  try {
    // Validate configuration
    config.validate();
    config.display();
    console.log('');
    
    // Check Solana installation
    if (!(await checkSolanaInstallation())) {
      process.exit(1);
    }
    
    // Setup keypair
    const address = await checkKeypair();
    if (!address) {
      process.exit(1);
    }
    
    // Configure Solana CLI
    await configureSolana();
    
    // Check/request balance
    await checkBalance();
    
    // Create sample metadata
    await createSampleMetadata();
    
    console.log('\n🎉 Setup complete! Next steps:');
    console.log('1. Upload your image to IPFS (see IPFS section in main guide)');
    console.log('2. Edit assets/nft-metadata.json with your IPFS hash');
    console.log('3. Run: npm run deploy');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();
