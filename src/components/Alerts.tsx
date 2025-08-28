import React, { useState } from 'react';
import { AlertTriangle, Clock, Check, X, Eye, Filter, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface Alert {
  id: string;
  type: 'pattern' | 'amount' | 'frequency' | 'recipient';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  accountId: string;
  customerName: string;
  amount?: string;
  timestamp: string;
  status: 'active' | 'investigating' | 'resolved' | 'dismissed';
}

export const Alerts: React.FC = () => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'investigating' | 'resolved' | 'dismissed'>('all');
  const [showAnalytics, setShowAnalytics] = useState(true);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 'ALT-001',
      type: 'recipient',
      severity: 'high',
      title: 'Multiple Transactions to Same Recipient',
      description: 'Customer has made 12 transactions totaling $245,000 to the same account within 48 hours',
      accountId: 'ACC-789123',
      customerName: 'John Doe',
      amount: '$245,000',
      timestamp: '2 hours ago',
      status: 'active',
    },
    {
      id: 'ALT-002',
      type: 'pattern',
      severity: 'high',
      title: 'Unusual Transaction Pattern Detected',
      description: 'Rapid succession of transactions with amounts just below reporting threshold',
      accountId: 'ACC-321654',
      customerName: 'Mike Johnson',
      amount: '$78,000',
      timestamp: '4 hours ago',
      status: 'investigating',
    },
    {
      id: 'ALT-003',
      type: 'amount',
      severity: 'medium',
      title: 'Large Cash Deposit',
      description: 'Unusual large cash deposit that deviates from customer\'s typical behavior',
      accountId: 'ACC-456789',
      customerName: 'Jane Smith',
      amount: '$12,000',
      timestamp: '6 hours ago',
      status: 'active',
    },
    {
      id: 'ALT-004',
      type: 'frequency',
      severity: 'medium',
      title: 'High Transaction Frequency',
      description: 'Customer has exceeded normal transaction frequency by 400% in the last week',
      accountId: 'ACC-654321',
      customerName: 'Sarah Williams',
      timestamp: '1 day ago',
      status: 'resolved',
    },
  ]);

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    return matchesSeverity && matchesStatus;
  });

  const updateAlertStatus = (alertId: string, newStatus: Alert['status']) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: newStatus } : alert
    ));
  };

  // Analytics data
  const alertTypeData = [
    { name: 'Recipient Pattern', value: 12, color: '#dc2626' },
    { name: 'Transaction Pattern', value: 8, color: '#f59e0b' },
    { name: 'Large Amount', value: 6, color: '#8b5cf6' },
    { name: 'High Frequency', value: 4, color: '#059669' },
  ];

  const severityTrendData = [
    { date: 'Mon', high: 5, medium: 8, low: 3 },
    { date: 'Tue', high: 7, medium: 6, low: 4 },
    { date: 'Wed', high: 4, medium: 9, low: 2 },
    { date: 'Thu', high: 8, medium: 7, low: 5 },
    { date: 'Fri', high: 6, medium: 10, low: 3 },
    { date: 'Sat', high: 3, medium: 5, low: 1 },
    { date: 'Sun', high: 2, medium: 4, low: 2 },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-100 border-amber-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100';
      case 'investigating': return 'text-blue-600 bg-blue-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'dismissed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pattern': return '📊';
      case 'amount': return '💰';
      case 'frequency': return '⚡';
      case 'recipient': return '👤';
      default: return '⚠️';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Alert Management</h2>
        <p className="text-gray-600">Monitor and manage suspicious activity alerts from AI analysis</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Active Alerts</p>
          <p className="text-2xl font-bold text-red-600">
            {alerts.filter(a => a.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Investigating</p>
          <p className="text-2xl font-bold text-blue-600">
            {alerts.filter(a => a.status === 'investigating').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Resolved</p>
          <p className="text-2xl font-bold text-green-600">
            {alerts.filter(a => a.status === 'resolved').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-amber-500">
          <p className="text-sm text-gray-600">High Severity</p>
          <p className="text-2xl font-bold text-amber-600">
            {alerts.filter(a => a.severity === 'high').length}
          </p>
        </div>
      </div>

      {/* Analytics Section */}
      {showAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Alert Type Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Type Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={alertTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {alertTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} alerts`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Severity Trends */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Severity Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="high" stackId="a" fill="#dc2626" name="High" />
                  <Bar dataKey="medium" stackId="a" fill="#f59e0b" name="Medium" />
                  <Bar dataKey="low" stackId="a" fill="#059669" name="Low" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center ${
                showAnalytics ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </button>
            
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white rounded-lg shadow-lg border-l-4 p-6 ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">{getTypeIcon(alert.type)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{alert.customerName} • {alert.accountId}</span>
                      {alert.amount && <span className="font-medium">{alert.amount}</span>}
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {alert.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">{alert.description}</p>
                
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(alert.status)}`}>
                    {alert.status}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getSeverityColor(alert.severity)}`}>
                    {alert.severity} priority
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 ml-4">
                <button className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 transition-colors flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </button>
                
                {alert.status === 'active' && (
                  <>
                    <button
                      onClick={() => updateAlertStatus(alert.id, 'investigating')}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Investigate
                    </button>
                    <button
                      onClick={() => updateAlertStatus(alert.id, 'dismissed')}
                      className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors flex items-center"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Dismiss
                    </button>
                  </>
                )}
                
                {alert.status === 'investigating' && (
                  <button
                    onClick={() => updateAlertStatus(alert.id, 'resolved')}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
          <p className="text-gray-600">No alerts match your current filter criteria.</p>
        </div>
      )}
    </div>
  );
};