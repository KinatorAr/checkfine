
import React, {useState, useEffect} from 'react';
import { SafeAreaProvider} from 'react-native-safe-area-context';
import LoginComponent from './src/components/Login';
import RegisterComponent from './src/components/Register';
import HomeComponent from './src/components/Home';
import AddVehicleComponent from './src/components/AddVehicle';
import VehicleDetailComponent from './src/components/VehicleDetail';
import NewInspectionComponent from './src/components/NewInspection';
import AddDamageComponent from './src/components/AddDamage';

import {auth} from './FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { ActivityIndicator, View } from 'react-native';

// Definir los tipos de páginas que podemos mostrar
type PageName = 
| 'Login'
| 'Register'
| 'Home'
| 'AddVehicle'
| 'VehicleDetail'
| 'NewInspection'
| 'AddDamage';

// Definir el tipo Vehiculo
export interface Vehiculo{
  id: string;
  marca: string;
  modelo: string;
  anio: string;
  color: string;
  placa: string;
}

//Definir el tipo Damage
export interface Damage {
  id: string; // Puede ser temporal
  tipo: string;
  ubicacion: string;
  comentarios: string;
  fotoUri?: string; // URI local de la foto antes de subirla
}


// Es una buena práctica definir las props que tus pantallas esperan
// Así, tus componentes Login y Register saben que recibirán setPage
export interface ScreenProps {
  setPage: (page: PageName) => void;
  setSelectedVehicle: (vehicle: Vehiculo) => void;
  selectedVehicle: Vehiculo | null;

  addDamageToList?: (damage: Damage) => void; // Para NewInspection y AddDamage
  currentDamages?: Damage[]; 
  clearDamages?: () => void;
  setDamages?: (damages: Damage[]) => void; // Prop para actualizar la lista
}


function App() {
  const [page, setPage] = useState<PageName>('Login');
  const [danosTemporales, setDanosTemporales] = useState<Damage[]>([]);
  // Nuevo estado para guardar el vehículo seleccionado
  const [selectedVehicle, setSelectedVehicle] = useState<Vehiculo | null>(null);
  // Estado para saber si estamos verificando la sesión
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  // Función "wrapper" para manejar la navegación con selección
  const handleSetSelectedVehicle = (vehicle: Vehiculo | null) => {
    setSelectedVehicle(vehicle);
    if (vehicle) {
      setPage('VehicleDetail'); // Navega al detalle cuando se selecciona un auto
    } else {
      // Si deseleccionamos (vehicle es null), quizás volver al Home
      setPage('Home'); 
    } 
  };

  // Esta función se pasa como prop y la llama AddDamageScreen
  // para añadir un daño a nuestra lista temporal.
  const handleAddDamageToList = (damage: Damage) => {
    setDanosTemporales(prevDanos => [...prevDanos, damage]);
    // AddDamageScreen se encargará de volver a NewInspection con setPage
  };

  // Para limpiar la lista cuando la inspección se guarda o cancela
  const clearTemporalDamages = () => {
    setDanosTemporales([]);
  };

  // Se pasa como prop 'setDamages' a NewInspectionScreen
  const handleSetDamages = (damages: Damage[]) => {
      setDanosTemporales(damages);
  };

  // Función placeholder para las props no usadas
  const doNothing = () => {};
  const doNothingDamages = (_damages: Damage[]) => {}; // Placeholder para setDamages

  // --- NUEVO useEffect ---
  // Este hook se ejecutará una vez cuando la app se inicie
  useEffect(() => {
    // onAuthStateChanged devuelve una función para "darse de baja"
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // El usuario está autenticado
        setPage('Home'); // Llevarlo al Home
      } else {
        // El usuario no está autenticado (o acaba de cerrar sesión)
        setPage('Login'); // Llévarlo al Login

        // Limpiamos cualquier estado sensible
        setSelectedVehicle(null);
        setDanosTemporales([]);
      }
      // Terminamos de cargar el estado de auth
      setIsAuthLoading(false);
    });

    // Limpiamos el listener cuando el componente se desmonte
    return () => unsubscribe();
  }, []); // El array vacío [] asegura que esto solo se ejecute al montar

  // Muestra un indicador de carga mientras se verifica la sesión
  // Esto evita el "flash" de la pantalla de Login
  if (isAuthLoading) {
    return (
      <SafeAreaProvider>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#1b3d5c" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      {page === 'Login' && <LoginComponent setPage={setPage} setSelectedVehicle={handleSetSelectedVehicle} selectedVehicle={selectedVehicle} addDamageToList={doNothing} setDamages={doNothingDamages} />}
      {page === 'Register' && <RegisterComponent setPage={setPage} setSelectedVehicle={handleSetSelectedVehicle} selectedVehicle={selectedVehicle} addDamageToList={doNothing} setDamages={doNothingDamages} />}
      {page === 'Home' && <HomeComponent setPage={setPage} setSelectedVehicle={handleSetSelectedVehicle} selectedVehicle={selectedVehicle} addDamageToList={doNothing} setDamages={doNothingDamages} />}
      {page === 'AddVehicle' && <AddVehicleComponent setPage={setPage} setSelectedVehicle={handleSetSelectedVehicle} selectedVehicle={selectedVehicle} addDamageToList={doNothing} setDamages={doNothingDamages} />}
      {page === 'VehicleDetail' && <VehicleDetailComponent setPage={setPage} setSelectedVehicle={handleSetSelectedVehicle} selectedVehicle={selectedVehicle} addDamageToList={doNothing} setDamages={doNothingDamages} />}
      {page === 'NewInspection' && (
          <NewInspectionComponent
              setPage={setPage}
              setSelectedVehicle={handleSetSelectedVehicle}
              selectedVehicle={selectedVehicle}
              addDamageToList={handleAddDamageToList}
              currentDamages={danosTemporales}
              clearDamages={clearTemporalDamages}
              setDamages={handleSetDamages}
          />
      )}
      {page === 'AddDamage' && (
          <AddDamageComponent
              setPage={setPage}
              setSelectedVehicle={handleSetSelectedVehicle}
              selectedVehicle={selectedVehicle}
              addDamageToList={handleAddDamageToList}
          />
      )}
    </SafeAreaProvider>
  );
}

export default App;
