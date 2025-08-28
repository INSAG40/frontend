import React, { useState } from 'react';
import { Shield, Upload, LogOut, User, File, CheckCircle, AlertCircle, Loader, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { User as UserType } from '../types/auth';

interface UploadFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  results?: AnalysisResults;
}

interface AnalysisResults {
  totalTransactions: number;
  suspiciousTransactions: number;
  flaggedAccounts: number;
  patterns: {
    multipleRecipients: number;
    unusualFrequency: number;
    largeAmounts: number;
    rapidSuccession: number;
  };
  riskDistribution: {
    high: number;
    medium: number;
    low: number;
    normal: number;
  };
}

interface DashboardProps {
  user: UserType;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
  };

  const processFiles = (fileList: File[]) => {
    const newFiles: UploadFile[] = fileList.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0,
    }));

    setFiles(prev => [...prev, ...newFiles]);

    newFiles.forEach((file) => {
      simulateFileProcess(file.id);
    });
  };

  const simulateFileProcess = (fileId: string) => {
    const updateProgress = (progress: number, status: UploadFile['status'], results?: AnalysisResults) => {
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress, status, results } : f
      ));
    };

    // Simulate upload progress
    let progress = 0;
    const uploadInterval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(uploadInterval);
        updateProgress(progress, 'processing');
        
        // Simulate AI analysis
        setTimeout(() => {
          const mockResults: AnalysisResults = {
            totalTransactions: Math.floor(Math.random() * 1000) + 500,
            suspiciousTransactions: Math.floor(Math.random() * 50) + 10,
            flaggedAccounts: Math.floor(Math.random() * 20) + 5,
            patterns: {
              multipleRecipients: Math.floor(Math.random() * 15) + 5,
              unusualFrequency: Math.floor(Math.random() * 12) + 3,
              largeAmounts: Math.floor(Math.random() * 10) + 2,
              rapidSuccession: Math.floor(Math.random() * 8) + 1,
            },
            riskDistribution: {
              high: Math.floor(Math.random() * 25) + 10,
              medium: Math.floor(Math.random() * 40) + 20,
              low: Math.floor(Math.random() * 60) + 30,
              normal: Math.floor(Math.random() * 200) + 400,
            }
          };
          updateProgress(100, 'completed', mockResults);
          setShowResults(true);
        }, 3000 + Math.random() * 2000);
      } else {
        updateProgress(progress, 'uploading');
      }
    }, 300);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = (status: UploadFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'AI Analysis in Progress...';
      case 'completed':
        return 'Analysis Complete';
      case 'error':
        return 'Processing Error';
    }
  };

  // Aggregate results from all completed files
  const aggregatedResults = files
    .filter(f => f.status === 'completed' && f.results)
    .reduce((acc, file) => {
      const results = file.results!;
      return {
        totalTransactions: acc.totalTransactions + results.totalTransactions,
        suspiciousTransactions: acc.suspiciousTransactions + results.suspiciousTransactions,
        flaggedAccounts: acc.flaggedAccounts + results.flaggedAccounts,
        patterns: {
          multipleRecipients: acc.patterns.multipleRecipients + results.patterns.multipleRecipients,
          unusualFrequency: acc.patterns.unusualFrequency + results.patterns.unusualFrequency,
          largeAmounts: acc.patterns.largeAmounts + results.patterns.largeAmounts,
          rapidSuccession: acc.patterns.rapidSuccession + results.patterns.rapidSuccession,
        },
        riskDistribution: {
          high: acc.riskDistribution.high + results.riskDistribution.high,
          medium: acc.riskDistribution.medium + results.riskDistribution.medium,
          low: acc.riskDistribution.low + results.riskDistribution.low,
          normal: acc.riskDistribution.normal + results.riskDistribution.normal,
        }
      };
    }, {
      totalTransactions: 0,
      suspiciousTransactions: 0,
      flaggedAccounts: 0,
      patterns: { multipleRecipients: 0, unusualFrequency: 0, largeAmounts: 0, rapidSuccession: 0 },
      riskDistribution: { high: 0, medium: 0, low: 0, normal: 0 }
    });

  // Chart data
  const riskDistributionData = [
    { name: 'High Risk', value: aggregatedResults.riskDistribution.high, color: '#dc2626' },
    { name: 'Medium Risk', value: aggregatedResults.riskDistribution.medium, color: '#f59e0b' },
    { name: 'Low Risk', value: aggregatedResults.riskDistribution.low, color: '#059669' },
    { name: 'Normal', value: aggregatedResults.riskDistribution.normal, color: '#6b7280' },
  ];

  const patternData = [
    { pattern: 'Multiple Recipients', count: aggregatedResults.patterns.multipleRecipients },
    { pattern: 'Unusual Frequency', count: aggregatedResults.patterns.unusualFrequency },
    { pattern: 'Large Amounts', count: aggregatedResults.patterns.largeAmounts },
    { pattern: 'Rapid Succession', count: aggregatedResults.patterns.rapidSuccession },
  ];

  const hasCompletedFiles = files.some(f => f.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-emerald-400 mr-3" />
              <h1 className="text-xl font-bold">AML Guard</h1>
              <span className="ml-4 text-sm text-gray-300">Anti-Money Laundering Detection System</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm text-gray-300">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-400 capitalize">{user.role} • {user.department}</p>
              </div>
              <button className="p-2 rounded-full hover:bg-slate-700 transition-colors">
                <User className="h-5 w-5" />
              </button>
              <button 
                onClick={onLogout}
                className="p-2 rounded-full hover:bg-slate-700 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Transaction Analysis Dashboard</h2>
          <p className="text-gray-600">Upload bank transaction files for AI-powered money laundering detection</p>
        </div>

        {/* File Upload Section */}
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
              type="file"
              multiple
              accept=".csv,.xlsx,.xls,.json"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Drop transaction files here or click to upload
            </h4>
            <p className="text-gray-500 mb-4">
              Supported formats: CSV, Excel (.xlsx, .xls), JSON
            </p>
            <p className="text-sm text-gray-400">
              Maximum file size: 50MB per file
            </p>
          </div>

          {/* File Processing Status */}
          {files.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Processing Status</h4>
              <div className="space-y-4">
                {files.map((file) => (
                  <div key={file.id} className="bg-gray-50 border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <File className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(file.status)}
                        <span className="text-sm font-medium text-gray-700">
                          {getStatusText(file.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          file.status === 'completed'
                            ? 'bg-green-500'
                            : file.status === 'error'
                            ? 'bg-red-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${file.progress}%` }}
                      ></div>
                    </div>
                    
                    {file.status === 'completed' && file.results && (
                      <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                        <p className="text-sm text-green-800 font-medium">
                          ✓ Analysis completed successfully
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          {file.results.totalTransactions} transactions analyzed, 
                          {file.results.suspiciousTransactions} suspicious patterns detected
                        </p>
                      </div>
                    )}

                    {file.status === 'processing' && (
                      <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm text-blue-800 font-medium">
                          🤖 AI analyzing transaction patterns...
                        </p>
                        <p className="text-sm text-blue-600 mt-1">
                          Detecting unusual recipient patterns, transaction frequency, and amount clustering
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {hasCompletedFiles && (
          <div className="space-y-8">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-3xl font-bold text-blue-600">{aggregatedResults.totalTransactions.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-amber-500">
                <p className="text-sm text-gray-600">Suspicious Transactions</p>
                <p className="text-3xl font-bold text-amber-600">{aggregatedResults.suspiciousTransactions}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
                <p className="text-sm text-gray-600">Flagged Accounts</p>
                <p className="text-3xl font-bold text-red-600">{aggregatedResults.flaggedAccounts}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                <p className="text-sm text-gray-600">Risk Score</p>
                <p className="text-3xl font-bold text-green-600">
                  {((aggregatedResults.suspiciousTransactions / aggregatedResults.totalTransactions) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Risk Distribution Pie Chart */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
                  Risk Distribution
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistributionData.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {riskDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} transactions`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Money Laundering Patterns */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 text-purple-500 mr-2" />
                  Detected Patterns
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={patternData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="pattern" fontSize={12} />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} cases`, 'Detected']} />
                      <Bar dataKey="count" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* AI Analysis Summary */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Analysis Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Key Findings</h4>
                  <div className="space-y-2">
                    <div className="flex items-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm text-red-800">
                        {aggregatedResults.patterns.multipleRecipients} accounts with multiple recipient patterns detected
                      </span>
                    </div>
                    <div className="flex items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                      <span className="text-sm text-amber-800">
                        {aggregatedResults.patterns.unusualFrequency} accounts with unusual transaction frequency
                      </span>
                    </div>
                    <div className="flex items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
                      <span className="text-sm text-orange-800">
                        {aggregatedResults.patterns.largeAmounts} large amount transactions flagged
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Risk Assessment</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">High Risk Transactions</span>
                        <span className="text-sm text-gray-500">{aggregatedResults.riskDistribution.high}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(aggregatedResults.riskDistribution.high / aggregatedResults.totalTransactions) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Medium Risk Transactions</span>
                        <span className="text-sm text-gray-500">{aggregatedResults.riskDistribution.medium}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(aggregatedResults.riskDistribution.medium / aggregatedResults.totalTransactions) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">Model Confidence: 94.2%</p>
                      <p className="text-sm text-blue-600 mt-1">Analysis completed with high accuracy</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-2">How It Works</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <p className="font-medium mb-1">1. Upload Files:</p>
              <p>Upload CSV, Excel, or JSON files containing bank transaction data</p>
            </div>
            <div>
              <p className="font-medium mb-1">2. AI Analysis:</p>
              <p>Our AI detects unusual patterns like multiple recipients and high frequency transactions</p>
            </div>
            <div>
              <p className="font-medium mb-1">3. View Results:</p>
              <p>Review flagged transactions and suspicious patterns in visual charts and reports</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};