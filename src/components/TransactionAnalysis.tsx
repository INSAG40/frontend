import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Filter, AlertTriangle, Eye, Download, BarChart3, Upload, File, CheckCircle, Loader, AlertCircle, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import Papa from 'papaparse'; // For parsing CSV

const API_BASE_URL = 'http://localhost:8000/api/auth';

interface Transaction {
  id: string;
  date: string;
  from_account: string;
  to_account: string;
  amount: number;
  description: string;
  risk_score: number;
  flags: string[];
  status: 'normal' | 'suspicious' | 'flagged';
}

interface UploadedFileState {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
}

export const TransactionAnalysis: React.FC = () => {
  const { user, isAuthenticated } = useAuth(); // Keeping user for potential future use or if false positive
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'normal' | 'suspicious' | 'flagged'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showCharts, setShowCharts] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for file upload
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileState[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchTransactions = useCallback(async () => {
    console.log("fetchTransactions called. isAuthenticated:", isAuthenticated);
    if (!isAuthenticated) {
      console.log("Not authenticated, skipping fetchTransactions.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const token = localStorage.getItem('aml_token');
    console.log("Fetching transactions with token:", token ? "present" : "missing");

    try {
      const response = await fetch(`${API_BASE_URL}/transactions/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      const data = await response.json();
      console.log("Transactions API Response:", response.status, data);

      if (response.ok) {
        setTransactions(data);
      } else if (response.status === 401) {
        setError('Unauthorized: Please log in again.');
        console.error("Transaction fetch 401 Unauthorized.");
      } else {
        setError(data.detail || 'Failed to fetch transactions.');
        console.error("Transaction fetch failed:", data);
      }
    } catch (err: any) {
      setError(err.message || 'Network error while fetching transactions.');
      console.error("Network error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const exportAllTransactionsToServer = useCallback(async () => {
    if (!isAuthenticated) {
      alert('You must be logged in to export transactions.');
      return;
    }
    const token = localStorage.getItem('aml_token');
    try {
      const response = await fetch(`${API_BASE_URL}/export-all-transactions-csv/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'all_transactions_analysis.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        console.log('All transactions exported successfully.');
      } else {
        const errorData = await response.json();
        console.error('Failed to export transactions:', errorData);
        alert(`Failed to export transactions: ${errorData.detail || response.statusText}`);
      }
    } catch (error: any) {
      console.error('Network error during export:', error);
      alert('Network error during export.');
    }
  }, [isAuthenticated]);

  const handleFiles = useCallback(async (files: File[]) => {
    if (!isAuthenticated) {
      alert('You must be logged in to upload files.');
      return;
    }

    const newUploadedFiles = files.map(file => ({
      id: `${file.name}-${Date.now()}`,
      file,
      status: 'pending' as UploadedFileState['status'], // Explicitly type status
      progress: 0,
      message: 'Pending upload',
    }));
    setUploadedFiles(prev => [...prev, ...newUploadedFiles]);

    let overallSuccess = true;

    for (const fileState of newUploadedFiles) {
      setUploadedFiles(prev => prev.map(f => f.id === fileState.id ? { ...f, status: 'uploading' as UploadedFileState['status'], message: 'Uploading...', progress: 10 } : f));
      
      try {
        const fileContent = await fileState.file.text();
        let parsedTransactions: any[] = [];

        if (fileState.file.type === 'application/json' || fileState.file.name.endsWith('.json')) {
          parsedTransactions = JSON.parse(fileContent);
        } else if (fileState.file.type === 'text/csv' || fileState.file.name.endsWith('.csv')) {
          const results = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
          if (results.errors.length) {
            throw new Error(`CSV parsing errors: ${results.errors.map((err: any) => err.message).join(', ')}`);
          }
          parsedTransactions = results.data.filter((row: any) => Object.values(row).some(value => value !== "")); // Filter out empty rows from CSV
        } else {
          throw new Error('Unsupported file type. Please upload CSV or JSON.');
        }

        setUploadedFiles(prev => prev.map(f => f.id === fileState.id ? { ...f, status: 'processing' as UploadedFileState['status'], message: 'Processing transactions...', progress: 50 } : f));

        let successCount = 0;
        let failureCount = 0;
        const token = localStorage.getItem('aml_token');

        for (const rawTransaction of parsedTransactions) {
          const transactionToSend = {
            id: `${rawTransaction.id || Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
            date: rawTransaction.date ? new Date(rawTransaction.date).toISOString().split('T')[0] : '',
            from_account: rawTransaction.from_account || rawTransaction.fromAccount || '',
            to_account: rawTransaction.to_account || rawTransaction.toAccount || '',
            amount: parseFloat(rawTransaction.amount) || 0,
            description: rawTransaction.description || '',
          };
          
          if (!transactionToSend.date || !transactionToSend.from_account || !transactionToSend.to_account || !transactionToSend.amount) {
            console.warn(`Skipping incomplete transaction (ID: ${transactionToSend.id}): Missing required fields.`, transactionToSend);
            failureCount++;
            overallSuccess = false;
            continue; // Skip to next transaction
          }

          try {
            const response = await fetch(`${API_BASE_URL}/transactions/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
              },
              body: JSON.stringify(transactionToSend),
            });

            if (response.ok) {
              successCount++;
            } else {
              overallSuccess = false;
              const errorData = await response.json();
              console.error(`Failed to submit transaction ${transactionToSend.id}:`, errorData);
              failureCount++;
            }
          } catch (apiError: any) {
            overallSuccess = false;
            console.error(`Network error submitting transaction ${transactionToSend.id}:`, apiError);
            failureCount++;
          }
        }

        if (failureCount === 0) {
          setUploadedFiles(prev => prev.map(f => f.id === fileState.id ? { ...f, status: 'completed' as UploadedFileState['status'], message: `Successfully processed ${successCount} transactions.`, progress: 100 } : f));
        } else {
          overallSuccess = false;
          setUploadedFiles(prev => prev.map(f => f.id === fileState.id ? { ...f, status: 'error' as UploadedFileState['status'], message: `Processed ${successCount} transactions, failed ${failureCount}. Check console.`, progress: 100 } : f));
        }

      } catch (err: any) {
        overallSuccess = false;
        console.error(`Error processing file ${fileState.file.name}:`, err);
        setUploadedFiles(prev => prev.map(f => f.id === fileState.id ? { ...f, status: 'error' as UploadedFileState['status'], message: err.message, progress: 100 } : f));
      }
    }
    
    // Clear uploaded files state after all files are processed
    setUploadedFiles([]);
    // Refresh the main transaction list after processing all files
    fetchTransactions();
    // Automatically export if overall processing was successful and files were processed
    if (overallSuccess && newUploadedFiles.length > 0) {
      exportAllTransactionsToServer();
    }

  }, [isAuthenticated, fetchTransactions, exportAllTransactionsToServer]);

  // File handling functions
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, [handleFiles]); // Added handleFiles to dependency array

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  }, [handleFiles]); // Added handleFiles to dependency array


  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const clearAllTransactions = useCallback(async () => {
    if (!isAuthenticated) {
      setError('You must be logged in to clear transactions.');
      return;
    }

    if (window.confirm('Are you sure you want to clear all transactions? This action cannot be undone.')) {
      setLoading(true);
      let responseOk = false; // Declare responseOk here
      setError(null);
      const token = localStorage.getItem('aml_token');

      try {
        const response = await fetch(`${API_BASE_URL}/transactions/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`,
          },
        });

        responseOk = response.ok; // Assign to responseOk

        if (response.ok) {
          setTransactions([]);
          console.log('All transactions cleared successfully.');
        } else {
          const errorData = await response.json();
          setError(errorData.detail || 'Failed to clear transactions.');
          console.error('Failed to clear transactions:', errorData);
        }
      } catch (err: any) {
        setError(err.message || 'Network error while clearing transactions.');
        console.error('Network error clearing transactions:', err);
      } finally {
        setLoading(false);
        if (responseOk) { // Use responseOk here
          window.location.reload();
        }
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    console.log("TransactionAnalysis useEffect: fetching transactions.");
    fetchTransactions();
  }, [fetchTransactions]);

  // Simplified Chart data for risk score distribution (assuming fetched data)
  const riskScoreData = [
    { range: '0-2', count: transactions.filter(t => t.risk_score >= 0 && t.risk_score < 2).length, color: '#059669' },
    { range: '2-4', count: transactions.filter(t => t.risk_score >= 2 && t.risk_score < 4).length, color: '#84cc16' },
    { range: '4-6', count: transactions.filter(t => t.risk_score >= 4 && t.risk_score < 6).length, color: '#f59e0b' },
    { range: '6-8', count: transactions.filter(t => t.risk_score >= 6 && t.risk_score < 8).length, color: '#f97316' },
    { range: '8-10', count: transactions.filter(t => t.risk_score >= 8 && t.risk_score <= 10).length, color: '#dc2626' },
  ];

  // Amount distribution data
  const amountDistributionData = transactions.map(t => ({
    id: t.id,
    amount: t.amount,
    risk_score: t.risk_score,
    status: t.status,
  }));

  // Daily transaction volume
  const dailyVolumeData = Array.from(transactions.reduce((acc, transaction) => {
    const date = transaction.date; // Assuming date is in YYYY-MM-DD format
    if (!acc.has(date)) {
      acc.set(date, { date, volume: 0, transactions: 0 });
    }
    const entry = acc.get(date)!;
    entry.volume += transaction.amount;
    entry.transactions += 1;
    return acc;
  }, new Map<string, { date: string; volume: number; transactions: number }>()).values())
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  .map(item => ({ ...item, date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) })); // Format date for display

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = 
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.from_account.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.to_account.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const getStatusIcon = (status: UploadedFileState['status']) => {
    switch (status) {
      case 'pending': return <Loader className="h-5 w-5 text-gray-400" />;
      case 'uploading': return <Loader className="h-5 w-5 text-blue-400" />;
      case 'processing': return <Loader className="h-5 w-5 text-purple-400" />;
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-400" />;
      default: return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="p-6 max-w-7xl mx-auto text-center text-gray-700">Loading transactions...</div>;
  }

  if (error) {
    return <div className="p-6 max-w-7xl mx-auto text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Transaction Analysis</h2>
        <p className="text-gray-600">AI-powered analysis of transaction patterns and suspicious activities</p>
      </div>

      {/* Conditional File Upload Section */}
      {transactions.length === 0 && ( // Only show when no transactions are loaded
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Upload className="h-5 w-5 text-blue-500 mr-2" />
            Upload Transaction Files
          </h3>
          
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
              dragActive
                ? 'border-emerald-400 bg-emerald-50'
                : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".csv,.json"
              onChange={handleChange}
              className="hidden"
            />
            
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Drag and drop transaction files here or 
              <button onClick={handleButtonClick} className="text-emerald-600 hover:text-emerald-700 font-bold ml-1">click to upload</button>
            </h4>
            <p className="text-gray-500 mb-4">
              Supported formats: CSV, JSON
            </p>
            <p className="text-sm text-gray-400">
              Maximum file size: 50MB per file
            </p>
          </div>

          {/* File Processing Status */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Processing Status</h4>
              <div className="space-y-4">
                {uploadedFiles.map((fileState) => (
                  <div key={fileState.id} className="bg-gray-50 border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <File className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{fileState.file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(fileState.file.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(fileState.status)}
                        <span className="text-sm font-medium text-gray-700">
                          {fileState.message}
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          fileState.status === 'completed'
                            ? 'bg-green-500'
                            : fileState.status === 'error'
                            ? 'bg-red-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${fileState.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
            
            <button
              onClick={exportAllTransactionsToServer} // Export all transactions from backend
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export All
            </button>

            <button
              onClick={clearAllTransactions}
              disabled={transactions.length === 0 || !isAuthenticated}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-4 p-3 rounded-lg text-sm bg-red-100 text-red-800">
            Error: {error}
          </div>
        )}
      </div>

      {/* Charts Section */}
      {showCharts && transactions.length > 0 && ( // Only show charts if there are transactions
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
                  <YAxis dataKey="risk_score" name="Risk Score" />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'amount' ? `$${value.toLocaleString()}` : value,
                      name === 'amount' ? 'Amount' : 'Risk Score'
                    ]}
                  />
                  <Scatter dataKey="risk_score" fill="#8b5cf6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats & Transaction Table - Only show if there are transactions */}
      {transactions.length > 0 && (
        <>
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
                          <div>{transaction.from_account}</div>
                          <div className="text-xs text-gray-500">→ {transaction.to_account}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${transaction.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(transaction.risk_score)}`}>
                          {transaction.risk_score}/10
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
        </>
      )}

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
                  <p className="mt-1 text-sm text-gray-900">{selectedTransaction.from_account}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">To Account</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedTransaction.to_account}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                <p className="text-sm text-gray-900">{selectedTransaction.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">AI Risk Assessment</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(selectedTransaction.risk_score)}`}>
                    {selectedTransaction.risk_score}/10
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${selectedTransaction.risk_score >= 7 ? 'bg-red-500' : selectedTransaction.risk_score >= 4 ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${selectedTransaction.risk_score * 10}%` }}
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