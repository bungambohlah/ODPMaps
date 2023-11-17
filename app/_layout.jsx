import { Slot } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { SessionProvider } from "../hooks/ctx";

export default function Root() {
  // Set up the auth context and render our layout inside of it.
  return (
    <SessionProvider>
      <PaperProvider>
        <Slot />
      </PaperProvider>
    </SessionProvider>
  );
}
