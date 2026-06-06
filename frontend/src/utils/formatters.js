/**
 * Formats a numeric value to Indian Rupees.
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value || 0);
};

/**
 * Formats ISO timestamps to standard date formatting.
 */
export const formatDate = (isoStr) => {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Formats ISO timestamps to standard clock time.
 */
export const formatTime = (isoStr) => {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};
