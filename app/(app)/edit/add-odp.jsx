import Mapbox from "@rnmapbox/maps";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { Button, Card, Icon, TextInput } from "react-native-paper";

Mapbox.setAccessToken(
  "pk.eyJ1IjoiYnVuZ2FtYm9obGFoIiwiYSI6ImNsbjkzOHc1dDAzNm4ya253aXh6a2tjbG8ifQ.iwEYr3cMfHciuU4LUuu9aw",
);
const UPSTASH_URL = "https://apn1-frank-cowbird-33009.upstash.io";
const UPSTASH_TOKEN =
  "AYDxASQgOWMxZjMwMWItODJkMS00MTg1LTliYjgtOTA5ZGU0OTE0NjA2ODVhODA3MWNhY2Q4NGRmZDhmNDI0NGRkMjViOWYxM2I=";
const DEFAULT_CENTER_COORDINATE = [112.74795609717692, -7.263394274153487];
const opt = { headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` } };

function Page() {
  const [permission, setPermission] = useState(false);
  const [location, setLocation] = useState(null);
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

  const setAnnotationsAPI = async (name) => {
    setOdpLoading(true);
    try {
      const selectedPos = [
        pointPosition?.[0] ? pointPosition[0] : location?.coords?.longitude,
        pointPosition?.[1] ? pointPosition[1] : location?.coords?.latitude,
      ];
      await fetch(`${UPSTASH_URL}/set/${name}/${JSON.stringify(selectedPos)}`, opt);
      await fetch(
        `${UPSTASH_URL}/set/${name}-Information/${JSON.stringify(
          `ODP ID: ${ODPForm.odpId}<enter>Mounting: ${ODPForm.odpMounting}<enter>Status: ${ODPForm.odpStatus}<enter>Subdistrict: ${ODPForm.odpSubdistrict}`,
        )}`,
        opt,
      );
      const locationNames = await fetch(`${UPSTASH_URL}/get/locationNames`, opt);
      const data = await locationNames.json();
      let locationNamesResult = JSON.parse(data.result || "[]");
      if (locationNamesResult.indexOf(name) < 0) {
        locationNamesResult.push(name);
      }
      await fetch(`${UPSTASH_URL}/set/locationNames/${JSON.stringify(locationNamesResult)}`, opt);

      router.setParams({ snackMessage: `Successfully to add ODP ${ODPForm.odpId}.` });
      router.back();
      router.replace({
        pathname: "/",
        params: { name, snackMessage: `Successfully to add ODP ${ODPForm.odpId}.` },
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
    camera.current?.setCamera({
      centerCoordinate: [location?.coords?.longitude, location?.coords?.latitude],
    });
  }, []);

  return (
    <>
      <View className="flex items-center justify-center">
        <View className="w-full h-full">
          {permission ? (
            <>
              <Mapbox.MapView style={{ flex: 1 }}>
                <Mapbox.UserLocation
                  onUpdate={(newLocation) => setLocation(newLocation)}
                  showsUserHeadingIndicator={false}
                  minDisplacement={5}
                  visible={false}
                />
                <Mapbox.Camera
                  ref={camera}
                  centerCoordinate={
                    location?.coords
                      ? [location?.coords?.longitude, location?.coords?.latitude]
                      : null
                  }
                  zoomLevel={16}
                  allowUpdates={true}
                />

                {location?.coords ? (
                  <Mapbox.PointAnnotation
                    id={`odp-add-point`}
                    selected
                    coordinate={[location?.coords?.longitude, location?.coords?.latitude]}
                    title="ODP Add Point"
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
                      <Text>Longitude: {pointPosition?.[0] || location?.coords?.longitude}</Text>
                      <Text>Latitude: {pointPosition?.[1] || location?.coords?.latitude}</Text>
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
                        <Button mode="contained" buttonColor="black">
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
