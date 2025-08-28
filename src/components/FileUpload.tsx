import React, { useState, useCallback } from 'react';
import { Upload, File, CheckCircle, AlertCircle, Loader, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface UploadFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
}

export const FileUpload: React.FC = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

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
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, []);

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

    // Simulate file upload and processing
    newFiles.forEach((file) => {
      simulateFileProcess(file.id);
    });
  };

  const simulateFileProcess = (fileId: string) => {
    const updateProgress = (progress: number, status: UploadFile['status']) => {
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress, status } : f
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
        
        // Simulate processing
        setTimeout(() => {
          updateProgress(100, 'completed');
        }, 2000 + Math.random() * 3000);
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

  // Analytics data for processed files
  const processingStatsData = [
    { status: 'Completed', count: files.filter(f => f.status === 'completed').length, color: '#059669' },
    { status: 'Processing', count: files.filter(f => f.status === 'processing').length, color: '#3b82f6' },
    { status: 'Uploading', count: files.filter(f => f.status === 'uploading').length, color: '#f59e0b' },
    { status: 'Error', count: files.filter(f => f.status === 'error').length, color: '#dc2626' },
  ];

  const detectionResultsData = [
    { pattern: 'Multiple Recipients', detected: 23, percentage: 34 },
    { pattern: 'Large Amounts', detected: 18, percentage: 27 },
    { pattern: 'Rapid Succession', detected: 15, percentage: 22 },
    { pattern: 'Unusual Timing', detected: 11, percentage: 17 },
  ];

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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Transaction File Upload</h2>
        <p className="text-gray-600">Upload bank transaction files for AI-powered money laundering analysis</p>
      </div>

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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Drop transaction files here or click to upload
        </h3>
        <p className="text-gray-500 mb-4">
          Supported formats: CSV, Excel (.xlsx, .xls), JSON
        </p>
        <p className="text-sm text-gray-400">
          Maximum file size: 50MB per file
        </p>
      </div>

      {/* Analytics Toggle */}
      {files.length > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`px-6 py-2 rounded-lg transition-colors flex items-center ${
              showAnalytics ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
        </div>
      )}

      {/* Analytics Dashboard */}
      {showAnalytics && files.length > 0 && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Processing Status Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={processingStatsData.filter(d => d.count > 0)}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                  >
                    {processingStatsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} files`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Detection Results */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Detection Results</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={detectionResultsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="pattern" fontSize={12} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} cases`, 'Detected']} />
                  <Bar dataKey="detected" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload Progress</h3>
          <div className="space-y-4">
            {files.map((file) => (
              <div key={file.id} className="bg-white border rounded-lg p-4 shadow-sm">
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
                
                {file.status === 'completed' && (
                  <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                    <p className="text-sm text-green-800 font-medium">
                      ✓ Analysis completed successfully
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      {Math.floor(Math.random() * 500) + 100} transactions analyzed, 
                      {Math.floor(Math.random() * 15) + 1} suspicious patterns detected
                    </p>
                  </div>
                )}

                {file.status === 'processing' && (
                  <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">
                      🤖 AI model analyzing transaction patterns...
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                      Detecting unusual recipient patterns, transaction timing, and amount clustering
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-2">Supported File Formats</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium mb-1">CSV Files:</p>
            <p>Required columns: date, amount, from_account, to_account, description</p>
          </div>
          <div>
            <p className="font-medium mb-1">Excel Files:</p>
            <p>Transaction data should be in the first sheet with headers in row 1</p>
          </div>
        </div>
      </div>
    </div>
  );
};