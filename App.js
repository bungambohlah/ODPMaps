import React, { useEffect, useState, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Mapbox from "@rnmapbox/maps";
import FAB from "./src/components/FAB";

Mapbox.setAccessToken(
  "pk.eyJ1IjoiYnVuZ2FtYm9obGFoIiwiYSI6ImNsbjkzOHc1dDAzNm4ya253aXh6a2tjbG8ifQ.iwEYr3cMfHciuU4LUuu9aw",
);
const DEFAULT_CENTER_COORDINATE = [112.74795609717692, -7.263394274153487];

const App = () => {
  const [location, setLocation] = useState(null);
  const [permission, setPermission] = useState(false);
  const camera = useRef(null);

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
  }, [location]);

  return (
    <View className="flex justify-center items-center">
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
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default App;
