import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline';
import { getHayabusaUsers } from '../services/hayabusaApi';
import api from '../services/api';

export default function HayabusaUserManagement({ isOpen, onClose, onUserCreated }) {
  const [hayabusaUsers, setHayabusaUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'hayabusa123', // Default password
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadHayabusaUsers();
    }
  }, [isOpen]);

  const loadHayabusaUsers = async () => {
    try {
      setLoading(true);
      const users = await getHayabusaUsers();
      setHayabusaUsers(users);
    } catch (error) {
      console.error('Error loading Hayabusa users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      setLoading(true);
      await api.post('/users', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'hayabusa',
      });

      // Reset form
      setFormData({ name: '', email: '', password: 'hayabusa123' });
      setShowAddForm(false);
      
      // Reload users
      await loadHayabusaUsers();
      
      // Notify parent
      if (onUserCreated) {
        onUserCreated();
      }

      alert('Akun Hayabusa berhasil dibuat!');
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert('Gagal membuat akun: ' + (error.response?.data?.message || error.message));
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
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Manajemen Akun Hayabusa
              </h3>
              <p className="text-sm text-gray-500">
                Kelola akun untuk tim Simpaskor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Add Button */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full mb-4 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Tambah Akun Hayabusa Baru</span>
            </button>
          )}

          {/* Add Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-4">Buat Akun Baru</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Contoh: Obi"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="contoh@simpaskor.id"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Password default: hayabusa123
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Membuat...' : 'Buat Akun'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ name: '', email: '', password: 'hayabusa123' });
                    setErrors({});
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          )}

          {/* Users List */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Daftar Akun Hayabusa ({hayabusaUsers.length})
            </h4>
            
            {loading && !showAddForm ? (
              <div className="text-center py-8 text-gray-500">
                Memuat data...
              </div>
            ) : hayabusaUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Belum ada akun Hayabusa
              </div>
            ) : (
              <div className="space-y-2">
                {hayabusaUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      Hayabusa
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
