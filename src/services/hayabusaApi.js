// Export Hayabusa payment methods from optimizedApi
import { apiService } from './optimizedApi';

export const getHayabusaStatistics = apiService.getHayabusaStatistics;
export const getHayabusaPayments = apiService.getHayabusaPayments;
export const getHayabusaUsers = apiService.getHayabusaUsers;
export const createHayabusaPayment = apiService.createHayabusaPayment;
export const updateHayabusaPaymentStatus = apiService.updateHayabusaPaymentStatus;

// Export transaction groups method
export const getTransactionGroups = async () => {
  const response = await apiService.getTransactionGroups();
  return response.data;
};

export default apiService;
