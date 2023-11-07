import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

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
  return checkPermissionsAndStartScan();
}

export function stopScan() : Promise<any> {
  return BeaconManager.stopScan();
}

export function init() : Promise<any> {
  return BeaconManager.init();
}

async function requestLocationPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 23) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "This app needs access to your location.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      }
    );
    return (granted === PermissionsAndroid.RESULTS.GRANTED);
  }
  return true;
}

async function requestBluetoothPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 31) { // Android 12 and above
    const bluetoothScanGranted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Bluetooth Scan Permission",
        message: "This app needs permission to scan for Bluetooth devices.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      }
    );

    const bluetoothConnectGranted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Bluetooth Connect Permission",
        message: "This app needs permission to connect to Bluetooth devices.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      }
    );

    return (bluetoothScanGranted === PermissionsAndroid.RESULTS.GRANTED &&
      bluetoothConnectGranted === PermissionsAndroid.RESULTS.GRANTED);
  }
  return true;
}

// 새로운 함수 추가: 권한을 확인하고 스캔을 시작합니다.
export async function checkPermissionsAndStartScan() {
  const locationPermission = await requestLocationPermission();
  const bluetoothPermission = await requestBluetoothPermission();

  if (!locationPermission || !bluetoothPermission) {
    console.log('Required permissions are not granted');
    // 권한 거부 처리 로직
    throw new Error('Required permissions are not granted');
  } else {
    // 모든 권한이 주어졌을 때 startScan 함수를 호출합니다.
    return BeaconManager.startScan();
  }
}


