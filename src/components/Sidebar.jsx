import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  CreditCardIcon,
  FolderIcon,
  DocumentChartBarIcon,
  ChartBarIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      shortName: 'Dashboard',
      excludeRoles: ['hayabusa']
    },
    {
      name: 'Dashboard Hayabusa',
      href: '/hayabusa/dashboard',
      icon: HomeIcon,
      shortName: 'Dashboard',
      roles: ['hayabusa']
    },
    {
      name: 'Riwayat Transaksi',
      href: '/transactions',
      icon: CreditCardIcon,
      shortName: 'Transaksi',
      excludeRoles: ['hayabusa']
    },
    {
      name: 'Kelompok Transaksi',
      href: '/transaction-groups',
      icon: FolderIcon,
      shortName: 'Kelompok',
      roles: ['admin', 'finance'],
    },
    {
      name: 'Laporan Keuangan',
      href: '/reports',
      icon: DocumentChartBarIcon,
      shortName: 'Laporan',
      roles: ['admin', 'finance'],
    },
    {
      name: 'Statistik',
      href: '/statistics',
      icon: ChartBarIcon,
      shortName: 'Statistik',
      roles: ['admin', 'finance'],
    },
    {
      name: 'Users',
      href: '/users',
      icon: UsersIcon,
      shortName: 'Users',
      roles: ['admin'],
    },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    // If item has specific roles, check if user has that role
    if (item.roles) {
      return item.roles.includes(user?.role);
    }
    // If item has excluded roles, check if user is NOT in that list
    if (item.excludeRoles) {
      return !item.excludeRoles.includes(user?.role);
    }
    // Otherwise, show the item
    return true;
  });

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:static inset-y-0 left-0 z-30
        ${isOpen && !window.matchMedia('(min-width: 1024px)').matches ? 'w-64' : isOpen ? 'w-64' : 'w-16'}
        bg-white min-h-screen shadow-xl border-r border-gray-100
        transition-all duration-300 ease-in-out
        flex flex-col
      `}>
        
        {/* Header with Toggle */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          {isOpen && (
            <h1 className="text-xl font-bold text-slate-800 truncate">
              Vertinova Finance
            </h1>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden lg:flex"
          >
            {isOpen ? (
              <ChevronLeftIcon className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronRightIcon className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-4">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.href;
            const IconComponent = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center mx-2 mb-1 px-3 py-3 rounded-lg
                  transition-all duration-200 ease-in-out
                  ${isActive
                    ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100'
                    : 'text-slate-700 hover:bg-gray-50 hover:text-slate-900'
                  }
                `}
                title={!isOpen ? item.name : ''}
              >
                <IconComponent className="w-5 h-5 flex-shrink-0" />
                {isOpen && (
                  <span className="ml-3 font-medium truncate">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info (when expanded) */}
        {isOpen && user && (
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
