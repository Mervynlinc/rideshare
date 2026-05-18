import { View, Text } from 'react-native';
import { RideStatus, RequestStatus } from '../../types';

interface StatusBadgeProps {
  status: RideStatus | RequestStatus;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-accent-glow', text: 'text-accent', label: 'Active' },
  full: { bg: 'bg-amber/10', text: 'text-amber', label: 'Full' },
  completed: { bg: 'bg-white/5 dark:bg-white/[0.06]', text: 'text-text-sec', label: 'Completed' },
  cancelled: { bg: 'bg-red-dim', text: 'text-red', label: 'Cancelled' },
  pending: { bg: 'bg-amber/10', text: 'text-amber', label: 'Pending' },
  accepted: { bg: 'bg-accent-glow', text: 'text-accent', label: 'Accepted' },
  declined: { bg: 'bg-red-dim', text: 'text-red', label: 'Declined' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <View className={`px-2.5 py-1 rounded-lg ${config.bg}`}>
      <Text className={`text-xs font-semibold ${config.text}`}>
        {config.label}
      </Text>
    </View>
  );
}
