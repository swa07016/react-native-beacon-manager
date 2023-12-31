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

export function getBeaconListInRange(): Promise<Array<Beacon>> {
  return new Promise((resolve, reject) => {
    BeaconManager.getBeaconListInRange()
      .then((list: Beacon[]) => {
        resolve(list);
      })
      .catch((error: Error) => {
        console.error('Failed to fetch beacon list', error);
        reject(error);
      });
  });
}

export function startScan(): Promise<any> {
  return checkPermissionsAndStartScan();
}

export function stopScan(): Promise<any> {
  return BeaconManager.stopScan();
}

export function init(): Promise<any> {
  return BeaconManager.init();
}

export async function requestLocationPermission() {
  if (
    Platform.OS === 'android' &&
    Platform.Version >= 23 &&
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  ) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: '위치 권한',
        message: '이 앱은 위치에 대한 접근 권한이 필요합니다.',
        buttonNeutral: '나중에 물어보기',
        buttonNegative: '취소',
        buttonPositive: '확인',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
}

export async function requestBluetoothPermission() {
  if (
    Platform.OS === 'android' &&
    Platform.Version >= 31 &&
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN &&
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
  ) {
    // Android 12 and above
    const bluetoothScanGranted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: '블루투스 스캔 권한',
        message: '이 앱은 Bluetooth 장치를 스캔하는 권한이 필요합니다.',
        buttonNeutral: '나중에 물어보기',
        buttonNegative: '취소',
        buttonPositive: '확인',
      }
    );

    const bluetoothConnectGranted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: '블루투스 연결 권한',
        message: '이 앱은 Bluetooth 장치에 연결하는 권한이 필요합니다.',
        buttonNeutral: '나중에 물어보기',
        buttonNegative: '취소',
        buttonPositive: '확인',
      }
    );

    return (
      bluetoothScanGranted === PermissionsAndroid.RESULTS.GRANTED &&
      bluetoothConnectGranted === PermissionsAndroid.RESULTS.GRANTED
    );
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

export interface Beacon {
  battery: number;
  connectable: boolean;
  deviceId: string | null;
  distance: number;
  inRange: boolean;
  macAddress: string;
  major: string;
  minor: string;
  name: string | null;
  rssi: number;
  txPower: string;
  uuid: string;
}
