# ODP Maps

This is a android application to display all existed ODP points in the android map. We can also monitor and see the registered user and port for each ODPs.

## Table of Contents

- [ODP Maps](#odp-maps)
  - [Table of Contents](#table-of-contents)
  - [Development Dependencies](#development-dependencies)
  - [Development Setup](#development-setup)
  - [Features](#features)
    - [Rule Authorization](#rule-authorization)

## Development Dependencies

1. install expo-cli (`npm install -g expo-cli`)
2. install eas-cli (`npm install -g eas-cli`)
3. Must have Expo Account, if you don't registered yet then register in [here](https://expo.dev/signup)

## Development Setup

1. if you don't login into eas-cli, then run eas login (if already login, then skip this step)
2. run `eas build:configure`
3. run `eas build --profile development --platform android`, you change into ios if you want to install in the ios platform
4. after build, you have QR Code to install the app
5. run `npx expo start --dev-client` to link the app with your devices

**NOTE: when run step 5, making sure all your devices (android and laptop) are connected to the same wifi/networks.**

## Features

- login (user & admin)
- near by odp 5km
- pencarian odp
- informasi detail table ODP (table) (user)
- mengubah informasi detail table ODP (table)
- informasi user ODP (under table)
- mengubah informasi user ODP (under table)
- edit lokasi ODP (user)

warna Marker:

- hijau (>16 port/customer)
- merah (<=16 port/customer)

### Rule Authorization

- admin bisa semua fitur
- user bisa lihat dan edit informasi dan table
- admin: bisa menambah user credentials
