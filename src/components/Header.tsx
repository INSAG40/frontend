import React from 'react';
import { Shield, Bell, Settings, User, LogOut } from 'lucide-react';
import { User as UserType } from '../types/auth';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserType;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, user, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Shield },
    { id: 'upload', label: 'Upload', icon: null },
    { id: 'transactions', label: 'Transactions', icon: null },
    { id: 'alerts', label: 'Alerts', icon: Bell },
  ];

  return (
    <header className="bg-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-emerald-400 mr-3" />
            <h1 className="text-xl font-bold">AML Guard</h1>
          </div>
          
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center ${
                      activeTab === item.id
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {Icon && <Icon className="h-4 w-4 mr-2" />}
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <p className="text-sm text-gray-300">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role} • {user.department}</p>
            </div>
            <button className="p-2 rounded-full hover:bg-slate-700 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
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
  );
};