import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { colors } from '@/constants/colors';

export default function EmployeeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.primary },
      }}
    >
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

// Wrapper component that includes bottom navigation
// This is used by the tabs layout to render the custom tab bar
export function EmployeeLayoutWithNav({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.container}>
      {children}
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
});