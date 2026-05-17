export const formatNumber = (value) => {
  if (!Number.isFinite(value)) return "--";
  return Math.round(value).toString();
};

export const formatPing = (value) => {
  if (!Number.isFinite(value)) return "--";
  return Math.round(value).toString();
};

export const formatDateTime = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString();
};

export const calcJitter = (latency) => (latency ? Math.max(1, Math.round(latency * 0.35)) : 0);
