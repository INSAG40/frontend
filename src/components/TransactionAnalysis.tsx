import React, { useState } from 'react';
import { Search, Filter, AlertTriangle, Eye, Download, TrendingUp, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, PieChart, Pie, Cell } from 'recharts';

interface Transaction {
  id: string;
  date: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  description: string;
  riskScore: number;
  flags: string[];
  status: 'normal' | 'suspicious' | 'flagged';
}

export const TransactionAnalysis: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'normal' | 'suspicious' | 'flagged'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showCharts, setShowCharts] = useState(true);

  const transactions: Transaction[] = [
    {
      id: 'TXN-001',
      date: '2024-01-15',
      fromAccount: 'ACC-123456',
      toAccount: 'ACC-789123',
      amount: 45000,
      description: 'Wire transfer',
      riskScore: 8.5,
      flags: ['Multiple transactions to same recipient', 'Large amount'],
      status: 'flagged',
    },
    {
      id: 'TXN-002',
      date: '2024-01-15',
      fromAccount: 'ACC-456789',
      toAccount: 'ACC-789123',
      amount: 23000,
      description: 'Business payment',
      riskScore: 7.2,
      flags: ['Same recipient pattern', 'Unusual timing'],
      status: 'suspicious',
    },
    {
      id: 'TXN-003',
      date: '2024-01-14',
      fromAccount: 'ACC-654321',
      toAccount: 'ACC-987654',
      amount: 5000,
      description: 'Regular payment',
      riskScore: 2.1,
      flags: [],
      status: 'normal',
    },
    {
      id: 'TXN-004',
      date: '2024-01-14',
      fromAccount: 'ACC-321654',
      toAccount: 'ACC-789123',
      amount: 78000,
      description: 'Investment transfer',
      riskScore: 9.1,
      flags: ['High amount', 'Rapid succession', 'Same recipient'],
      status: 'flagged',
    },
  ];

  // Chart data for risk score distribution
  const riskScoreData = [
    { range: '0-2', count: 45, color: '#059669' },
    { range: '2-4', count: 32, color: '#84cc16' },
    { range: '4-6', count: 28, color: '#f59e0b' },
    { range: '6-8', count: 18, color: '#f97316' },
    { range: '8-10', count: 12, color: '#dc2626' },
  ];

  // Amount distribution data
  const amountDistributionData = transactions.map(t => ({
    id: t.id,
    amount: t.amount,
    riskScore: t.riskScore,
    status: t.status,
  }));

  // Daily transaction volume
  const dailyVolumeData = [
    { date: 'Jan 14', volume: 156000, transactions: 23 },
    { date: 'Jan 15', volume: 234000, transactions: 31 },
    { date: 'Jan 16', volume: 189000, transactions: 28 },
    { date: 'Jan 17', volume: 267000, transactions: 35 },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = 
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.fromAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.toAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || transaction.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getRiskColor = (score: number) => {
    if (score >= 7) return 'text-red-600 bg-red-100';
    if (score >= 4) return 'text-amber-600 bg-amber-100';
    return 'text-green-600 bg-green-100';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'flagged': return 'text-red-600 bg-red-100';
      case 'suspicious': return 'text-amber-600 bg-amber-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Transaction Analysis</h2>
        <p className="text-gray-600">AI-powered analysis of transaction patterns and suspicious activities</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search transactions, accounts, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCharts(!showCharts)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                showCharts ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {showCharts ? 'Hide Charts' : 'Show Charts'}
            </button>
            
            <div className="relative">
              <Filter className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">All Statuses</option>
                <option value="flagged">Flagged</option>
                <option value="suspicious">Suspicious</option>
                <option value="normal">Normal</option>
              </select>
            </div>
            
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Risk Score Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Score Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskScoreData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} transactions`, 'Count']} />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Amount vs Risk Score Scatter */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Amount vs Risk Score</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={amountDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="amount" name="Amount" />
                  <YAxis dataKey="riskScore" name="Risk Score" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'amount' ? `$${value.toLocaleString()}` : value,
                      name === 'amount' ? 'Amount' : 'Risk Score'
                    ]}
                  />
                  <Scatter dataKey="riskScore" fill="#8b5cf6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Flagged</p>
          <p className="text-2xl font-bold text-red-600">
            {transactions.filter(t => t.status === 'flagged').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-amber-500">
          <p className="text-sm text-gray-600">Suspicious</p>
          <p className="text-2xl font-bold text-amber-600">
            {transactions.filter(t => t.status === 'suspicious').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Normal</p>
          <p className="text-2xl font-bold text-green-600">
            {transactions.filter(t => t.status === 'normal').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Total Analyzed</p>
          <p className="text-2xl font-bold text-blue-600">{transactions.length}</p>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From → To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>{transaction.fromAccount}</div>
                      <div className="text-xs text-gray-500">→ {transaction.toAccount}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${transaction.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(transaction.riskScore)}`}>
                      {transaction.riskScore}/10
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedTransaction(transaction)}
                      className="text-emerald-600 hover:text-emerald-700 flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Transaction Details: {selectedTransaction.id}
                </h3>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedTransaction.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="mt-1 text-sm text-gray-900 font-medium">
                    ${selectedTransaction.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">From Account</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedTransaction.fromAccount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">To Account</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedTransaction.toAccount}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                <p className="text-sm text-gray-900">{selectedTransaction.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">AI Risk Assessment</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(selectedTransaction.riskScore)}`}>
                    {selectedTransaction.riskScore}/10
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${selectedTransaction.riskScore >= 7 ? 'bg-red-500' : selectedTransaction.riskScore >= 4 ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${selectedTransaction.riskScore * 10}%` }}
                  ></div>
                </div>
              </div>

              {selectedTransaction.flags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Risk Factors Detected</p>
                  <div className="space-y-2">
                    {selectedTransaction.flags.map((flag, index) => (
                      <div key={index} className="flex items-center p-3 bg-red-50 rounded-lg border border-red-200">
                        <AlertTriangle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                        <span className="text-sm text-red-800">{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};