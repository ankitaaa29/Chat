export const formatMobileTime = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const getMobileInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const getMobileAvatarColor = (username) => {
  if (!username) return '#6366F1';
  const colors = [
    '#6366F1',
    '#8B5CF6',
    '#EC4899',
    '#10B981',
    '#F59E0B',
    '#3B82F6',
    '#14B8A6',
    '#F97316',
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};
