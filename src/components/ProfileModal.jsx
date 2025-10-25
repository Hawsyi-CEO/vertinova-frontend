import React, { useState, useEffect } from 'react';
import { XMarkIcon, UserCircleIcon, BuildingLibraryIcon, KeyIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ProfileModal({ isOpen, onClose, onToast }) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
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
    if (user && isOpen) {
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
  }, [user, isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password confirmation if changing password
    if (formData.password && formData.password !== formData.password_confirmation) {
      if (onToast) onToast({ message: 'Password dan konfirmasi password tidak cocok!', type: 'error' });
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

      // Clear password fields first
      setFormData({
        ...formData,
        password: '',
        password_confirmation: '',
      });

      // Show success toast
      console.log('Setting success toast...');
      if (onToast) {
        onToast({ message: 'Profil berhasil diperbarui!', type: 'success' });
      }
      
      // Auto close after 2.5 seconds
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (onToast) {
        onToast({ 
          message: error.response?.data?.message || 'Gagal memperbarui profil. Silakan coba lagi.',
          type: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <UserCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Edit Profil
              </h3>
              <p className="text-sm text-slate-300">
                Perbarui informasi akun Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-slate-300 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <UserCircleIcon className="w-5 h-5 mr-2 text-slate-700" />
                Informasi Pribadi
              </h4>
              <div className="space-y-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Bank Account Information */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <BuildingLibraryIcon className="w-5 h-5 mr-2 text-green-600" />
                Informasi Rekening Bank
              </h4>
              <div className="space-y-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Sesuai dengan buku tabungan"
                  />
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <KeyIcon className="w-5 h-5 mr-2 text-slate-700" />
                Ubah Password (Opsional)
              </h4>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="Ulangi password baru"
                    minLength="6"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>
  );
}
