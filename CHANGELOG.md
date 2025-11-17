# Anno Core - Changelog

## Version 1.0.0 - Initial Release (Core Distribution)

### What's Included

This is the **minimal core distribution** of Anno Transport Keys, containing only the essential functionality for multi-provider LLM routing with transport keys.

#### Core Features ✅
- **Multi-tenant authentication** (Organizations + Users with JWT)
- **Transport keys** (Unified LLM routing primitive)
- **Multi-provider support** (OpenAI, Anthropic, Google, Azure, custom)
- **Encrypted API key storage** (AES-256-CBC)
- **Transport key hashing** (bcrypt)
- **Rate limiting** (Per transport key)
- **React frontend** (Login, Transport Keys management)
- **Complete documentation** (README, QUICKSTART, DEVELOPER_GUIDE)

#### Database Schema (4 Tables)
1. `organizations` - Multi-tenant support
2. `users` - JWT authentication
3. `transport_keys` - Main routing feature
4. `transport_key_providers` - Multi-provider configurations

### What's NOT Included (Advanced ANNO Features)

These features are part of the full ANNO system but **not included** in anno_core:

- ❌ **Keyword metadata** (Configurable weights, categories)
- ❌ **Conversation tracking** (Full message history, summaries, checkpoints)
- ❌ **Chat settings** (Per-chat configuration -sessioning transport keys feature)
- ❌ **Token usage tracking** (Usage analytics)
- ❌ **Keyword Management UI** (Frontend page removed from core)
- ❌ **Agent framework** (AutoGen integration, plugins, workflows)

### Clean-up Changes

#### Removed Visual IDE Dependencies
- Changed `VISUAL_MCP_MODE` → `SERVER_MODE`
- Removed `MCP_TRANSPORT=stdio` option (HTTP only)
- Removed `visual_mcp/anno` path references → `anno_core`
- Removed agent framework logging
- Simplified server startup

#### Simplified Configuration
- **Before:** `VISUAL_MCP_MODE=both|relay|mcp_server|stdio`
- **After:** `SERVER_MODE=relay|both` (relay only or relay + MCP server)

### Migration Guide (For Full ANNO Users)

If you're using the full ANNO system with memories/keywords, you'll need the complete schema:

```bash
# Full ANNO schema (not included in anno_core)
# Contact for enterprise/advanced features
```

### Installation

```bash
# Clone repository
git clone https://github.com/madnguvu/anno_core.git
cd anno_core

# Install dependencies
npm install

# Create database with CORE schema only
createdb anno_core
psql -d anno_core -f database/core-schema.sql

# Configure environment
cp .env.example .env
# Edit .env: DB_PASSWORD, JWT_SECRET, ENCRYPTION_SECRET

# Start server
npm start
```

### Default Credentials

- **Email:** admin@localhost
- **Password:** admin123
- **Org ID:** 999 (Default Organization)

### Documentation

- **README.md** - Feature overview and quickstart
- **INSTALL.md** - Installation guide
- **QUICKSTART.md** - 5-minute setup walkthrough
- **DEVELOPER_GUIDE.md** - Complete API reference
- **ADVANCED_ROUTING.md** - Routing concepts and theory
- **NATURAL_LANGUAGE_ROUTING_DEMO.md** - Working examples and applications

### License

MIT License - See LICENSE file

### Contributing

This is the minimal core. For advanced features (memories, keywords, conversation tracking), see the full ANNO system.  Contact original developer for more information:  Matthew DiFrancesco | difran@gmail.com

---

**Questions?** Open an issue on GitHub!  https://github.com/madnguvu/anno_core/
