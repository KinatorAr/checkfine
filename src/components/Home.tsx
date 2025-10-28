import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, Modal, TextInput, View, ScrollView, Pressable, Alert, FlatList, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import { ScreenProps, Vehiculo } from '../../App';
import { Svg, Path } from 'react-native-svg';

import { db, auth } from '../../FirebaseConfig'; // Importamos la base de datos
import {collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

const SearchIcon = ({ color, size }: { color?: string; size?: number }) => {
    return (
    <Svg
        width={size || 24}
        height={size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color || "#888"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round">
            <Path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <Path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
            <Path d="M21 21l-6 -6" />
    </Svg>
    );
};

const Settings = ({ color, size }: { color?: string; size?: number }) => {
    return (
        <Svg 
            width={size || 24}
            height={size || 24}
            viewBox="0 0 24 24" 
            fill="none" 
            stroke={color || "currentColor"}
            strokeWidth={2}
            strokeLinecap="round" 
            strokeLinejoin="round">
                <Path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <Path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
                <Path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
        </Svg>
    )
};

const SearchOffIcon = ({ color, size }: { color?: string; size?: number }) => {
    return (
        <Svg
        width={size || 24}
        height={size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color || "currentColor"}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        >
        <Path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <Path d="M5.039 5.062a7 7 0 0 0 9.91 9.89m1.584 -2.434a7 7 0 0 0 -9.038 -9.057" />
        <Path d="M3 3l18 18" />
        </Svg>
    );
};

const Plus = ({ color, size }: { color?: string; size?: number }) => {
    return (
        <Svg 
        width={size || 24}
        height={size || 24}
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={color || "currentColor"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round">
            <Path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <Path d="M12 5l0 14" />
            <Path d="M5 12l14 0" />
        </Svg>
    );
};


const Home = ({setPage, setSelectedVehicle}: ScreenProps) => {
    const [searchText, setSearchText] = useState('')
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [cargarVehiculos, setCargarVehiculos] = useState<Vehiculo[]>([]); // Para deshabilitar el botón mientras se procesa el login

    //useEffect para cargar los vehículos desde Firestore
    useEffect(() => {
        setLoading(true);
        const userId = auth.currentUser?.uid;
        if (!userId) {
        setLoading(false);
        // Si no hay usuario, mandarlo al Login
        setPage('Login'); 
        return;
        }
    // Creamos una consulta a la colección 'vehiculos'
        const q = query(
        collection(db, 'vehiculos'),
        where('creadoPor', '==', userId), // Filtramos por el usuario logueado
        orderBy('creadoEn', 'desc') // Ordenamos por fecha de creación
        );

        const unsubscribe = onSnapshot(
        q,
        querySnapshot => {
            const listaVehiculos: Vehiculo[] = []; // Usamos el tipo Vehiculo
            querySnapshot.forEach(doc => {
            const data = doc.data();
            listaVehiculos.push({
                id: doc.id,
                placa: data.placa,
                marca: data.marca,
                modelo: data.modelo,
                año: data.anio,
                color: data.color,
            });
            });
            setCargarVehiculos(listaVehiculos);
            setLoading(false);
        },
        error => {
            console.error('Error al obtener vehículos: ', error);
            Alert.alert('Error', 'No se pudieron cargar los vehículos.');
            setLoading(false);
        },
        );
        return () => unsubscribe();
    }, []);

      // --- Función para manejar el clic en "Inspeccionar" ---
    const handleInspectVehicle = (vehicle: Vehiculo) => {
        setSelectedVehicle(vehicle); // Guardamos el auto seleccionado en App.tsx
        // App.tsx automáticamente cambiará a setPage('VehicleDetail')
    };

    //Funcion para renderizar cada vehículo en la lista
    const renderVehicle = ({item}: {item: Vehiculo}) => (
        <Pressable style={styles.vehiculoCard}>
            <Text style={styles.vehiculoPlaca}>{item.placa}</Text>
            <Text style={styles.vehiculoInfo}>
                {item.marca} {item.modelo} ({item.año})
            </Text>
            <Text style={styles.vehiculoInfo}>Color: {item.color}</Text>
            <Pressable style={styles.inspeccionarBtn} onPress={() => handleInspectVehicle(item)}>
                <Text style={styles.inspeccionarBtnTexto}>Inspeccionar</Text>
            </Pressable>
        </Pressable>
    );

    // COMPONENTE PARA LA CABECERA
    const renderHeader = () => (
        <View> 
        <View 
            style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginVertical: 10,
            }}>
            <Text style={styles.titulo}>Mis Vehículos</Text>
            <Pressable onPress={() => setModalVisible(true)}>
                <Settings color="#1b3d5c" size={40} />
            </Pressable>
        </View>
        <View style={styles.searchContainer}>
            <View style={styles.searchIcon}>
            <SearchIcon color="#888" size={18} />
            </View>
            <TextInput
            style={styles.searchInput}
            placeholder="Buscar..."
            placeholderTextColor={'#B3B3B4'}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            />
        </View>
        <View
            style={{
            borderWidth: 1,
            borderColor: '#DBDBDC',
            marginBottom: 15,
            }}></View>
        </View>
    );

    // COMPONENTE PARA EL ESTADO VACÍO
    //    Esto lo pasaremos a la prop ListEmptyComponent
    const renderEmptyList = () => {
        if (loading) {
        // Si está cargando, mostramos el ActivityIndicator
        return (
            <ActivityIndicator size="large" color="#1b3d5c" style={{marginTop: 50}} />
        );
        }

        // Si no está cargando y la lista está vacía
        return (
        <View
            style={{
            alignItems: 'center',
            marginTop: 40,
            paddingHorizontal: 30, // Añadido para centrar el texto si es largo
            }}>
            <SearchOffIcon color="#1b3d5c" size={100} />
            <Text style={styles.textoVacio}>
            No tienes vehículos registrados.{'\n'}
            Toca el botón (+) para agregar uno.
            </Text>
        </View>
        );
    };

    return (
    <SafeAreaView style={styles.container}>
        <FlatList style={styles.base} data={cargarVehiculos} renderItem={renderVehicle} keyExtractor={(item) => item.id} ListHeaderComponent={renderHeader} ListEmptyComponent={renderEmptyList} contentContainerStyle={{paddingBottom: 100 }}/>
        <Pressable style = {styles.plus} onPress={() => setPage('AddVehicle')}>
            <Plus color="#fff" size={30}/>
        </Pressable>
        <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {setModalVisible(false);}}>
            {/* Fondo oscuro semitransparente. Al tocarlo, cierra el modal */}
            <Pressable
            style={styles.modalOverlay}
            onPress={() => setModalVisible(false)}>
                <Pressable style={styles.modalContent} onPress={() => {}}>
                    {/* Usamos SafeAreaView para respetar la barra de estado */}
                    <SafeAreaView>
                    <Text style={styles.modalTitle}>Configuración</Text>
                    
                    {/* Aquí pones tu lista de opciones */}
                    <Pressable style={styles.menuItem}>
                        <Text style={styles.menuItemText}>Mi Perfil</Text>
                    </Pressable>
                    <Pressable style={styles.menuItem}>
                        <Text style={styles.menuItemText}>Notificaciones</Text>
                    </Pressable>
                    <Pressable style={styles.menuItem} onPress={() => {
                        auth.signOut();
                        setModalVisible(false);
                    }}>
                        <Text style={[styles.menuItemText, {color: '#C00'}]}>Cerrar Sesión</Text>
                    </Pressable>
                    {/* Un botón para cerrar (opcional) */}
                    <Pressable
                        style={[styles.inspeccionarBtn, {marginTop: 40, backgroundColor: '#555'}]}
                        onPress={() => setModalVisible(false)}>
                        <Text style={styles.inspeccionarBtnTexto}>Cerrar Menú</Text>
                    </Pressable>
                    </SafeAreaView>
                </Pressable>
            </Pressable>
        </Modal>
    </SafeAreaView>
    )
}

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
    titulo:{
    color: '#1b3d5c',
    fontWeight: '600',
    fontSize: 26,
    },
    //Barra de busqueda
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#1b3d5c',
        paddingHorizontal: 15,
        marginBottom: 20,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 15,
        fontSize: 16,
        color: '#000',
    },
    contenidoVehiculos: {
        paddingTop: 15,
        paddingBottom: 30,
    },
    //Camara
    plus: {
        position: 'absolute',
        bottom: 60,
        right: 30,
        backgroundColor: '#1b3d5c',
        padding: 15,
        borderRadius: 50,
        elevation: 5, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    textoVacio: {
        color: '#1b3d5c', 
        fontSize: 16, 
        textAlign: 'center', 
        marginTop: 20, 
        fontWeight: '500',
        fontFamily: 'RobotoCondensed',
    },
    //
    vehiculoCard: {
        backgroundColor: '#FAFAFA',
        padding: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#EEE',
        marginBottom: 15,
    },
    vehiculoPlaca: {
        color: '#1b3d5c',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'RobotoCondensed',
    },
    vehiculoInfo: {
        color: '#333',
        fontSize: 16,
        fontFamily: 'RobotoCondensed',
        marginTop: 5,
    },
    inspeccionarBtn: {
        backgroundColor: '#1b3d5c',
        padding: 12,
        borderRadius: 5,
        marginTop: 15,
        alignItems: 'center',
    },
    inspeccionarBtnTexto: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'RobotoCondensed',
    },
    // Botón Flotante (FAB)
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#1b3d5c',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8, // Sombra para Android
        shadowColor: '#000', // Sombra para iOS
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b3d5c',
    marginBottom: 25,
    },
    menuItem: {
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    menuItemText: {
        fontSize: 18,
        color: '#333',
        fontFamily: 'RobotoCondensed',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo oscuro semitransparente
    },
    modalContent: {
        position: 'absolute',
        top: 0,
        right: 0, // <-- Se pega a la derecha
        bottom: 0,
        width: '80%', // Ocupa el 80% del ancho de la pantalla
        backgroundColor: '#FFF',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
        width: -2, // Sombra solo a la izquierda
        height: 0,
        },
    },
})

export default Home
