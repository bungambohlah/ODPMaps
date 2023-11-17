import React, { useEffect, useState, useRef, Fragment } from "react";
import { Stack, router, useGlobalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Mapbox from "@rnmapbox/maps";
import { Appbar, Menu } from "react-native-paper";
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
  const { name } = useGlobalSearchParams();
  const [location, setLocation] = useState(null);
  const [permission, setPermission] = useState(false);
  const [annotations, setAnnotations] = useState({});
  const [annotationsLoading, setAnnotationsLoading] = useState(false);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const camera = useRef(null);
  const { signOut } = useSession();

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
  const setAnnotationsAPI = async (reducedLocationNames) => {
    for (const [key, value] of Object.entries(reducedLocationNames)) {
      // TODO: value it will be coordinate that need to set
      await fetch(
        `${UPSTASH_URL}/set/${key}/${JSON.stringify([
          location?.coords?.longitude,
          location?.coords?.latitude,
        ])}`,
        {
          headers: {
            Authorization: `Bearer ${UPSTASH_TOKEN}`,
          },
        },
      );
    }

    return reducedLocationNames;
  };
  const getAnnotationsAPI = async (reducedLocationNames) => {
    for (const [key, value] of Object.entries(reducedLocationNames)) {
      const response = await fetch(`${UPSTASH_URL}/get/${key}`, {
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
        },
      });
      const data = await response.json();
      const coords = JSON.parse(data.result || "[]");
      setAnnotations((s) => ({ ...s, [key]: coords }));
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

  useEffect(() => {
    camera.current?.setCamera({
      centerCoordinate: [location?.coords?.longitude, location?.coords?.latitude],
      zoomLevel: 16,
    });

    if (!annotationsLoading && location) {
      setAnnotationsLoading(true);
      getAnnotationNamesAPI()
        .then((reducedLocationNames) => setAnnotationsAPI(reducedLocationNames))
        .then((reducedLocationNames) => getAnnotationsAPI(reducedLocationNames))
        .catch((err) => console.error(err));
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
      <View className="flex items-center justify-center">
        <StatusBar backgroundColor="blue" />
        <View className="w-full h-full">
          {permission ? (
            <>
              <Mapbox.MapView style={styles.map}>
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
                {Object.entries(annotations)?.map(([name, coords], idx) => (
                  <Fragment key={idx}>
                    {Array.isArray(coords) && coords.length ? (
                      <Mapbox.PointAnnotation
                        key={idx}
                        id={`odp-${idx}`}
                        coordinate={coords}
                        title={name}
                        selected
                        onSelected={() => {
                          router.push({
                            params: { name },
                            pathname: "/details/information",
                          });
                        }}
                      />
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
              >
                <MaterialIcons name="my-location" size={38} color="white" />
              </FAB>
            </>
          ) : (
            <Text>Please, enable location permissions</Text>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default App;
