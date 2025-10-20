// Currency formatting utilities

// Format number with thousand separators (for input display)
export const formatCurrencyInput = (value) => {
  if (!value) return '';
  // Remove all non-digits
  const numericValue = value.toString().replace(/\D/g, '');
  // Add thousand separators
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Parse formatted currency back to number (for form submission)
export const parseCurrencyInput = (value) => {
  return value.replace(/\./g, '');
};

// Safe number conversion - prevents NaN
export const safeNumber = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

// Format currency for display in tables/cards (using Intl.NumberFormat)
export const formatCurrencyDisplay = (amount) => {
  const safeAmount = safeNumber(amount);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(safeAmount);
};

// Format currency for display with manual Rp prefix and dots (alternative)
export const formatCurrencySimple = (amount) => {
  const safeAmount = safeNumber(amount);
  if (safeAmount === 0) return 'Rp. 0';
  const numericValue = Math.abs(safeAmount);
  const formatted = numericValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp. ${formatted}`;
};

// Responsive currency formatting based on screen size and amount
export const formatCurrencyResponsive = (amount, isMobile = false) => {
  const safeAmount = safeNumber(amount);
  if (safeAmount === 0) return 'Rp. 0';
  
  const numericValue = Math.abs(safeAmount);
  
  // For very large numbers on mobile, use abbreviated format
  if (isMobile && numericValue >= 1000000000) {
    const billions = (numericValue / 1000000000).toFixed(1);
    return `Rp. ${billions}M`;
  } else if (isMobile && numericValue >= 1000000) {
    const millions = (numericValue / 1000000).toFixed(1);
    return `Rp. ${millions}Jt`;
  } else if (isMobile && numericValue >= 1000) {
    const thousands = (numericValue / 1000).toFixed(0);
    return `Rp. ${thousands}rb`;
  }
  
  // Default format with thousand separators
  const formatted = numericValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp. ${formatted}`;
};

// Compact currency format for small screens
export const formatCurrencyCompact = (amount) => {
  const safeAmount = safeNumber(amount);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(safeAmount);
};