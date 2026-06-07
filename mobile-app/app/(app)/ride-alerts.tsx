import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import { useRideAlerts } from '../../hooks/useRideAlerts';

export default function RideAlertsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { alerts, loading, addAlert, toggleAlert, deleteAlert } = useRideAlerts();
  const [showForm, setShowForm] = useState(false);
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!fromLocation.trim() && !toLocation.trim()) {
      Alert.alert('Missing Fields', 'Enter at least a from or to location.');
      return;
    }

    setSaving(true);
    const alert = await addAlert(
      fromLocation.trim() || null,
      toLocation.trim() || null
    );
    setSaving(false);

    if (alert) {
      setShowForm(false);
      setFromLocation('');
      setToLocation('');
    } else {
      Alert.alert('Error', 'Failed to create alert. Please try again.');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Alert?', 'You will no longer be notified for this route.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAlert(id) },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-phone">
      <ScrollView className="flex-1 px-5 pt-6 bg-bg-phone">
        <View className="flex-row items-center gap-3 pb-5">
          <BackButton onPress={() => router.back()} />
          <Text className="font-display text-xl font-bold flex-1 text-text">
            Ride Alerts
          </Text>
          {!showForm && (
            <TouchableOpacity onPress={() => setShowForm(true)}>
              <View className="flex-row items-center gap-1">
                <Ionicons name="add" size={18} className="text-accent" />
                <Text className="text-sm font-semibold text-accent">New</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <Text className="text-xs text-text-muted mb-5 leading-5">
          Get notified when someone posts a ride matching your route. Leave a field blank to match any location.
        </Text>

        {showForm && (
          <View className="rounded-2xl p-4 mb-5 bg-bg-card border border-border">
            <Text className="text-sm font-semibold text-text mb-3">New Alert</Text>
            <TextInput
              className="rounded-xl px-4 py-3 text-sm mb-2 bg-bg-input border border-border text-text"
              placeholder="From (optional — match any)"
              placeholderTextColor="rgb(156 163 175)"
              value={fromLocation}
              onChangeText={setFromLocation}
            />
            <TextInput
              className="rounded-xl px-4 py-3 text-sm mb-3 bg-bg-input border border-border text-text"
              placeholder="To (optional — match any)"
              placeholderTextColor="rgb(156 163 175)"
              value={toLocation}
              onChangeText={setToLocation}
            />
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl items-center bg-accent"
                onPress={handleAdd}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text className="text-sm font-semibold text-black">Save Alert</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                className="py-3 px-4 rounded-xl items-center"
                style={{ backgroundColor: `${colors.red.DEFAULT}15` }}
                onPress={() => {
                  setShowForm(false);
                  setFromLocation('');
                  setToLocation('');
                }}
              >
                <Text className="text-sm font-semibold text-red">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {loading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
          </View>
        ) : alerts.length > 0 ? (
          <View className="rounded-2xl overflow-hidden bg-bg-card border border-border">
            {alerts.map((alert) => (
              <View
                key={alert.id}
                className="flex-row items-center gap-3 py-4 px-4 border-b border-border"
              >
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center"
                  style={{ backgroundColor: alert.active ? colors.accent.glow : colors.bg.input }}
                >
                  <Ionicons
                    name="notifications"
                    size={18}
                    color={alert.active ? colors.accent.DEFAULT : colors.icon.muted}
                  />
                </View>
                <View className="flex-1">
                  <Text className={`text-sm font-medium ${alert.active ? 'text-text' : 'text-text-muted'}`}>
                    {alert.fromLocation || 'Anywhere'} → {alert.toLocation || 'Anywhere'}
                  </Text>
                  <Text className="text-xs text-text-muted mt-0.5">
                    {alert.active ? 'Active' : 'Paused'}
                  </Text>
                </View>
                <Switch
                  value={alert.active}
                  onValueChange={(val) => toggleAlert(alert.id, val)}
                  trackColor={{ false: colors.bg.input, true: colors.accent.glow }}
                  thumbColor={alert.active ? colors.accent.DEFAULT : colors.text.dim}
                />
                <TouchableOpacity onPress={() => handleDelete(alert.id)} className="p-1">
                  <Ionicons name="trash-outline" size={16} color={colors.red.DEFAULT} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View className="py-12 items-center">
            <Ionicons name="notifications-off" size={48} className="text-icon-muted mb-3" />
            <Text className="text-sm text-text-muted text-center">No ride alerts yet</Text>
            <Text className="text-xs text-text-dim text-center mt-1">
              Create an alert to get notified when rides to your preferred locations are posted
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}