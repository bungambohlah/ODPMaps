import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";

const UPSTASH_URL = "https://apn1-frank-cowbird-33009.upstash.io";
const UPSTASH_TOKEN =
  "AYDxASQgOWMxZjMwMWItODJkMS00MTg1LTliYjgtOTA5ZGU0OTE0NjA2ODVhODA3MWNhY2Q4NGRmZDhmNDI0NGRkMjViOWYxM2I=";
const opt = { headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` } };

function Page() {
  const { name } = useLocalSearchParams();
  return (
    <>
      <Text>Edit ODP {name}</Text>
    </>
  );
}

export default Page;
