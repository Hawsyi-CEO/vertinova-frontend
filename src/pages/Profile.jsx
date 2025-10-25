import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, UserCircleIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bank_name: '',
    account_number: '',
    account_holder_name: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bank_name: user.bank_name || '',
        account_number: user.account_number || '',
        account_holder_name: user.account_holder_name || '',
        password: '',
        password_confirmation: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validate password confirmation if changing password
    if (formData.password && formData.password !== formData.password_confirmation) {
      setMessage({ type: 'error', text: 'Password dan konfirmasi password tidak cocok!' });
      return;
    }

    try {
      setLoading(true);

      const updateData = {
        name: formData.name,
        email: formData.email,
        bank_name: formData.bank_name,
        account_number: formData.account_number,
        account_holder_name: formData.account_holder_name,
      };

      // Only include password if it's being changed
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await api.put(`/users/${user.id}`, updateData);

      // Update user context with new data
      if (updateUser) {
        updateUser(response.data.data);
      }

      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
      
      // Clear password fields
      setFormData({
        ...formData,
        password: '',
        password_confirmation: '',
      });

      // Scroll to top to show message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Gagal memperbarui profil. Silakan coba lagi.' 
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Kembali
          </button>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <UserCircleIcon className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
              <p className="text-gray-500">Kelola informasi akun dan rekening Anda</p>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-700">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <UserCircleIcon className="w-6 h-6 mr-2" />
                Informasi Pribadi
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nama lengkap Anda"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="email@example.com"
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Ubah Password (Opsional)</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password Baru
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Kosongkan jika tidak ingin mengubah"
                      minLength="6"
                    />
                    <p className="mt-1 text-xs text-gray-500">Minimal 6 karakter</p>
                  </div>

                  <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                      Konfirmasi Password Baru
                    </label>
                    <input
                      type="password"
                      id="password_confirmation"
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ulangi password baru"
                      minLength="6"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Account Information */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 border-b border-green-700">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <BuildingLibraryIcon className="w-6 h-6 mr-2" />
                Informasi Rekening Bank
              </h2>
              <p className="text-sm text-green-100 mt-1">
                Untuk mempermudah proses pembayaran
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Bank
                </label>
                <input
                  type="text"
                  id="bank_name"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Contoh: BCA, Mandiri, BNI, BRI"
                />
              </div>

              <div>
                <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Rekening
                </label>
                <input
                  type="text"
                  id="account_number"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Contoh: 1234567890"
                />
              </div>

              <div>
                <label htmlFor="account_holder_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Pemilik Rekening
                </label>
                <input
                  type="text"
                  id="account_holder_name"
                  name="account_holder_name"
                  value={formData.account_holder_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Sesuai dengan buku tabungan"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Pastikan nama sesuai dengan yang tertera di buku rekening
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
