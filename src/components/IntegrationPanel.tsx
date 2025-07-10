import React, { useState } from 'react';
import { Plus, Link, Activity, AlertCircle, CheckCircle, Clock, Settings, Trash2 } from 'lucide-react';
import { Integration } from '../types';

interface IntegrationPanelProps {
  integrations: Integration[];
  onAddIntegration: (integration: Omit<Integration, 'id'>) => void;
  onToggleIntegration: (id: string) => void;
  onDeleteIntegration: (id: string) => void;
}

export const IntegrationPanel: React.FC<IntegrationPanelProps> = ({
  integrations,
  onAddIntegration,
  onToggleIntegration,
  onDeleteIntegration,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    name: '',
    type: 'webhook' as const,
    config: {},
  });

  const handleAddIntegration = () => {
    if (newIntegration.name.trim()) {
      onAddIntegration({
        ...newIntegration,
        status: 'inactive',
      });
      setNewIntegration({ name: '', type: 'webhook', config: {} });
      setShowAddForm(false);
    }
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Link className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Integrations</h3>
            <p className="text-gray-600">Manage your external integrations</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Integration</span>
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Add New Integration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Integration Name
              </label>
              <input
                type="text"
                value={newIntegration.name}
                onChange={(e) => setNewIntegration(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter integration name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Integration Type
              </label>
              <select
                value={newIntegration.type}
                onChange={(e) => setNewIntegration(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="webhook">Webhook</option>
                <option value="api">API</option>
                <option value="plugin">Plugin</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddIntegration}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Integration
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {integrations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Link className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No integrations yet</p>
            <p className="text-sm">Add your first integration to get started</p>
          </div>
        ) : (
          integrations.map((integration) => (
            <div
              key={integration.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(integration.status)}
                    <h4 className="font-medium text-gray-900">{integration.name}</h4>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(integration.status)}`}>
                    {integration.status}
                  </span>
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                    {integration.type}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onToggleIntegration(integration.id)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      integration.status === 'active'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {integration.status === 'active' ? 'Disable' : 'Enable'}
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteIntegration(integration.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {integration.lastSync && (
                <p className="text-sm text-gray-500 mt-2">
                  Last sync: {integration.lastSync.toLocaleString()}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};