import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCache } from '../context/CacheContext';
import api from '../services/api';
import SidebarModal from '../components/SidebarModal';
import ModernTransactionForm from '../components/ModernTransactionForm';
import HayabusaUserManagement from '../components/HayabusaUserManagement';
import { formatCurrencyResponsive, formatCurrencyCompact, safeNumber } from '../utils/currencyFormat';
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
  UserPlusIcon
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
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    description: '',
    type: 'income',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    transaction_group_id: id,
    expense_category: '',
    user_id: '',
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
    setFormData({
      description: transaction.description,
      type: transaction.type,
      amount: transaction.amount.toString(),
      date: transaction.date,
      category: transaction.category || '',
      transaction_group_id: id,
      expense_category: transaction.expense_category || '',
      user_id: transaction.user_id,
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

  const getTotalIncome = () => {
    return transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + safeNumber(t.amount), 0);
  };

  const getTotalExpense = () => {
    return transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + safeNumber(t.amount), 0);
  };

  const getBalance = () => {
    return getTotalIncome() - getTotalExpense();
  };

  // Pagination helpers
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = transactions.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Reset pagination when transactions change
  useEffect(() => {
    setCurrentPage(1);
  }, [transactions.length]);

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

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ClockIcon className="w-5 h-5 mr-2 text-slate-600" />
            Daftar Transaksi
          </h3>
        </div>
        
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada transaksi</h3>
            <p className="mt-1 text-sm text-gray-500">
              Mulai dengan menambahkan transaksi pertama dalam kelompok ini.
            </p>
            {(user?.role === 'admin' || user?.role === 'finance' || user?.role === 'user') && (
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
                          {transaction.user?.name && (
                            <p className="text-sm text-gray-500">• {transaction.user.name}</p>
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
    </div>
  );
};

export default TransactionGroupDetail;