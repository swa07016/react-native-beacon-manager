import * as React from 'react';

import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { getBeaconListInRange, startScan, requestBluetoothPermission, requestLocationPermission, stopScan, init } from 'react-native-beacon-manager';

export default function App() {
  const [result, setResult] = React.useState<number | undefined>();
  const [beaconList, setBeaconList] = React.useState<Array<object>>();


  React.useEffect(() => {
    init()
      .then(() => requestBluetoothPermission())
      .then(() => requestLocationPermission())
      .then(() => startScan());
  }, []);

  const printBeaconList = (beaconArray : Array<object>) : void => {
    console.log("BEACON ARRAY ( size=", beaconArray.length, ")");

    beaconArray.forEach((beacon, index) => {
      console.log(`Beacon ${index}:`, beacon);
    });

    console.log("---------------")
  }

  const handleButtonClick = async () => {
    try {
      const beaconArray = await getBeaconListInRange();
      printBeaconList(beaconArray);
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
