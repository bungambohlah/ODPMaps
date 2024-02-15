import Mapbox from "@rnmapbox/maps";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { Button, Card, TextInput } from "react-native-paper";

Mapbox.setAccessToken(
  "pk.eyJ1IjoiYnVuZ2FtYm9obGFoIiwiYSI6ImNsbjkzOHc1dDAzNm4ya253aXh6a2tjbG8ifQ.iwEYr3cMfHciuU4LUuu9aw",
);
const UPSTASH_URL = "https://adapting-wildcat-40465.upstash.io";
const UPSTASH_TOKEN =
  "AZ4RACQgMmE4NTFjNzYtZTg0MS00NDk3LWIyZTEtYWZlODAwMGE2ZDVkMTc4Nzk5ZmM2ZTFlNGQ1NzllMjU5ODc1ZDc4OTEyZDk=";
const opt = { headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` } };

function Page() {
  const { name } = useLocalSearchParams();
  const [permission, setPermission] = useState(false);
  const [pointPosition, setPointPosition] = useState(null);
  const [ODPHide, setODPHide] = useState(false);
  const [ODPForm, setODPForm] = useState({
    odpId: "",
    odpMounting: "",
    odpStatus: "",
    odpSubdistrict: "",
  });
  const [odpLoading, setOdpLoading] = useState(false);
  const camera = useRef(null);

  const getAnnotationsAPI = async (name) => {
    setOdpLoading(true);
    try {
      const responseLocation = await fetch(`${UPSTASH_URL}/get/${name}`, opt);
      const dataLocation = await responseLocation.json();
      const currLocation = JSON.parse(dataLocation.result || "[]");
      if (currLocation.length) {
        setPointPosition(currLocation);
      }

      const responseInformation = await fetch(`${UPSTASH_URL}/get/${name}-Information`, opt);
      const dataInformation = await responseInformation.json();
      const currInformation = JSON.parse(dataInformation.result || "");
      const currInformationArr = currInformation.split("<enter>");
      if (currInformationArr.length > 1) {
        setODPForm({
          odpId: name || "",
          odpMounting:
            (currInformationArr[1] && currInformationArr[1].replace("Mounting: ", "")) || "",
          odpStatus: (currInformationArr[2] && currInformationArr[2].replace("Status: ", "")) || "",
          odpSubdistrict:
            (currInformationArr[3] && currInformationArr[3].replace("Subdistrict: ", "")) || "",
        });
      } else if (currInformationArr.length <= 1) {
        setODPForm((s) => ({ ...s, odpId: name }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setOdpLoading(false);
    }
  };

  const setAnnotationsAPI = async (newName) => {
    setOdpLoading(true);
    try {
      const selectedPos = [pointPosition[0], pointPosition[1]];
      await fetch(`${UPSTASH_URL}/set/${newName}/${JSON.stringify(selectedPos)}`, opt);
      await fetch(
        `${UPSTASH_URL}/set/${newName}-Information/${JSON.stringify(
          `ODP ID: ${ODPForm.odpId}<enter>Mounting: ${ODPForm.odpMounting}<enter>Status: ${ODPForm.odpStatus}<enter>Subdistrict: ${ODPForm.odpSubdistrict}`,
        )}`,
        opt,
      );
      const locationNames = await fetch(`${UPSTASH_URL}/get/locationNames`, opt);
      const data = await locationNames.json();
      let locationNamesResult = JSON.parse(data.result || "[]");
      if (locationNamesResult.indexOf(newName) < 0) {
        locationNamesResult.push(newName);
      }
      // if newName is changed, then remove the old one
      if (newName !== name && locationNamesResult.indexOf(name) >= 0) {
        locationNamesResult.splice(locationNamesResult.indexOf(name), 1);
      }
      await fetch(`${UPSTASH_URL}/set/locationNames/${JSON.stringify(locationNamesResult)}`, opt);

      // if newName is changed, then remove the old one for location and information
      if (newName !== name) {
        await fetch(`${UPSTASH_URL}/del/${name}`, opt);
        await fetch(`${UPSTASH_URL}/del/${name}-Information`, opt);
        await fetch(`${UPSTASH_URL}/del/${name}-Users`, opt);
      }

      router.setParams({ snackMessage: `Successfully to edit ODP ${ODPForm.odpId}.` });
      router.back();
      router.back();
      router.replace({
        pathname: "/",
        params: { name: newName, snackMessage: `Successfully to edit ODP ${ODPForm.odpId}.` },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setOdpLoading(false);
    }
  };

  useEffect(() => {
    Mapbox.setTelemetryEnabled(false);
    Mapbox.requestAndroidLocationPermissions().then((access) => {
      if (access) setPermission(access);
    });
  }, []);

  useEffect(() => {
    getAnnotationsAPI(name);
  }, [name]);

  return (
    <>
      <View className="flex items-center justify-center">
        <View className="w-full h-full">
          {permission ? (
            <>
              <Mapbox.MapView style={{ flex: 1 }}>
                <Mapbox.Camera
                  ref={camera}
                  zoomLevel={16}
                  allowUpdates={true}
                  centerCoordinate={pointPosition}
                />

                {pointPosition?.length ? (
                  <Mapbox.PointAnnotation
                    id={`odp-edit-point`}
                    selected
                    coordinate={pointPosition}
                    title="ODP Edit Point"
                    draggable
                    onDragEnd={({ geometry: { coordinates } }) => setPointPosition(coordinates)}
                  />
                ) : null}
              </Mapbox.MapView>
              {ODPHide ? (
                <Button
                  mode="contained"
                  onPress={() => {
                    setODPHide(false);
                  }}
                  buttonColor="black"
                >
                  Show
                </Button>
              ) : (
                <Card className="absolute left-0 right-0 p-4 m-auto mx-4 bottom-10">
                  <Card.Content>
                    <View className="flex w-full gap-4">
                      <TextInput
                        label="ODP ID"
                        mode="outlined"
                        value={ODPForm.odpId}
                        onChangeText={(odpId) => setODPForm((s) => ({ ...s, odpId }))}
                      />
                      <TextInput
                        label="Mounting"
                        mode="outlined"
                        value={ODPForm.odpMounting}
                        onChangeText={(odpMounting) => setODPForm((s) => ({ ...s, odpMounting }))}
                      />
                      <Text>Longitude: {pointPosition?.[0]}</Text>
                      <Text>Latitude: {pointPosition?.[1]}</Text>
                      <TextInput
                        label="Status"
                        mode="outlined"
                        value={ODPForm.odpStatus}
                        onChangeText={(odpStatus) => setODPForm((s) => ({ ...s, odpStatus }))}
                      />
                      <TextInput
                        label="Subdistrict"
                        mode="outlined"
                        value={ODPForm.odpSubdistrict}
                        onChangeText={(odpSubdistrict) =>
                          setODPForm((s) => ({ ...s, odpSubdistrict }))
                        }
                      />
                      <View className="flex flex-row items-center w-full gap-2 justify-evenly">
                        <Button mode="contained" buttonColor="black" onPress={() => router.back()}>
                          Exit
                        </Button>
                        <Button
                          mode="contained"
                          buttonColor="black"
                          onPress={() => setODPHide(true)}
                        >
                          Hide
                        </Button>
                        <Button
                          loading={odpLoading}
                          disabled={odpLoading}
                          mode="contained"
                          buttonColor="black"
                          onPress={() => setAnnotationsAPI(ODPForm.odpId)}
                        >
                          Save
                        </Button>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              )}
            </>
          ) : (
            <Text>Please, enable location permissions</Text>
          )}
        </View>
      </View>
    </>
  );
}

export default Page;
