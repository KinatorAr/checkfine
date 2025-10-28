// Este archivo le dice a TypeScript qué es el módulo 'firebase/auth/react-native'
// import { Persistence } from 'firebase/auth';

// declare module 'firebase/auth/react-native' {
//   export function getReactNativePersistence(storage: any): Persistence;
// }

import { Persistence, ReactNativeAsyncStorage } from "firebase/auth";

declare module "firebase/auth" {
  export declare function getReactNativePersistence(
    storage: ReactNativeAsyncStorage,
  ): Persistence;
}