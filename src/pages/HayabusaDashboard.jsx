import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHayabusaStatistics, getHayabusaPayments } from '../services/hayabusaApi';
import { formatCurrency } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import simpaskorLogo from '../assets/simpaskor-logo.png';
import ProfileModal from '../components/ProfileModal';
import Toast from '../components/Toast';
import JadwalSimpaskor from '../components/JadwalSimpaskor';
import { 
  CurrencyDollarIcon, 
  ClockIcon, 
  ChevronRightIcon,
  CalendarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  BellIcon,
  CreditCardIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function HayabusaDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [activeModal, setActiveModal] = useState(null); // 'statistik', 'riwayat', 'pembayaran', 'jadwal'
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showJadwalModal, setShowJadwalModal] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileClick = () => {
    console.log('Profile clicked, opening modal');
    setShowProfileModal(true);
  };

  const openModal = (modalName) => {
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
    // Reload data setelah modal ditutup untuk update data terbaru
    loadData();
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, paymentsData] = await Promise.all([
        getHayabusaStatistics(),
        getHayabusaPayments()
      ]);
      
      setStatistics(statsData);
      setPayments(paymentsData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      paid: 'Dibayar',
      pending: 'Pending',
      cancelled: 'Dibatalkan'
    };
    return texts[status] || status;
  };

  // Pagination helpers
  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = payments.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Reset pagination when payments change
  useEffect(() => {
    setCurrentPage(1);
  }, [payments.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  // Ambil 1 pembayaran terbaru untuk dashboard
  const latestPayment = statistics?.recent_payments?.[0];
  const latestTransaction = payments[0];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Section - Navy Slate Style */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-b-3xl shadow-xl">
        <div className="px-4 pt-6 pb-20">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6 relative">
            {/* Logo - Centered */}
            <div className="absolute left-0 right-0 flex justify-center pointer-events-none">
              <img 
                src={simpaskorLogo} 
                alt="Simpaskor" 
                className="h-10 w-auto opacity-90"
              />
            </div>

            {/* Spacer for left side */}
            <div className="flex-1"></div>

            {/* Action Buttons - Right side with z-index */}
            <div className="flex items-center space-x-2 relative z-10">
              <button 
                onClick={handleProfileClick}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all cursor-pointer"
                title="Profil"
                type="button"
              >
                <UserCircleIcon className="h-6 w-6 text-white" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all cursor-pointer"
                title="Logout"
                type="button"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          {/* Saldo Card - Floating */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 -mb-16 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-500 text-sm">Total Pendapatan</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">
                  {formatCurrency(statistics?.total_income || 0)}
                </h2>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl">
                <CurrencyDollarIcon className="h-8 w-8 text-slate-800" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-gray-500 text-xs">Pembayaran Bulan Ini</p>
                <p className="text-lg font-bold text-gray-900">
                  {statistics?.pending_payments || 0}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Status</p>
                <div className="flex items-center mt-1">
                  <CheckCircleIcon className="h-5 w-5 text-slate-800 mr-1" />
                  <span className="text-sm font-semibold text-slate-800">Aktif</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Grid - Navy Slate Style - 4 tombol sejajar horizontal */}
      <div className="px-4 mt-20 mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-4 gap-4">
            <button 
              onClick={() => openModal('statistik')}
              className="flex flex-col items-center space-y-2 group"
            >
              <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs text-gray-700 font-medium text-center">Statistik</span>
            </button>
            
            <button 
              onClick={() => openModal('riwayat')}
              className="flex flex-col items-center space-y-2 group"
            >
              <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs text-gray-700 font-medium text-center">Riwayat</span>
            </button>
            
            <button 
              onClick={() => openModal('pembayaran')}
              className="flex flex-col items-center space-y-2 group"
            >
              <div className="p-3 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <CreditCardIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs text-gray-700 font-medium text-center">Pembayaran</span>
            </button>

            <button 
              onClick={() => setShowJadwalModal(true)}
              className="flex flex-col items-center space-y-2 group"
            >
              <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs text-gray-700 font-medium text-center">Jadwal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pembayaran Terbaru - Hanya 1 Card */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Pembayaran Terbaru</h3>
          <button 
            onClick={() => openModal('riwayat')}
            className="text-slate-800 text-sm font-semibold flex items-center hover:text-slate-700"
          >
            Lihat Semua
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </button>
        </div>

        {latestPayment ? (
          <div className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl">
                  <CurrencyDollarIcon className="h-6 w-6 text-slate-800" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {latestPayment.transaction_group?.name || 'Simpaskor'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {latestPayment.period}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(latestPayment.payment_date).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-slate-800">
                  {formatCurrency(latestPayment.amount)}
                </p>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusBadge(latestPayment.status)}`}>
                  {getStatusText(latestPayment.status)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Belum ada pembayaran terbaru</p>
          </div>
        )}
      </div>

      {/* Transaksi Terbaru - Hanya 1 Card */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Transaksi Terbaru</h3>
          <button 
            onClick={() => openModal('riwayat')}
            className="text-slate-800 text-sm font-semibold flex items-center hover:text-slate-700"
          >
            Lihat Semua
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </button>
        </div>
        
        {latestTransaction ? (
          <div className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-900">
                    {latestTransaction.transaction_group?.name || 'Simpaskor'}
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(latestTransaction.status)}`}>
                    {getStatusText(latestTransaction.status)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{latestTransaction.period}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(latestTransaction.payment_date).toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
                {latestTransaction.description && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-1">{latestTransaction.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">Jumlah</span>
              <span className="text-lg font-bold text-slate-800">
                {formatCurrency(latestTransaction.amount)}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Belum ada transaksi</p>
          </div>
        )}
      </div>

      {/* Modal Components */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-br from-slate-800 to-slate-900 px-6 py-4 rounded-t-3xl flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-white">
                {activeModal === 'statistik' && 'Statistik Pendapatan'}
                {activeModal === 'riwayat' && 'Riwayat Pembayaran'}
                {activeModal === 'pembayaran' && 'Detail Pembayaran'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/20 rounded-full transition-all"
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {activeModal === 'statistik' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200">
                      <p className="text-sm text-gray-600 mb-1">Total Pendapatan</p>
                      <p className="text-2xl font-bold text-slate-800">
                        {formatCurrency(statistics?.total_income || 0)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">Total Transaksi</p>
                      <p className="text-2xl font-bold text-blue-800">
                        {payments.length}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
                      <p className="text-sm text-gray-600 mb-1">Rata-rata/Bulan</p>
                      <p className="text-2xl font-bold text-green-800">
                        {formatCurrency((statistics?.total_income || 0) / (payments.length || 1))}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-4 border border-yellow-200">
                      <p className="text-sm text-gray-600 mb-1">Pending</p>
                      <p className="text-2xl font-bold text-yellow-800">
                        {statistics?.pending_payments || 0}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-3">Grafik Pembayaran (Coming Soon)</h4>
                    <div className="h-40 bg-white rounded-xl flex items-center justify-center border border-slate-200">
                      <p className="text-gray-400">Grafik akan ditampilkan di sini</p>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'riwayat' && (
                <div className="space-y-3">
                  {payments.length > 0 ? (
                    payments.map((payment) => (
                      <div key={payment.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-bold text-slate-800">{payment.transaction_group?.name || 'Simpaskor'}</p>
                            <p className="text-sm text-gray-600">{payment.period}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(payment.status)}`}>
                            {getStatusText(payment.status)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                          <p className="text-xs text-gray-500">
                            {new Date(payment.payment_date).toLocaleDateString('id-ID', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </p>
                          <p className="text-lg font-bold text-slate-800">{formatCurrency(payment.amount)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Belum ada riwayat pembayaran</p>
                    </div>
                  )}
                </div>
              )}

              {activeModal === 'pembayaran' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Saldo Saat Ini</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">
                          {formatCurrency(statistics?.total_income || 0)}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-200 rounded-xl">
                        <CreditCardIcon className="h-8 w-8 text-slate-800" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-200 rounded-lg">
                        <BellIcon className="h-5 w-5 text-blue-800" />
                      </div>
                      <div>
                        <p className="font-semibold text-blue-900">Informasi Pembayaran</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Pembayaran dilakukan setiap tanggal 5 setiap bulan. Jika ada pertanyaan, hubungi Finance Manager.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 mb-3">Metode Pembayaran</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-sm text-gray-700">Transfer Bank</span>
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 opacity-50">
                        <span className="text-sm text-gray-700">E-Wallet</span>
                        <span className="text-xs text-gray-500">Coming Soon</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => {
          setShowProfileModal(false);
          // Reload data setelah profile modal ditutup
          loadData();
        }} 
        onToast={(toastData) => {
          console.log('Toast triggered from modal:', toastData);
          setToast(toastData);
        }}
      />

      {/* Jadwal Simpaskor Modal */}
      <JadwalSimpaskor 
        isOpen={showJadwalModal}
        onClose={() => setShowJadwalModal(false)}
      />

      {/* Toast Notification */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: '' })} 
      />
    </div>
  );
}
