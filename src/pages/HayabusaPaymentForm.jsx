import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHayabusaUsers, getTransactionGroups, createHayabusaPayment } from '../services/hayabusaApi';

export default function HayabusaPaymentForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hayabusaUsers, setHayabusaUsers] = useState([]);
  const [transactionGroups, setTransactionGroups] = useState([]);
  const [formData, setFormData] = useState({
    hayabusa_user_id: '',
    transaction_group_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    period: '',
    description: '',
    status: 'pending'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [users, groups] = await Promise.all([
        getHayabusaUsers(),
        getTransactionGroups()
      ]);
      
      setHayabusaUsers(users);
      setTransactionGroups(groups);

      // Auto-select Simpaskor group if available
      const simpaskorGroup = groups.find(g => g.name.toLowerCase().includes('simpaskor'));
      if (simpaskorGroup) {
        setFormData(prev => ({ ...prev, transaction_group_id: simpaskorGroup.id }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Gagal memuat data');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.hayabusa_user_id) {
      newErrors.hayabusa_user_id = 'Pilih karyawan Hayabusa';
    }
    if (!formData.transaction_group_id) {
      newErrors.transaction_group_id = 'Pilih grup transaksi';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Jumlah harus lebih dari 0';
    }
    if (!formData.payment_date) {
      newErrors.payment_date = 'Tanggal pembayaran wajib diisi';
    }
    if (!formData.period) {
      newErrors.period = 'Periode wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      await createHayabusaPayment(formData);
      alert('Pembayaran berhasil dibuat');
      navigate('/hayabusa-payments');
    } catch (error) {
      console.error('Error creating payment:', error);
      alert(error.response?.data?.message || 'Gagal membuat pembayaran');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Buat Pembayaran Hayabusa
          </h2>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 space-y-6">
          {/* Hayabusa User */}
          <div>
            <label htmlFor="hayabusa_user_id" className="block text-sm font-medium text-gray-700">
              Karyawan Hayabusa <span className="text-red-500">*</span>
            </label>
            <select
              id="hayabusa_user_id"
              name="hayabusa_user_id"
              value={formData.hayabusa_user_id}
              onChange={handleChange}
              className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${
                errors.hayabusa_user_id ? 'border-red-300' : 'border-gray-300'
              } focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md`}
            >
              <option value="">Pilih Karyawan</option>
              {hayabusaUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {errors.hayabusa_user_id && (
              <p className="mt-1 text-sm text-red-600">{errors.hayabusa_user_id}</p>
            )}
          </div>

          {/* Transaction Group */}
          <div>
            <label htmlFor="transaction_group_id" className="block text-sm font-medium text-gray-700">
              Grup Transaksi <span className="text-red-500">*</span>
            </label>
            <select
              id="transaction_group_id"
              name="transaction_group_id"
              value={formData.transaction_group_id}
              onChange={handleChange}
              className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${
                errors.transaction_group_id ? 'border-red-300' : 'border-gray-300'
              } focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md`}
            >
              <option value="">Pilih Grup Transaksi</option>
              {transactionGroups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            {errors.transaction_group_id && (
              <p className="mt-1 text-sm text-red-600">{errors.transaction_group_id}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Jumlah <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">Rp</span>
              </div>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                className={`block w-full pl-12 pr-12 py-2 border ${
                  errors.amount ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* Payment Date */}
          <div>
            <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700">
              Tanggal Pembayaran <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="payment_date"
              name="payment_date"
              value={formData.payment_date}
              onChange={handleChange}
              className={`mt-1 block w-full border ${
                errors.payment_date ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            />
            {errors.payment_date && (
              <p className="mt-1 text-sm text-red-600">{errors.payment_date}</p>
            )}
          </div>

          {/* Period */}
          <div>
            <label htmlFor="period" className="block text-sm font-medium text-gray-700">
              Periode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="period"
              name="period"
              value={formData.period}
              onChange={handleChange}
              placeholder="Contoh: Januari 2024, Q1 2024"
              className={`mt-1 block w-full border ${
                errors.period ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            />
            {errors.period && (
              <p className="mt-1 text-sm text-red-600">{errors.period}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Keterangan
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Keterangan tambahan (opsional)"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="pending">Pending</option>
              <option value="paid">Dibayar</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/hayabusa-payments')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
