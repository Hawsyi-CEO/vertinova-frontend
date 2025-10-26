import { useState, useEffect } from 'react';
import { getSimpaskorSchedule, parseSimpaskorSchedule } from '../services/simpaskorApi';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon,
  UsersIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function JadwalSimpaskor({ isOpen, onClose }) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchSchedule();
    }
  }, [isOpen]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSimpaskorSchedule();
      console.log('Raw API Response:', data); // Debug: lihat struktur data
      const parsedSchedule = parseSimpaskorSchedule(data);
      console.log('Parsed Schedule:', parsedSchedule); // Debug: lihat data setelah parsing
      setSchedule(parsedSchedule);
    } catch (err) {
      console.error('Error loading schedule:', err);
      setError('Gagal memuat jadwal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CalendarIcon className="h-6 w-6 text-white mr-2" />
                <h3 className="text-lg font-semibold text-white">
                  Jadwal Simpaskor
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchSchedule}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
                >
                  Coba Lagi
                </button>
              </div>
            ) : schedule && schedule.length > 0 ? (
              <div className="space-y-4">
                {schedule.map((event, index) => (
                  <div 
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {event.event_name || event.title || event.name || 'Event'}
                        </h4>
                        
                        <div className="space-y-2">
                          {/* Tanggal dan Hari */}
                          {(event.event_date || event.date || event.tanggal || event.start_date) && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-3">
                              <div className="flex items-start">
                                <CalendarIcon className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-semibold text-blue-900">
                                    {new Date(event.event_date || event.date || event.tanggal || event.start_date).toLocaleDateString('id-ID', {
                                      weekday: 'long'
                                    })}
                                  </p>
                                  <p className="text-base font-bold text-blue-800 mt-1">
                                    {new Date(event.event_date || event.date || event.tanggal || event.start_date).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Waktu */}
                          {(event.event_time || event.time || event.waktu || event.start_time) && (
                            <div className="flex items-center text-sm text-gray-600">
                              <ClockIcon className="h-4 w-4 mr-2 text-slate-600" />
                              <span className="font-medium">{event.event_time || event.time || event.waktu || event.start_time}</span>
                            </div>
                          )}

                          {/* Lokasi */}
                          {(event.event_location || event.location || event.lokasi || event.tempat) && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPinIcon className="h-4 w-4 mr-2 text-slate-600" />
                              <span>{event.event_location || event.location || event.lokasi || event.tempat}</span>
                            </div>
                          )}

                          {/* Deskripsi */}
                          {(event.event_description || event.description || event.deskripsi || event.keterangan) && (
                            <p className="text-sm text-gray-700 mt-2">
                              {event.event_description || event.description || event.deskripsi || event.keterangan}
                            </p>
                          )}

                          {/* Peserta/Quota */}
                          {(event.participants || event.peserta || event.quota) && (
                            <div className="flex items-center text-sm text-gray-600">
                              <UsersIcon className="h-4 w-4 mr-2 text-slate-600" />
                              <span>{event.participants || event.peserta || event.quota} peserta</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Badge Status */}
                      {event.status && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          event.status.toLowerCase() === 'active' || event.status.toLowerCase() === 'aktif'
                            ? 'bg-green-100 text-green-800'
                            : event.status.toLowerCase() === 'upcoming' || event.status.toLowerCase() === 'akan datang'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {event.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada jadwal tersedia</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
