import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      <Stack.Screen name="Login" />
      <Stack.Screen name="Register" />
      <Stack.Screen name="RoleSelect" />
    </Stack>
  );
}