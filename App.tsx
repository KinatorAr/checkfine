
import React, {useState} from 'react';
import {StyleSheet, Text, Modal, TextInput, View, ScrollView, Pressable, Alert} from 'react-native';
import { SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import LoginComponent from './src/components/login';
import RegisterComponent from './src/components/register';

// Definir los tipos de páginas que podemos mostrar
type PageName = 
| 'login'
| 'register'

// Es una buena práctica definir las props que tus pantallas esperan
// Así, tus componentes Login y Register saben que recibirán setPage
export interface ScreenProps {
  setPage: (page: PageName) => void;
}


function App() {
  const [page, setPage] = useState<PageName>('login');

  return (
    <SafeAreaProvider>
      {page === 'login' && <LoginComponent setPage={setPage}/>}
      {page === 'register' && <RegisterComponent setPage={setPage}/>}
    </SafeAreaProvider>
  );
}

export default App;
