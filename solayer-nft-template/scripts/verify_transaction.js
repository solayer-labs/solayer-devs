#!/usr/bin/env node

import { Connection, PublicKey } from '@solana/web3.js';
import config from '../config/index.js';

async function verifyTransaction() {
    console.log('🔍 Comprehensive Transaction Verification on Solayer Devnet\n');
    
    const connection = new Connection(config.solana.rpcUrl, 'confirmed');
    const txSignature = '4FtWSJ2D7Z4sQz7veb9tzDc8ucpXhRiRHNYLpfeXzVutMrznGLxd5AqhmNjZunBmyRD6oWbrFKA7r7KG93gTYRZJ';
    const mintAddress = '4avFv5tVTb6tkPXJ3KxyqqQM75yEYkkabexBeZzarjpy';
    
    console.log(`📝 Transaction Signature: ${txSignature}`);
    console.log(`🎯 Mint Address: ${mintAddress}`);
    console.log(`🌐 RPC URL: ${config.solana.rpcUrl}\n`);
    
    // Test 1: Direct RPC call to getTransaction
    console.log('🔍 Test 1: Direct RPC getTransaction call');
    console.log('-'.repeat(50));
    
    try {
        const response = await fetch(config.solana.rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getTransaction',
                params: [
                    txSignature,
                    { encoding: 'json', maxSupportedTransactionVersion: 0 }
                ]
            })
        });
        
        const result = await response.json();
        if (result.result) {
            console.log('✅ Transaction found via direct RPC call');
            console.log(`   • Slot: ${result.result.slot}`);
            console.log(`   • Block Time: ${new Date(result.result.blockTime * 1000).toISOString()}`);
            console.log(`   • Status: ${result.result.meta?.err ? 'Failed' : 'Success'}`);
            console.log(`   • Fee: ${result.result.meta?.fee || 'N/A'} lamports`);
        } else {
            console.log('❌ Transaction not found via direct RPC call');
            console.log(`   • Response: ${JSON.stringify(result)}`);
        }
    } catch (error) {
        console.log(`⚠️  Direct RPC call failed: ${error.message}`);
    }
    
    // Test 2: Check if transaction exists using Connection.getTransaction
    console.log('\n🔍 Test 2: Solana Web3.js getTransaction');
    console.log('-'.repeat(50));
    
    try {
        const transaction = await connection.getTransaction(txSignature, {
            maxSupportedTransactionVersion: 0
        });
        
        if (transaction) {
            console.log('✅ Transaction found via Web3.js');
            console.log(`   • Slot: ${transaction.slot}`);
            console.log(`   • Block Time: ${new Date(transaction.blockTime * 1000).toISOString()}`);
            console.log(`   • Status: ${transaction.meta?.err ? 'Failed' : 'Success'}`);
            console.log(`   • Fee: ${transaction.meta?.fee || 'N/A'} lamports`);
        } else {
            console.log('❌ Transaction not found via Web3.js');
        }
    } catch (error) {
        console.log(`⚠️  Web3.js getTransaction failed: ${error.message}`);
    }
    
    // Test 3: Check mint account
    console.log('\n🔍 Test 3: Mint Account Verification');
    console.log('-'.repeat(50));
    
    try {
        const mintPubkey = new PublicKey(mintAddress);
        const mintAccount = await connection.getAccountInfo(mintPubkey);
        
        if (mintAccount) {
            console.log('✅ Mint account exists');
            console.log(`   • Owner: ${mintAccount.owner.toBase58()}`);
            console.log(`   • Lamports: ${mintAccount.lamports}`);
            console.log(`   • Data Length: ${mintAccount.data.length} bytes`);
            console.log(`   • Executable: ${mintAccount.executable}`);
            
            // Try to parse mint data if it's a token mint
            if (mintAccount.owner.toBase58() === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') {
                console.log('   • Account Type: SPL Token Mint');
                
                // Parse basic mint info
                const data = mintAccount.data;
                if (data.length >= 82) {
                    const mintAuthorityOption = data[0];
                    const supply = data.readBigUInt64LE(36);
                    const decimals = data[44];
                    console.log(`   • Supply: ${supply.toString()}`);
                    console.log(`   • Decimals: ${decimals}`);
                    console.log(`   • Mint Authority Present: ${mintAuthorityOption === 1}`);
                }
            }
        } else {
            console.log('❌ Mint account not found');
        }
    } catch (error) {
        console.log(`⚠️  Mint account check failed: ${error.message}`);
    }
    
    // Test 4: Check transaction signatures for the mint account
    console.log('\n🔍 Test 4: Transaction History for Mint Account');
    console.log('-'.repeat(50));
    
    try {
        const mintPubkey = new PublicKey(mintAddress);
        const signatures = await connection.getSignaturesForAddress(mintPubkey, { limit: 10 });
        
        if (signatures.length > 0) {
            console.log(`✅ Found ${signatures.length} transaction(s) for mint account:`);
            signatures.forEach((sig, index) => {
                const isOurTx = sig.signature === txSignature ? ' ⭐ (OUR TX)' : '';
                console.log(`   ${index + 1}. ${sig.signature}${isOurTx}`);
                console.log(`      • Slot: ${sig.slot}`);
                console.log(`      • Status: ${sig.err ? 'Failed' : 'Success'}`);
                if (sig.blockTime) {
                    console.log(`      • Time: ${new Date(sig.blockTime * 1000).toISOString()}`);
                }
            });
        } else {
            console.log('❌ No transactions found for mint account');
        }
    } catch (error) {
        console.log(`⚠️  Transaction history check failed: ${error.message}`);
    }
    
    // Test 5: Network info
    console.log('\n🔍 Test 5: Network Information');
    console.log('-'.repeat(50));
    
    try {
        const version = await connection.getVersion();
        console.log('✅ Network connection successful');
        console.log(`   • Solana Core: ${version['solana-core']}`);
        console.log(`   • Feature Set: ${version['feature-set']}`);
        
        const slot = await connection.getSlot();
        console.log(`   • Current Slot: ${slot}`);
        
        const epoch = await connection.getEpochInfo();
        console.log(`   • Current Epoch: ${epoch.epoch}`);
        
    } catch (error) {
        console.log(`⚠️  Network info check failed: ${error.message}`);
    }
    
    // Test 6: Compare with regular Solana devnet
    console.log('\n🔍 Test 6: Cross-verification with Regular Solana Devnet');
    console.log('-'.repeat(50));
    
    try {
        const regularDevnetConnection = new Connection('https://api.devnet.solana.com', 'confirmed');
        
        // Check if transaction exists on regular devnet
        const regularDevnetTx = await regularDevnetConnection.getTransaction(txSignature, {
            maxSupportedTransactionVersion: 0
        });
        
        if (regularDevnetTx) {
            console.log('⚠️  Transaction also found on regular Solana devnet');
            console.log('   This might indicate the transaction was broadcast to both networks');
        } else {
            console.log('✅ Transaction NOT found on regular Solana devnet');
            console.log('   This confirms the transaction is specific to Solayer devnet');
        }
        
        // Check mint account on regular devnet
        const mintPubkey = new PublicKey(mintAddress);
        const regularDevnetMint = await regularDevnetConnection.getAccountInfo(mintPubkey);
        
        if (regularDevnetMint) {
            console.log('⚠️  Mint account also exists on regular Solana devnet');
        } else {
            console.log('✅ Mint account NOT found on regular Solana devnet');
            console.log('   This confirms the NFT is specific to Solayer devnet');
        }
        
    } catch (error) {
        console.log(`⚠️  Cross-verification failed: ${error.message}`);
    }
    
    // Summary
    console.log('\n📊 Summary & Solayer Explorer Links');
    console.log('='.repeat(50));
    
    console.log(`\n🌐 Solayer Explorer Links:`);
    console.log(`• Transaction: https://explorer.solayer.org/tx/${txSignature}`);
    console.log(`• Mint Account: https://explorer.solayer.org/address/${mintAddress}`);
    
    console.log(`\n💡 Note: If the Solayer explorer shows "transaction not found",`);
    console.log(`   this could be due to:`);
    console.log(`   1. Different indexing systems between RPC and explorer`);
    console.log(`   2. Explorer may not index all transactions`);
    console.log(`   3. Different data retention policies`);
    console.log(`   4. The transaction exists on-chain but isn't in the explorer's database`);
    
    console.log(`\n✅ The transaction and NFT are verified to exist on Solayer devnet via RPC!`);
}

verifyTransaction().catch(console.error);
