import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ScreenProps} from '../../App';

import {auth} from '../../FirebaseConfig';
import {signInWithEmailAndPassword} from 'firebase/auth';

const Login = ({setPage}: ScreenProps) => {
  //Estados
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Para deshabilitar el botón mientras se procesa el login
  
  // Estado para controlar la visibilidad de la contraseña
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  //Función principal de login
  const handleLogin = async () => {
    // Validaciones
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, ingresa tu correo y contraseña.');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      console.log('¡Login Exitoso!', user.uid);
      // Si el login es exitoso, Firebase guarda la sesión automáticamente
      // (gracias a la persistencia que tiene la configuracion de FirebaseConfig.ts).
      // Navegamos a la pantalla principal de la app
      setPage('Home');
    } catch (error: any) {
      console.error(error.code, error.message);
      setLoading(false); // Reactiva el botón
      // 'auth/invalid-credential' es el error moderno para "correo o contraseña incorrectos"
      if (error.code === 'auth/invalid-credential') {
        Alert.alert('Error', 'Correo o contraseña incorrectos.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Error', 'El formato del correo es incorrecto.');
      } else {
        Alert.alert('Error', 'Ocurrió un error. Intenta de nuevo.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.base}>
        <Text style={styles.titulo}>CheckFine</Text>
        <View>
          <TextInput
            style={styles.input}
            placeholder="Correo electronico"
            placeholderTextColor={'#B3B3B4'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"></TextInput>
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput} // Estilo modificado para que quepa el botón
            placeholder="Contraseña"
            placeholderTextColor={'#B3B3B4'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible} // Controlado por el estado
          />
          <Pressable
            onPress={() => setIsPasswordVisible(!isPasswordVisible)} // Cambia el estado
            style={styles.toggleButton}>
            <Text style={styles.toggleButtonText}>
              {isPasswordVisible ? 'Ocultar' : 'Mostrar'}
            </Text>
          </Pressable>
        </View>

        <Pressable style={styles.btn} onPress={handleLogin} disabled={loading}>
          <Text style={styles.btnTexto}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Text>
        </Pressable>
        <Text style={styles.subTitulo}>
          ¿Has olvidado tus datos de inicio de sesión? {''}
          <Text style={styles.subTituloBold}>Obtén ayuda.</Text>
        </Text>
        <Pressable onPress={() => setPage('Register')}>
          <Text style={styles.texto}>No tengo una cuenta</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  container: {
    backgroundColor: '#FFF',
    flex: 1,
    fontFamily: 'RobotoCondensed',
  },
  titulo: {
    color: '#1b3d5c',
    fontWeight: '700',
    fontSize: 38,
    fontFamily: 'RobotoCondensed',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#FFF',
    color: '#000',
    padding: 20,
    borderRadius: 5,
    borderColor: '#1B3D5C',
    borderWidth: 2,
    marginVertical: 10,
  },
  // --- NUEVOS ESTILOS ---
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 5,
    borderColor: '#1B3D5C',
    borderWidth: 2,
    marginVertical: 10,
  },
  passwordInput: {
    flex: 1, // Para que el input ocupe el espacio disponible
    color: '#000',
    padding: 20,
    // Quitamos los estilos de borde/fondo que ahora están en el 'passwordContainer'
  },
  toggleButton: {
    padding: 20, // Padding para que sea fácil de presionar
  },
  toggleButtonText: {
    color: '#1B3D5C',
    fontWeight: '600',
  },
  // --- FIN NUEVOS ESTILOS ---
  btn: {
    backgroundColor: '#1B3D5C',
    padding: 20,
    marginVertical: 20,
    borderRadius: 5,
  },
  btnTexto: {
    color: '#FFF',
    fontFamily: 'RobotoCondensed',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
  },
  subTitulo: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'RobotoCondensed',
    borderBottomColor: '#DBDBDC',
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  subTituloBold: {
    color: '#1B3D5C',
    fontWeight: '900',
  },
  texto: {
    padding: 10,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1B3D5C',
  },
});

export default Login;
