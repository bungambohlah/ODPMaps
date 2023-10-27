import { Stack, router, useGlobalSearchParams, useNavigation } from "expo-router";
import { Appbar, PaperProvider } from "react-native-paper";

export default function RootLayout() {
  const { name } = useGlobalSearchParams();
  const navigation = useNavigation();

  function renderEditIcon() {
    const routes = navigation.getState?.().routes || [];
    const indexStack = navigation.getState?.().index;
    if (!indexStack) return;

    const tabIndex = routes[navigation.getState?.().index].state?.index || 0;
    if (tabIndex === 0) {
      return (
        <Appbar.Action
          icon="pencil"
          onPress={() => router.push({ pathname: "/edit/edit-information", params: { name } })}
        />
      );
    }

    return null;
  }

  return (
    <PaperProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Welcome Home" }} />
        <Stack.Screen
          name="details"
          options={{
            title: "ODP Information",
            headerRight: () => renderEditIcon(),
            animation: "slide_from_bottom",
            gestureDirection: "vertical",
          }}
        />
        <Stack.Screen name="edit/edit-information" options={{ title: "Edit ODP Information" }} />
      </Stack>
    </PaperProvider>
  );
}
