# Anno Transport Keys - Quick Start Guide# Anno Transport Keys - Developer Quickstart 🚀



This guide will get you up and running with Anno Transport Keys in **5 minutes**.**Get started in 5 minutes.** This is a batteries-included starter project for building multi-tenant AI applications with transport keys, multi-provider LLM routing, and persistent memory.



------



## 📦 What You'll Build## 📦 What You Get



By the end of this guide, you'll have:- ✅ **JWT Multi-Tenant Authentication** (users, orgs, roles)

- ✅ Working authentication system (JWT)- ✅ **Transport Keys** (TTTTTTTTT-UUU-SSS-WWW-VV-XX-YY-ZZZZ-C indexing)

- ✅ Multi-tenant organization support- ✅ **Multi-Provider LLM Routing** (OpenAI, Anthropic, Google, Gemini, Azure, custom endpoints)

- ✅ Your first transport key created- ✅ **Persistent Memory System** (episodic memories with temporal indexing)

- ✅ LLM routing to OpenAI/Anthropic/Google/Azure- ✅ **Keyword Management UI** (weights, categories, enable/disable)

- ✅ React frontend for managing keys- ✅ **React Frontend** (login, transport keys, keyword management)

- ✅ **PostgreSQL Backend** (with pre-seeded admin account)

---- ✅ **Developer-Ready** (npm install, import SQL, start coding)



## ⚡ Quick Installation---



### Step 1: Install Dependencies## ⚡ Quickstart (3 Steps)



```bash### Step 1: Install Dependencies

npm install

``````bash

cd anno_core

**What this installs:**npm install

- Express.js (backend server)```

- PostgreSQL driver (database)

- bcrypt (password hashing)**Required**: Node.js 18+, PostgreSQL 14+

- jsonwebtoken (JWT authentication)

- React + Vite (frontend)---

- TypeScript support

### Step 2: Create Database and Import Schema

### Step 2: Create Database

```bash

```bash# Create database

# Create PostgreSQL databasecreatedb anno_transport_dev

createdb anno_transport_dev

# Import schema and seed data (includes admin/admin123 account)

# Import schema (creates 4 tables)psql -d anno_transport_dev -f database/quickstart-schema.sql

psql -d anno_transport_dev -f database/core-schema.sql```

```

**Default Admin Account:**

**You should see:**- Email: `admin@localhost`

```- Password: `admin123`

✅ Anno Transport Keys (Core) database initialized successfully!- Org ID: `999` (default/beta org)

- Role: Admin (role_id: 1)

📧 Default Admin Account:

   Email: admin@localhost---

   Password: admin123

   Org ID: 999 (Default Organization)### Step 3: Configure Environment and Start

```

```bash

**Tables created:**# Copy environment template

- `organizations` - Multi-tenant supportcp .env.example .env

- `users` - JWT authentication

- `transport_keys` - LLM routing# Edit .env with your database credentials and LLM API keys (optional for testing)

- `transport_key_providers` - Multi-provider configs# DB_HOST=localhost

# DB_PORT=5432

### Step 3: Configure Environment### Step 3: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your settings
nano .env
```

**Required changes:**
```bash
# DB_NAME=anno_core_dev

# DB_USER=postgres

```bash# DB_PASSWORD=your_password

# Copy template# JWT_SECRET=change-this-in-production

cp .env.example .env# OPENAI_API_KEY=sk-...  (optional)

# ANTHROPIC_API_KEY=sk-... (optional)

# Edit with your settings

nano .env  # or code .env# Start server (runs both backend API and React frontend)

```npm start

```

**Required settings:**

```bash**Server URLs:**

# Database- Backend API: http://localhost:3009

DB_PASSWORD=your_postgres_password- React Frontend: http://localhost:5173



# Security (generate random strings)---

JWT_SECRET=long-random-string-min-32-chars

ENCRYPTION_SECRET=different-long-random-string## 🎯 First Login

```

1. Open http://localhost:5173

**Generate secrets:**2. Login with **admin@localhost** / **admin123**

```bash3. You're in! Start building.

# Linux/Mac

openssl rand -base64 32---



# Windows (PowerShell)## 🛠️ What to Build First

[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

```### 1. Create a Transport Key



### Step 4: Start ServerNavigate to **Transport Keys** page:

- Click "Create New Transport Key"

```bash- Nickname: `my-first-key`

npm start- Provider: `openai`

```- Model: `gpt-4o-mini`

- Paste your OpenAI API key

**You should see:**- Click "Create"

```

[SERVER] Anno Transport Keys Server running on http://localhost:3009Copy your transport key (looks like `tkp_abc123...`)

[SERVER] Mode: relay

[SERVER] API endpoints available at http://localhost:3009/api---

[RELAY SERVER] Transport key endpoint: POST http://localhost:3009/api/relay/chat

```### 2. Test Multi-Provider LLM Routing



**Frontend:** http://localhost:5173  ```bash

**Backend API:** http://localhost:3009# Use your transport key to call OpenAI

curl -X POST http://localhost:3009/api/relay/chat \

---  -H "X-Transport-Key: tkp_abc123..." \

  -H "Content-Type: application/json" \

## 🎯 First Login  -d '{

    "messages": [{"role": "user", "content": "Hello! What model are you?"}]

1. Open http://localhost:5173 in your browser  }'

2. Click "Login"```

3. Enter credentials:

   - **Email:** admin@localhost**What Happens:**

   - **Password:** admin1231. Server validates your transport key

4. Click "Sign In"2. Loads your provider config (OpenAI, gpt-4o-mini)

3. Injects persistent context from memories

**You're in!** 🎉4. Routes to OpenAI API

5. Stores conversation in PostgreSQL

---6. Returns response with conversation_id



## 🔑 Create Your First Transport Key---



### Via Frontend (Easy)### 3. Add Persistent Memories



1. Click "Transport Keys" in the navigation```bash

2. Click "Create Transport Key"# Create a memory that will be injected into all conversations

3. Fill in the form:curl -X POST http://localhost:3009/api/memories \

   - **Nickname:** "My OpenAI Key"  -H "X-Transport-Key: tkp_abc123..." \

   - **Provider:** OpenAI  -H "Content-Type: application/json" \

   - **Model:** gpt-4o-mini  -d '{

   - **API Key:** sk-... (your OpenAI API key)    "content": "User prefers concise answers with code examples.",

   - **Temperature:** 0.7 (optional)    "keywords": ["preferences", "code", "concise"]

4. Click "Create"  }'

5. **Copy your transport key!** (tkp_...)```



**Important:** Save this transport key - you'll need it for API calls!**Next LLM call will include:**

```

### Via API (Advanced)<persistent_context>

User prefers concise answers with code examples.

```bash</persistent_context>

# 1. Login to get JWT token```

curl -X POST http://localhost:3009/api/auth/login \

  -H "Content-Type: application/json" \---

  -d '{

    "email": "admin@localhost",### 4. Manage Keywords

    "password": "admin123"

  }'Navigate to **Keyword Management** page:

- View all keywords extracted from memories

# Response: { "token": "eyJhbGc...", "user": {...} }- Adjust weights (1.000 - 2.000)

- Enable/disable keywords for indexing

# 2. Create transport key- Filter by category (normal, collocate, stop_word, custom)

curl -X POST http://localhost:3009/api/transport-keys \

  -H "Authorization: Bearer eyJhbGc..." \**Keyword Weights:**

  -H "Content-Type: application/json" \- Single words (e.g., "code"): 1.000 (default)

  -d '{- Phrases (e.g., "code_examples"): 2.000 (default)

    "nickname": "My OpenAI Key",- Custom weights: Multiply contribution to temporal indices (XX, YY, ZZZZ)

    "provider": "openai",

    "model_name": "gpt-4o-mini",---

    "encrypted_provider_api_key": "sk-...",

    "temperature": 0.7## 🧠 Understanding Transport Keys

  }'

### The Index Structure: `TTTTTTTTT-UUU-SSS-WWW-VV-XX-YY-ZZZZ-C`

# Response: { "transportKey": "tkp_abc123...", "display": "tkp_***123" }

```| Component | Meaning | Example |

|-----------|---------|---------|

---| **TTTTTTTTT** | Organization ID (alphanumeric, 36^9 orgs) | `999` (default/beta) |

| **UUU** | Entity type + RBAC (person/family/org/robot/fleet) | `100` (standard user) |

## 🚀 Test LLM Routing| **SSS** | Sentiment scoring with differential decay | `1500` (neutral) |

| **WWW** | Semantic cluster ID (dynamic grouping) | `001` |

Now let's test your transport key!| **VV** | Data source (LLM=5, manual=6, file=7) | `05` |

| **XX** | Same-day keyword density (weighted) | `03` |

### Test 1: Simple Chat| **YY** | 14-day window keyword density (weighted) | `12` |

| **ZZZZ** | Initial density + access frequency (anti-gaming) | `0008` |

```bash| **C** | Critical/cache flag (auto-decay 24hrs) | `0` |

curl -X POST http://localhost:3009/api/relay/chat \

  -H "X-Transport-Key: tkp_your_key_here" \**Example Transport Key:** `tkp_999-100-1500-001-05-03-12-0008-0`

  -H "Content-Type: application/json" \

  -d '{---

    "messages": [

      {"role": "user", "content": "Hello! What model are you?"}## 🌐 Multi-Provider LLM Support

    ]

  }'### Supported Providers (Pre-Configured)

```

| Provider | Base URL | Models |

**Expected response:**|----------|----------|--------|

```json| **OpenAI** | `https://api.openai.com/v1` | gpt-4o, gpt-4o-mini, o1-preview, o1-mini |

{| **Anthropic** | `https://api.anthropic.com/v1` | claude-3-5-sonnet-latest, claude-3-5-haiku-latest |

  "choices": [| **Google Gemini** | `https://generativelanguage.googleapis.com/v1beta` | gemini-2.0-flash-exp, gemini-1.5-pro |

    {| **Azure OpenAI** | Custom (your deployment URL) | gpt-4o, gpt-4-turbo |

      "message": {| **Custom Endpoint** | Any OpenAI-compatible API | Any model |

        "role": "assistant",

        "content": "Hello! I'm GPT-4o-mini, a language model created by OpenAI..."### Adding a Provider to Your Transport Key

      }

    }**Frontend UI:**

  ],1. Go to Transport Keys page

  "usage": {2. Click on a transport key

    "prompt_tokens": 12,3. Add Provider → Select provider type

    "completion_tokens": 25,4. Nickname: "My OpenAI Key"

    "total_tokens": 375. Model: "gpt-4o-mini"

  }6. API Key: "sk-..."

}7. Save

```

**API Call:**

### Test 2: With System Prompt```bash

curl -X POST http://localhost:3009/api/transport-keys/{key_id}/providers \

```bash  -H "Authorization: Bearer {jwt_token}" \

curl -X POST http://localhost:3009/api/relay/chat \  -H "Content-Type: application/json" \

  -H "X-Transport-Key: tkp_your_key_here" \  -d '{

  -H "Content-Type: application/json" \    "nickname": "My OpenAI Key",

  -d '{    "provider": "openai",

    "messages": [    "model_name": "gpt-4o-mini",

      {"role": "system", "content": "You are a helpful coding assistant. Be concise."},    "encrypted_provider_api_key": "sk-...",

      {"role": "user", "content": "Write a Python function to reverse a string"}    "temperature": 0.7,

    ]    "max_tokens": 4000

  }'  }'

``````



### Test 3: Custom Temperature### Using Multi-Provider Routing



```bash**Specify Provider by Nickname:**

curl -X POST http://localhost:3009/api/relay/chat \```bash

  -H "X-Transport-Key: tkp_your_key_here" \curl -X POST http://localhost:3009/api/relay/chat \

  -H "Content-Type: application/json" \  -H "X-Transport-Key: tkp_abc123..." \

  -d '{  -H "Content-Type: application/json" \

    "temperature": 0.9,  -d '{

    "messages": [    "provider_nickname": "My OpenAI Key",

      {"role": "user", "content": "Write a creative story about a robot"}    "messages": [{"role": "user", "content": "Hello!"}]

    ]  }'

  }'```

```

**Automatic Provider Selection:**

---- If `provider_nickname` not specified, uses default (first active provider)

- Can switch providers mid-conversation

## 🌐 Multi-Provider Setup- Each message stores which provider was used



### Add Multiple Providers---



Create transport keys for different providers:## 📚 Database Schema



```bash### Core Tables

# OpenAI

curl -X POST http://localhost:3009/api/transport-keys \**users** - Multi-tenant user accounts

  -H "Authorization: Bearer {jwt}" \- `id` UUID (primary key)

  -H "Content-Type: application/json" \- `email` VARCHAR(255) UNIQUE

  -d '{- `password_hash` VARCHAR(255)

    "nickname": "OpenAI GPT-4o",- `org_id` VARCHAR(9) (links to organizations)

    "provider": "openai",- `role_id` INTEGER (1=admin, 2=user)

    "model_name": "gpt-4o-mini",- `api_key` VARCHAR(255) (JWT alternative)

    "encrypted_provider_api_key": "sk-..."

  }'**transport_keys** - LLM routing credentials

- `id` UUID (primary key)

# Anthropic- `user_id` UUID (foreign key)

curl -X POST http://localhost:3009/api/transport-keys \- `nickname` VARCHAR(255)

  -H "Authorization: Bearer {jwt}" \- `provider` VARCHAR(50) (openai, anthropic, google, etc.)

  -H "Content-Type: application/json" \- `api_key_hash` VARCHAR(255) (bcrypt hashed)

  -d '{- `display_key` VARCHAR(50) (tkp_...)

    "nickname": "Claude Sonnet",- `encrypted_provider_api_key` TEXT (AES-256 encrypted)

    "provider": "anthropic",- `model_name` VARCHAR(255)

    "model_name": "claude-3-5-sonnet-latest",- `system_prompt` TEXT

    "encrypted_provider_api_key": "sk-ant-..."- `temperature` DECIMAL(3,2)

  }'- `active` BOOLEAN



# Google Gemini**transport_key_providers** - Multi-provider configs per key

curl -X POST http://localhost:3009/api/transport-keys \- `id` UUID (primary key)

  -H "Authorization: Bearer {jwt}" \- `transport_key_id` UUID (foreign key)

  -H "Content-Type: application/json" \- `nickname` VARCHAR(255) (user-friendly name)

  -d '{- `provider` VARCHAR(50)

    "nickname": "Gemini Flash",- `model_name` VARCHAR(255)

    "provider": "google",- `encrypted_provider_api_key` TEXT

    "model_name": "gemini-2.0-flash-exp",- `base_url` VARCHAR(500) (for custom endpoints)

    "encrypted_provider_api_key": "your-google-key"- `is_active` BOOLEAN (current default provider)

  }'

```**episodic_memories** - Persistent context storage

- `id` UUID (primary key)

### Use Different Providers- `user_id` UUID (foreign key)

- `timestamp` BIGINT (Unix timestamp)

```javascript- `content` TEXT (memory text)

// Use OpenAI key- `keywords` TEXT[] (array of keywords)

fetch('/api/relay/chat', {- `org_id` VARCHAR(9) (TTTTTTTTT)

  headers: { 'X-Transport-Key': 'tkp_openai_key' },- `role_id` VARCHAR(3) (UUU)

  body: JSON.stringify({- `cluster_id` VARCHAR(3) (WWW)

    messages: [{ role: 'user', content: 'Code help?' }]- `vv` INTEGER (data source)

  })- `xx` INTEGER (same-day keyword density)

});- `yy` INTEGER (14-day keyword density)

- `zzzz` INTEGER (initial density + access frequency)

// Use Anthropic key- `c` INTEGER (critical flag: 0 or 1)

fetch('/api/relay/chat', {- `always_relevant` BOOLEAN (star/pin flag)

  headers: { 'X-Transport-Key': 'tkp_anthropic_key' },- `last_accessed` BIGINT

  body: JSON.stringify({

    messages: [{ role: 'user', content: 'Code help?' }]**keyword_metadata** - Keyword configuration

  })- `keyword` VARCHAR(255) (primary key)

});- `weight` DECIMAL(5,4) (1.0000 - 2.0000)

```- `category` VARCHAR(50) (normal, collocate, stop_word, custom)

- `enabled` BOOLEAN

---- `notes` TEXT

- `first_seen_at` TIMESTAMP (when keyword first appeared)

## 🔐 Security Features- `last_viewed_at` TIMESTAMP (when last viewed in UI)

- `view_count` INTEGER (how many times viewed)

### Encrypted API Keys

**conversation_messages** - Full LLM conversation history

All LLM provider API keys are **AES-256-CBC encrypted** before storage:- `id` UUID (primary key)

- `transport_key_id` UUID (foreign key)

```javascript- `role` VARCHAR(20) (user, assistant, system)

// You provide:- `content` TEXT

"encrypted_provider_api_key": "sk-proj-abc123..."- `provider` VARCHAR(50) (which LLM was used)

- `model_name` VARCHAR(255)

// Stored in database as:- `timestamp` BIGINT

"a1b2c3d4e5f6:9f8e7d6c5b4a3210fedcba9876543210"- `tokens_used` INTEGER

// (IV + encrypted data)- `archived` BOOLEAN

```

---

### Hashed Transport Keys

## 🔐 Security & Encryption

Transport keys are **bcrypt hashed** (cost factor 10):

### API Key Encryption

```javascriptAll LLM provider API keys are encrypted before storage:

// You receive:

"tkp_abc123def456ghi789..."```javascript

// AES-256-CBC encryption

// Stored in database as:const ENCRYPTION_KEY = crypto.scryptSync(

"$2b$10$aBZSyFi8pnhmmoYorv7bk.MLSM5JMxDOuLxWfmJIS/jGhqHCRBdui"  process.env.ENCRYPTION_SECRET || 'change-in-production',

```  'salt',

  32

### JWT Authentication);



User sessions use **JWT tokens** (7-day expiration):// Encrypted format: "iv:encryptedData"

const encrypted = encryptApiKey("sk-...");

```javascript// Stored: "a1b2c3d4e5f6....:9f8e7d6c5b4a...."

// Token structure:```

{

  "id": "uuid",### Transport Key Hashing

  "email": "user@example.com",Transport keys are bcrypt hashed (cost factor 10):

  "orgId": "999",

  "iat": 1234567890,```javascript

  "exp": 1235172690  // +7 daysconst bcrypt = require('bcrypt');

}const apiKeyHash = await bcrypt.hash(transportKey, 10);

```// Stored: "$2b$10$..."

```

---

### JWT Tokens

## 🎨 Frontend FeaturesUser sessions use JWT with configurable expiration:



### Transport Keys Page```javascript

const token = jwt.sign(

**Features:**  { id: user.id, email: user.email, orgId: user.org_id },

- View all your transport keys  process.env.JWT_SECRET || 'change-in-production',

- Create new keys  { expiresIn: '7d' }

- Delete keys);

- Copy keys to clipboard```

- See masked display (tkp_***123)

---

**React Component:** `pages/TransportKeysPage.tsx`

## 🎨 Frontend Pages

### Login/Register Pages

The React frontend includes 4 main pages:

**Features:**

- JWT authentication### 1. **Login Page** (`pages/LoginPage.tsx`)

- Password show/hide toggle- Email/password authentication

- Error handling- JWT token storage in localStorage

- Loading states- Auto-redirect if already logged in

- Automatic redirect after login- Switch to registration



**React Components:** ### 2. **Transport Keys Page** (`pages/TransportKeysPage.tsx`)

- `pages/LoginPage.tsx`- Create new transport keys

- `pages/RegisterPage.tsx`- Manage providers (OpenAI, Anthropic, Google, Azure, custom)

- View/edit provider configs

---- Copy transport key for API use

- Enable/disable keys

## 📊 Database Schema- View usage stats



### organizations### 3. **Keyword Management Page** (`pages/KeywordManagementPage.tsx`)

- View all keywords from memories

```sql- Filter by category (normal, collocate, stop_word, custom)

CREATE TABLE organizations (- Sort by weight, date, view count, alphabetical

    org_id VARCHAR(9) PRIMARY KEY,        -- "999"- Edit keyword weights (1.000 - 2.000)

    org_name VARCHAR(255) NOT NULL,       -- "Default Organization"- Enable/disable keywords

    org_key VARCHAR(255),- Bulk actions (enable/disable multiple)

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),- Auto-mark keywords as viewed

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);### 4. **Dashboard** (`App.tsx`)

```- Navigation sidebar

- User profile

### users- Logout

- Page routing

```sql

CREATE TABLE users (---

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    username VARCHAR(255) UNIQUE,## 🧪 Testing the API

    email VARCHAR(255) UNIQUE NOT NULL,

    first_name VARCHAR(255) NOT NULL,### 1. Register a New User

    last_name VARCHAR(255) NOT NULL,

    password_hash VARCHAR(255) NOT NULL,  -- bcrypt```bash

    role_id INTEGER NOT NULL DEFAULT 2,   -- 1=admin, 2=usercurl -X POST http://localhost:3009/api/auth/register \

    active BOOLEAN NOT NULL DEFAULT true,  -H "Content-Type: application/json" \

    org_id VARCHAR(9) NOT NULL DEFAULT '999',  -d '{

    api_key VARCHAR(255) UNIQUE,    "email": "developer@example.com",

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),    "password": "securepass123",

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),    "first_name": "Dev",

    FOREIGN KEY (org_id) REFERENCES organizations(org_id)    "last_name": "User"

);  }'

``````



### transport_keys**Response:**

```json

```sql{

CREATE TABLE transport_keys (  "user": {

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),    "id": "uuid-here",

    user_id UUID NOT NULL REFERENCES users(id),    "email": "developer@example.com",

    nickname VARCHAR(255) NOT NULL,    "org_id": "999",

    provider VARCHAR(50) NOT NULL,        -- openai, anthropic, google, etc.    "role_id": 2

    api_key_hash VARCHAR(255) NOT NULL,   -- bcrypt hash of transport key  },

    display_key VARCHAR(50) NOT NULL,     -- tkp_***123  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

    encrypted_provider_api_key TEXT,      -- AES-256-CBC encrypted}

    base_url VARCHAR(500),```

    deployment VARCHAR(255),              -- Azure deployment name

    api_version VARCHAR(50),              -- Azure API version---

    temperature DECIMAL(3,2) DEFAULT 0.7,

    model_name VARCHAR(255),### 2. Login

    system_prompt TEXT,

    max_requests_per_minute INTEGER DEFAULT 60,```bash

    custom_params JSONB DEFAULT '{}',curl -X POST http://localhost:3009/api/auth/login \

    active BOOLEAN DEFAULT true,  -H "Content-Type: application/json" \

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  -d '{

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()    "email": "admin@localhost",

);    "password": "admin123"

```  }'

```

### transport_key_providers

**Response:**

```sql```json

CREATE TABLE transport_key_providers ({

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  "user": {

    transport_key_id UUID NOT NULL REFERENCES transport_keys(id),    "id": "uuid-here",

    nickname VARCHAR(255) NOT NULL,    "email": "admin@localhost",

    provider VARCHAR(50) NOT NULL,    "first_name": "Admin",

    model_name VARCHAR(255),    "last_name": "User"

    encrypted_provider_api_key TEXT,  },

    base_url VARCHAR(500),  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

    deployment VARCHAR(255),}

    api_version VARCHAR(50),```

    temperature DECIMAL(3,2) DEFAULT 0.7,

    system_prompt TEXT,Save the `token` for authenticated requests.

    max_tokens INTEGER DEFAULT 4000,

    custom_params JSONB DEFAULT '{}',---

    is_active BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),### 3. Create Transport Key

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);```bash

```curl -X POST http://localhost:3009/api/transport-keys \

  -H "Authorization: Bearer {your_jwt_token}" \

---  -H "Content-Type: application/json" \

  -d '{

## 🛠️ Common Tasks    "nickname": "My OpenAI Key",

    "provider": "openai",

### List All Transport Keys    "model_name": "gpt-4o-mini",

    "encrypted_provider_api_key": "sk-...",

```bash    "temperature": 0.7

curl http://localhost:3009/api/transport-keys \  }'

  -H "Authorization: Bearer {jwt_token}"```

```

**Response:**

### Delete a Transport Key```json

{

```bash  "id": "uuid-here",

curl -X DELETE http://localhost:3009/api/transport-keys/{key_id} \  "nickname": "My OpenAI Key",

  -H "Authorization: Bearer {jwt_token}"  "provider": "openai",

```  "display_key": "tkp_abc123...",

  "active": true

### Register New User}

```

```bash

curl -X POST http://localhost:3009/api/auth/register \---

  -H "Content-Type: application/json" \

  -d '{### 4. Chat with LLM (Multi-Provider Routing)

    "email": "dev@example.com",

    "password": "securepass123",```bash

    "first_name": "Developer",curl -X POST http://localhost:3009/api/relay/chat \

    "last_name": "User"  -H "X-Transport-Key: tkp_abc123..." \

  }'  -H "Content-Type: application/json" \

```  -d '{

    "messages": [

---      {"role": "user", "content": "Explain transport keys in one sentence"}

    ]

## 🐛 Troubleshooting  }'

```

### "Cannot connect to database"

**Response:**

```bash```json

# Check PostgreSQL is running{

pg_isready  "provider": "openai",

  "model": "gpt-4o-mini",

# Test connection  "response": "Transport keys are unified authentication primitives that route AI conversations to multiple LLM providers while maintaining persistent context and conversation history.",

psql -h localhost -U postgres -d anno_transport_dev  "conversation_id": "uuid-here",

  "tokens_used": 45

# Verify .env settings}

cat .env | grep DB_```

```

---

### "JWT malformed"

### 5. Add Memory (Persistent Context)

```javascript

// Clear localStorage in browser console```bash

localStorage.clear()curl -X POST http://localhost:3009/api/memories \

  -H "Authorization: Bearer {your_jwt_token}" \

// Re-login to get new token  -H "Content-Type: application/json" \

```  -d '{

    "content": "User is a Python developer building a chatbot",

### "Invalid transport key"    "keywords": ["python", "chatbot", "developer"]

  }'

- Check that you copied the full key (starts with `tkp_`)```

- Ensure key wasn't deleted

- Verify key is active in database**Next chat will include:**

```

### "Port 3009 already in use"<persistent_context>

User is a Python developer building a chatbot

```bash</persistent_context>

# Change PORT in .env```

PORT=3010

---

# Or find and kill process

# Linux/Mac:### 6. Get All Memories

lsof -ti:3009 | xargs kill

```bash

# Windows:curl -X GET http://localhost:3009/api/memories \

netstat -ano | findstr :3009  -H "Authorization: Bearer {your_jwt_token}"

taskkill /PID <process_id> /F```

```

---

---

### 7. Get Keywords

## 🚀 What's Next?

```bash

### Build Your First Appcurl -X GET http://localhost:3009/api/keywords \

  -H "Authorization: Bearer {your_jwt_token}"

```javascript```

// Simple chatbot

async function chat(message) {**Response:**

  const response = await fetch('/api/relay/chat', {```json

    method: 'POST',[

    headers: {  {

      'X-Transport-Key': 'tkp_your_key',    "keyword": "python",

      'Content-Type': 'application/json'    "weight": 1.0000,

    },    "category": "normal",

    body: JSON.stringify({    "enabled": true,

      messages: [    "first_seen_at": "2025-11-17T10:00:00Z",

        { role: 'user', content: message }    "last_viewed_at": null,

      ]    "view_count": 0

    })  },

  });  {

      "keyword": "code_examples",

  const data = await response.json();    "weight": 2.0000,

  return data.choices[0].message.content;    "category": "collocate",

}    "enabled": true

  }

// Use it]

const answer = await chat('What is the capital of France?');```

console.log(answer); // "The capital of France is Paris."

```---



### Advanced Features### 8. Update Keyword Weight



For advanced capabilities, see:```bash

- **ADVANCED_ROUTING.md** - Natural language routingcurl -X PATCH http://localhost:3009/api/keywords/python \

- **DEVELOPER_GUIDE.md** - Complete API reference  -H "Authorization: Bearer {your_jwt_token}" \

- **Enterprise Version** - Persistent memories, keyword weighting, conversation tracking  -H "Content-Type: application/json" \

  -d '{

---    "weight": 1.5000

  }'

## 📚 Learn More```



- **README.md** - Feature overview---

- **DEVELOPER_GUIDE.md** - API reference

- **ADVANCED_ROUTING.md** - Routing concepts## 🚢 Production Deployment

- **CHANGELOG.md** - Version history

### Environment Variables

---

```bash

**Ready to build? You now have:**# Database

- ✅ Working authenticationDB_HOST=your-postgres-host

- ✅ Transport keys createdDB_PORT=5432

- ✅ LLM routing configuredDB_NAME=anno_production

- ✅ React frontend runningDB_USER=anno_user

DB_PASSWORD=strong-random-password

**Start building your AI application! 🚀**

# Security
JWT_SECRET=long-random-string-min-32-chars
ENCRYPTION_SECRET=different-long-random-string

# Server
PORT=3009
NODE_ENV=production

# LLM Providers (optional, users can add their own)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
GOOGLE_API_KEY=...
```

### Database Setup

```bash
# Production database
createdb -U anno_user anno_production

# Import schema (SKIP seed data for production)
psql -U anno_user -d anno_production -f database/schema-only.sql

# Create first admin manually
psql -U anno_user -d anno_production
INSERT INTO users (id, email, password_hash, first_name, last_name, role_id, org_id)
VALUES (
  gen_random_uuid(),
  'admin@yourcompany.com',
  -- Use bcrypt to hash password: bcrypt.hash('your-password', 10)
  '$2b$10$...',
  'Admin',
  'User',
  1,
  '999'
);
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3009
CMD ["node", "server.cjs"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: anno_production
      POSTGRES_USER: anno_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  anno-server:
    build: .
    ports:
      - "3009:3009"
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: anno_production
      DB_USER: anno_user
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      ENCRYPTION_SECRET: ${ENCRYPTION_SECRET}
    depends_on:
      - postgres

volumes:
  postgres_data:
```

---

## 📖 Developer Guide

### Adding a Custom LLM Provider

1. **Define Provider Config in `server.cjs`:**

```javascript
// server.cjs - LLM provider routing
const LLM_PROVIDERS = {
  'my-custom-llm': {
    base_url: 'https://api.mycustomllm.com/v1',
    auth_header: 'Authorization',
    auth_prefix: 'Bearer',
    default_model: 'my-model-v1',
    supports_streaming: true
  }
};
```

2. **Add to Frontend Provider List:**

```typescript
// pages/TransportKeysPage.tsx
const PROVIDER_OPTIONS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'my-custom-llm', label: 'My Custom LLM' }
];
```

3. **Test:**

```bash
curl -X POST http://localhost:3009/api/transport-keys \
  -H "Authorization: Bearer {jwt}" \
  -d '{
    "provider": "my-custom-llm",
    "model_name": "my-model-v1",
    "encrypted_provider_api_key": "custom-api-key"
  }'
```

---

### Custom Indexing Logic

Modify temporal index calculations in `server.cjs`:

```javascript
// server.cjs - Temporal indexing
const recalculateIndices = async (memories) => {
  const clusteredMemories = updateMemoryClusters(memories);
  const allKeywords = new Set();
  clusteredMemories.forEach(mem => {
    mem.keywords.forEach(kw => allKeywords.add(kw));
  });
  const weightMap = await getKeywordWeights(Array.from(allKeywords));

  return clusteredMemories.map(targetMemory => {
    const keywords = targetMemory.keywords;
    let occurrencesOnDate = 0;
    let occurrencesInWindow = 0;

    const windowStart = targetMemory.timestamp - (WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const windowEnd = targetMemory.timestamp + (WINDOW_DAYS * 24 * 60 * 60 * 1000);

    clusteredMemories.forEach(mem => {
      const matchingKeywords = mem.keywords.filter(k => keywords.includes(k));
      if (matchingKeywords.length > 0) {
        const weight = matchingKeywords.reduce((sum, keyword) => {
          const keywordWeight = weightMap.get(keyword) || 1.000;
          return sum + keywordWeight;
        }, 0);

        if (isSameDay(targetMemory.timestamp, mem.timestamp)) {
          occurrencesOnDate += weight;
        }
        if (mem.timestamp >= windowStart && mem.timestamp <= windowEnd) {
          occurrencesInWindow += weight;
        }
      }
    });

    // Custom logic: Boost XX by 2x for important keywords
    targetMemory.index.XX = occurrencesOnDate > 0 
      ? Math.min(10, Math.max(1, Math.ceil(occurrencesOnDate / 10))) 
      : 0;
    
    targetMemory.index.YY = Math.min(99, occurrencesInWindow);

    return targetMemory;
  });
};
```

---

## 🐛 Troubleshooting

### "Cannot connect to database"
```bash
# Check PostgreSQL is running
pg_isready

# Check credentials in .env
cat .env | grep DB_

# Test connection
psql -h localhost -U postgres -d anno_transport_dev
```

### "JWT malformed" or "Invalid token"
```bash
# Clear localStorage in browser
localStorage.clear()

# Or delete specific keys
localStorage.removeItem('auth_token')
localStorage.removeItem('user')

# Re-login to get new token
```

### "Transport key not found"
```bash
# Verify key exists
curl -X GET http://localhost:3009/api/transport-keys \
  -H "Authorization: Bearer {jwt}"

# Check active status
# Keys with active=false won't work
```

### "LLM provider error"
```bash
# Check API key is correct
# Check provider base URL is reachable
# Check model name is valid for that provider

# Test provider directly
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-..."
```

---

## 📝 License

MIT License - Build whatever you want!

---

## 🤝 Contributing

This is a starter template. Fork it, modify it, ship it!

**Ideas for Extensions:**
- Webhook notifications when memories are created
- Slack/Discord integration for LLM relay
- Vector embeddings for semantic memory search
- Custom memory retention policies
- Advanced RBAC with org-level permissions
- Multi-region database replication
- Redis caching layer for high-volume deployments

---

## 📧 Support

Questions? Open an issue or check the [Developer Guide](./DEVELOPER_GUIDE.md) for advanced topics.

**Happy building! 🚀**
