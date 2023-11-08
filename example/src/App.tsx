import * as React from 'react';

import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import {
  getBeaconListInRange,
  startScan,
  requestBluetoothPermission,
  requestLocationPermission,
  init,
  Beacon,
} from 'react-native-beacon-manager';

export default function App() {
  const [beaconList, setBeaconList] = React.useState<Array<Beacon>>();

  React.useEffect(() => {
    init()
      .then(() => requestBluetoothPermission())
      .then(() => requestLocationPermission())
      .then(() => startScan());
  }, []);

  const printBeaconList = (beaconArray: Array<Beacon>): void => {
    console.log('BEACON ARRAY ( size=', beaconArray.length, ')');

    beaconArray.forEach((beacon, index) => {
      console.log(`Beacon ${index}:`, beacon);
    });

    console.log('---------------');
  };

  const handleButtonClick = async () => {
    try {
      const beaconArray: Array<Beacon> = await getBeaconListInRange();
      printBeaconList(beaconArray);
      setBeaconList(beaconArray);
    } catch (error) {
      console.error('Error getting beacon list:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Result: {beaconList?.length}</Text>
      <TouchableOpacity onPress={handleButtonClick}>
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
