import { useState } from "react";
import { Stack, router, useGlobalSearchParams, useNavigation, Redirect } from "expo-router";
import { Appbar, Menu } from "react-native-paper";
import { useSession } from "../../hooks/ctx";

export default function RootLayout() {
  const { session, signOut } = useSession();
  const { name } = useGlobalSearchParams();
  const navigation = useNavigation();
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);

  function _handleMore() {
    setMoreMenuVisible(!moreMenuVisible);
  }

  function renderEditIcon() {
    const routes = navigation.getState?.().routes || [];
    const indexStack = navigation.getState?.().index;
    if (typeof indexStack !== "number") return;

    const tabIndex = routes[navigation.getState?.().index].state?.index || 0;
    if (tabIndex === 1) {
      return (
        <Menu.Item
          onPress={() =>
            router.push({ pathname: "/(app)/edit/edit-information", params: { name } })
          }
          title={`Edit ODP ${name}`}
        />
      );
    }

    return null;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/sign-in" />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Welcome Home" }} />
      <Stack.Screen
        name="details"
        options={{
          title: "ODP Information",
          headerRight: () => (
            <Menu
              visible={moreMenuVisible}
              onDismiss={_handleMore}
              anchor={
                <Appbar.Action
                  icon="dots-vertical"
                  onPress={_handleMore}
                  style={{ display: "flex", width: "100%" }}
                />
              }
              anchorPosition="bottom"
              contentStyle={{
                backgroundColor: "white",
              }}
            >
              {renderEditIcon()}
              <Menu.Item title="Logout" onPress={() => signOut()} />
            </Menu>
          ),
          animation: "slide_from_bottom",
          gestureDirection: "vertical",
        }}
      />
      <Stack.Screen name="edit/edit-information" options={{ title: "Edit ODP Information" }} />
    </Stack>
  );
}
