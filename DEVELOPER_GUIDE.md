# Anno Transport Keys - API Reference

**Quick reference for developers.** For setup instructions, see [QUICKSTART.md](./QUICKSTART.md).

---

## 🎯 Core Concept

**One transport key** → Routes to **any LLM provider** (OpenAI, Anthropic, Google, Azure, custom)

```javascript
// Instead of managing multiple API keys
fetch('/api/relay/chat', {
  headers: { 'X-Transport-Key': 'tkp_abc123...' }, // One key for all providers
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});
```

---

## 🔐 Authentication

### Register User

```bash
curl -X POST http://localhost:3009/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "password": "securepass123",
    "first_name": "Dev",
    "last_name": "User"
  }'
```

### Login (Get JWT)

```bash
curl -X POST http://localhost:3009/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@localhost",
    "password": "admin123"
  }'

# Response includes:
# { "token": "eyJhbGc...", "user": {...} }
```

**Use JWT in headers:** `Authorization: Bearer {token}`

---

## 🔑 Transport Keys

### Create Transport Key

```bash
curl -X POST http://localhost:3009/api/transport-keys \
  -H "Authorization: Bearer {jwt}" \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "My OpenAI Key",
    "provider": "openai",
    "model_name": "gpt-4o-mini",
    "encrypted_provider_api_key": "sk-...",
    "temperature": 0.7
  }'

# Response includes:
# { "transportKey": "tkp_abc123...", "display": "tkp_***234yz" }
# ⚠️ Save the full key - it's only shown once!
```

**Supported providers:** `openai`, `anthropic`, `google`, `azure`, custom

### List Transport Keys

```bash
curl http://localhost:3009/api/transport-keys \
  -H "Authorization: Bearer {jwt}"
```

### Delete Transport Key

```bash
curl -X DELETE http://localhost:3009/api/transport-keys/{id} \
  -H "Authorization: Bearer {jwt}"
```

---

## 💬 LLM Chat

### Basic Chat

```bash
curl -X POST http://localhost:3009/api/relay/chat \
  -H "X-Transport-Key: tkp_abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What is the capital of France?"}
    ]
  }'
```

### With System Prompt

```bash
curl -X POST http://localhost:3009/api/relay/chat \
  -H "X-Transport-Key: tkp_abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Explain quantum computing"}
    ],
    "temperature": 0.7,
    "max_tokens": 1000
  }'
```

### Streaming Response

```javascript
const response = await fetch('http://localhost:3009/api/relay/chat', {
  method: 'POST',
  headers: {
    'X-Transport-Key': 'tkp_abc123...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Write a story' }],
    stream: true
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  console.log(chunk);
}
```

---

## 🔌 Multi-Provider Examples

### OpenAI (GPT-4o-mini)

```json
{
  "nickname": "Fast OpenAI",
  "provider": "openai",
  "model_name": "gpt-4o-mini",
  "encrypted_provider_api_key": "sk-proj-..."
}
```

### Anthropic (Claude 3.5 Sonnet)

```json
{
  "nickname": "Smart Claude",
  "provider": "anthropic",
  "model_name": "claude-3-5-sonnet-latest",
  "encrypted_provider_api_key": "sk-ant-..."
}
```

### Google (Gemini 2.0 Flash)

```json
{
  "nickname": "Fast Gemini",
  "provider": "google",
  "model_name": "gemini-2.0-flash-exp",
  "encrypted_provider_api_key": "AIza..."
}
```

### Azure OpenAI

```json
{
  "nickname": "Azure GPT-4o",
  "provider": "azure",
  "model_name": "gpt-4o",
  "encrypted_provider_api_key": "your-azure-key",
  "base_url": "https://your-resource.openai.azure.com",
  "deployment": "gpt-4o-deployment",
  "api_version": "2024-02-15-preview"
}
```

---

## 📊 Complete API Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | None | Register new user |
| `/api/auth/login` | POST | None | Get JWT token |
| `/api/transport-keys` | GET | JWT | List transport keys |
| `/api/transport-keys` | POST | JWT | Create transport key |
| `/api/transport-keys/:id` | DELETE | JWT | Delete transport key |
| `/api/relay/chat` | POST | Transport Key | Send chat message to LLM |
| `/api/health` | GET | None | Health check |

---

## 🔒 Security

### Environment Variables (Required for Production)

```bash
# .env
JWT_SECRET=your-long-random-string-min-32-chars
ENCRYPTION_SECRET=different-long-random-string
DB_PASSWORD=your-postgres-password
```

**Generate secrets:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### Security Features

- ✅ **AES-256-CBC encryption** for LLM provider API keys
- ✅ **bcrypt hashing** (cost 10) for transport keys
- ✅ **JWT tokens** with 7-day expiration
- ✅ **Parameterized SQL queries** (no injection risk)

---

## 🚨 Common Errors

### `401 Unauthorized`
- **Cause:** Invalid or missing JWT/transport key
- **Fix:** Check `Authorization: Bearer {token}` or `X-Transport-Key: tkp_...` header

### `409 User already exists`
- **Cause:** Email already registered
- **Fix:** Use different email or login with existing account

### `500 LLM request failed`
- **Cause:** Invalid provider API key, rate limit, or network issue
- **Fix:** Check provider API key is correct, verify provider status page

### Database connection failed
- **Cause:** PostgreSQL not running or wrong credentials
- **Fix:** Run `pg_isready` and check `.env` settings

---

## 💡 Quick Tips

### Cost Optimization

Use different keys for different use cases:

```javascript
const KEYS = {
  production: 'tkp_gpt4o...',        // GPT-4o for important requests
  development: 'tkp_mini...',        // GPT-4o-mini for testing (95% cheaper!)
  bulk: 'tkp_gemini...'              // Gemini Flash for high-volume (99% cheaper!)
};
```

### Provider Switching

Change providers without touching code:

```javascript
// Your code (never changes)
const chat = (message) => fetch('/api/relay/chat', {
  headers: { 'X-Transport-Key': TRANSPORT_KEY },
  body: JSON.stringify({ messages: [{ role: 'user', content: message }] })
});

// Monday: Using OpenAI
// Wednesday: Switch transport key to Anthropic → Code unchanged!
// Friday: Try Google Gemini → Code unchanged!
```

### Error Handling

```javascript
try {
  const response = await fetch('/api/relay/chat', {
    method: 'POST',
    headers: {
      'X-Transport-Key': 'tkp_...',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ messages: [...] })
  });

  if (!response.ok) {
    const error = await response.json();
    
    if (response.status === 401) {
      console.error('Invalid transport key');
    } else if (response.status === 429) {
      console.error('Rate limit exceeded');
    } else {
      console.error('Error:', error.error);
    }
    return;
  }

  const data = await response.json();
  console.log(data.choices[0].message.content);
  
} catch (error) {
  console.error('Network error:', error);
}
```

---

## 📚 Next Steps

- **Production deployment?** See [INSTALL.md](./INSTALL.md)
- **Need help?** Open an issue on GitHub
- **Want to contribute?** PRs welcome!

---

**Happy building! 🚀**
