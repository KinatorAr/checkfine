import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, ScrollView, Pressable, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import { ScreenProps } from '../../App';
import { db, auth } from '../../FirebaseConfig'; // Importamos 'auth' para saber qué usuario lo agrega
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const AddVehicle = ({ setPage }: ScreenProps) => {
    //Estados para guardar cada campo del vehículo
    const [placa, setPlaca] = useState('');
    const [marca, setMarca] = useState('');
    const [modelo, setModelo] = useState('');
    const [anio, setAnio] = useState('');
    const [color, setColor] = useState('');
    const [loading, setLoading] = useState(false);

    //Funcion para agregar el vehículo a Firestore
const handleSaveVehicle = async () => {
    if (!placa || !marca || !modelo || !anio || !color) {
        Alert.alert('Error', 'Por favor, completa todos los campos.');
        return; 
    }
    setLoading(true);
    try {
      // Agregamos a la colección "vehiculos" en Firestore
    const vehiculosCollectionRef = collection(db, 'vehiculos');
      // Usamos 'addDoc' para crear un nuevo documento en esa colección
    const docRef = await addDoc(vehiculosCollectionRef, {
        placa: placa.toUpperCase(), // Guardar placas en mayúsculas
        marca: marca,
        modelo: modelo,
        anio: anio, // Guardará el string,
        color: color,
        // (En un futuro, aquí iría el flotillaId)
        // flotillaId: 'ID_DE_LA_EMPRESA_DEL_USUARIO', 
        creadoEn: serverTimestamp(), // Guarda la fecha actual
        creadoPor: auth.currentUser?.uid, // Guarda qué usuario lo agregó
    });
    console.log('¡Vehículo guardado con ID!', docRef.id);
    Alert.alert('¡Éxito!', 'Vehículo agregado a tu flotilla.');
      //Regresamos al Home (que ahora debería mostrar el nuevo auto)
    setPage('Home');
    } catch (error) {
    console.error("Error al guardar vehículo: ", error);
    Alert.alert('Error', 'No se pudo guardar el vehículo.');
    setLoading(false);
    }
};

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.base}>
                <Text style={styles.titulo}>Agregar Nuevo Vehículo</Text>
                <Text style={styles.texto}>Ingresa los datos del vehículo para registrarlo en tu flotilla.</Text>
                <View>
                    <TextInput style={styles.input} placeholder='Placa (Ej. ABC-123)' placeholderTextColor = '#B3B3B4' value={placa} onChangeText={setPlaca} autoCapitalize='characters'></TextInput>
                </View>
                <View style={styles.seccionUno}>
                    <TextInput style={[styles.input, styles.seccionUnoItem]} placeholder='Marca' placeholderTextColor='#B3B3B4' value={marca} onChangeText={setMarca}></TextInput>
                    <TextInput style={[styles.input, styles.seccionUnoItem]} placeholder='Modelo' placeholderTextColor='#B3B3B4' value={modelo} onChangeText={setModelo}></TextInput>
                </View>
                <View style={styles.seccionUno}>
                    <TextInput style={[styles.input, styles.seccionUnoItem]} placeholder='Año' placeholderTextColor='#B3B3B4' value={anio} onChangeText={setAnio} keyboardType='numeric' maxLength={4}></TextInput>
                    <TextInput style={[styles.input, styles.seccionUnoItem]} placeholder='Color' placeholderTextColor='#B3B3B4' value={color} onChangeText={setColor}></TextInput>
                </View>
                <Pressable style={styles.btn} onPress={handleSaveVehicle} disabled={loading}>
                    <Text style={styles.btnTexto}>{loading ? 'Guardando...' : 'Guardar Vehículo'}</Text>
                </Pressable>
                <Pressable style ={styles.btnCancelar} onPress={() => setPage('Home')}>
                    <Text style ={styles.btnCancelarTexto}>Cancelar</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    base:{
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
        fontSize: 32,
        fontFamily: 'RobotoCondensed',
        textAlign: 'left',
        marginVertical: 20,
    },
    texto: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'left',
        color: '#000',
        marginBottom: 10,
    },
    input:{
        backgroundColor: '#FFF',
        color: '#000',
        padding: 20,
        borderRadius: 5,
        borderColor: '#1B3D5C',
        borderWidth: 2,
        marginVertical: 10,
    },
    btn: {
        backgroundColor: '#1B3D5C',
        padding: 15,
        marginVertical: 10,
        borderRadius: 5,
    },
    btnCancelar:{
        backgroundColor: 'transparent',
        borderColor: '#1B3D5C',
        borderWidth: 2,
        padding: 15,
        marginVertical: 10,
        borderRadius: 5,
    },
    btnCancelarTexto:{
        color: '#1B3D5C',
        fontFamily: 'RobotoCondensed',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 900
    },
    btnTexto: {
        color: '#FFF',
        fontFamily: 'RobotoCondensed',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 900
    },
    subTitulo:{
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
    seccionUno:{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexBasis: '50%',
    },
    seccionUnoItem:{
        width: '48%',
    },
});

export default AddVehicle
