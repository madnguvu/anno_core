#anno_core – Multi-tenant transport keys & auth for LLM agents (the missing Auth0 for AI)

**One key. Any LLM. Zero vendor lock-in.  Multi-provider, multi-model, swap either in-chat.*

Stop juggling API keys. Stop hardcoding providers. Stop rewriting code when models change.

Anno's Transport Keys** is the missing abstraction layer for AI applications.  In my original project, of which the core has been forked for your review and development needs here as anno_core, has incredibly powerful capabilities and ultra-high performance that really is the main reason why I am making my first publicly accessible project available.  This stack is fast.  Postgres has blown me away in regards to my needs as building from the bottom up, and I wish I remembered of whom or what turned me onto it a while back, but thank you for doing so.  I can't wait to get to the moment to simply dive head first into getting up to speed in all that is postgres.  That DB tech is what makes this little starter project worth sharing in the first place.  Enjoy. - MattD

BTW, I am interested to collaborate with someone that finds this project interesting, I have a ton of implemented components that I would consider opening up to the community if there is actual traction with this project.  

https://opensource.org/licenses/MIT)
https://nodejs.org/)
https://www.postgresql.org/)

---

Why This Exists

You're building an AI application. You need to support multiple LLM providers. Here's what typically happens:

```javascript
// ❌ The nightmare: Managing multiple providers manually
const OPENAI_KEY = process.env.OPENAI_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY;
const GOOGLE_KEY = process.env.GOOGLE_KEY;

if (provider === 'openai') {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: messages,
    apiKey: OPENAI_KEY
  });
} else if (provider === 'anthropic') {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-latest',
    messages: messages,
    apiKey: ANTHROPIC_KEY
  });
} else if (provider === 'google') {
  // Completely different API structure...
}
// Your codebase is now coupled to every provider's SDK
```

**There has to be a better way.**

```javascript
// ✅ With Anno Transport Keys: One unified API
const response = await fetch('http://localhost:3009/api/relay/chat', {
  method: 'POST',
  headers: {
    'X-Transport-Key': 'tkp_abc123...', // One key for all providers
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});

// ✅ Provider switching? Just change a setting. Zero code changes.
```

---

## What You Get

### One Key, Infinite Providers

Swap while in-chat with 1 model, next message is a different model, different provider, context injection makes the user experience seamless.

Create a single `tkp_*` transport key that routes to **any** LLM provider:
- OpenAI (GPT-4o, GPT-4o-mini, GPT-3.5-turbo)
- Anthropic (Claude 3.5 Sonnet, Claude 3.5 Haiku)
- Google (Gemini 2.0 Flash, Gemini 1.5 Pro)
- Azure OpenAI (your deployments)
- **Any OpenAI-compatible API** (Ollama, LM Studio, custom endpoints)

### Multi-Tenant Out of the Box

- JWT authentication
- Organization-based isolation
- Role-based access control (admin, user)
- Each user can have multiple transport keys - each transport keys can have multiple provider configurations stored, and the active flag is where the magic happens when your next message hits the realy out.  Activity, preferences, jobs, permissions, organization associations....  

### Security by Default

- **AES-256-CBC encryption** for all LLM provider API keys
- **bcrypt hashing** for transport keys (cost factor 10)
- **JWT tokens** with configurable expiration (default 7 days)
- Environment-based secrets (never commit keys)

### 5-Minute Setup

```bash
git clone https://github.com/your-org/anno_core.git
cd anno_core
npm install
createdb anno_core_dev
psql -d anno_core_dev -f database/core-schema.sql
cp .env.example .env
# Edit .env with your settings
npm start
```

**That's it.** You now have:
- Running API server (http://localhost:3009)
- React frontend (http://localhost:5173)
- Admin account (admin@localhost / admin123)
- Full multi-provider LLM routing

---

## See It In Action

### Create a Transport Key (Frontend)

    1. Navigate to http://localhost:5173
    2. Login with `admin@localhost` / `admin123`
    3. Click "Transport Keys" → "Create New"
    4. Fill in:
        - Nickname: My OpenAI Key
        - Provider: OpenAI
        - Model: gpt-5-mini
        - Provider API Key: sk-proj-your-openai-key
    5. Click "Create"

**Result:** You get a transport key like `tkp_abc123def456...`

### Use Your Transport Key (API)

```bash
Chat with any LLM using your transport key

curl -X POST http://localhost:3009/api/relay/chat \
  -H "X-Transport-Key: tkp_abc123def456..." \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Explain quantum computing in simple terms"}
    ]
  }'
```

**Response:**
```json
{
  "id": "chatcmpl-abc123",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "Quantum computing uses quantum mechanics principles..."
    }
  }],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 87,
    "total_tokens": 99
  }
}
```

---

## Core Features

### 1. Provider Abstraction

Switch providers without touching your application code:

```javascript
// Your application code (never changes)
const chat = async (message) => {
  return await fetch('/api/relay/chat', {
    headers: { 'X-Transport-Key': TRANSPORT_KEY },
    body: JSON.stringify({ messages: [{ role: 'user', content: message }] })
  });
};

// Production: Using GPT-4o
// Create transport key → Provider: OpenAI, Model: gpt-4o

// Next week: Switch to Claude
// Update transport key → Provider: Anthropic, Model: claude-3-5-sonnet-latest
// Application code? Unchanged. Zero downtime.
```

### 2. Cost Optimization

Different keys for different use cases:

```javascript
// Expensive key for critical production
const criticalKey = 'tkp_prod_gpt4o...'; // GPT-4o ($2.50/1M input tokens)

// Cheap key for development/testing
const devKey = 'tkp_dev_mini...'; // GPT-4o-mini ($0.15/1M input tokens)

// Ultra-cheap key for high-volume simple tasks
const bulkKey = 'tkp_bulk_gemini...'; // Gemini Flash ($0.075/1M input tokens)
```

**Result:** 60-90% cost reduction vs. using a single model for everything, without transport keys switching "in session" on 3rd party sofware is not possible in 90+ percent of cases (estimated).  Deploy the anno_core as your "man-in-the-middle" goto relay service or application, giving you full control of the pipeline and when and how to change the destination.

### 3. Multi-Provider Reliability

Set up fallback chains:

```javascript
// Primary: Claude 3.5 Sonnet (best quality)
const primary = 'tkp_claude...';

try {
  return await chat(message, primary);
} catch (error) {
  // Fallback: GPT-4o (good quality, higher availability)
  const fallback = 'tkp_openai...';
  return await chat(message, fallback);
}
```

### 4. **Streaming Support**

```javascript
const response = await fetch('/api/relay/chat', {
  method: 'POST',
  headers: { 'X-Transport-Key': transportKey },
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
  console.log(chunk); // Real-time token streaming
}
```

---

## Architecture
```
┌──────────────────────────────────────────────────────────────┐
│                     Your Application                         │
│  (React, Vue, Mobile App, CLI, Chatbot, etc.)                │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ X-Transport-Key: tkp_abc123...
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│              Anno Transport Keys Server                      │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  1. Validate Transport Key (bcrypt)                 │     │
│  │  2. Decrypt LLM Provider API Key (AES-256-CBC)      │     │
│  │  3. Route to Provider                               │     │
│  └─────────────────────────────────────────────────────┘     │
└────────────┬─────────┬──────────┬──────────┬─────────────────┘
             │         │          │          │
      ┌──────▼──┐ ┌────▼────┐ ┌──▼─────┐ ┌──▼─────┐
      │ OpenAI  │ │Anthropic│ │ Google │ │ Azure  │
      │ GPT-4o  │ │ Claude  │ │ Gemini │ │Custom  │
      └─────────┘ └─────────┘ └────────┘ └────────┘
```
### Database Schema (4 Tables)
```sql
-- Multi-tenant organizations
organizations (org_id, org_name, created_at)

-- User authentication
users (id, email, password_hash, org_id, role_id, first_name, last_name)

-- Transport keys (the core!)
transport_keys (
  id, user_id, nickname, provider, model_name,
  api_key_hash,                    -- bcrypt hash of transport key
  encrypted_provider_api_key,      -- AES-256-CBC encrypted LLM key
  temperature, system_prompt, active
)

-- Multi-provider configurations
transport_key_providers (
  id, transport_key_id, provider, model_name,
  base_url, deployment, api_version, enabled
)
```
**Design Philosophy:** Minimal schema, maximum flexibility.

---

## Use Cases

### 1. SaaS Applications

Your users want to use their own LLM keys (not yours):

```javascript
// User provides their OpenAI key in your app
const userKey = await createTransportKey({
  userId: user.id,
  provider: 'openai',
  apiKey: userProvidedKey  // Encrypted before storage
});

// Your app uses their key (they pay for LLM costs)
await chat(message, userKey);
```

**Benefits:**
- ✅ No LLM costs for you
- ✅ Users control their data
- ✅ Scales to unlimited usage

### 2. **Multi-Model Applications**

Different features use different models:

```javascript
// Code generation: Claude (best for code)
const codeKey = 'tkp_claude_sonnet...';
const code = await generateCode(prompt, codeKey);

// Creative writing: GPT-4o (best for creative)
const creativeKey = 'tkp_gpt4o...';
const story = await generateStory(prompt, creativeKey);

// Long-context analysis: Gemini (1M token window)
const analysisKey = 'tkp_gemini...';
const analysis = await analyzeDocument(longDoc, analysisKey);
```

### 3. **Agency/White-Label**

Manage LLM access for multiple clients:

```javascript
// Client A: Startup (budget-conscious)
const clientA = {
  orgId: 'client-a',
  transportKey: 'tkp_...',  // Points to GPT-4o-mini
  rateLimit: 1000  // requests/day
};

// Client B: Enterprise (premium)
const clientB = {
  orgId: 'client-b',
  transportKey: 'tkp_...',  // Points to GPT-4o + Claude
  rateLimit: 100000  // requests/day
};
```

### 4. **A/B Testing**

Compare model performance:

```javascript
const testGroups = {
  control: 'tkp_gpt4o_mini...',     // 50% of users
  experimental: 'tkp_claude...'     // 50% of users
};

const transportKey = Math.random() < 0.5 
  ? testGroups.control 
  : testGroups.experimental;

const response = await chat(message, transportKey);

// Track: Which model has better user satisfaction?
await logMetrics({ transportKey, userRating: response.rating });
```

## Comparison

| Feature | Anno Transport Keys | Raw API Keys | LangChain | LiteLLM |
|---------|---------------------|--------------|-----------|---------|
| **Multi-provider support** | ✅ Built-in | ❌ Manual | ✅ Yes | ✅ Yes |
| **API key encryption** | ✅ AES-256-CBC | ❌ No | ❌ No | ❌ No |
| **Multi-tenant auth** | ✅ JWT + RBAC | ❌ No | ❌ No | ❌ No |
| **Frontend included** | ✅ React UI | ❌ No | ❌ No | ❌ No |
| **5-minute setup** | ✅ Yes | ❌ No | ⚠️ Complex | ⚠️ Complex |
| **Database-backed** | ✅ PostgreSQL | ❌ No | ⚠️ Optional | ❌ No |
| **Rate limiting** | ✅ Per key | ❌ Manual | ⚠️ Optional | ⚠️ Optional |
| **Streaming** | ✅ SSE | ✅ Yes | ✅ Yes | ✅ Yes |
| **Self-hosted** | ✅ Yes | N/A | ✅ Yes | ✅ Yes |
| **License** | ✅ MIT | N/A | ✅ MIT | ⚠️ Varies |

**Sweet Spot:** LangChain's flexibility + LiteLLM's routing + your own auth + zero setup time.

---

## Tech Stack

- **Backend:** Node.js 18+, Express.js
- **Frontend:** React 18+, TypeScript, Vite
- **Database:** PostgreSQL 14+
- **Security:** bcrypt, crypto (AES-256-CBC), jsonwebtoken
- **APIs:** OpenAI, Anthropic, Google AI, Azure OpenAI

**No heavy frameworks. No vendor lock-in. Just clean, maintainable code.**

---

## Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute setup guide
- **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - Complete API reference
- **[INSTALL.md](./INSTALL.md)** - Detailed installation instructions
- **[CHANGELOG.md](./CHANGELOG.md)** - What's new, what's not included

---

## Contributing

We welcome contributions! Here's how:

1. **Fork the repo**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit changes:** `git commit -m 'Add amazing feature'`
4. **Push to branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Setup

```bash
git clone https://github.com/your-org/anno_core.git
cd anno_core
npm install
npm run dev  # Start in development mode
```

---

## Security

### Reporting Vulnerabilities

**DO NOT** open public issues for security vulnerabilities.

Email: difran@gmail.com

We'll respond within 48 hours.

### Security Features

- ✅ **Encrypted API Keys:** AES-256-CBC encryption for all LLM provider keys
- ✅ **Hashed Transport Keys:** bcrypt (cost 10) for transport key storage
- ✅ **JWT Authentication:** Secure session management
- ✅ **Environment Secrets:** No hardcoded credentials
- ✅ **SQL Injection Protection:** Parameterized queries
- ✅ **CORS Configuration:** Restrict allowed origins
- ✅ **Rate Limiting:** Prevent abuse (per transport key)

---

## Roadmap

### v1.0 (Current)
- [x] Multi-provider support (OpenAI, Anthropic, Google, Azure)
- [x] Transport key creation/management
- [x] JWT authentication
- [x] Multi-tenant organizations
- [x] React frontend
- [x] Streaming support
- [x] AES-256-CBC encryption
- [x] PostgreSQL backend

### v1.1 (Next)
- [ ] Natural language routing (auto-select best provider)
- [ ] Cost tracking & analytics dashboard
- [ ] Webhook integrations
- [ ] Advanced rate limiting (token-based)
- [ ] API usage metrics
- [ ] Docker deployment
- [ ] Kubernetes manifests

### v2.0 (Future)
- [ ] Multi-model consensus (query 3 models, synthesize answer)
- [ ] Adaptive routing (learn from user feedback)
- [ ] Custom model hosting (integrate local LLMs)
- [ ] GraphQL API
- [ ] Real-time collaboration
- [ ] Enterprise SSO (SAML, OAuth)

**Want a feature?** 
[Open an issue](https://github.com/madnguvu/anno_core/issues)!

---

## Learn More

### Tutorials (coming soon)
- [Build a Chatbot with Transport Keys](./docs/tutorial-chatbot.md) (Coming soon)
- [Multi-Provider Cost Optimization](./docs/tutorial-cost-optimization.md) (Coming soon)
- [Production Deployment Guide](./docs/tutorial-production.md) (Coming soon)
---

## Enterprise Features

Need more? I'd love to help.  

**Contact:** 
Matthew DiFrancesco 
difran@gmail.com

---

## License

**MIT License** 

**TL;DR:** You can use this commercially, modify it, distribute it. Just keep the copyright notice.

---

## Acknowledgments

Built with inspiration from:
- **Stripe** - For showing how great developer experience drives adoption
- **OpenAI** - For the ChatGPT API structure we adopted
- **LangChain** - For pioneering LLM abstraction
- **LiteLLM** - For multi-provider routing concepts and blazing trails!

Special thanks to the open source community for making this possible.

---

## Star Us!

If Anno_core's Transport Keys helps for you to build better AI applications, **please star this repo!**

It helps others discover the project and motivates us to keep improving it.

---

## Contact

- **GitHub Issues:** [Report bugs or request features](https://github.com/madnguvu/anno_core/issues)
- **Email:** difran@gmail.com (Matthew DiFrancesco = creator)
