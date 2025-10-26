import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCache } from '../context/CacheContext';
import { formatCurrencyResponsive, formatCurrencyCompact, safeNumber } from '../utils/currencyFormat';
import { 
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const Transactions = () => {
  const { isCacheValid, getCache, setCache, clearCache } = useCache();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    category: 'all',
    dateFrom: '',
    dateTo: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    // Check if we have valid cached data
    if (isCacheValid('transactions', 2 * 60 * 1000)) { // Reduced to 2 minutes
      const cachedData = getCache('transactions');
      if (cachedData.data) {
        setTransactions(cachedData.data);
        setFilteredTransactions(cachedData.data);
        setLoading(false);
        return;
      }
    }

    try {
      console.log('🔄 Fetching transactions...');
      const response = await api.get('/transactions');
      const data = response.data.data || [];
      setTransactions(data);
      setFilteredTransactions(data);
      
      // Cache the transactions data with shorter expiry
      setCache('transactions', { data });
      console.log('✅ Transactions cached successfully');
      
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters whenever transactions or filters change
  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);

  const applyFilters = () => {
    let filtered = [...transactions];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.description?.toLowerCase().includes(searchLower) ||
        transaction.category?.toLowerCase().includes(searchLower) ||
        transaction.expense_category?.toLowerCase().includes(searchLower) ||
        transaction.user?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filters.type);
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(transaction => 
        transaction.category === filters.category || 
        transaction.expense_category === filters.category
      );
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.date) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.date) <= new Date(filters.dateTo)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'amount':
          aValue = Math.abs(parseFloat(a.amount) || 0);
          bValue = Math.abs(parseFloat(b.amount) || 0);
          break;
        case 'description':
          aValue = a.description?.toLowerCase() || '';
          bValue = b.description?.toLowerCase() || '';
          break;
        case 'type':
          aValue = a.type || '';
          bValue = b.type || '';
          break;
        default: // date
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTransactions(filtered);
  };

  // Pagination helpers
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Reset pagination when filtered transactions change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTransactions.length]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      category: 'all',
      dateFrom: '',
      dateTo: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  const getUniqueCategories = () => {
    const categories = new Set();
    transactions.forEach(transaction => {
      if (transaction.category) categories.add(transaction.category);
      if (transaction.expense_category) categories.add(transaction.expense_category);
    });
    return Array.from(categories).sort();
  };

  // Hook for detecting mobile screen
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              <ClockIcon className="w-8 h-8 mr-3 text-slate-800" />
              Riwayat Transaksi
            </h1>
            <p className="text-slate-600 mt-1">
              Lihat semua riwayat transaksi dan mutasi keuangan
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <span className="font-medium">💡 Info:</span> Untuk menambah transaksi baru, silakan pilih kelompok transaksi terlebih dahulu
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center">
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filter & Pencarian
          </h2>
          <button
            onClick={clearFilters}
            className="text-sm text-slate-600 hover:text-slate-800 underline"
          >
            Reset Filter
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cari Transaksi
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari deskripsi, kategori, atau user..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipe Transaksi
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800"
            >
              <option value="all">Semua Tipe</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Kategori
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800"
            >
              <option value="all">Semua Kategori</option>
              {getUniqueCategories().map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Urutkan Berdasarkan
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800"
            >
              <option value="date">Tanggal</option>
              <option value="amount">Jumlah</option>
              <option value="description">Deskripsi</option>
              <option value="type">Tipe</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Urutan
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleFilterChange('sortOrder', 'desc')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.sortOrder === 'desc'
                    ? 'bg-slate-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ArrowDownIcon className="w-4 h-4 inline mr-1" />
                Turun
              </button>
              <button
                onClick={() => handleFilterChange('sortOrder', 'asc')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.sortOrder === 'asc'
                    ? 'bg-slate-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ArrowUpIcon className="w-4 h-4 inline mr-1" />
                Naik
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-slate-600">
            Menampilkan <span className="font-semibold">{filteredTransactions.length}</span> dari <span className="font-semibold">{transactions.length}</span> transaksi
            {filters.search && (
              <span> • Pencarian: "<span className="font-medium">{filters.search}</span>"</span>
            )}
            {filters.type !== 'all' && (
              <span> • Tipe: <span className="font-medium">{filters.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span></span>
            )}
            {filters.category !== 'all' && (
              <span> • Kategori: <span className="font-medium">{filters.category}</span></span>
            )}
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kelompok
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTransactions.length > 0 ? (
                currentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        {transaction.description}
                        {transaction.hayabusa_payment?.hayabusa_user?.name && (
                          <div className="text-xs text-blue-600 mt-1">
                            → {transaction.hayabusa_payment.hayabusa_user.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {transaction.transaction_group ? (
                        <div className="flex items-center">
                          <span 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: transaction.transaction_group.color }}
                          ></span>
                          <span className="text-gray-900">{transaction.transaction_group.name}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.expense_category || transaction.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{isMobile ? formatCurrencyCompact(safeNumber(Math.abs(transaction.amount))) : formatCurrencyResponsive(Math.abs(transaction.amount), false)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.hayabusa_payment?.hayabusa_user?.name 
                        ? `${transaction.hayabusa_payment.hayabusa_user.name} (Hayabusa)` 
                        : transaction.user?.name || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    {transactions.length === 0 ? 'Belum ada transaksi' : 'Tidak ada transaksi yang sesuai dengan filter'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredTransactions.length)} dari {filteredTransactions.length} transaksi
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-colors ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>

                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
