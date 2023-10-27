import { Tabs } from "expo-router/tabs";
import { Ionicons, Feather } from "@expo/vector-icons";

export default function DetailLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="information"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="information-circle-sharp" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="users" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
