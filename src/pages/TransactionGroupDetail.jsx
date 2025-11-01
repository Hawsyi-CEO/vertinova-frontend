import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCache } from '../context/CacheContext';
import api from '../services/api';
import SidebarModal from '../components/SidebarModal';
import ModernTransactionForm from '../components/ModernTransactionForm';
import HayabusaUserManagement from '../components/HayabusaUserManagement';
import JadwalSimpaskor from '../components/JadwalSimpaskor';
import { formatCurrencyResponsive, formatCurrencyCompact, safeNumber } from '../utils/currencyFormat';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FolderIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserPlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const TransactionGroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearCache } = useCache();
  
  const [group, setGroup] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showHayabusaManagement, setShowHayabusaManagement] = useState(false);
  const [showJadwalModal, setShowJadwalModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    type: 'all', // all, income, expense
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const [formData, setFormData] = useState({
    description: '',
    type: 'income',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    transaction_group_id: id,
    expense_category: '',
    user_id: '',
    hayabusa_user_id: '', // Tambahkan field hayabusa_user_id
    notes: ''
  });

  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);

  useEffect(() => {
    fetchGroupDetail();
  }, [id]);

  const fetchGroupDetail = async () => {
    try {
      setLoading(true);
      
      // Fetch group details
      const groupResponse = await api.get(`/transaction-groups/${id}`);
      if (groupResponse.data.success) {
        setGroup(groupResponse.data.data);
      }

      // Fetch transactions in this group
      const transactionsResponse = await api.get(`/transactions?transaction_group_id=${id}`);
      if (transactionsResponse.data.success) {
        setTransactions(transactionsResponse.data.data || []);
      }

    } catch (error) {
      console.error('Error fetching group detail:', error);
      if (error.response?.status === 404) {
        navigate('/transaction-groups');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setValidationErrors({});
    
    try {
      // Ensure the transaction is associated with this group
      const transactionData = { ...formData, transaction_group_id: id };
      
      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction.id}`, transactionData);
      } else {
        await api.post('/transactions', transactionData);
      }
      
      // Close modal and reset form
      resetForm();
      
      // Clear cache and refresh data
      clearCache('transactions');
      clearCache('dashboard');
      clearCache('statistics');
      clearCache('reports');
      await fetchGroupDetail();
      setSuccessMessage(editingTransaction ? 'Transaksi berhasil diperbarui!' : 'Transaksi berhasil ditambahkan!');
      showSuccessMessage();
      
    } catch (error) {
      console.error('Error saving transaction:', error);
      
      if (error.response?.status === 422) {
        setValidationErrors(error.response.data.errors || {});
      } else {
        alert('Terjadi kesalahan saat menyimpan transaksi');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    
    // Cek apakah ini transaksi Hayabusa payment
    const hayabusaUserId = transaction.hayabusa_payment?.hayabusa_user_id;
    
    setFormData({
      description: transaction.description,
      type: transaction.type,
      amount: transaction.amount.toString(),
      date: transaction.date,
      category: transaction.category || '',
      transaction_group_id: id,
      expense_category: transaction.expense_category || '',
      user_id: transaction.user_id,
      hayabusa_user_id: hayabusaUserId || '', // Set hayabusa_user_id untuk dropdown
      notes: transaction.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (transactionId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return;
    
    try {
      await api.delete(`/transactions/${transactionId}`);
      setSuccessMessage('Transaksi berhasil dihapus!');
      showSuccessMessage();
      fetchGroupDetail();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Terjadi kesalahan saat menghapus transaksi');
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingTransaction(null);
    setFormData({
      description: '',
      type: 'income',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      transaction_group_id: id,
      expense_category: '',
      user_id: '',
      hayabusa_user_id: '', // Reset hayabusa_user_id juga
      notes: ''
    });
  };

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
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

  // Filter transactions based on filter criteria
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesDescription = transaction.description?.toLowerCase().includes(searchLower);
        const matchesHayabusaName = transaction.hayabusa_payment?.hayabusa_user?.name?.toLowerCase().includes(searchLower);
        if (!matchesDescription && !matchesHayabusaName) return false;
      }

      // Type filter
      if (filters.type !== 'all' && transaction.type !== filters.type) return false;

      // Date range filter
      if (filters.dateFrom && transaction.date < filters.dateFrom) return false;
      if (filters.dateTo && transaction.date > filters.dateTo) return false;

      // Amount range filter
      const amount = safeNumber(transaction.amount);
      if (filters.minAmount && amount < parseFloat(filters.minAmount)) return false;
      if (filters.maxAmount && amount > parseFloat(filters.maxAmount)) return false;

      return true;
    });
  }, [transactions, filters]);

  // Calculate statistics from filtered transactions
  const statistics = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + safeNumber(t.amount), 0);
    const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + safeNumber(t.amount), 0);
    const balance = income - expense;

    // Group by month for trend chart
    const monthlyData = {};
    filteredTransactions.forEach(t => {
      const month = t.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { month, income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        monthlyData[month].income += safeNumber(t.amount);
      } else {
        monthlyData[month].expense += safeNumber(t.amount);
      }
    });

    const trendData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

    // Count by type for pie chart
    const typeData = [
      { name: 'Pemasukan', value: income, color: '#10b981' },
      { name: 'Pengeluaran', value: expense, color: '#ef4444' }
    ];

    return { income, expense, balance, trendData, typeData };
  }, [filteredTransactions]);

  const getTotalIncome = () => {
    return statistics.income;
  };

  const getTotalExpense = () => {
    return statistics.expense;
  };

  const getBalance = () => {
    return statistics.balance;
  };

  // Pagination helpers - use filtered transactions
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

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return filters.search || filters.type !== 'all' || filters.dateFrom || filters.dateTo || filters.minAmount || filters.maxAmount;
  }, [filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Kelompok tidak ditemukan</h3>
        <Link to="/transaction-groups" className="text-slate-800 hover:text-slate-600">
          Kembali ke daftar kelompok
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 max-w-sm">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div>
              <p className="font-medium">Berhasil!</p>
              <p className="text-sm text-green-100">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/transaction-groups"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-slate-600" />
            </Link>
            {group && (
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: group.color || '#3B82F6' }}
                ></div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 flex items-center">
                    <FolderIcon className="w-8 h-8 mr-3 text-slate-800" />
                    {group.name}
                  </h1>
                  {group.description && (
                    <p className="text-slate-600 mt-1">{group.description}</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Jadwal Simpaskor button - only for Simpaskor group */}
            {group?.name?.toLowerCase().includes('simpaskor') && (
              <button
                onClick={() => setShowJadwalModal(true)}
                className="bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
              >
                <CalendarIcon className="w-5 h-5" />
                <span>Jadwal Simpaskor</span>
              </button>
            )}

            {/* Manage Hayabusa button - only for Simpaskor group */}
            {group?.name?.toLowerCase().includes('simpaskor') && 
             (user?.role === 'admin' || user?.role === 'finance') && (
              <button
                onClick={() => setShowHayabusaManagement(true)}
                className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
              >
                <UserPlusIcon className="w-5 h-5" />
                <span>Kelola Akun Hayabusa</span>
              </button>
            )}

            {/* Add Transaction button */}
            {(user?.role === 'admin' || user?.role === 'finance' || user?.role === 'user') && (
              <button
                onClick={() => setShowModal(true)}
                className="group bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3 transform hover:scale-105"
              >
                <div className="p-1 bg-white bg-opacity-20 rounded-lg group-hover:bg-opacity-30 transition-all">
                  <PlusIcon className="w-5 h-5" />
                </div>
                <span className="font-medium">Tambah Transaksi</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-gray-600 text-sm font-medium">Total Pemasukan</p>
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-slate-800">
                {isMobile ? formatCurrencyCompact(getTotalIncome()) : formatCurrencyResponsive(getTotalIncome(), false)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <ArrowTrendingDownIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-gray-600 text-sm font-medium">Total Pengeluaran</p>
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-slate-800">
                {isMobile ? formatCurrencyCompact(getTotalExpense()) : formatCurrencyResponsive(getTotalExpense(), false)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 text-white shadow-lg border border-slate-600">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-400 bg-opacity-20 rounded-lg backdrop-blur-sm">
              <CurrencyDollarIcon className="h-6 w-6 text-yellow-300" />
            </div>
            <div className="ml-4">
              <p className="text-slate-200 text-sm font-medium">Saldo</p>
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-yellow-300">
                {isMobile ? formatCurrencyCompact(getBalance()) : formatCurrencyResponsive(getBalance(), false)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2 text-slate-600" />
              Analisis & Statistik
            </h3>
            <button
              onClick={() => setShowChart(!showChart)}
              className="flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200"
            >
              <span>{showChart ? 'Sembunyikan' : 'Tampilkan'}</span>
              <svg 
                className={`w-4 h-4 transform transition-transform duration-300 ${showChart ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className={`transition-all duration-500 ease-in-out ${showChart ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 md:p-6 space-y-4">
              {/* Statistics Cards Row - Compact Modern Design */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                {/* Total Transaksi Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                  <div className="absolute top-0 right-0 -mt-3 -mr-3 w-16 h-16 bg-white opacity-10 rounded-full"></div>
                  <div className="absolute bottom-0 left-0 -mb-3 -ml-3 w-12 h-12 bg-white opacity-10 rounded-full"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-blue-100 text-xs font-semibold tracking-wide uppercase">Total Transaksi</p>
                      <div className="bg-white bg-opacity-20 p-1.5 rounded-lg backdrop-blur-sm">
                        <FolderIcon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-white tracking-tight">{filteredTransactions.length}</p>
                  </div>
                </div>

                {/* Pemasukan Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                  <div className="absolute top-0 right-0 -mt-3 -mr-3 w-16 h-16 bg-white opacity-10 rounded-full"></div>
                  <div className="absolute bottom-0 left-0 -mb-3 -ml-3 w-12 h-12 bg-white opacity-10 rounded-full"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-emerald-100 text-xs font-semibold tracking-wide uppercase">Pemasukan</p>
                      <div className="bg-white bg-opacity-20 p-1.5 rounded-lg backdrop-blur-sm">
                        <ArrowTrendingUpIcon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-white tracking-tight">
                      {filteredTransactions.filter(t => t.type === 'income').length}
                    </p>
                  </div>
                </div>

                {/* Pengeluaran Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-red-600 to-pink-600 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                  <div className="absolute top-0 right-0 -mt-3 -mr-3 w-16 h-16 bg-white opacity-10 rounded-full"></div>
                  <div className="absolute bottom-0 left-0 -mb-3 -ml-3 w-12 h-12 bg-white opacity-10 rounded-full"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-rose-100 text-xs font-semibold tracking-wide uppercase">Pengeluaran</p>
                      <div className="bg-white bg-opacity-20 p-1.5 rounded-lg backdrop-blur-sm">
                        <ArrowTrendingDownIcon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-white tracking-tight">
                      {filteredTransactions.filter(t => t.type === 'expense').length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Charts Row - Compact Modern Design */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                {/* Pie Chart - Type Distribution */}
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center mb-3">
                    <div className="w-1.5 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-2"></div>
                    <h4 className="text-base font-bold text-gray-800">Distribusi Transaksi</h4>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#059669" stopOpacity={0.9}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#dc2626" stopOpacity={0.9}/>
                        </linearGradient>
                      </defs>
                      <Pie
                        data={statistics.typeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {statistics.typeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => formatCurrencyCompact(value)}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar Chart - Monthly Trend */}
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center mb-3">
                    <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full mr-2"></div>
                    <h4 className="text-base font-bold text-gray-800">Tren Bulanan</h4>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={statistics.trendData}>
                      <defs>
                        <linearGradient id="gradientIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#059669" stopOpacity={0.7}/>
                        </linearGradient>
                        <linearGradient id="gradientExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#dc2626" stopOpacity={0.7}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <Tooltip 
                        formatter={(value) => formatCurrencyCompact(value)}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                      />
                      <Bar 
                        dataKey="income" 
                        name="Pemasukan" 
                        fill="url(#gradientIncome)"
                        radius={[8, 8, 0, 0]}
                        animationBegin={0}
                        animationDuration={800}
                      />
                      <Bar 
                        dataKey="expense" 
                        name="Pengeluaran" 
                        fill="url(#gradientExpense)"
                        radius={[8, 8, 0, 0]}
                        animationBegin={200}
                        animationDuration={800}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ClockIcon className="w-5 h-5 mr-2 text-slate-600" />
            Daftar Transaksi {hasActiveFilters && `(${filteredTransactions.length} hasil)`}
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              hasActiveFilters 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FunnelIcon className="w-4 h-4" />
            <span className="text-sm">Filter</span>
            {hasActiveFilters && (
              <span className="bg-white text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {Object.values(filters).filter(v => v && v !== 'all').length}
              </span>
            )}
            <svg 
              className={`w-4 h-4 transform transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Filter Panel with smooth transition */}
        <div className={`transition-all duration-500 ease-in-out ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 py-4 bg-slate-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cari Transaksi
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    placeholder="Deskripsi atau nama..."
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipe Transaksi
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">Semua Tipe</option>
                  <option value="income">Pemasukan</option>
                  <option value="expense">Pengeluaran</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tanggal Dari
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tanggal Sampai
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Min Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Jumlah Minimal
                </label>
                <input
                  type="number"
                  value={filters.minAmount}
                  onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Max Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Jumlah Maksimal
                </label>
                <input
                  type="number"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                  placeholder="Tidak terbatas"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Filter Actions */}
            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium transition-colors text-sm"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span>Hapus Semua Filter</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {hasActiveFilters ? 'Tidak ada transaksi yang sesuai filter' : 'Belum ada transaksi'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {hasActiveFilters 
                ? 'Coba ubah kriteria filter Anda' 
                : 'Mulai dengan menambahkan transaksi pertama dalam kelompok ini.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm"
              >
                Hapus Filter
              </button>
            )}
            {!hasActiveFilters && (user?.role === 'admin' || user?.role === 'finance' || user?.role === 'user') && (
              <div className="mt-6">
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Tambah Transaksi
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {currentTransactions.map((transaction) => (
                <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {transaction.type === 'income' ? (
                          <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{transaction.description}</h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-500 flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {new Date(transaction.date).toLocaleDateString('id-ID')}
                          </p>
                          {(transaction.category || transaction.expense_category) && (
                            <p className="text-sm text-gray-500">{transaction.expense_category || transaction.category}</p>
                          )}
                          {/* Tampilkan nama Hayabusa jika ada, jika tidak tampilkan user biasa */}
                          {(transaction.hayabusa_payment?.hayabusa_user?.name || transaction.user?.name) && (
                            <p className="text-sm text-gray-500">
                              • {transaction.hayabusa_payment?.hayabusa_user?.name 
                                  ? `${transaction.hayabusa_payment.hayabusa_user.name} (Hayabusa)` 
                                  : transaction.user.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <p className={`text-sm md:text-base lg:text-lg font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{isMobile ? formatCurrencyCompact(safeNumber(transaction.amount)) : formatCurrencyResponsive(transaction.amount, false)}
                      </p>
                      
                      {(user?.role === 'admin' || user?.role === 'finance') && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="p-2 text-gray-400 hover:text-slate-800 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="p-2 text-gray-400 hover:text-slate-800 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center text-sm text-gray-700">
                    <span>
                      Menampilkan {startIndex + 1} - {Math.min(endIndex, transactions.length)} dari {transactions.length} transaksi
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg transition-all ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed opacity-50'
                          : 'text-slate-600 hover:text-slate-800 hover:bg-gray-100'
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
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                              currentPage === page
                                ? 'bg-slate-800 text-white shadow-lg'
                                : 'text-slate-600 hover:text-slate-800 hover:bg-gray-100'
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
                      className={`p-2 rounded-lg transition-all ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed opacity-50'
                          : 'text-slate-600 hover:text-slate-800 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sidebar Modal */}
      <SidebarModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTransaction(null);
        }}
        title={editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
        size="lg"
      >
        <ModernTransactionForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          saving={saving}
          validationErrors={validationErrors}
          editingTransaction={editingTransaction}
          onCancel={() => {
            setShowModal(false);
            setEditingTransaction(null);
          }}
          groupId={id}
          groupName={group?.name}
        />
      </SidebarModal>

      {/* Hayabusa User Management Modal */}
      <HayabusaUserManagement
        isOpen={showHayabusaManagement}
        onClose={() => setShowHayabusaManagement(false)}
        onUserCreated={() => {
          // Optional: refresh something if needed
          console.log('Hayabusa user created');
        }}
      />

      {/* Jadwal Simpaskor Modal */}
      <JadwalSimpaskor 
        isOpen={showJadwalModal}
        onClose={() => setShowJadwalModal(false)}
      />
    </div>
  );
};

export default TransactionGroupDetail;