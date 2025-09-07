import React from 'react';
import { Shield, LogOut, User } from 'lucide-react';
import { User as UserType } from '../types/auth';
import { TransactionAnalysis } from './TransactionAnalysis'; // Import the TransactionAnalysis component

interface DashboardProps {
  user: UserType;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  console.log("Dashboard received user:", user);
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

      {/* Main Content Area: Render TransactionAnalysis component */}
      <main className="py-6">
        <TransactionAnalysis />
      </main>
    </div>
  );
};