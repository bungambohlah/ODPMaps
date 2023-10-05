import { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, PermissionsAndroid } from 'react-native';
import Mapbox from '@rnmapbox/maps';

Mapbox.setAccessToken('pk.eyJ1IjoiYnVuZ2FtYm9obGFoIiwiYSI6ImNsbjkzOHc1dDAzNm4ya253aXh6a2tjbG8ifQ.iwEYr3cMfHciuU4LUuu9aw');

const App = () => {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    Mapbox.setTelemetryEnabled(false);
    Mapbox.requestAndroidLocationPermissions();
  }, [])

  return (
    <View style={styles.page}>
      <StatusBar backgroundColor="blue" />
      <View style={styles.container}>
        <Mapbox.MapView style={styles.map} >
          <Mapbox.UserLocation onUpdate={(newLocation) => setLocation(newLocation)} />
          <Mapbox.Camera followUserLocation followZoomLevel={16} />
        </Mapbox.MapView>
      </View>
    </View>
  );
}

export default App;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    height: '100%',
    width: '100%',
  },
  map: {
    flex: 1
  }
});
