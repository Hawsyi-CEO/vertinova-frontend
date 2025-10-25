import React, { useState, useEffect } from 'react';
import { 
  CurrencyDollarIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  FolderIcon,
  UserIcon,
  PencilIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import TransactionGroupSelect from './TransactionGroupSelect';
import ValidationError from './ValidationError';
import { formatCurrencyInput, parseCurrencyInput } from '../utils/currencyFormat';
import { getHayabusaUsers } from '../services/hayabusaApi';

const ModernTransactionForm = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  saving, 
  validationErrors, 
  editingTransaction,
  onCancel,
  groupId, // Add groupId prop to identify if we're in a group context
  groupName // Add groupName prop to check if it's Simpaskor
}) => {
  const [hayabusaUsers, setHayabusaUsers] = useState([]);
  const [loadingHayabusa, setLoadingHayabusa] = useState(false);

  const expenseCategories = [
    'Operasional',
    'Marketing',
    'Administrasi', 
    'Transportasi',
    'Konsumsi',
    'Utilitas',
    'Peralatan',
    'Pembayaran Hayabusa',
    'Lainnya'
  ];

  // Check if current group is Simpaskor
  const isSimpaskorGroup = groupName?.toLowerCase().includes('simpaskor');

  // Load Hayabusa users when needed
  useEffect(() => {
    if (formData.expense_category === 'Pembayaran Hayabusa' && isSimpaskorGroup) {
      loadHayabusaUsers();
    }
  }, [formData.expense_category, isSimpaskorGroup]);

  const loadHayabusaUsers = async () => {
    try {
      setLoadingHayabusa(true);
      const users = await getHayabusaUsers();
      setHayabusaUsers(users);
    } catch (error) {
      console.error('Error loading Hayabusa users:', error);
    } finally {
      setLoadingHayabusa(false);
    }
  };

  // Handle amount input change
  const handleAmountChange = (e) => {
    const inputValue = e.target.value;
    const numericValue = parseCurrencyInput(inputValue);
    setFormData({...formData, amount: numericValue});
  };

  // Display formatted amount
  const displayAmount = formatCurrencyInput(formData.amount);

  return (
    <div className="h-full flex flex-col">
      <form id="transaction-form" onSubmit={onSubmit} className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-6 space-y-6">
          {/* Tipe Transaksi - Moved to top */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <CurrencyDollarIcon className="w-5 h-5 mr-2 text-slate-600" />
              Tipe Transaksi
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all duration-200 bg-gray-50 focus:bg-white"
            >
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
            <ValidationError field="type" errors={validationErrors} />
          </div>

          {/* Deskripsi */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <DocumentTextIcon className="w-5 h-5 mr-2 text-slate-600" />
              Deskripsi Transaksi
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="Contoh: Pembelian bahan baku, Penjualan produk..."
            />
            <ValidationError field="description" errors={validationErrors} />
          </div>

          {/* Jumlah */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <CurrencyDollarIcon className="w-5 h-5 mr-2 text-slate-600" />
              Jumlah (IDR)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm font-medium">Rp.</span>
              </div>
              <input
                type="text"
                required
                value={displayAmount}
                onChange={handleAmountChange}
                className="w-full pl-14 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="1.000.000"
                inputMode="numeric"
                pattern="[0-9.,]*"
              />
            </div>
            <ValidationError field="amount" errors={validationErrors} />
          </div>

          {/* Tanggal */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <CalendarDaysIcon className="w-5 h-5 mr-2 text-slate-600" />
              Tanggal Transaksi
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
            <ValidationError field="date" errors={validationErrors} />
          </div>

          {/* Kelompok Transaksi - Only show if not in group context */}
          {!groupId && (
            <div className="space-y-3">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <FolderIcon className="w-5 h-5 mr-2 text-slate-600" />
                Kelompok Transaksi
              </label>
              <TransactionGroupSelect
                required
                value={formData.transaction_group_id}
                onChange={(value) => setFormData({...formData, transaction_group_id: value})}
                type={formData.type || 'both'}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all duration-200 bg-gray-50 focus:bg-white"
              />
              <ValidationError field="transaction_group_id" errors={validationErrors} />
            </div>
          )}

          {/* Kategori Pengeluaran (hanya untuk expense) */}
          {formData.type === 'expense' && (
            <div className="space-y-3">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <TagIcon className="w-5 h-5 mr-2 text-slate-600" />
                Kategori Pengeluaran
              </label>
              <select
                required
                value={formData.expense_category}
                onChange={(e) => setFormData({...formData, expense_category: e.target.value})}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all duration-200 bg-gray-50 focus:bg-white"
              >
                <option value="">Pilih kategori...</option>
                {expenseCategories.map(category => {
                  // Only show "Pembayaran Hayabusa" if in Simpaskor group
                  if (category === 'Pembayaran Hayabusa' && !isSimpaskorGroup) {
                    return null;
                  }
                  return <option key={category} value={category}>{category}</option>;
                })}
              </select>
              <ValidationError field="expense_category" errors={validationErrors} />
            </div>
          )}

          {/* Pilih Hayabusa (hanya muncul jika kategori = Pembayaran Hayabusa) */}
          {formData.type === 'expense' && 
           formData.expense_category === 'Pembayaran Hayabusa' && 
           isSimpaskorGroup && (
            <div className="space-y-3">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <UserIcon className="w-5 h-5 mr-2 text-slate-600" />
                Hayabusa
              </label>
              {loadingHayabusa ? (
                <div className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500">
                  Memuat data...
                </div>
              ) : (
                <select
                  required
                  value={formData.hayabusa_user_id || ''}
                  onChange={(e) => setFormData({...formData, hayabusa_user_id: e.target.value})}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all duration-200 bg-gray-50 focus:bg-white"
                >
                  <option value="">Pilih Hayabusa...</option>
                  {hayabusaUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              )}
              <ValidationError field="hayabusa_user_id" errors={validationErrors} />
              <p className="text-xs text-gray-500">
                💡 Transaksi ini akan tercatat sebagai pembayaran honor untuk Hayabusa yang dipilih
              </p>
            </div>
          )}

          {/* Catatan */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <DocumentTextIcon className="w-5 h-5 mr-2 text-slate-600" />
              Catatan (Opsional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
              placeholder="Tambahkan catatan jika diperlukan..."
            />
            <ValidationError field="notes" errors={validationErrors} />
          </div>

        </div>
      </form>
      
      {/* Action Buttons - Fixed at bottom */}
      <div className="p-6 bg-white border-t border-gray-200 flex space-x-4" style={{ borderBottomLeftRadius: '20px' }}>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={saving}
          form="transaction-form"
          className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {editingTransaction ? 'Mengupdate...' : 'Menyimpan...'}
            </>
          ) : (
            editingTransaction ? 'Update Transaksi' : 'Simpan Transaksi'
          )}
        </button>
      </div>
    </div>
  );
};

export default ModernTransactionForm;