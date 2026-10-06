import Ionicons from '@expo/vector-icons/Ionicons';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable } from 'react-native';

import { PeopleProvider } from '@/hooks/usePeople';
import { ThemeProvider, useAppTheme } from '@/hooks/useTheme';
import { registerNotificationNavigation, rescheduleAllBirthdayNotifications } from '@/lib/notifications';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ThemeProvider>
      <PeopleProvider>
        <RootNavigation />
      </PeopleProvider>
    </ThemeProvider>
  );
}

function RootNavigation() {
  const { colors, scheme } = useAppTheme();
  const router = useRouter();
  const navTheme = scheme === 'dark'
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: colors.background, card: colors.surface, text: colors.text, border: colors.border, primary: colors.primary } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.background, card: colors.surface, text: colors.text, border: colors.border, primary: colors.primary } };

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => undefined);
    rescheduleAllBirthdayNotifications().catch((error) => {
      console.warn('[DearDay] Could not reschedule notifications', error);
    });
  }, []);

  useEffect(() => {
    const openPerson = (personId: string) => {
      router.push(`/person/${personId}`);
    };
    return registerNotificationNavigation(openPerson);
  }, [router]);

  return (
    <NavigationThemeProvider value={navTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.background },
          contentStyle: { backgroundColor: colors.background },
          headerTitleStyle: { fontWeight: '700' },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add"
          options={{
            title: 'Add Birthday',
            presentation: 'modal',
            headerRight: () => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={() => router.back()}
                hitSlop={12}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            ),
          }}
        />
        <Stack.Screen name="person/[id]/index" options={{ title: '' }} />
        <Stack.Screen name="person/[id]/edit" options={{ title: 'Edit' }} />
        <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
      </Stack>
    </NavigationThemeProvider>
  );
}
