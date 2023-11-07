import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-beacon-manager' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const BeaconManager = NativeModules.BeaconManager
  ? NativeModules.BeaconManager
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export function multiply(a: number, b: number): Promise<number> {
  return BeaconManager.multiply(a, b);
}

export function getBeaconList(): Promise<Array<object>> {
  return new Promise((resolve, reject) => {
    BeaconManager.getBeaconList()
      .then((list) => {
        resolve(list);
      }).catch((error) => {
      console.error("Failed to fetch beacon list", error);
      reject(error);
    });
  });
}


export function startScan() : Promise<any> {
  return BeaconManager.startScan();
}

export function stopScan() : Promise<any> {
  return BeaconManager.stopScan();
}

export function init() : Promise<any> {
  return BeaconManager.init();
}
