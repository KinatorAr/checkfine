import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, Modal, TextInput, View, ScrollView, Pressable, Alert, FlatList, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import { ScreenProps, Vehiculo} from '../../App';

import { Svg, Path } from 'react-native-svg';

import { db } from '../../FirebaseConfig'; // Importamos la base de datos
import {collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

// --- Icono de Flecha para Volver ---
const ArrowLeftIcon = ({color, size}: {color?: string; size?: number}) => (
    <Svg
        width={size || 24}
        height={size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color || 'currentColor'}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round">
        <Path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <Path d="M5 12l14 0" />
        <Path d="M5 12l6 6" />
        <Path d="M5 12l6 -6" />
    </Svg>
    );


const VehicleDetail = ({setPage, selectedVehicle}: ScreenProps) => {
    // Estados para este componente
    const [loadingInspections, setLoadingInspections] = useState(true);
    const [inspections, setInspections] = useState<any[]>([]); // Aquí guardaremos el historial

    // Si no hay auto seleccionado (por algún error), regresamos al Home
    if (!selectedVehicle) {
        setPage('Home');
        return null; // No renderiza nada
}

    // useEffect para cargar el HISTORIAL de inspecciones de ESTE auto
    useEffect(() => {
        setLoadingInspections(true);
        
        // 1. Consulta a la colección "inspecciones"
        const q = query(
        collection(db, 'inspecciones'),
        // 2. Filtra donde el vehiculoId sea el de nuestro auto seleccionado
        where('vehiculoId', '==', selectedVehicle.id),
        // 3. Ordena por fecha
        orderBy('fecha', 'desc'), 
        );

        // 4. Escuchamos en tiempo real
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const listaInspecciones: any[] = [];
        querySnapshot.forEach((doc) => {
            listaInspecciones.push({ id: doc.id, ...doc.data() });
        });
        setInspections(listaInspecciones); // Guardamos la lista
        setLoadingInspections(false);
        }, (error) => {
        console.error("Error al obtener inspecciones: ", error);
        Alert.alert("Error", "No se pudo cargar el historial.");
        setLoadingInspections(false);
        });
        return () => unsubscribe();
    }, [selectedVehicle.id]); // Se vuelve a ejecutar si el ID del auto cambia
      // --- Función para renderizar el historial (por ahora simple) ---
    const renderHistorial = ({ item }: { item: any }) => (
        <View style={styles.card}>
        <Text style={styles.cardTitle}>Inspección ({item.tipo})</Text>
        {/* 'item.fecha.toDate()' es necesario si es un Timestamp de Firebase */}
        <Text style={styles.cardSubText}>
            Fecha: {item.fecha ? new Date(item.fecha.seconds * 1000).toLocaleString('es-MX') : 'N/A'}
        </Text>
        <Text style={styles.cardSubText}>Kilometraje: {item.kilometraje} km</Text>
        </View>
    );

    // --- Función para renderizar el estado vacío del historial ---
    const renderEmptyHistory = () => (
        <View style={{alignItems: 'center', marginVertical: 40}}>
        {loadingInspections ? (
            <ActivityIndicator size="large" color="#1b3d5c" />
        ) : (
            <Text style={styles.emptyText}>Este vehículo no tiene inspecciones.</Text>
        )}
        </View>
    );
    return (
        <SafeAreaView style={styles.container}>
        {/* --- Header con Botón de Volver --- */}
        <View style={styles.header}>
            <Pressable onPress={() => setPage('Home')} style={styles.backButton}>
            <ArrowLeftIcon color="#1b3d5c" size={28} />
            </Pressable>
            <Text style={styles.titulo}>Detalle del Vehículo</Text>
            <View style={{width: 40}} />{/* Espaciador */}
        </View>

        {/* --- Información del Vehículo --- */}
        <View style={styles.infoContainer}>
            <Text style={styles.placa}>{selectedVehicle.placa}</Text>
            <Text style={styles.infoText}>{selectedVehicle.marca} {selectedVehicle.modelo}</Text>
            <Text style={styles.infoText}>Año: {selectedVehicle.anio} | Color: {selectedVehicle.color}</Text>
        </View>

        {/* --- Botón de Nueva Inspección --- */}
        <Pressable style={styles.btnInspeccion}>
            <Text style={styles.btnInspeccionTexto} onPress={() => setPage('NewInspection')} >Iniciar Nueva Inspección</Text>
        </Pressable>

        {/* --- Historial --- */}
        <Text style={styles.historialTitulo}>Historial de Inspecciones</Text>
        <FlatList
            data={inspections}
            renderItem={renderHistorial}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={renderEmptyHistory}
            contentContainerStyle={{paddingHorizontal: 20}}
        />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    backButton: {
        padding: 5,
    },
    titulo: {
        color: '#1b3d5c',
        fontWeight: '600',
        fontSize: 22,
        fontFamily: 'RobotoCondensed',
    },
    infoContainer: {
        padding: 20,
        backgroundColor: '#FAFAFA',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    placa: {
        color: '#1b3d5c',
        fontSize: 28,
        fontWeight: 'bold',
        fontFamily: 'RobotoCondensed',
    },
    infoText: {
        color: '#333',
        fontSize: 18,
        fontFamily: 'RobotoCondensed',
        marginTop: 5,
    },
    btnInspeccion: {
        backgroundColor: '#1b3d5c',
        padding: 18,
        borderRadius: 8,
        margin: 20,
    },
    btnInspeccionTexto: {
        color: '#FFF',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '900',
        fontFamily: 'RobotoCondensed',
    },
    historialTitulo: {
        color: '#1b3d5c',
        fontWeight: '600',
        fontSize: 20,
        fontFamily: 'RobotoCondensed',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    card: {
        backgroundColor: '#FAFAFA',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#EEE',
        marginBottom: 10,
    },
    cardTitle: {
        color: '#1b3d5c',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'RobotoCondensed',
    },
    cardSubText: {
        color: '#555',
        fontSize: 16,
        fontFamily: 'RobotoCondensed',
        marginTop: 5,
    },
    emptyText: {
        color: '#555',
        fontSize: 16,
        fontFamily: 'RobotoCondensed',
        textAlign: 'center'
    },
    });


export default VehicleDetail
