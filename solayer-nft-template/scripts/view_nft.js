#!/usr/bin/env node

import { Connection, PublicKey } from '@solana/web3.js';
import config from '../config/index.js';

async function viewNFT() {
    console.log('🔍 NFT Viewer for Solayer Devnet\n');
    
    const connection = new Connection(config.solana.rpcUrl, 'confirmed');
    
    // Get the latest deployment
    let deploymentData;
    try {
        const fs = await import('fs');
        const deploymentIndex = JSON.parse(fs.readFileSync('./deployment-index.json', 'utf8'));
        deploymentData = deploymentIndex
            .filter(entry => entry.step === 'nft_deployed' && entry.success)
            .pop(); // Get the latest successful deployment
    } catch (error) {
        console.error('❌ Could not read deployment data:', error.message);
        return;
    }
    
    if (!deploymentData) {
        console.log('❌ No successful NFT deployments found');
        return;
    }
    
    console.log('🎯 Latest NFT Deployment Details');
    console.log('=' .repeat(50));
    console.log(`📛 Name: ${deploymentData.metadata.name}`);
    console.log(`🏷️  Symbol: ${deploymentData.metadata.symbol}`);
    console.log(`📝 Description: ${deploymentData.metadata.description}`);
    console.log(`🎯 Mint Address: ${deploymentData.mint}`);
    console.log(`🏦 Token Account: ${deploymentData.tokenAccount}`);
    console.log(`🖼️  Image URL: ${deploymentData.imageUrl}`);
    console.log(`📝 Transaction: ${deploymentData.signature}`);
    console.log(`⏱️  Deployed: ${new Date(deploymentData.timestamp).toLocaleString()}`);
    console.log(`⏳ Deployment Time: ${(deploymentData.deploymentTimeMs / 1000).toFixed(2)}s`);
    console.log(`🌐 Network: ${deploymentData.network} (${deploymentData.rpcUrl})`);
    
    console.log('\n🔍 Explorer Links');
    console.log('-'.repeat(50));
    
    const encodedRpc = encodeURIComponent(deploymentData.rpcUrl);
    
    // Transaction links
    console.log('\n📝 Transaction:');
    console.log(`• Solana Explorer: https://explorer.solana.com/tx/${deploymentData.signature}?cluster=custom&customUrl=${encodedRpc}`);
    console.log(`• SolanaFM: https://solana.fm/tx/${deploymentData.signature}?cluster=custom-${deploymentData.rpcUrl}`);
    
    // Mint account links  
    console.log('\n🎯 Mint Account:');
    console.log(`• Solana Explorer: https://explorer.solana.com/address/${deploymentData.mint}?cluster=custom&customUrl=${encodedRpc}`);
    console.log(`• SolanaFM: https://solana.fm/address/${deploymentData.mint}?cluster=custom-${deploymentData.rpcUrl}`);
    
    // Token account links
    console.log('\n🏦 Token Account:');
    console.log(`• Solana Explorer: https://explorer.solana.com/address/${deploymentData.tokenAccount}?cluster=custom&customUrl=${encodedRpc}`);
    
    // Try to verify the accounts exist
    console.log('\n🔍 Account Verification');
    console.log('-'.repeat(50));
    
    try {
        const mintPubkey = new PublicKey(deploymentData.mint);
        const mintInfo = await connection.getAccountInfo(mintPubkey);
        
        if (mintInfo) {
            console.log('✅ Mint account exists');
            console.log(`   • Owner: ${mintInfo.owner.toBase58()}`);
            console.log(`   • Lamports: ${mintInfo.lamports}`);
            console.log(`   • Data length: ${mintInfo.data.length} bytes`);
        } else {
            console.log('❌ Mint account not found');
        }
        
    } catch (error) {
        console.log(`⚠️  Account verification failed: ${error.message}`);
    }
    
    try {
        const tokenPubkey = new PublicKey(deploymentData.tokenAccount);
        const tokenInfo = await connection.getAccountInfo(tokenPubkey);
        
        if (tokenInfo) {
            console.log('✅ Token account exists');
            console.log(`   • Owner: ${tokenInfo.owner.toBase58()}`);
            console.log(`   • Lamports: ${tokenInfo.lamports}`);
        } else {
            console.log('❌ Token account not found');
        }
        
    } catch (error) {
        console.log(`⚠️  Token account verification failed: ${error.message}`);
    }
    
    // Image verification
    console.log('\n🖼️  Image Verification');
    console.log('-'.repeat(50));
    
    try {
        const response = await fetch(deploymentData.imageUrl, { method: 'HEAD' });
        if (response.ok) {
            console.log('✅ Image is accessible');
            console.log(`   • Content-Type: ${response.headers.get('content-type')}`);
            console.log(`   • Content-Length: ${response.headers.get('content-length')} bytes`);
        } else {
            console.log(`❌ Image not accessible: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.log(`⚠️  Image verification failed: ${error.message}`);
    }
    
    console.log('\n🎉 Use the explorer links above to view your NFT!');
    console.log('💡 If the custom cluster links don\'t work, the NFT exists on Solayer devnet');
    console.log('   and can be verified using the RPC calls shown above.');
}

viewNFT().catch(console.error);
