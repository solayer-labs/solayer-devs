import fs from 'fs';
import config from '../config/index.js';

async function uploadImageToPinata(imagePath) {
  if (!config.ipfs.pinataJwt) {
    throw new Error('PINATA_JWT not configured in .env file');
  }
  
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image file not found: ${imagePath}`);
  }
  
  console.log('📤 Uploading image to IPFS via Pinata...');
  
  // Create form data
  const formData = new FormData();
  const fileBuffer = fs.readFileSync(imagePath);
  const fileName = imagePath.split('/').pop();
  
  // Create blob from buffer
  const blob = new Blob([fileBuffer]);
  formData.append('file', blob, fileName);
  
  // Add metadata
  formData.append('pinataMetadata', JSON.stringify({
    name: fileName,
    keyvalues: {
      project: 'solayer-nft',
      type: 'image'
    }
  }));
  
  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.ipfs.pinataJwt}`
    },
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload to Pinata: ${error}`);
  }
  
  const data = await response.json();
  const imageUrl = `${config.ipfs.gateway}/ipfs/${data.IpfsHash}`;
  
  console.log('✅ Image uploaded successfully!');
  console.log(`📎 IPFS Hash: ${data.IpfsHash}`);
  console.log(`🔗 Image URL: ${imageUrl}`);
  
  return {
    hash: data.IpfsHash,
    url: imageUrl
  };
}

async function uploadMetadataToPinata(metadata) {
  if (!config.ipfs.pinataJwt) {
    throw new Error('PINATA_JWT not configured in .env file');
  }
  
  console.log('📤 Uploading metadata to IPFS via Pinata...');
  
  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.ipfs.pinataJwt}`
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name: `${metadata.name} Metadata`,
        keyvalues: {
          project: 'solayer-nft',
          type: 'metadata'
        }
      }
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload metadata to Pinata: ${error}`);
  }
  
  const data = await response.json();
  const metadataUrl = `${config.ipfs.gateway}/ipfs/${data.IpfsHash}`;
  
  console.log('✅ Metadata uploaded successfully!');
  console.log(`📎 IPFS Hash: ${data.IpfsHash}`);
  console.log(`🔗 Metadata URL: ${metadataUrl}`);
  
  return {
    hash: data.IpfsHash,
    url: metadataUrl
  };
}

// CLI usage
async function main() {
  const imagePath = process.argv[2];
  
  if (!imagePath) {
    console.log('Usage: node scripts/upload_to_ipfs.js <image_path>');
    console.log('Example: node scripts/upload_to_ipfs.js assets/my-nft.png');
    process.exit(1);
  }
  
  try {
    const result = await uploadImageToPinata(imagePath);
    
    console.log('\n🔄 Next steps:');
    console.log('1. Copy the Image URL above');
    console.log('2. Edit your metadata file and replace YOUR_IPFS_HASH_HERE');
    console.log('3. Run: npm run deploy');
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  }
}

// Export functions for use in other scripts
export { uploadImageToPinata, uploadMetadataToPinata };

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}
