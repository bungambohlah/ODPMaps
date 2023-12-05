import React, { useEffect, useState, useRef, Fragment } from "react";
import { Stack, router, useGlobalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Mapbox from "@rnmapbox/maps";
import { ActivityIndicator, Appbar, Button, Menu, Snackbar, TextInput } from "react-native-paper";
import { useAssets } from "expo-asset";
import { Image } from "expo-image";
import FAB from "../../components/FAB";
import { useSession } from "../../hooks/ctx";

Mapbox.setAccessToken(
  "pk.eyJ1IjoiYnVuZ2FtYm9obGFoIiwiYSI6ImNsbjkzOHc1dDAzNm4ya253aXh6a2tjbG8ifQ.iwEYr3cMfHciuU4LUuu9aw",
);
const UPSTASH_URL = "https://apn1-frank-cowbird-33009.upstash.io";
const UPSTASH_TOKEN =
  "AYDxASQgOWMxZjMwMWItODJkMS00MTg1LTliYjgtOTA5ZGU0OTE0NjA2ODVhODA3MWNhY2Q4NGRmZDhmNDI0NGRkMjViOWYxM2I=";
const DEFAULT_CENTER_COORDINATE = [112.74795609717692, -7.263394274153487];

const App = () => {
  const { name, snackMessage } = useGlobalSearchParams();
  const [location, setLocation] = useState(null);
  const [permission, setPermission] = useState(false);
  const [annotations, setAnnotations] = useState({});
  const [annotationUsers, setAnnotationUsers] = useState({});
  const [annotationsLoading, setAnnotationsLoading] = useState(false);
  const [annotationsLoaded, setAnnotationsLoaded] = useState(false);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const camera = useRef(null);
  const { signOut } = useSession();
  const [assets, error] = useAssets([require("../../assets/green_marker.png")]);
  const [cameraPos, setCameraPos] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  const onDismissSnackBar = () => router.setParams({ snackMessage: "" });

  function _handleMore() {
    setMoreMenuVisible(!moreMenuVisible);
  }

  const getAnnotationNamesAPI = async () => {
    const response = await fetch(`${UPSTASH_URL}/get/locationNames`, {
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
      },
    });
    const data = await response.json();
    const locationNames = JSON.parse(data.result || "[]");
    const reducedLocationNames = locationNames.reduce((obj, key) => {
      obj[key] = [];
      return obj;
    }, {});
    setAnnotations(reducedLocationNames);
    return reducedLocationNames;
  };

  const getAnnotationsAPI = async (reducedLocationNames) => {
    for (const [key, value] of Object.entries(reducedLocationNames)) {
      // get annotation coordinates
      const response = await fetch(`${UPSTASH_URL}/get/${key}`, {
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
        },
      });
      const data = await response.json();
      const coords = JSON.parse(data.result || "[]");
      setAnnotations((s) => ({ ...s, [key]: coords }));

      // get annotation users
      const resUsers = await fetch(`${UPSTASH_URL}/get/${key}-Users`, {
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
        },
      });
      const dataUsers = await resUsers.json();
      const users = JSON.parse(dataUsers.result || "[]");
      setAnnotationUsers((s) => ({ ...s, [key]: users }));
    }

    return Promise.resolve();
  };

  function searchODP() {
    if (annotations[searchInput]) {
      router.push({ pathname: "/details", params: { name: searchInput } });
      setSearchInput("");
    } else if (!annotations[searchInput]) {
      router.setParams({ snackMessage: "ODP ID that you search is not found" });
    }
  }

  useEffect(() => {
    Mapbox.setTelemetryEnabled(false);
    Mapbox.requestAndroidLocationPermissions().then((access) => {
      if (access) setPermission(access);
    });
    camera.current?.setCamera({
      centerCoordinate: [location?.coords?.longitude, location?.coords?.latitude],
    });
  }, []);

  useEffect(() => {
    camera.current?.setCamera({
      centerCoordinate: [location?.coords?.longitude, location?.coords?.latitude],
      zoomLevel: 16,
    });

    if (!annotationsLoading && location) {
      setAnnotationsLoading(true);
      setAnnotationsLoaded(false);
      getAnnotationNamesAPI()
        .then((reducedLocationNames) => getAnnotationsAPI(reducedLocationNames))
        .catch((err) => console.error(err))
        .finally(() => setAnnotationsLoaded(true));
    }
  }, [location, annotationsLoading]);

  useEffect(() => {
    if (name) {
      setAnnotationsLoading(false);
    }
  }, [name]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Welcome",
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
              <Menu.Item title="Logout" onPress={() => signOut()} />
            </Menu>
          ),
        }}
      />
      {assets?.length ? (
        <View className="flex items-center justify-center">
          <StatusBar backgroundColor="blue" />
          <View className="w-full h-full">
            {permission ? (
              <>
                <View className="absolute z-[999999] top-2 right-2">
                  <TextInput
                    placeholder="Insert ODP ID"
                    mode="outlined"
                    dense
                    value={searchInput}
                    onChangeText={(val) => setSearchInput(val)}
                    cursorColor="black"
                    outlineColor="black"
                    activeOutlineColor="black"
                    style={{
                      height: 32,
                      width: 200,
                      padding: 10,
                      zIndex: 100,
                      borderRadius: 10,
                    }}
                    right={
                      <TextInput.Icon
                        icon="magnify"
                        color="black"
                        style={{
                          marginLeft: 24,
                          paddingLeft: 8,
                          borderLeftWidth: 3,
                          borderLeftColor: "black",
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0,
                        }}
                        onPress={searchODP}
                      />
                    }
                  />
                </View>
                <Mapbox.MapView
                  style={styles.map}
                  onCameraChanged={({ properties: { center } }) => setCameraPos(center)}
                >
                  <Mapbox.UserLocation
                    onUpdate={(newLocation) => setLocation(newLocation)}
                    showsUserHeadingIndicator={true}
                    minDisplacement={5}
                  />
                  <Mapbox.Camera
                    ref={camera}
                    centerCoordinate={DEFAULT_CENTER_COORDINATE}
                    zoomLevel={16}
                  />
                  {annotationsLoaded &&
                    Object.entries(annotations)?.map(([name, coords], idx) => (
                      <Fragment key={idx}>
                        {Array.isArray(coords) && coords.length ? (
                          <>
                            <Mapbox.PointAnnotation
                              key={idx}
                              id={`odp-${idx}`}
                              coordinate={coords}
                              title={name}
                              selected
                              onSelected={() => {
                                router.push({
                                  params: { name },
                                  pathname: "/details",
                                });
                              }}
                            >
                              {annotationUsers[name].length === 16 && assets ? (
                                <Image
                                  source={assets[0]}
                                  style={{ width: 32, height: 32 }}
                                  contentFit="contain"
                                />
                              ) : null}
                            </Mapbox.PointAnnotation>
                          </>
                        ) : null}
                      </Fragment>
                    ))}
                </Mapbox.MapView>
                <FAB
                  onPress={() => {
                    // setLocation({ coords: { latitude: 0, longitude: 0 } });
                    camera.current?.setCamera({
                      centerCoordinate: [location?.coords?.longitude, location?.coords?.latitude],
                      zoomLevel: 16,
                      animationDuration: 1000,
                      animationMode: "flyTo",
                    });
                  }}
                  customClassName="right-4 bg-blue-500 px-3 py-3 shadow-2xl shadow-blue-500 border-2 border-blue-700"
                >
                  <MaterialIcons name="my-location" size={38} color="white" />
                </FAB>
                <FAB
                  onPress={() => {
                    router.push({
                      params: { coords: JSON.stringify(cameraPos) },
                      pathname: "/(app)/edit/add-odp",
                    });
                  }}
                  customClassName="left-4 mb-2"
                >
                  <Button icon="plus" mode="contained" buttonColor="black" textColor="#47b000">
                    <Text className="text-white">Add ODP</Text>
                  </Button>
                </FAB>
              </>
            ) : (
              <Text>Please, enable location permissions</Text>
            )}
          </View>
        </View>
      ) : (
        <ActivityIndicator
          color="black"
          size="large"
          style={{
            display: "absolute",
            transform: [
              { translateX: -Dimensions.get("window").width * 0 },
              { translateY: Dimensions.get("window").height * 0.45 },
            ],
          }}
        />
      )}
      <Snackbar
        visible={snackMessage?.length || false}
        onDismiss={onDismissSnackBar}
        duration={2000}
      >
        {snackMessage}
      </Snackbar>
    </>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default App;
