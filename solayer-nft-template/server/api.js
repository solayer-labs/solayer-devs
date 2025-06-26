import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use((req, res, next) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Rate limiting headers
  res.setHeader('X-RateLimit-Limit', '100');
  res.setHeader('X-RateLimit-Remaining', '99');
  
  next();
});

// Parse JSON bodies
app.use(express.json({ limit: '1mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    network: config.solana.network
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Solayer NFT Deployment API',
    version: '1.0.0',
    network: config.solana.network,
    endpoints: {
      health: '/health',
      deployments: '/api/deployments',
      latest: '/api/deployments/latest',
      stats: '/api/stats'
    },
    documentation: 'https://github.com/YOUR_USERNAME/YOUR_REPO_NAME'
  });
});

// Get all deployments
app.get('/api/deployments', (req, res) => {
  try {
    if (!fs.existsSync(config.deploymentIndex)) {
      return res.status(404).json({
        error: 'No deployments found',
        message: 'Run the deployment script first: npm run deploy'
      });
    }
    
    const deployments = JSON.parse(fs.readFileSync(config.deploymentIndex));
    
    // Optional filtering
    const step = req.query.step;
    const filteredDeployments = step 
      ? deployments.filter(d => d.step === step)
      : deployments;
    
    res.json({
      total: filteredDeployments.length,
      deployments: filteredDeployments,
      filters: req.query
    });
    
  } catch (error) {
    console.error('Error reading deployments:', error);
    res.status(500).json({
      error: 'Failed to read deployments',
      message: error.message
    });
  }
});

// Get latest successful deployment
app.get('/api/deployments/latest', (req, res) => {
  try {
    if (!fs.existsSync(config.deploymentIndex)) {
      return res.status(404).json({
        error: 'No deployments found'
      });
    }
    
    const deployments = JSON.parse(fs.readFileSync(config.deploymentIndex));
    const successfulDeployments = deployments.filter(d => d.step === 'nft_deployed');
    
    if (successfulDeployments.length === 0) {
      return res.status(404).json({
        error: 'No successful deployments found'
      });
    }
    
    const latest = successfulDeployments[successfulDeployments.length - 1];
    res.json(latest);
    
  } catch (error) {
    console.error('Error reading latest deployment:', error);
    res.status(500).json({
      error: 'Failed to read latest deployment'
    });
  }
});

// Get deployment statistics
app.get('/api/stats', (req, res) => {
  try {
    if (!fs.existsSync(config.deploymentIndex)) {
      return res.json({
        totalDeployments: 0,
        successfulDeployments: 0,
        failedDeployments: 0,
        successRate: 0
      });
    }
    
    const deployments = JSON.parse(fs.readFileSync(config.deploymentIndex));
    const successful = deployments.filter(d => d.step === 'nft_deployed').length;
    const failed = deployments.filter(d => d.step === 'deployment_failed').length;
    const total = successful + failed;
    
    res.json({
      totalDeployments: total,
      successfulDeployments: successful,
      failedDeployments: failed,
      successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
      lastDeployment: deployments.length > 0 ? deployments[deployments.length - 1].timestamp : null
    });
    
  } catch (error) {
    console.error('Error calculating stats:', error);
    res.status(500).json({
      error: 'Failed to calculate statistics'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: config.api.nodeEnv === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: ['/', '/health', '/api/deployments', '/api/deployments/latest', '/api/stats']
  });
});

// Start server
const server = app.listen(config.api.port, () => {
  console.log(`🚀 Secure NFT API Server running on http://localhost:${config.api.port}`);
  console.log(`📊 Deployments: http://localhost:${config.api.port}/api/deployments`);
  console.log(`❤️  Health: http://localhost:${config.api.port}/health`);
  console.log(`📈 Stats: http://localhost:${config.api.port}/api/stats`);
  console.log(`🌐 Network: ${config.solana.network}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
