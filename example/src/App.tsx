import * as React from 'react';

import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { multiply, getBeaconList, startScan, stopScan, init } from 'react-native-beacon-manager';

export default function App() {
  const [result, setResult] = React.useState<number | undefined>();
  const [beaconList, setBeaconList] = React.useState<Array<object>>();


  React.useEffect(() => {
    init()
      .then(() => startScan());
  }, []);

  const handleButtonClick = async () => {
    try {
      const beaconArray = await getBeaconList();
      console.log("BEACON ARRAY ( size=", beaconArray.length, ")");

      beaconArray.forEach((beacon, index) => {
        console.log(`Beacon ${index}:`, beacon);
      });

      console.log("---------------")
      setBeaconList(beaconArray);
    } catch (error) {
      console.error('Error getting beacon list:', error);
    }
  };



  return (
    <View style={styles.container}>
      <Text>Result: {beaconList?.length}</Text>
      <TouchableOpacity onPress={handleButtonClick} >
        <Text>Fetch</Text>
      </TouchableOpacity>
      <Text>---</Text>
      {/*<TouchableOpacity onPress={() => stopScan().then(() => 'STOP!')} >*/}
      {/*  <Text>stop</Text>*/}
      {/*</TouchableOpacity>*/}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
