import api from './api';

export const transactionGroupService = {
  // Get all transaction groups (optimized)
  getAll: async () => {
    console.log('📡 API Request: Getting all transaction groups...');
    const startTime = performance.now();
    
    const response = await api.get('/transaction-groups');
    
    const endTime = performance.now();
    console.log(`⚡ API Response time: ${(endTime - startTime).toFixed(2)}ms`);
    
    return response.data;
  },
  
  // Get transaction groups options for dropdown
  getOptions: async (type = 'both') => {
    const response = await api.get('/transaction-groups/options', { params: { type } });
    return response.data;
  },
  
  // Create new transaction group
  create: async (data) => {
    const response = await api.post('/transaction-groups', data);
    return response.data;
  },
  
  // Get transaction group by id
  getById: async (id) => {
    const response = await api.get(`/transaction-groups/${id}`);
    return response.data;
  },
  
  // Update transaction group
  update: async (id, data) => {
    const response = await api.put(`/transaction-groups/${id}`, data);
    return response.data;
  },
  
  // Delete transaction group
  delete: async (id) => {
    const response = await api.delete(`/transaction-groups/${id}`);
    return response.data;
  },
};
