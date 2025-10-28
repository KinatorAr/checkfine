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
import {auth, db} from '../../FirebaseConfig';

import {createUserWithEmailAndPassword} from 'firebase/auth';
import {doc, setDoc} from 'firebase/firestore';

const Register = ({setPage}: ScreenProps) => {
  // Estados para los campos del formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false); // Para deshabilitar el botón mientras se procesa el registro

  // --- NUEVOS ESTADOS ---
  // Estados para controlar la visibilidad de las contraseñas
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  // --- FIN NUEVOS ESTADOS ---

  // 4. Función principal de registro
  const handleRegister = async () => {
    // Validaciones simples
    if (!nombre || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor, rellena todos los campos.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      // Crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      console.log('¡Usuario creado en Auth!', user.uid);
      // Guardar la info extra en Firestore Database
      // Creamos una referencia a un nuevo documento en la colección "users"
      // usando el UID (ID Único) del usuario como ID del documento.
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: email.toLowerCase(),
        nombre: nombre,
        apellido: apellido,
        createdAt: new Date(), // Es bueno guardar cuándo se registró
      });
      console.log('¡Datos guardados en Firestore!');
      // --- PASO 3: Éxito ---
      Alert.alert(
        '¡Registro Exitoso!',
        'Tu cuenta ha sido creada. Ahora inicia sesión.',
      );
      setPage('Login'); // Manda al usuario a la pantalla de Login
    } catch (error: any) {
      console.error(error.code, error.message);
      setLoading(false); // Reactivar el botón

      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'Ese correo electrónico ya está en uso.');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert(
          'Error',
          'La contraseña debe tener al menos 6 caracteres.',
        );
      } else {
        Alert.alert('Error', 'Ocurrió un error. Intenta de nuevo.');
      }
    }
    // NOTA: No es necesario poner setLoading(false) en el 'try'
    // porque si tiene éxito, cambiamos de pantalla.
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.base}>
        <Text style={styles.titulo}>Crear una cuenta</Text>
        <View style={styles.seccionUno}>
          {/* Fila de Nombre y Apellido */}
          <TextInput
            style={[styles.input, styles.seccionUnoItem]}
            placeholder="Nombre(s)"
            placeholderTextColor={'#B3B3B4'}
            value={nombre}
            onChangeText={setNombre}></TextInput>
          <TextInput
            style={[styles.input, styles.seccionUnoItem]}
            placeholder="Apellido P."
            placeholderTextColor={'#B3B3B4'}
            value={apellido}
            onChangeText={setApellido}></TextInput>
        </View>
        <View>
          <TextInput
            style={styles.input}
            placeholder="Correo eletronico"
            placeholderTextColor={'#B3B3B4'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"></TextInput>
        </View>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Contraseña nueva (mín. 6 caracteres)"
            placeholderTextColor={'#B3B3B4'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
          />
          <Pressable
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.toggleButton}>
            <Text style={styles.toggleButtonText}>
              {isPasswordVisible ? 'Ocultar' : 'Mostrar'}
            </Text>
          </Pressable>
        </View>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirmar contraseña"
            placeholderTextColor={'#B3B3B4'}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!isConfirmPasswordVisible}
          />
          <Pressable
            onPress={() =>
              setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
            }
            style={styles.toggleButton}>
            <Text style={styles.toggleButtonText}>
              {isConfirmPasswordVisible ? 'Ocultar' : 'Mostrar'}
            </Text>
          </Pressable>
        </View>
        <Pressable
          style={styles.btn}
          onPress={handleRegister}
          disabled={loading}>
          <Text style={styles.btnTexto}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </Text>
        </Pressable>
        <Pressable onPress={() => setPage('Login')}>
          <Text style={styles.texto}>Ya tengo una cuenta</Text>
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
    marginTop: 20,
    marginBottom: 20,
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
    marginVertical: 10,
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
    color: '#1B3D5C',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 10,
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
    borderTopColor: '#DBDBDC',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  seccionUno: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexBasis: '50%',
  },
  seccionUnoItem: {
    width: '48%',
  },
  seccionDos: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexBasis: '50%',
  },
  SeccionDosItem: {
    width: '30%',
  },
});

export default Register;
