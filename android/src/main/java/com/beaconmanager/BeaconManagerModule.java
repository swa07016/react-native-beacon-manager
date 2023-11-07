package com.beaconmanager;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.core.content.ContextCompat;
import androidx.core.app.ActivityCompat;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;

import android.app.Activity;
import android.Manifest;
import android.content.pm.PackageManager;
import android.util.Log;

import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import com.minew.beaconset.BluetoothState;
import com.minew.beaconset.ConnectionState;
import com.minew.beaconset.MinewBeacon;
import com.minew.beaconset.MinewBeaconConnection;
import com.minew.beaconset.MinewBeaconConnectionListener;
import com.minew.beaconset.MinewBeaconManager;
import com.minew.beaconset.MinewBeaconManagerListener;

import java.util.List;
import java.util.ArrayList;
import java.util.Collections;
import java.lang.System;
import java.lang.Float;


@ReactModule(name = BeaconManagerModule.NAME)
public class BeaconManagerModule extends ReactContextBaseJavaModule {

  public static final String NAME = "BeaconManager";

  private MinewBeaconManager mMinewBeaconManager;
  private List<MinewBeacon> mMinewBeacons = new ArrayList();
  UserRssi comp = new UserRssi();
  private Handler handler = new Handler(Looper.getMainLooper());

  // init을 먼저 호출하세요
  @ReactMethod
  public void init(Promise promise) {
      initManager();
      initListener();
//      initPermission();
      startService();
      promise.resolve("Success");
  }

  private void initManager() {
    mMinewBeaconManager = MinewBeaconManager.getInstance(getReactApplicationContext());
    //设置每10秒返回一次结果

//    mMinewBeaconManager.setRangeInterval(1000);
  }

  private void initListener() {
    mMinewBeaconManager.setMinewbeaconManagerListener(new MinewBeaconManagerListener() {
      @RequiresApi(api = Build.VERSION_CODES.M)
      @Override
      public void onUpdateBluetoothState(BluetoothState state) {
        switch (state) {
          case BluetoothStatePowerOff:
//            Toast.makeText(getApplicationContext(), "bluetooth off", Toast.LENGTH_SHORT).show();
            break;
          case BluetoothStatePowerOn:
//            Toast.makeText(getApplicationContext(), "bluetooth on", Toast.LENGTH_SHORT).show();
            break;
        }
      }

      @Override
      public void onRangeBeacons(List<MinewBeacon> beacons) {
        System.out.println("CALL ON RANGE");
        Log.e("test", "size=" + beacons.size());
        //获取周围设备的最新扫描数据
        setData(beacons);
        Log.e("test", "SET BEACONLIST" + mMinewBeacons.size());
      }

      @Override
      public void onAppearBeacons(List<MinewBeacon> beacons) {
        System.out.println("CALL ON APPEAR");
      }

      @Override
      public void onDisappearBeacons(List<MinewBeacon> beacons) {
        System.out.println("CALL ON DISAPPEAR");
      }
    });

  }

//  @RequiresApi(api = Build.VERSION_CODES.M)
//  private void initPermission() {
//    String[] requestPermissions;
//    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
//      requestPermissions = new String[]{
//        Manifest.permission.BLUETOOTH_SCAN,
//        Manifest.permission.BLUETOOTH_CONNECT,
//        Manifest.permission.ACCESS_COARSE_LOCATION,
//        Manifest.permission.ACCESS_FINE_LOCATION
//      };
//
//    } else {
//      requestPermissions = new String[]{
//        Manifest.permission.ACCESS_COARSE_LOCATION,
//        Manifest.permission.ACCESS_FINE_LOCATION
//      };
//
//    }
//
//    ActivityCompat.requestPermissions(this,
//      requestPermissions, Manifest.permission.REQUEST_FINE_LOCATION);
//
//  }

  private void startService() {
    mMinewBeaconManager.startService();
    mMinewBeaconManager.registerBleChangeBroadcast();
  }

  @ReactMethod
  public void startScan(Promise promise) {
    checkLocation();
    checkBluetooth();

    handler.postDelayed(new Runnable() {
      @Override
      public void run() {
        System.out.println("START SCAN!");
        mMinewBeaconManager.startScan();
      }
      // Runnable 익명 클래스의 끝에 대한 중괄호 추가
    }, 0);
    // handler.postDelayed() 메소드 호출의 끝에 대한 중괄호 추가

    promise.resolve("Success");
// startScan 메소드의 끝에 대한 중괄호 추가
  }



  @ReactMethod
  public void stopScan(Promise promise) {
    mMinewBeaconManager.stopScan();
    promise.resolve("Success");
  }

  @ReactMethod
  public void getBeaconList(Promise promise) {
    Log.e("test", "GET BEACONLIST" + mMinewBeacons.size());

    WritableArray beaconArray = Arguments.createArray();

      for (MinewBeacon beacon : mMinewBeacons) {
          WritableMap beaconMap = Arguments.createMap();
          beaconMap.putString("name", beacon.getName());
           beaconMap.putString("uuid", beacon.getUuid());
           beaconMap.putBoolean("connectable", beacon.isConnectable());
        beaconMap.putBoolean("inRange", beacon.isInRange());
           beaconMap.putString("major", beacon.getMajor());
           beaconMap.putString("minor", beacon.getMinor());
           beaconMap.putInt("rssi", beacon.getRssi());
           beaconMap.putInt("battery", beacon.getBattery());
        beaconMap.putDouble("distance", Float.valueOf(beacon.getDistance()).doubleValue());
          beaconMap.putString("txPower", beacon.getTxpower());
        beaconMap.putString("deviceId", beacon.getDeviceId());
        beaconMap.putString("macAddress", beacon.getMacAddress());

          // 추가적인 필요한 필드를 여기에 넣어줍니다.

          beaconArray.pushMap(beaconMap);
      }

    Log.e("test", "PROMISE BEACONSLIST : " + beaconArray.size());

      promise.resolve(beaconArray);
  }

  private void checkBluetooth(){
      if (ContextCompat.checkSelfPermission(getReactApplicationContext(), Manifest.permission.BLUETOOTH_SCAN)
              != PackageManager.PERMISSION_GRANTED) {
          // Permission is not granted
          ActivityCompat.requestPermissions(getCurrentActivity(),new String[]{Manifest.permission.BLUETOOTH_SCAN},102);
      }

      if (ContextCompat.checkSelfPermission(getReactApplicationContext(), Manifest.permission.BLUETOOTH_CONNECT)
              != PackageManager.PERMISSION_GRANTED) {
          // Permission is not granted
          ActivityCompat.requestPermissions(getCurrentActivity(),new String[]{Manifest.permission.BLUETOOTH_CONNECT},103);
      }


    if (ContextCompat.checkSelfPermission(getReactApplicationContext(), Manifest.permission.BLUETOOTH_ADMIN)
      != PackageManager.PERMISSION_GRANTED) {
      // Permission is not granted
      ActivityCompat.requestPermissions(getCurrentActivity(),new String[]{Manifest.permission.BLUETOOTH_ADMIN},103);
    }


    if (ContextCompat.checkSelfPermission(getReactApplicationContext(), Manifest.permission.BLUETOOTH)
      != PackageManager.PERMISSION_GRANTED) {
      // Permission is not granted
      ActivityCompat.requestPermissions(getCurrentActivity(),new String[]{Manifest.permission.BLUETOOTH},103);
    }

  }

  private void checkLocation(){
      if (ContextCompat.checkSelfPermission(getReactApplicationContext(), Manifest.permission.ACCESS_COARSE_LOCATION)
              != PackageManager.PERMISSION_GRANTED) {
          // Permission is not granted
          ActivityCompat.requestPermissions(getCurrentActivity(),new String[]{Manifest.permission.ACCESS_COARSE_LOCATION},101);
      }

    if (ContextCompat.checkSelfPermission(getReactApplicationContext(), Manifest.permission.ACCESS_FINE_LOCATION)
      != PackageManager.PERMISSION_GRANTED) {
      // Permission is not granted
      ActivityCompat.requestPermissions(getCurrentActivity(),new String[]{Manifest.permission.ACCESS_FINE_LOCATION},101);
    }
  }

  public BeaconManagerModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  private void setData(List<MinewBeacon> minewBeacons) {
      this.mMinewBeacons = minewBeacons;
  }


  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  // Example method
  @ReactMethod
  public void multiply(double a, double b, Promise promise) {
    promise.resolve(a * b);
  }
}
