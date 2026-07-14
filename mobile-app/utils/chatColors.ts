const PARTICIPANT_COLORS = [
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#EC4899', // Pink
  '#14B8A6', // Teal
];

const POSTER_COLOR = '#22C55E'; // Green — always for the ride owner

export function getParticipantColor(
  userId: string,
  posterId: string,
  participantIds: string[]
): string {
  if (userId === posterId) return POSTER_COLOR;
  const nonPosterIds = participantIds.filter((id) => id !== posterId);
  const index = nonPosterIds.indexOf(userId);
  if (index === -1) return PARTICIPANT_COLORS[0];
  return PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
