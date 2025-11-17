import React, { useState, useEffect } from 'react';
import { Key, Plus, Edit, Trash2, RefreshCw, Search, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

interface TransportKey {
  id: string;
  user_id: string;
  nickname: string;
  provider: string;
  display_key: string;
  transport_key?: string;  // Full transport key for authentication
  provider_api_key?: string;  // Decrypted provider API key (Google, Azure, etc.)
  active: boolean;
  created_at: string;
  user_email?: string;
  user_name?: string;
  organization_name?: string;
  org_key?: string;
  base_url?: string;
  deployment?: string;
  api_version?: string;
  temperature?: number;
  model_name?: string;
  system_prompt?: string;
  max_requests_per_minute?: number;
  custom_params?: any;
}

interface ProviderConfig {
  id: string;
  transport_key_id: string;
  nickname: string;
  provider: string;
  model_name?: string;
  base_url?: string;
  deployment?: string;
  api_version?: string;
  temperature?: number;
  system_prompt?: string;
  max_tokens?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ConversationMessage {
  id: string;
  transport_key_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  provider?: string;
  model_name?: string;
  timestamp: number;
  tokens_used?: number;
  archived: boolean;
  created_at: string;
}

interface ConversationCheckpoint {
  id: string;
  transport_key_id: string;
  message_count: number;
  last_message_timestamp?: number;
  goals?: string[];
  decisions?: string[];
  open_questions?: string[];
  key_facts?: string[];
  current_topic?: string;
  session_started_at: string;
  last_activity_at: string;
  created_at: string;
}

interface ConversationData {
  messages: ConversationMessage[];
  checkpoint: ConversationCheckpoint | null;
  summaries: any[];
}

interface Organization {
  org_id: string;
  org_name: string;
  org_key?: string;
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  organization_name?: string;
  org_key?: string;
}

interface TransportKeysPageProps {
  user: any;
  onNavigate: (page: string) => void;
  isAdmin: boolean;
}

const TransportKeysPage: React.FC<TransportKeysPageProps> = ({ user, onNavigate, isAdmin }) => {
  const [transportKeys, setTransportKeys] = useState<TransportKey[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<TransportKey | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Key copy states
  const [copyMessages, setCopyMessages] = useState<{[key: string]: string}>({});

  // Multi-provider states
  const [keyProviders, setKeyProviders] = useState<{[keyId: string]: ProviderConfig[]}>({});
  const [keyConversations, setKeyConversations] = useState<{[keyId: string]: ConversationData}>({});
  const [expandedKeys, setExpandedKeys] = useState<{[keyId: string]: boolean}>({});
  const [showConversation, setShowConversation] = useState<{[keyId: string]: boolean}>({});

  // System messages/notifications
  const [systemMessages, setSystemMessages] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    timestamp: number;
  }>>([]);

  // Form states
  const [formData, setFormData] = useState({
    nickname: '',
    provider: '',
    apiKey: '',
    baseURL: '',
    deployment: '',
    apiVersion: '',
    temperature: 0.7,
    modelName: '',
    systemPrompt: '',
    maxRequestsPerMinute: 60,
    userEmail: '',
    organizationName: '',
    customParams: '{}'
  });

  const [newOrgName, setNewOrgName] = useState('');
  const [showNewOrgForm, setShowNewOrgForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to get auth headers
  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('auth_token');
    if (!token) return {};
    return { 'Authorization': `Bearer ${token}` };
  };

  // System message management
  const addSystemMessage = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setSystemMessages(prev => [...prev, { id, type, message, timestamp: Date.now() }]);

    // Auto-remove success messages after 5 seconds, errors after 10 seconds
    const timeout = type === 'error' ? 10000 : 5000;
    setTimeout(() => {
      removeSystemMessage(id);
    }, timeout);
  };

  const removeSystemMessage = (id: string) => {
    setSystemMessages(prev => prev.filter(msg => msg.id !== id));
  };

  // Fetch data
  const fetchTransportKeys = async () => {
    try {
      let url = '/api/transport-keys';
      if (!isAdmin) {
        // Regular users fetch their own transport keys
        url = `/api/users/${user.id}/transport-keys`;
      }
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setTransportKeys(data);
      }
    } catch (error) {
      console.error('Failed to fetch transport keys:', error);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  // Fetch providers for a specific transport key
  const fetchProvidersForKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/transport-keys/${keyId}/providers`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const providers = await response.json();
        setKeyProviders(prev => ({ ...prev, [keyId]: providers }));
      }
    } catch (error) {
      console.error(`Failed to fetch providers for key ${keyId}:`, error);
    }
  };

  // Fetch conversation history for a specific transport key
  const fetchConversationForKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/transport-keys/${keyId}/conversations`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const conversation = await response.json();
        setKeyConversations(prev => ({ ...prev, [keyId]: conversation }));
      }
    } catch (error) {
      console.error(`Failed to fetch conversation for key ${keyId}:`, error);
    }
  };

  // Toggle expanded state for a key
  const toggleKeyExpanded = async (keyId: string) => {
    const isExpanded = expandedKeys[keyId];
    setExpandedKeys(prev => ({ ...prev, [keyId]: !isExpanded }));

    // Fetch providers and conversations when expanding for the first time
    if (!isExpanded) {
      if (!keyProviders[keyId]) {
        await fetchProvidersForKey(keyId);
      }
      if (!keyConversations[keyId]) {
        await fetchConversationForKey(keyId);
      }
    }
  };

  // Switch active provider
  const handleSwitchProvider = async (keyId: string, providerId: string) => {
    try {
      const response = await fetch(`/api/transport-keys/${keyId}/providers/${providerId}/activate`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        await fetchProvidersForKey(keyId);
        addSystemMessage('success', 'Provider switched successfully!');
      } else {
        const error = await response.json();
        addSystemMessage('error', error.error || 'Failed to switch provider');
      }
    } catch (error) {
      console.error('Failed to switch provider:', error);
      addSystemMessage('error', 'Failed to switch provider');
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const fetchPromises = [fetchTransportKeys(), fetchOrganizations()];
      if (isAdmin) {
        fetchPromises.push(fetchUsers());
      }
      await Promise.all(fetchPromises);
      setIsLoading(false);
    };
    initialize();
  }, [isAdmin, user.id]);

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let targetUserId = user.id;
      let targetUserEmail = user.email;

      if (isAdmin) {
        // Find user by email for admin
        const foundUser = users.find(u => u.email === formData.userEmail);
        if (!foundUser) {
          addSystemMessage('error', 'User not found. Please enter a valid email address.');
          return;
        }
        targetUserId = foundUser.id;
        targetUserEmail = foundUser.email;
      }

      const url = editingKey ? `/api/users/${targetUserId}/transport-keys/${editingKey.id}` : `/api/users/${targetUserId}/transport-keys`;
      const method = editingKey ? 'PUT' : 'POST';

      const submitData = {
        nickname: formData.nickname,
        provider: formData.provider,
        apiKey: formData.apiKey,
        baseURL: formData.baseURL,
        deployment: formData.deployment,
        apiVersion: formData.apiVersion,
        temperature: formData.temperature,
        modelName: formData.modelName,
        systemPrompt: formData.systemPrompt,
        maxRequestsPerMinute: formData.maxRequestsPerMinute,
        organizationName: formData.organizationName,
        customParams: formData.customParams
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const createdKey = await response.json();
        await fetchTransportKeys();
        resetForm();

        // Show the keys in a special message if this was a creation
        if (!editingKey && createdKey.transport_key) {
          addSystemMessage('success', `Transport key created! COPY THESE KEYS NOW:

🔑 Transport Key (for authentication):
${createdKey.transport_key}

🔐 Provider API Key (${createdKey.provider}):
${createdKey.provider_api_key || 'Not provided'}

These keys will only be shown once!`);
        } else {
          addSystemMessage('success', 'Transport key updated successfully!');
        }
      } else {
        let errorMessage = 'Failed to save transport key';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            errorMessage = error.error || error.message || errorMessage;
          } else {
            // If not JSON, try to get text response
            const textResponse = await response.text();
            errorMessage = textResponse || `HTTP ${response.status}: ${response.statusText}`;
          }
        } catch (parseError) {
          // If parsing fails, use status info
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        addSystemMessage('error', errorMessage);
      }
    } catch (error) {
      console.error('Failed to save transport key:', error);
      addSystemMessage('error', 'Failed to save transport key');
    }
  };

  const handleCreateOrg = async () => {
    if (!newOrgName.trim()) return;

    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ org_name: newOrgName })
      });

      if (response.ok) {
        await fetchOrganizations();
        setFormData(prev => ({ ...prev, organizationName: newOrgName }));
        setNewOrgName('');
        setShowNewOrgForm(false);
      }
    } catch (error) {
      console.error('Failed to create organization:', error);
    }
  };

  const handleEdit = (key: TransportKey) => {
    setEditingKey(key);
    // Find user details
    const user = users.find(u => u.id === key.user_id);
    setFormData({
      nickname: key.nickname || '',
      provider: key.provider || '',
      apiKey: key.provider_api_key || '', // Show the full provider API key for editing
      baseURL: (key as any).base_url || '',
      deployment: (key as any).deployment || '',
      apiVersion: (key as any).api_version || '',
      temperature: (key as any).temperature || 0.7,
      modelName: (key as any).model_name || '',
      systemPrompt: (key as any).system_prompt || '',
      maxRequestsPerMinute: (key as any).max_requests_per_minute || 60,
      userEmail: user?.email || '',
      organizationName: user?.organization_name || key.organization_name || '',
      customParams: (key as any).custom_params ? JSON.stringify((key as any).custom_params) : '{}'
    });
    setShowAddForm(true);
  };

  const handleDelete = async (key: TransportKey) => {
    if (!window.confirm('Are you sure you want to delete this transport key?')) return;

    try {
      const response = await fetch(`/api/users/${key.user_id}/transport-keys/${key.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        await fetchTransportKeys();
        addSystemMessage('success', 'Transport key deleted successfully!');
      } else {
        let errorMessage = 'Failed to delete transport key';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            errorMessage = error.error || error.message || errorMessage;
          } else {
            const textResponse = await response.text();
            errorMessage = textResponse || `HTTP ${response.status}: ${response.statusText}`;
          }
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        addSystemMessage('error', errorMessage);
      }
    } catch (error) {
      console.error('Failed to delete transport key:', error);
      addSystemMessage('error', 'Failed to delete transport key');
    }
  };

  const handleRegenerate = async (key: TransportKey) => {
    if (!window.confirm('Are you sure you want to regenerate this transport key?')) return;

    try {
      const response = await fetch(`/api/users/${key.user_id}/transport-keys/${key.id}/regenerate`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        await fetchTransportKeys();
        addSystemMessage('success', 'Transport key regenerated successfully!');
      } else {
        let errorMessage = 'Failed to regenerate transport key';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            errorMessage = error.error || error.message || errorMessage;
          } else {
            const textResponse = await response.text();
            errorMessage = textResponse || `HTTP ${response.status}: ${response.statusText}`;
          }
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        addSystemMessage('error', errorMessage);
      }
    } catch (error) {
      console.error('Failed to regenerate transport key:', error);
      addSystemMessage('error', 'Failed to regenerate transport key');
    }
  };

  const handleToggleActive = async (key: TransportKey) => {
    try {
      const newActiveState = !key.active;
      const response = await fetch(`/api/users/${key.user_id}/transport-keys/${key.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          nickname: key.nickname,
          provider: key.provider,
          active: newActiveState
        })
      });

      if (response.ok) {
        await fetchTransportKeys();
        addSystemMessage('success', `Transport key ${newActiveState ? 'activated' : 'deactivated'} successfully!`);
      } else {
        let errorMessage = `Failed to ${newActiveState ? 'activate' : 'deactivate'} transport key`;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            errorMessage = error.error || error.message || errorMessage;
          } else {
            const textResponse = await response.text();
            errorMessage = textResponse || `HTTP ${response.status}: ${response.statusText}`;
          }
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        addSystemMessage('error', errorMessage);
      }
    } catch (error) {
      console.error('Failed to toggle transport key active state:', error);
      addSystemMessage('error', 'Failed to toggle transport key active state');
    }
  };

  // Key copy handlers
  const handleKeyCopy = async (keyId: string, fullKey: string) => {
    try {
      await navigator.clipboard.writeText(fullKey);
      setCopyMessages(prev => ({ ...prev, [keyId]: 'Key copied to clipboard!' }));

      // Clear message after 3 seconds
      setTimeout(() => {
        setCopyMessages(prev => {
          const newMessages = { ...prev };
          delete newMessages[keyId];
          return newMessages;
        });
      }, 3000);
    } catch (error) {
      console.error('Failed to copy key:', error);
      setCopyMessages(prev => ({ ...prev, [keyId]: 'Failed to copy key' }));

      // Clear error message after 3 seconds
      setTimeout(() => {
        setCopyMessages(prev => {
          const newMessages = { ...prev };
          delete newMessages[keyId];
          return newMessages;
        });
      }, 3000);
    }
  };

  const handleFormKeyCopy = async () => {
    if (!formData.apiKey) return;

    try {
      await navigator.clipboard.writeText(formData.apiKey);
      setCopyMessages(prev => ({ ...prev, 'form-api-key': 'API key copied to clipboard!' }));

      // Clear message after 3 seconds
      setTimeout(() => {
        setCopyMessages(prev => {
          const newMessages = { ...prev };
          delete newMessages['form-api-key'];
          return newMessages;
        });
      }, 3000);
    } catch (error) {
      console.error('Failed to copy key:', error);
      setCopyMessages(prev => ({ ...prev, 'form-api-key': 'Failed to copy API key' }));

      // Clear error message after 3 seconds
      setTimeout(() => {
        setCopyMessages(prev => {
          const newMessages = { ...prev };
          delete newMessages['form-api-key'];
          return newMessages;
        });
      }, 3000);
    }
  };

  const resetForm = () => {
    setFormData({
      nickname: '',
      provider: '',
      apiKey: '',
      baseURL: '',
      deployment: '',
      apiVersion: '',
      temperature: 0.7,
      modelName: '',
      systemPrompt: '',
      maxRequestsPerMinute: 60,
      userEmail: isAdmin ? '' : user.email,
      organizationName: '',
      customParams: '{}'
    });
    setEditingKey(null);
    setShowAddForm(false);
  };

  // Filter transport keys based on search
  const filteredKeys = transportKeys.filter(key =>
    key.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.organization_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedKeys = filteredKeys.slice((page - 1) * pageSize, page * pageSize);

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* System Messages */}
      {systemMessages.length > 0 && (
        <div className="mb-6 space-y-2">
          {systemMessages.map(message => (
            <div
              key={message.id}
              className={`p-4 rounded-lg border flex items-start justify-between ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : message.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {message.type === 'success' && '✅ Success'}
                  {message.type === 'error' && '❌ Error'}
                  {message.type === 'info' && 'ℹ️ Info'}
                </p>
                <p className="text-sm mt-1 whitespace-pre-wrap break-words">{message.message}</p>
              </div>
              <button
                onClick={() => removeSystemMessage(message.id)}
                className="ml-4 text-gray-400 hover:text-gray-600 flex-shrink-0"
                title="Dismiss message"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Key className="mr-3" size={32} />
          Transport Keys Management
        </h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 !text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus size={20} className="mr-2 !text-white" />
          <span className="!text-white">Add Transport Key</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search transport keys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Add/Edit Transport Key Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingKey ? 'Edit Transport Key' : 'Add New Transport Key'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Email *</label>
                  <input
                    type="email"
                    name="userEmail"
                    value={formData.userEmail}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="user@example.com"
                    required
                  />
                </div>
              )}
              {!isAdmin && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                  <div className="w-full p-2 border rounded bg-gray-50 text-gray-700">
                    {user.first_name} {user.last_name} ({user.email})
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nickname *</label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Azure OpenAI"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider *</label>
                <select
                  name="provider"
                  value={formData.provider}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Provider</option>
                  <option value="azure">Azure OpenAI</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google/Gemini</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider's API Key *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="apiKey"
                    value={formData.apiKey}
                    onChange={handleInputChange}
                    className="flex-1 p-2 border rounded"
                    placeholder="sk-..."
                    required={!editingKey}
                  />
                  {formData.apiKey && (
                    <button
                      type="button"
                      onClick={handleFormKeyCopy}
                      className="!bg-green-600 !text-white px-3 py-2 rounded hover:!bg-green-700 text-sm"
                    >
                      Copy
                    </button>
                  )}
                </div>
                {copyMessages['form-api-key'] && (
                  <p className="text-sm text-green-600 mt-1">{copyMessages['form-api-key']}</p>
                )}
              </div>

              {editingKey && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Anno Transport API Key</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingKey.display_key}
                      readOnly
                      className="flex-1 p-2 border rounded bg-gray-50 text-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => handleKeyCopy(editingKey.id, editingKey.display_key)}
                      className="!bg-blue-600 !text-white px-3 py-2 rounded hover:!bg-blue-700 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use this key in your IDE/browser to connect to Anno's relay service
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
                <input
                  type="url"
                  name="baseURL"
                  value={formData.baseURL}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="https://api.openai.com/v1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
                <input
                  type="text"
                  name="modelName"
                  value={formData.modelName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="gpt-4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deployment Name (Azure only)</label>
                <input
                  type="text"
                  name="deployment"
                  value={formData.deployment}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="gpt-4-deployment"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Version</label>
                <input
                  type="text"
                  name="apiVersion"
                  value={formData.apiVersion}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="2023-12-01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  min="0"
                  max="2"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Requests/Minute</label>
                <input
                  type="number"
                  name="maxRequestsPerMinute"
                  value={formData.maxRequestsPerMinute}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  min="1"
                  max="1000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
              <textarea
                name="systemPrompt"
                value={formData.systemPrompt}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Custom system prompt..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
              <div className="flex gap-2">
                <select
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  className="flex-1 p-2 border rounded"
                >
                  <option value="">Select Organization (Optional)</option>
                  {organizations.map(org => (
                    <option key={org.org_id} value={org.org_name}>
                      {org.org_name} {org.org_key && `(Key: ${org.org_key.substring(0, 8)}...)`}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewOrgForm(!showNewOrgForm)}
                  className="bg-gray-500 !text-white px-3 py-2 rounded hover:bg-gray-600"
                >
                  <Plus size={16} className="!text-white" />
                </button>
              </div>

              {showNewOrgForm && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="New organization name"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    className="flex-1 p-2 border rounded"
                  />
                  <button
                    type="button"
                    onClick={handleCreateOrg}
                    className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                  >
                    Create
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Parameters (JSON)</label>
              <textarea
                name="customParams"
                value={formData.customParams}
                onChange={handleInputChange}
                className="w-full p-2 border rounded font-mono text-sm"
                rows={2}
                placeholder='{"customParam": "value"}'
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 !text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <span className="!text-white">{editingKey ? 'Update Transport Key' : 'Create Transport Key'}</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 !text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                <span className="!text-white">Cancel</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transport Keys List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Transport Keys ({filteredKeys.length})</h2>
          <div className="space-y-4">
            {paginatedKeys.map(key => (
              <div key={key.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium">{key.nickname}</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {key.provider}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1">User: {key.user_email || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">Organization: {key.organization_name || 'Personal'}</p>
                    {/* Transport Key */}
                    <div className="mb-2 p-2 bg-blue-50 rounded">
                      <p className="text-sm font-medium text-gray-700 mb-1">🔑 Transport Key</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-white px-2 py-1 rounded font-mono flex-1 border border-blue-200 break-all">
                          {key.transport_key || key.display_key}
                        </code>
                        <button
                          onClick={() => handleKeyCopy(key.id, key.transport_key || key.display_key)}
                          className="!bg-blue-600 !text-white text-xs px-3 py-1 rounded hover:!bg-blue-700 whitespace-nowrap"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    {/* Provider API Key */}
                    {key.provider_api_key && (
                      <div className="mb-2 p-2 bg-green-50 rounded">
                        <p className="text-sm font-medium text-gray-700 mb-1">🔐 Provider API Key ({key.provider})</p>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-white px-2 py-1 rounded font-mono flex-1 border border-green-200 break-all">
                            {key.provider_api_key}
                          </code>
                          <button
                            onClick={() => handleKeyCopy(`${key.id}-provider`, key.provider_api_key!)}
                            className="!bg-green-600 !text-white text-xs px-3 py-1 rounded hover:!bg-green-700 whitespace-nowrap"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                    {!key.provider_api_key && (
                      <div className="mb-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-xs text-yellow-700">⚠️ No provider API key (will use .env fallback)</p>
                      </div>
                    )}
                    <p className="text-sm text-gray-500">Created: {new Date(key.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="checkbox"
                      checked={key.active}
                      onChange={() => handleToggleActive(key)}
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                      title={key.active ? "Deactivate Transport Key" : "Activate Transport Key"}
                    />
                    <button
                      onClick={() => handleEdit(key)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit Transport Key"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleRegenerate(key)}
                      className="text-green-600 hover:text-green-800 p-1"
                      title="Regenerate Transport Key"
                    >
                      <RefreshCw size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(key)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete Transport Key"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredKeys.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Key size={48} className="mx-auto mb-2 opacity-50" />
              <p>No transport keys found.</p>
              <p className="text-sm">Click "Add Transport Key" to create one.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {filteredKeys.length > pageSize && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="mx-2 px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="mx-2 px-3 py-1">
            Page {page} of {Math.ceil(filteredKeys.length / pageSize)}
          </span>
          <button
            onClick={() => setPage(prev => Math.min(prev + 1, Math.ceil(filteredKeys.length / pageSize)))}
            disabled={page === Math.ceil(filteredKeys.length / pageSize)}
            className="mx-2 px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TransportKeysPage;
