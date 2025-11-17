# Anno Transport Keys - Installation Guide

This is the **anno_core** distribution - a complete, production-ready starter package for building multi-tenant AI applications with transport keys.

---

## What's Included

- ✅ Complete backend API (`server.cjs` - ~700 lines)
- ✅ React frontend with authentication and management UI
- ✅ PostgreSQL schema with pre-seeded admin account
- ✅ Multi-provider LLM routing (OpenAI, Anthropic, Google, Azure)
- ✅ JWT authentication with bcrypt password hashing
- ✅ AES-256-CBC encryption for LLM provider API keys
- ✅ Complete documentation (README, QUICKSTART, DEVELOPER_GUIDE)

---

## Quick Install (5 Minutes)

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create Database

```bash
# Create database
createdb anno_core_dev

# Import schema (includes admin/admin123 account)
psql -d anno_core_dev -f database/core-schema.sql
```

**You should see:**
```
✅ Anno Transport Keys database initialized successfully!
-------------------------------------------------------------------------

Default Admin Account:
Email: admin@localhost
Password: admin123

-------------------------------------------------------------------------
```

### Step 3: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env  # or use your preferred editor
```

**Required changes in `.env`:**
```bash
DB_PASSWORD=your_postgres_password
JWT_SECRET=long-random-string-min-32-chars
ENCRYPTION_SECRET=different-long-random-string
```

**Generate secrets:**
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### Step 4: Start Server

```bash
npm start
```
---------------------------------------------------------------------
**Server URLs:**
- Backend API: http://localhost:3009
- React Frontend: http://localhost:5173

### Step 5: Login and Test

1. Open http://localhost:5173
2. Login with:
   - Email: `admin@localhost`
   - Password: `admin123`
3. Create your first transport key
4. Start building!

----------------------------------------------------------------------

## File Structure

```
anno_core/
├── README.md                     # This file
├── QUICKSTART.md                 # Detailed setup guide
├── DEVELOPER_GUIDE.md            # Complete API reference
├── LICENSE                       # MIT License
├── .gitignore                    # Git ignore rules
├── .env.example                  # Environment template
├── package.json                  # Node.js dependencies
├── server.cjs                    # Express.js backend (5,581 lines)
├── App.tsx                       # Main React application
├── index.html                    # HTML entry point
├── vite.config.ts                # Vite build configuration
├── tsconfig.json                 # TypeScript configuration
│
├── database/
│   └── core-schema.sql          # PostgreSQL schema (4 tables) + seed data
│
└── pages/
    ├── LoginPage.tsx            # JWT authentication
    ├── RegisterPage.tsx         # User registration
    └── TransportKeysPage.tsx    # Transport keys management
```

---

## Next Steps

### 1. Read the Documentation

- **QUICKSTART.md** - Complete setup walkthrough with examples
- **DEVELOPER_GUIDE.md** - API reference and advanced topics

### 2. Create a Transport Key

In the frontend:
1. Go to "Transport Keys" page
2. Click "Create Transport Key"
3. Enter:
   - Nickname: "My OpenAI Key"
   - Provider: "openai"
   - Model: "gpt-4o-mini"
   - API Key: "sk-..." (your OpenAI API key)
4. Click "Create"
5. Copy your transport key (tkp_...)

### 3. Test the LLM Relay

```bash
curl -X POST http://localhost:3009/api/relay/chat \
  -H "X-Transport-Key: tkp_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello! What model are you?"}
    ]
  }'
```

### 4. Add Persistent Memories

```bash
curl -X POST http://localhost:3009/api/memories \
  -H "X-Transport-Key: tkp_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "User prefers Python for backend development",
    "keywords": ["python", "backend", "preferences"]
  }'
```

### 5. Manage Keywords

In the frontend:
1. Go to "Keyword Management" page
2. View all keywords extracted from memories
3. Adjust weights (1.000 - 2.000)
4. Enable/disable keywords
5. Filter and sort as needed

---

## Configuration

### Environment Variables

Edit `.env` with your configuration:

**Database (Required):**
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=anno_core_dev
DB_USER=postgres
DB_PASSWORD=your_password_here
```

**Security (Required):**
```bash
JWT_SECRET=your-long-random-secret-min-32-chars
ENCRYPTION_SECRET=different-long-random-secret
```

**Server (Optional):**
```bash
PORT=3009
NODE_ENV=development
```

**LLM Providers (Optional - users can add via UI):**
```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
```

### Multi-Tenant Organizations

The default organization is `999` (general/beta users).

To create a new organization:

```sql
INSERT INTO organizations (org_id, org_name, org_key)
VALUES ('ABC123XYZ', 'My Company', 'custom-org-key');

-- Create users in this org
INSERT INTO users (email, password_hash, first_name, last_name, org_id)
VALUES ('user@company.com', '$2b$10$...', 'John', 'Doe', 'ABC123XYZ');
```

---

## 🐛 Troubleshooting

### "Cannot connect to database"

```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -h localhost -U postgres -d anno_core_dev

# Verify .env settings
cat .env | grep DB_
```

### "JWT malformed" or "Invalid token"

```javascript
// Clear localStorage in browser console
localStorage.clear()

// Re-login to get new token
```

### "LLM provider error"

1. Verify API key is correct in transport key
2. Check provider base URL is reachable
3. Verify model name is valid for provider
4. Check rate limits not exceeded

### "Port 3009 already in use"

```bash
# Change PORT in .env
PORT=3010

# Or find and kill process on port 3009
# Linux/Mac:
lsof -ti:3009 | xargs kill

# Windows:
netstat -ano | findstr :3009
taskkill /PID <process_id> /F
```

---

## 📚 API Quick Reference

### Authentication

**Register:**
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "securepass123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Login:**
```bash
POST /api/auth/login
{
  "email": "admin@localhost",
  "password": "admin123"
}
```

### Transport Keys

**Create:**
```bash
POST /api/transport-keys
Headers: Authorization: Bearer <jwt_token>
{
  "nickname": "My OpenAI Key",
  "provider": "openai",
  "model_name": "gpt-4o-mini",
  "encrypted_provider_api_key": "sk-..."
}
```

**List:**
```bash
GET /api/transport-keys
Headers: Authorization: Bearer <jwt_token>
```

### LLM Relay

**Chat:**
```bash
POST /api/relay/chat
Headers: X-Transport-Key: tkp_...
{
  "messages": [
    {"role": "user", "content": "Hello!"}
  ]
}
```

### Memories

**Create:**
```bash
POST /api/memories
Headers: X-Transport-Key: tkp_...
{
  "content": "User prefers concise answers",
  "keywords": ["preferences", "concise"]
}
```

**List:**
```bash
GET /api/memories
Headers: X-Transport-Key: tkp_...
```

### Keywords

**List:**
```bash
GET /api/keywords
Headers: Authorization: Bearer <jwt_token>
```

**Update Weight:**
```bash
PATCH /api/keywords/python
Headers: Authorization: Bearer <jwt_token>
{
  "weight": 1.5000
}
```

---

## 🚢 Production Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3009
CMD ["node", "server.cjs"]
```

```bash
docker build -t anno-transport-keys .
docker run -p 3009:3009 --env-file .env anno-transport-keys
```

### Environment-Specific Databases

**Development:**
```bash
DB_NAME=anno_core_dev
```

**Staging:**
```bash
DB_NAME=anno_core_staging
```

**Production:**
```bash
DB_NAME=anno_core_prod
NODE_ENV=production
```

### Security Checklist

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Change `ENCRYPTION_SECRET` to different random value
- [ ] Use environment-specific database credentials
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS for production domains
- [ ] Set `NODE_ENV=production`
- [ ] Regular security updates for dependencies
- [ ] Enable audit logging
- [ ] Implement rate limiting
- [ ] Use secure password policies

---

## 🤝 Support

**Documentation:**
- QUICKSTART.md - Detailed setup guide
- DEVELOPER_GUIDE.md - Complete API reference

**Common Issues:**
See the Troubleshooting section above

**Contributing:**
Fork the repository, make improvements, submit pull requests!

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🎯 What's Next?

1. ✅ Server running
2. ✅ Logged in as admin
3. ✅ First transport key created
4. **→ Start building your AI application!**

Ideas:
- Multi-tenant SaaS chatbot
- Internal enterprise AI tools
- AI agent platforms
- Research projects
- Educational tools

**Happy building! 🚀**
