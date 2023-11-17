import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { ActivityIndicator, Button, Card, TextInput } from "react-native-paper";

const UPSTASH_URL = "https://apn1-frank-cowbird-33009.upstash.io";
const UPSTASH_TOKEN =
  "AYDxASQgOWMxZjMwMWItODJkMS00MTg1LTliYjgtOTA5ZGU0OTE0NjA2ODVhODA3MWNhY2Q4NGRmZDhmNDI0NGRkMjViOWYxM2I=";
const opt = { headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` } };

function Page() {
  const { name } = useLocalSearchParams();
  const [information, setInformation] = useState("");
  const [odpName, setODPName] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  async function getInformationODP() {
    setLoading(true);
    try {
      const response = await fetch(`${UPSTASH_URL}/get/${name}-Information`, opt);
      const data = await response.json();
      const resultData = JSON.parse(data.result || null);
      setInformation(resultData);
      setODPName(name);
    } catch (error) {
      setInformation("");
      setODPName("");
    } finally {
      setLoading(false);
    }
  }

  async function setInformationODP(desc, odpName) {
    try {
      desc = desc ? desc : "";
      const formattedDesc = JSON.stringify(desc).replaceAll("\\n", "<enter>");

      // update information
      await fetch(`${UPSTASH_URL}/del/${name}-Information`, opt);
      await fetch(`${UPSTASH_URL}/set/${odpName}-Information/${formattedDesc}`, opt);

      // update coordinates location name
      const response = await fetch(`${UPSTASH_URL}/get/${name}`, opt);
      const data = await response.json();
      const currentCoord = JSON.parse(data.result || null);
      await fetch(`${UPSTASH_URL}/set/${odpName}/${JSON.stringify(currentCoord)}`, opt);
      await fetch(`${UPSTASH_URL}/del/${name}`, opt);

      // update list of locations
      const responseLoc = await fetch(`${UPSTASH_URL}/get/locationNames`, opt);
      const dataLoc = await responseLoc.json();
      let locationNames = JSON.parse(dataLoc.result || null);
      locationNames = locationNames.filter((x) => x !== name);
      locationNames.push(odpName);
      await fetch(`${UPSTASH_URL}/set/locationNames/${JSON.stringify(locationNames)}`, opt);

      router.setParams({ name: odpName });
      router.back();
      router.replace({ pathname: "/details/information", params: { name: odpName } });
    } catch (error) {
      // console.error(error);
    }
  }

  function handleSubmit() {
    setDisabled(true);
    setInformationODP(information, odpName)
      .then(() => router.setParams({ snackMessage: "Successfully to update description." }))
      .catch(() => router.setParams({ snackMessage: "Failed to update description." }))
      .finally(() => {
        setDisabled(false);
      });
  }

  useEffect(() => {
    // load first time
    getInformationODP();
  }, [name]);

  return (
    <>
      <Card className="p-4 m-4">
        {!loading ? (
          <>
            <Text className="text-xl font-bold">Edit Information {name}</Text>
            <View className="flex flex-col gap-4 mt-4">
              <TextInput
                label="ODP Name"
                value={odpName}
                onChangeText={(text) => setODPName(text)}
              />
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
          </>
        ) : (
          <ActivityIndicator animating={true} />
        )}
      </Card>
    </>
  );
}

export default Page;
