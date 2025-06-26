import {
  Connection,
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import {
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress
} from '@solana/spl-token';
import fs from 'fs';
import config from '../config/index.js';
import { uploadMetadataToPinata } from './upload_to_ipfs.js';

class NFTDeployer {
  constructor() {
    this.config = config;
    this.connection = null;
    this.payer = null;
  }

  async initialize() {
    try {
      // Validate configuration
      this.config.validate();
      
      // Load keypair
      const secret = JSON.parse(fs.readFileSync(this.config.solana.keypairPath));
      this.payer = Keypair.fromSecretKey(Uint8Array.from(secret));
      
      // Initialize connection (HTTP only, no WebSockets)
      this.connection = new Connection(this.config.solana.rpcUrl, {
        commitment: this.config.solana.commitment,
        disableRetryOnRateLimit: true,
        confirmTransactionInitialTimeout: 60000
      });
      
      console.log('✅ NFT Deployer initialized');
      console.log(`📍 Wallet: ${this.payer.publicKey.toBase58()}`);
      console.log(`🌐 Network: ${this.config.solana.network}`);
      
    } catch (error) {
      throw new Error(`Failed to initialize deployer: ${error.message}`);
    }
  }

  appendToIndex(entry) {
    const indexPath = this.config.deploymentIndex;
    const deployments = fs.existsSync(indexPath) 
      ? JSON.parse(fs.readFileSync(indexPath)) 
      : [];
    
    deployments.push({
      ...entry,
      timestamp: new Date().toISOString()
    });
    
    fs.writeFileSync(indexPath, JSON.stringify(deployments, null, 2));
    console.log(`📝 Updated deployment index: ${entry.step}`);
  }

  async confirmTransaction(signature, maxRetries = 30) {
    console.log('⏳ Confirming transaction...');
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await this.connection.getSignatureStatus(signature);
        
        if (response.value?.confirmationStatus === 'confirmed' || 
            response.value?.confirmationStatus === 'finalized') {
          console.log(`✅ Transaction confirmed (${response.value.confirmationStatus})`);
          return response.value;
        }
        
        if (response.value?.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(response.value.err)}`);
        }
        
      } catch (error) {
        console.log(`Confirmation attempt ${i + 1}/${maxRetries} failed: ${error.message}`);
      }
      
      if (i < maxRetries - 1) {
        console.log(`⏳ Waiting 2s before retry... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    throw new Error('Transaction confirmation timeout');
  }

  async createMetadataUri(metadata) {
    console.log('📤 Creating metadata URI...');
    
    // Option 1: Upload to IPFS (if Pinata is configured)
    if (this.config.ipfs.pinataJwt) {
      try {
        console.log('🌐 Uploading metadata to IPFS...');
        const result = await uploadMetadataToPinata(metadata);
        return result.url;
      } catch (error) {
        console.warn(`⚠️ IPFS upload failed: ${error.message}`);
        console.log('📋 Falling back to data URI...');
      }
    }
    
    // Option 2: Fallback to data URI
    const dataUri = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString('base64')}`;
    console.log('📋 Using data URI for metadata');
    return dataUri;
  }

  async validateMetadata(metadata) {
    console.log('🔍 Validating metadata...');
    
    // Required fields
    const requiredFields = ['name', 'symbol', 'description', 'image'];
    const missingFields = requiredFields.filter(field => !metadata[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required metadata fields: ${missingFields.join(', ')}`);
    }
    
    // Check if image URL is accessible
    if (metadata.image.startsWith('http')) {
      try {
        console.log('🖼️ Verifying image accessibility...');
        const response = await fetch(metadata.image, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`Image not accessible: ${response.status} ${response.statusText}`);
        }
        console.log(`✅ Image verified: ${response.headers.get('content-type')}`);
      } catch (error) {
        console.warn(`⚠️ Warning: Could not verify image: ${error.message}`);
      }
    }
    
    console.log('✅ Metadata validation passed');
  }

  async checkPrerequisites() {
    console.log('🔍 Checking deployment prerequisites...');
    
    // Check wallet balance
    const balance = await this.connection.getBalance(this.payer.publicKey);
    const balanceSOL = balance / LAMPORTS_PER_SOL;
    console.log(`💰 Wallet balance: ${balanceSOL} SOL`);
    
    if (balanceSOL < 0.01) {
      throw new Error(`Insufficient balance. Need at least 0.01 SOL, have ${balanceSOL} SOL`);
    }
    
    // Check network connectivity
    try {
      await this.connection.getLatestBlockhash();
      console.log('✅ Network connectivity verified');
    } catch (error) {
      throw new Error(`Network connectivity failed: ${error.message}`);
    }
    
    console.log('✅ Prerequisites check passed');
  }

  async deployNFT(metadataFilePath) {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting NFT deployment...');
      console.log(`📄 Metadata file: ${metadataFilePath}`);
      
      // Load and validate metadata
      if (!fs.existsSync(metadataFilePath)) {
        throw new Error(`Metadata file not found: ${metadataFilePath}`);
      }
      
      const metadata = JSON.parse(fs.readFileSync(metadataFilePath, 'utf8'));
      console.log(`📋 NFT Name: "${metadata.name}"`);
      console.log(`🎨 Symbol: "${metadata.symbol}"`);
      
      await this.validateMetadata(metadata);
      await this.checkPrerequisites();
      
      // Create metadata URI
      const metadataUri = await this.createMetadataUri(metadata);
      
      this.appendToIndex({
        step: 'metadata_prepared',
        metadata: metadata,
        metadataUri: metadataUri.length > 100 ? metadataUri.substring(0, 100) + '...' : metadataUri
      });
      
      // Generate mint keypair
      const mintKeypair = Keypair.generate();
      console.log(`🎯 Generated mint address: ${mintKeypair.publicKey.toBase58()}`);
      
      // Calculate associated token account
      const associatedTokenAccount = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        this.payer.publicKey
      );
      console.log(`🏦 Token account: ${associatedTokenAccount.toBase58()}`);
      
      // Get latest blockhash and calculate rent
      const { blockhash } = await this.connection.getLatestBlockhash();
      const mintRent = await getMinimumBalanceForRentExemptMint(this.connection);
      console.log(`💸 Mint rent: ${mintRent / LAMPORTS_PER_SOL} SOL`);
      
      // Build transaction
      console.log('🔨 Building transaction...');
      const transaction = new Transaction();
      
      // 1. Create mint account
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: this.payer.publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports: mintRent,
          programId: TOKEN_PROGRAM_ID,
        })
      );
      
      // 2. Initialize mint (0 decimals = NFT)
      transaction.add(
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          0, // 0 decimals for NFT
          this.payer.publicKey, // mint authority
          this.payer.publicKey  // freeze authority
        )
      );
      
      // 3. Create associated token account
      transaction.add(
        createAssociatedTokenAccountInstruction(
          this.payer.publicKey,
          associatedTokenAccount,
          this.payer.publicKey,
          mintKeypair.publicKey
        )
      );
      
      // 4. Mint 1 token (the NFT)
      transaction.add(
        createMintToInstruction(
          mintKeypair.publicKey,
          associatedTokenAccount,
          this.payer.publicKey,
          1 // amount = 1 for NFT
        )
      );
      
      // Set transaction properties
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.payer.publicKey;
      
      // Sign transaction
      transaction.sign(this.payer, mintKeypair);
      console.log('✍️ Transaction signed');
      
      // Send transaction
      console.log('📤 Sending transaction...');
      const signature = await this.connection.sendRawTransaction(transaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: this.config.solana.commitment
      });
      
      console.log(`📝 Transaction signature: ${signature}`);
      this.appendToIndex({
        step: 'transaction_sent',
        signature: signature,
        mint: mintKeypair.publicKey.toBase58()
      });
      
      // Confirm transaction
      const status = await this.confirmTransaction(signature);
      
      // Calculate deployment time
      const deploymentTime = Date.now() - startTime;
      
      // Record successful deployment
      const deploymentData = {
        step: 'nft_deployed',
        success: true,
        mint: mintKeypair.publicKey.toBase58(),
        tokenAccount: associatedTokenAccount.toBase58(),
        signature: signature,
        metadata: metadata,
        metadataUri: metadataUri,
        imageUrl: metadata.image,
        network: this.config.solana.network,
        rpcUrl: this.config.solana.rpcUrl,
        deploymentTimeMs: deploymentTime,
        status: status,
        explorer: `https://explorer.solana.com/tx/${signature}?cluster=custom&customUrl=${encodeURIComponent(this.config.solana.rpcUrl)}`
      };
      
      this.appendToIndex(deploymentData);
      
      // Print success summary
      console.log('\n🎉 NFT Successfully Deployed!');
      console.log('='.repeat(50));
      console.log(`🎯 Mint Address: ${mintKeypair.publicKey.toBase58()}`);
      console.log(`🏦 Token Account: ${associatedTokenAccount.toBase58()}`);
      console.log(`🖼️ Image URL: ${metadata.image}`);
      console.log(`📝 Transaction: ${signature}`);
      console.log(`⏱️ Deployment Time: ${(deploymentTime / 1000).toFixed(2)}s`);
      console.log(`🔍 Explorer: ${deploymentData.explorer}`);
      console.log(`📊 Full details: ${this.config.deploymentIndex}`);
      
      return deploymentData;
      
    } catch (error) {
      const deploymentTime = Date.now() - startTime;
      
      console.error('❌ Deployment failed:', error.message);
      
      this.appendToIndex({
        step: 'deployment_failed',
        error: error.message,
        metadataFile: metadataFilePath,
        deploymentTimeMs: deploymentTime
      });
      
      throw error;
    }
  }
}

// CLI usage
async function main() {
  const metadataFile = process.argv[2] || config.nft.defaultMetadataFile;
  
  console.log('🚀 Solayer NFT Deployment Tool\n');
  
  try {
    const deployer = new NFTDeployer();
    await deployer.initialize();
    await deployer.deployNFT(metadataFile);
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    console.error('\n💡 Troubleshooting tips:');
    console.error('1. Check your .env file configuration');
    console.error('2. Ensure you have sufficient SOL balance');
    console.error('3. Verify your metadata file is valid JSON');
    console.error('4. Check network connectivity');
    process.exit(1);
  }
}

// Export for use in other modules
export { NFTDeployer };

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}
