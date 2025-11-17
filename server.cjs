/**
 * Anno Transport Keys - Minimal Express Server
 * 
 * Provides REST API endpoints for:
 * - User authentication (JWT)
 * - Transport keys management
 * - Multi-provider LLM routing
 * 
 * Run with: node server.cjs
 */

const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cors = require('cors');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const app = express();
const PORT = process.env.PORT || 3009;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'anno_core_dev',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'change-in-production-please';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Encryption configuration for LLM provider API keys
const ENCRYPTION_KEY = crypto.scryptSync(
  process.env.ENCRYPTION_SECRET || 'change-in-production-please',
  'salt',
  32
);

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Static files (for React frontend)
app.use(express.static(path.join(__dirname, 'dist')));

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Encrypt LLM provider API key using AES-256-CBC
 */
function encryptApiKey(apiKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt LLM provider API key
 */
function decryptApiKey(encryptedData) {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Generate a transport key (format: tkp_<64-char-hex>)
 */
function generateTransportKey() {
  return 'tkp_' + crypto.randomBytes(32).toString('hex');
}

/**
 * Create masked display version of transport key
 */
function maskTransportKey(key) {
  if (!key || key.length < 12) return key;
  return key.substring(0, 7) + '***' + key.substring(key.length - 6);
}

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * JWT authentication middleware
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from database
    const result = await pool.query(
      'SELECT id, email, org_id, role_id, first_name, last_name FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Transport key validation middleware (for LLM relay endpoint)
 */
async function validateTransportKey(req, res, next) {
  try {
    const transportKey = req.headers['x-transport-key'];
    
    if (!transportKey) {
      return res.status(401).json({ error: 'Missing X-Transport-Key header' });
    }

    // Find transport key in database
    const result = await pool.query(
      `SELECT tk.*, u.org_id, u.email as user_email
       FROM transport_keys tk
       JOIN users u ON tk.user_id = u.id
       WHERE tk.active = true`,
      []
    );

    // Check each key using bcrypt compare (keys are hashed)
    let matchedKey = null;
    for (const row of result.rows) {
      const isMatch = await bcrypt.compare(transportKey, row.api_key_hash);
      if (isMatch) {
        matchedKey = row;
        break;
      }
    }

    if (!matchedKey) {
      return res.status(401).json({ error: 'Invalid transport key' });
    }

    req.transportKey = matchedKey;
    next();
  } catch (error) {
    console.error('Transport key validation error:', error);
    return res.status(500).json({ error: 'Transport key validation failed' });
  }
}

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

/**
 * POST /api/auth/register
 * Register a new user
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user (default org_id = 999, role_id = 2 for regular user)
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, org_id, role_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, org_id, role_id`,
      [email, passwordHash, first_name || '', last_name || '', '999', 2]
    );

    const user = result.rows[0];

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        org_id: user.org_id,
        role_id: user.role_id
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * Login and get JWT token
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user
    const result = await pool.query(
      'SELECT id, email, password_hash, first_name, last_name, org_id, role_id FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        orgId: user.org_id,
        roleId: user.role_id
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        org_id: user.org_id,
        role_id: user.role_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============================================================================
// TRANSPORT KEYS ENDPOINTS
// ============================================================================

/**
 * GET /api/transport-keys
 * List all transport keys for authenticated user
 */
app.get('/api/transport-keys', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nickname, provider, model_name, display_key, temperature, 
              system_prompt, max_requests_per_minute, active, created_at, updated_at
       FROM transport_keys
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('List transport keys error:', error);
    res.status(500).json({ error: 'Failed to list transport keys' });
  }
});

/**
 * POST /api/transport-keys
 * Create a new transport key
 */
app.post('/api/transport-keys', authenticate, async (req, res) => {
  try {
    const {
      nickname,
      provider,
      model_name,
      encrypted_provider_api_key,
      temperature,
      system_prompt,
      max_requests_per_minute
    } = req.body;

    // Validate required fields
    if (!nickname || !provider || !model_name || !encrypted_provider_api_key) {
      return res.status(400).json({
        error: 'Missing required fields: nickname, provider, model_name, encrypted_provider_api_key'
      });
    }

    // Generate transport key
    const transportKey = generateTransportKey();
    const displayKey = maskTransportKey(transportKey);

    // Hash transport key for storage
    const apiKeyHash = await bcrypt.hash(transportKey, 10);

    // Encrypt the LLM provider's API key
    const encryptedProviderKey = encryptApiKey(encrypted_provider_api_key);

    // Insert into database
    const result = await pool.query(
      `INSERT INTO transport_keys 
       (user_id, nickname, provider, model_name, api_key_hash, display_key,
        encrypted_provider_api_key, temperature, system_prompt, max_requests_per_minute, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, nickname, provider, model_name, display_key, created_at`,
      [
        req.user.id,
        nickname,
        provider,
        model_name,
        apiKeyHash,
        displayKey,
        encryptedProviderKey,
        temperature || 0.7,
        system_prompt || null,
        max_requests_per_minute || 60,
        true
      ]
    );

    const createdKey = result.rows[0];

    res.status(201).json({
      id: createdKey.id,
      transportKey: transportKey, // Return full key only once!
      display: createdKey.display_key,
      nickname: createdKey.nickname,
      provider: createdKey.provider,
      model_name: createdKey.model_name,
      created_at: createdKey.created_at,
      message: 'Save this transport key securely - it will not be shown again!'
    });
  } catch (error) {
    console.error('Create transport key error:', error);
    res.status(500).json({ error: 'Failed to create transport key' });
  }
});

/**
 * DELETE /api/transport-keys/:id
 * Delete a transport key
 */
app.delete('/api/transport-keys/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const check = await pool.query(
      'SELECT id FROM transport_keys WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Transport key not found' });
    }

    // Delete
    await pool.query('DELETE FROM transport_keys WHERE id = $1', [id]);

    res.json({ message: 'Transport key deleted successfully' });
  } catch (error) {
    console.error('Delete transport key error:', error);
    res.status(500).json({ error: 'Failed to delete transport key' });
  }
});

// ============================================================================
// LLM RELAY ENDPOINT
// ============================================================================

/**
 * POST /api/relay/chat
 * Relay chat request to configured LLM provider
 */
app.post('/api/relay/chat', validateTransportKey, async (req, res) => {
  try {
    const { messages, temperature, max_tokens, stream } = req.body;
    const transportKey = req.transportKey;

    // Decrypt the LLM provider's API key
    const providerApiKey = decryptApiKey(transportKey.encrypted_provider_api_key);

    // Get provider configuration
    const provider = transportKey.provider;
    const model = transportKey.model_name;

    // Build request based on provider
    let providerUrl, providerHeaders, providerBody;

    switch (provider) {
      case 'openai':
        providerUrl = 'https://api.openai.com/v1/chat/completions';
        providerHeaders = {
          'Authorization': `Bearer ${providerApiKey}`,
          'Content-Type': 'application/json'
        };
        providerBody = {
          model: model,
          messages: messages,
          temperature: temperature || transportKey.temperature || 0.7,
          max_tokens: max_tokens,
          stream: stream || false
        };
        break;

      case 'anthropic':
        providerUrl = 'https://api.anthropic.com/v1/messages';
        providerHeaders = {
          'x-api-key': providerApiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        };
        // Convert OpenAI format to Anthropic format
        const systemMessage = messages.find(m => m.role === 'system');
        const userMessages = messages.filter(m => m.role !== 'system');
        providerBody = {
          model: model,
          messages: userMessages,
          system: systemMessage ? systemMessage.content : undefined,
          temperature: temperature || transportKey.temperature || 0.7,
          max_tokens: max_tokens || 1024,
          stream: stream || false
        };
        break;

      case 'google':
        providerUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${providerApiKey}`;
        providerHeaders = {
          'Content-Type': 'application/json'
        };
        // Convert to Google format
        providerBody = {
          contents: messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          })),
          generationConfig: {
            temperature: temperature || transportKey.temperature || 0.7,
            maxOutputTokens: max_tokens
          }
        };
        break;

      case 'azure':
        // Azure requires custom deployment URL
        const azureUrl = process.env.AZURE_OPENAI_ENDPOINT || transportKey.base_url;
        const deployment = transportKey.deployment || model;
        const apiVersion = transportKey.api_version || '2024-02-15-preview';
        providerUrl = `${azureUrl}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
        providerHeaders = {
          'api-key': providerApiKey,
          'Content-Type': 'application/json'
        };
        providerBody = {
          messages: messages,
          temperature: temperature || transportKey.temperature || 0.7,
          max_tokens: max_tokens,
          stream: stream || false
        };
        break;

      default:
        return res.status(400).json({ error: `Unsupported provider: ${provider}` });
    }

    // Make request to LLM provider
    const fetch = (await import('node-fetch')).default;
    const providerResponse = await fetch(providerUrl, {
      method: 'POST',
      headers: providerHeaders,
      body: JSON.stringify(providerBody)
    });

    // Handle streaming responses
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      providerResponse.body.pipe(res);
      return;
    }

    // Handle non-streaming response
    const data = await providerResponse.json();

    if (!providerResponse.ok) {
      console.error('Provider error:', data);
      return res.status(providerResponse.status).json({
        error: data.error || 'Provider request failed',
        provider: provider
      });
    }

    // Normalize response format (convert all to OpenAI-like format)
    let normalizedResponse;

    switch (provider) {
      case 'openai':
      case 'azure':
        normalizedResponse = data;
        break;

      case 'anthropic':
        normalizedResponse = {
          id: data.id,
          object: 'chat.completion',
          created: Date.now(),
          model: model,
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: data.content[0]?.text || ''
            },
            finish_reason: data.stop_reason
          }],
          usage: {
            prompt_tokens: data.usage?.input_tokens || 0,
            completion_tokens: data.usage?.output_tokens || 0,
            total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
          }
        };
        break;

      case 'google':
        const candidate = data.candidates?.[0];
        normalizedResponse = {
          id: 'google-' + Date.now(),
          object: 'chat.completion',
          created: Date.now(),
          model: model,
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: candidate?.content?.parts?.[0]?.text || ''
            },
            finish_reason: candidate?.finishReason?.toLowerCase() || 'stop'
          }],
          usage: {
            prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
            completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
            total_tokens: data.usageMetadata?.totalTokenCount || 0
          }
        };
        break;
    }

    res.json(normalizedResponse);
  } catch (error) {
    console.error('LLM relay error:', error);
    res.status(500).json({ error: 'LLM request failed', details: error.message });
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// ============================================================================
// FRONTEND FALLBACK (for React Router)
// ============================================================================

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ============================================================================
// START SERVER
// ============================================================================

const server = app.listen(PORT, () => {
  console.log('\n==============================================');
  console.log('🚀 Anno Transport Keys Server');
  console.log('==============================================');
  console.log(`📍 API Server: http://localhost:${PORT}`);
  console.log(`📍 Frontend:   http://localhost:5173 (Vite dev server)`);
  console.log(`📊 Health:     http://localhost:${PORT}/api/health`);
  console.log('==============================================\n');
  console.log('📚 API Endpoints:');
  console.log('   POST   /api/auth/register');
  console.log('   POST   /api/auth/login');
  console.log('   GET    /api/transport-keys');
  console.log('   POST   /api/transport-keys');
  console.log('   DELETE /api/transport-keys/:id');
  console.log('   POST   /api/relay/chat');
  console.log('==============================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    pool.end();
    process.exit(0);
  });
});
