export const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
export const formatTime = (seconds) => {
  const s = Math.round(seconds);
  const minutes = Math.floor(s / 60);
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
export const ordinal = (value) => `${value}${value === 1 ? 'st' : value === 2 ? 'nd' : value === 3 ? 'rd' : 'th'}`;
