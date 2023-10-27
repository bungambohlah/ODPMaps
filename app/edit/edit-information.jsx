import React, { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { Button, Card, Snackbar, TextInput } from "react-native-paper";

const UPSTASH_URL = "https://apn1-frank-cowbird-33009.upstash.io";
const UPSTASH_TOKEN =
  "AYDxASQgOWMxZjMwMWItODJkMS00MTg1LTliYjgtOTA5ZGU0OTE0NjA2ODVhODA3MWNhY2Q4NGRmZDhmNDI0NGRkMjViOWYxM2I=";

function Page() {
  const { name } = useLocalSearchParams();
  const [information, setInformation] = useState("");
  const [visible, setVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [disabled, setDisabled] = useState(false);

  const onDismissSnackBar = () => setVisible(false);

  async function setInformationODP(desc) {
    const formattedDesc = JSON.stringify(desc).replaceAll("\\n", "<enter>");
    console.log(formattedDesc);
    await fetch(`${UPSTASH_URL}/set/${name}-Information/${formattedDesc}`, {
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
      },
    });
  }

  function handleSubmit() {
    setDisabled(true);
    setInformationODP(information)
      .then(() => {
        setSnackMessage("Successfully to update description.");
        setVisible(true);
      })
      .catch(() => {
        setSnackMessage("Failed to update description.");
        setVisible(true);
      })
      .finally(() => {
        setDisabled(false);
      });
  }

  return (
    <>
      <Card className="p-4 m-4">
        <Text className="text-xl font-bold">Edit Information {name}</Text>
        <View className="flex flex-col gap-4 mt-4">
          <TextInput
            label="Description"
            value={information}
            onChangeText={(text) => setInformation(text)}
            multiline
          />
          <Button mode="contained" onPress={handleSubmit} disabled={disabled}>
            Submit
          </Button>
        </View>
      </Card>
      <Snackbar visible={visible} onDismiss={onDismissSnackBar}>
        {snackMessage}
      </Snackbar>
    </>
  );
}

export default Page;
