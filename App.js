import {useState, useEffect} from 'react'
import { StyleSheet, View, Text } from 'react-native';
import Mapbox from 'rnmapbox/maps';

Mapbox.setAccessToken('pk.eyJ1IjoiYnVuZ2FtYm9obGFoIiwiYSI6ImNsbjkzOHc1dDAzNm4ya253aXh6a2tjbG8ifQ.iwEYr3cMfHciuU4LUuu9aw');
export default function App() {
  const [mb, setMb] = useState(null)

  return (
   <View style={styles.page}>
      <View style={styles.container}>
        {mb ? (<mb.MapView style={styles.map} />) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    height: 300,
    width: 300,
  },
  map: {
    flex: 1
  }
});

