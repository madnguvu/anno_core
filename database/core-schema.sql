-- =============================================================================
-- anno_core Transport Keys - Core Schema (Minimal)
-- =============================================================================
-- This schema includes ONLY the essential tables for transport keys functionality
-- Advanced features (memories, keywords, conversation tracking) are not included
-- Default Admin: admin@localhost / admin123
-- =============================================================================

-- Drop existing tables (careful in production!)
DROP TABLE IF EXISTS transport_key_providers CASCADE;
DROP TABLE IF EXISTS transport_keys CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- =============================================================================
-- Core Tables (Essential for Transport Keys)
-- =============================================================================

-- Organizations (multi-tenant support)
CREATE TABLE organizations (
    org_id VARCHAR(9) PRIMARY KEY,
    org_name VARCHAR(255) NOT NULL,
    org_key VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users (JWT authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL DEFAULT 2, -- 1=admin, 2=user
    active BOOLEAN NOT NULL DEFAULT true,
    org_id VARCHAR(9) NOT NULL DEFAULT '999',
    api_key VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (org_id) REFERENCES organizations(org_id) ON DELETE CASCADE
);

-- Transport Keys (unified LLM routing credentials)
CREATE TABLE transport_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nickname VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    display_key VARCHAR(50) NOT NULL,
    encrypted_provider_api_key TEXT,
    base_url VARCHAR(500),
    deployment VARCHAR(255),
    api_version VARCHAR(50),
    temperature DECIMAL(3,2) DEFAULT 0.7,
    model_name VARCHAR(255),
    system_prompt TEXT,
    max_requests_per_minute INTEGER DEFAULT 60,
    custom_params JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transport Key Providers (multi-provider configs per key)
CREATE TABLE transport_key_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transport_key_id UUID NOT NULL REFERENCES transport_keys(id) ON DELETE CASCADE,
    nickname VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    model_name VARCHAR(255),
    encrypted_provider_api_key TEXT,
    base_url VARCHAR(500),
    deployment VARCHAR(255),
    api_version VARCHAR(50),
    temperature DECIMAL(3,2) DEFAULT 0.7,
    system_prompt TEXT,
    max_tokens INTEGER DEFAULT 4000,
    custom_params JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- Indexes (Performance Optimization)
-- =============================================================================

-- Users
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_api_key ON users(api_key);
CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_users_role_id ON users(role_id);

-- Organizations
CREATE INDEX idx_organizations_org_name ON organizations(org_name);

-- Transport Keys
CREATE INDEX idx_transport_keys_user_id ON transport_keys(user_id);
CREATE INDEX idx_transport_keys_provider ON transport_keys(provider);
CREATE INDEX idx_transport_keys_active ON transport_keys(active);
CREATE INDEX idx_transport_keys_display_key ON transport_keys(display_key);

-- Transport Key Providers
CREATE INDEX idx_transport_key_providers_key ON transport_key_providers(transport_key_id);
CREATE INDEX idx_transport_key_providers_active ON transport_key_providers(transport_key_id, is_active);

-- =============================================================================
-- Triggers (Auto-update timestamps)
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transport_keys_updated_at
    BEFORE UPDATE ON transport_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Seed Data (Default Organization and Admin Account)
-- =============================================================================

-- Default organization (999 = general/beta users)
INSERT INTO organizations (org_id, org_name, org_key)
VALUES ('999', 'Default Organization', 'default-org-key');

-- Admin account
-- Email: admin@localhost
-- Password: admin123
-- Password hash generated with: bcrypt.hash('admin123', 10)
INSERT INTO users (
    id,
    username,
    email,
    first_name,
    last_name,
    password_hash,
    role_id,
    org_id,
    active
) VALUES (
    gen_random_uuid(),
    'admin',
    'admin@localhost',
    'Admin',
    'User',
    '$2b$10$aBZSyFi8pnhmmoYorv7bk.MLSM5JMxDOuLxWfmJIS/jGhqHCRBdui', -- admin123
    1, -- admin role
    '999', -- default org
    true
);

-- =============================================================================
-- Completion Message
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE ' Anno Transport Keys (Core) database initialized successfully!';
    RAISE NOTICE '';
    RAISE NOTICE ' Default Admin Account:';
    RAISE NOTICE '   Email: admin@localhost';
    RAISE NOTICE '   Password: admin123';
    RAISE NOTICE '   Org ID: 999 (Default Organization)';
    RAISE NOTICE '   Role: Admin (role_id: 1)';
    RAISE NOTICE '';
    RAISE NOTICE ' Tables Created:';
    RAISE NOTICE '   • organizations (multi-tenant support)';
    RAISE NOTICE '   • users (JWT authentication)';
    RAISE NOTICE '   • transport_keys (LLM routing)';
    RAISE NOTICE '   • transport_key_providers (multi-provider configs)';
    RAISE NOTICE '';
    RAISE NOTICE 'Advanced Features Not Included:';
    RAISE NOTICE '   This is the minimal core schema for transport keys.';
    RAISE NOTICE '   Episodic memories, keyword weighting, conversation tracking,';
    RAISE NOTICE '   and other advanced features are available in the full ANNO system.';
    RAISE NOTICE '   Contact difran@gmail.com / +1-440-299-7828 for commercial /enterprise';
    RAISE NOTICE '   feature requests and/or support.';
    RAISE NOTICE '';
    RAISE NOTICE ' Next Steps:';
    RAISE NOTICE '   1. Configure .env file with database credentials';
    RAISE NOTICE '   2. Start server: npm start';
    RAISE NOTICE '   3. Login at http://localhost:5173 with admin@localhost / admin123';
    RAISE NOTICE '   4. Create your first transport key!';
    RAISE NOTICE '';
END $$;
