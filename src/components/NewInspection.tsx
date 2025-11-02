import React, {useEffect, useState} from 'react';
    import {
    StyleSheet,
    Text,
    TextInput,
    View,
    ScrollView,
    Pressable,
    Alert,
    ActivityIndicator,
    Platform
    } from 'react-native';
import {ScreenProps, Damage} from '../../App';
import {Svg, Path} from 'react-native-svg';

import {db, auth, storage, app, functions} from '../../FirebaseConfig';
import {collection, addDoc, serverTimestamp} from 'firebase/firestore';
import { ref, uploadBytesResumable, uploadBytes, getDownloadURL } from "firebase/storage";
import { httpsCallable } from "firebase/functions";
import {SafeAreaView} from 'react-native-safe-area-context';

// --- Iconos (ArrowLeftIcon, PlusIcon, TrashIcon) ---
const ArrowLeftIcon = ({color, size}: {color?: string; size?: number}) => (
    <Svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path stroke="none" d="M0 0h24v24H0z" fill="none" /><Path d="M5 12l14 0" /><Path d="M5 12l6 6" /><Path d="M5 12l6 -6" />
    </Svg>
    );
const PlusIcon = ({color, size}: {color?: string; size?: number}) => (
    <Svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path stroke="none" d="M0 0h24v24H0z" fill="none" /><Path d="M12 5l0 14" /><Path d="M5 12l14 0" />
    </Svg>
    );
const TrashIcon = ({color, size}: {color?: string; size?: number}) => (
    <Svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path stroke="none" d="M0 0h24v24H0z" fill="none"/><Path d="M4 7l16 0" /><Path d="M10 11l0 6" /><Path d="M14 11l0 6" /><Path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><Path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
    </Svg>
    );
const CalculatorIcon = ({ color, size }: { color?: string; size?: number }) => (
    <Svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path stroke="none" d="M0 0h24v24H0z" fill="none"/><Path d="M4 3m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" /><Path d="M8 7m0 1a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v1a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1z" /><Path d="M8 14l0 .01" /><Path d="M12 14l0 .01" /><Path d="M16 14l0 .01" /><Path d="M8 17l0 .01" /><Path d="M12 17l0 .01" /><Path d="M16 17l0 .01" />
    </Svg>
);

// --- Definimos las props específicas para NewInspection ---
interface NewInspectionProps extends ScreenProps {
    currentDamages: Damage[];
    clearDamages: () => void;
    // Función para actualizar la lista desde aquí
    // Esto es necesario para la función 'handleRemoveDamage'
    setDamages: (damages: Damage[]) => void;
    }

    // Definimos la llamada a la Cloud Function
    const getEstimate = httpsCallable(functions, 'generarCotizacion');

    const NewInspection = ({setPage, selectedVehicle, currentDamages, clearDamages, setDamages}: NewInspectionProps) => {
    const [tipoInspeccion, setTipoInspeccion] = useState<'Entrada' | 'Salida' | ''>('');
    const [kilometraje, setKilometraje] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingQuote, setLoadingQuote] = useState(false); // Para cotizar
    const [estimatedCost, setEstimatedCost] = useState<string | null>(null); // Guardará la cotización en TABLA

    if (!selectedVehicle) {
        setPage('Home'); // Navegación Correcta
        return null;
    }

    // (Funciones handleAddDamage, handleRemoveDamage quedan igual)
    const handleAddDamageNavigation = () => {
        setPage('AddDamage');
    };

      // --- Función para ELIMINAR un daño 
    const handleRemoveDamage = (idToRemove: string) => {
        const updatedDamages = currentDamages.filter(dano => dano.id !== idToRemove);
        setDamages(updatedDamages);
    };

    // FUNCIÓN para llamar a la Cloud Function!
    const handleGetEstimate = async () => {
        if (currentDamages.length === 0) {
            Alert.alert("Sin daños", "Agrega al menos un daño para poder cotizar.");
            return;
        }
        if (!tipoInspeccion || !kilometraje) {
            Alert.alert('Datos faltantes', 'Por favor, define el Tipo de Inspección y el Kilometraje para cotizar.');
            return;
        }
        setLoadingQuote(true);
        setEstimatedCost(null);
        try {
            // 1. Preparamos los datos para enviar
            const dataToSend = {
                vehicle: {
                    marca: selectedVehicle.marca,
                    modelo: selectedVehicle.modelo,
                    anio: selectedVehicle.anio,
                },
                damages: currentDamages.map(d => ({
                    tipo: d.tipo,
                    ubicacion: d.ubicacion,
                    comentarios: d.comentarios,
                })),
                kilometraje: kilometraje,
                tipoInspeccion: tipoInspeccion,
            };
            // 2. Llamamos a la Cloud Function 'generarCotizacion'
            console.log("Enviando datos a la IA:", dataToSend);
            const result: any = await getEstimate(dataToSend);
            
            // 3. Recibimos la respuesta (el texto de la tabla)
            const quoteText = result.data.cotizacion;
            console.log("Respuesta de IA recibida:", quoteText);
            
            setEstimatedCost(quoteText); // Guardamos la tabla de texto
            setLoadingQuote(false);
        } catch (error) {
            console.error("Error al cotizar (Cloud Function): ", error);
            setLoadingQuote(false);
            Alert.alert("Error de Cotización", "No se pudo conectar con el servicio de IA.");
        }
    };

  // --- Función para Guardar la Inspección y los Daños ---
    const handleSaveInspection = async () => {
        if (!tipoInspeccion || !kilometraje) { 
            Alert.alert('Error', 'Completar los campos requeridos.')
            return;
        }
        const userId = auth.currentUser?.uid;
        if (!userId) { 
            Alert.alert('Error', 'Usuario no autenticado.');
            return;
        }

        setLoading(true);
        try {
        // Guardar la Inspección (igual que antes)
        const inspeccionesCollectionRef = collection(db, 'inspecciones');
        const inspeccionDocRef = await addDoc(inspeccionesCollectionRef, { // Renombrado a inspeccionDocRef
            vehiculoId: selectedVehicle.id,
            inspectorId: userId,
            fecha: serverTimestamp(),
            tipo: tipoInspeccion,
            kilometraje: parseInt(kilometraje, 10),
        });
        console.log('¡Inspección guardada con ID!', inspeccionDocRef.id);

        // GUARDAR LOS DAÑOS
        // Apuntar a la colección 'danos'
        const danosCollectionRef = collection(db, 'danos');
        // Crear una promesa para cada operación de guardado de daño
        const promises = currentDamages.map(async (dano) => {
            let fotoUrl: string | null = null;
            const uri = dano.fotoUri; // Guardamos en una variable local
            if (uri) { // Comprobamos la variable local
                console.log('Subiendo foto para daño (XHR):', dano.id);
                try {
                    // Convertir URI a Blob con XMLHttpRequest
                    const blob: Blob = await new Promise((resolve, reject) => {
                        const xhr = new XMLHttpRequest();
                        xhr.onload = () => resolve(xhr.response);
                        xhr.onerror = (e) => reject(new TypeError("Network request failed (XHR)"));
                        xhr.responseType = "blob";
                        // Usamos la variable 'uri' que sabemos que es string
                        xhr.open("GET", uri, true);
                        xhr.send(null);
                    });
                    // Crear referencia en Storage (usando 'uri')
                    const fileName = uri.split('/').pop() || `dano-${Date.now()}.jpg`;
                    const storageRef = ref(storage, `danos/${inspeccionDocRef.id}/${Date.now()}-${fileName}`);
                    // Subir el Blob
                    await uploadBytes(storageRef, blob);
                    // Obtener la URL de descarga
                    fotoUrl = await getDownloadURL(storageRef);
                    console.log('Foto subida (XHR), URL:', fotoUrl);
                } catch (uploadError) {
                    console.error(`Error al subir foto para daño ${dano.id} (XHR):`, uploadError);
                    fotoUrl = null;
                }
            } // Fin if (uri)
            // Guardar los datos del daño en Firestore
            return addDoc(danosCollectionRef, {
                inspeccionId: inspeccionDocRef.id,
                vehiculoId: selectedVehicle.id,
                tipo: dano.tipo,
                ubicacion: dano.ubicacion,
                comentarios: dano.comentarios,
                fotoUrl: fotoUrl, // Guardamos la URL (o null)
                creadoEn: serverTimestamp(),
                creadoPor: userId,
            });
        }); // Fin del map

        // Esperar a que TODAS las promesas de guardado de daño terminen
        await Promise.all(promises);
        
        if (currentDamages.length > 0) {
            console.log(`¡${currentDamages.length} daños guardados en Firestore!`);
        }

        Alert.alert('¡Éxito!', 'Inspección y daños registrados.');
        clearDamages(); // Limpiamos la lista temporal en App.tsx
        setPage('VehicleDetail');

        } catch (error) {
        console.error("Error al guardar inspección o daños: ", error);
        Alert.alert('Error', 'No se pudo guardar la inspección completa.');
        setLoading(false); // Solo ponemos setLoading(false) si hay error
        }
    };

    // Renderizado de daño temporal 
    const renderDanoTemporal = (dano: Damage) => ( 
        <View key={dano.id} style={styles.danoCard}>
        <View style={{flex: 1}}>
            <Text style={styles.danoTipo}>
            {dano.tipo} - {dano.ubicacion}
            </Text>
            <Text style={styles.danoComentario}>{dano.comentarios}</Text>
            {/* Ahora SÍ reconoce item.fotoUri */}
            {dano.fotoUri && <Text style={styles.fotoIndicator}>📷 Foto adjunta</Text>}
        </View>
        <Pressable onPress={() => handleRemoveDamage(dano.id)} style={styles.removeButton}>
            <TrashIcon color="#E74C3C" size={20} />
        </Pressable>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
            <Pressable onPress={() => setPage('VehicleDetail')} style={styles.backButton}>
            <ArrowLeftIcon color="#1b3d5c" size={28} />
            </Pressable>
            <Text style={styles.titulo}>Nueva Inspección</Text>
            <View style={{width: 40}} />
        </View>

            {/* ScrollView */}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Info Vehículo */}
                <Text style={styles.infoVehiculo}>
                    Vehículo: {selectedVehicle.marca} {selectedVehicle.modelo} ({selectedVehicle.placa})
                </Text>

                {/* Tipo Inspección */}
                <Text style={styles.label}>Tipo de Inspección</Text>
                <View style={styles.tipoContainer}>
                    <Pressable
                        style={[styles.tipoButton, tipoInspeccion === 'Entrada' && styles.tipoButtonSelected]}
                        onPress={() => setTipoInspeccion('Entrada')}>
                        <Text style={[styles.tipoButtonText, tipoInspeccion === 'Entrada' && styles.tipoButtonTextSelected]}>Entrada</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.tipoButton, tipoInspeccion === 'Salida' && styles.tipoButtonSelected]}
                        onPress={() => setTipoInspeccion('Salida')}>
                        <Text style={[styles.tipoButtonText, tipoInspeccion === 'Salida' && styles.tipoButtonTextSelected]}>Salida</Text>
                    </Pressable>
                </View>

                {/* Kilometraje */}
                <Text style={styles.label}>Kilometraje Actual</Text>
                <TextInput
                style={styles.input}
                placeholder="Ej. 15000"
                placeholderTextColor="#B3B3B4"
                value={kilometraje}
                onChangeText={setKilometraje}
                keyboardType="numeric"
                />

                {/* Sección de Daños */}
                <View style={styles.danosSection}>
                    <Text style={styles.label}>Registro de Daños</Text>
                    {/* Usamos .map para mostrar los daños actuales */}
                    {currentDamages.length === 0 ? (
                        <Text style={styles.noDanosText}>No se han registrado daños aún.</Text>
                    ) : (
                        // Mapeamos directamente el array
                        currentDamages.map(renderDanoTemporal)
                    )}
                {/* Botón Agregar Daño */}
                    <Pressable style={styles.btnAddDano} onPress={handleAddDamageNavigation}>
                        <PlusIcon color="#1b3d5c" size={20} />
                        <Text style={styles.btnAddDanoText}>Agregar Daño</Text>
                    </Pressable>
                </View>
                {/* Sección Cotización */}
                <View style={styles.cotizadorSection}>
                    <Text style={styles.label}>Cotizador (IA)</Text>
                    <Pressable 
                        style={[styles.btnCalcular, (currentDamages.length === 0 || loadingQuote) && styles.btnCalcularDisabled]} 
                        onPress={handleGetEstimate} 
                        disabled={currentDamages.length === 0 || loadingQuote}
                    >
                        <CalculatorIcon color={(currentDamages.length === 0 || loadingQuote) ? "#AAA" : "#1b3d5c"} size={20} />
                        {loadingQuote ? (
                            <Text style={styles.btnCalcularText}>Generando cotización...</Text>
                        ) : (
                            <Text style={styles.btnCalcularText}>Cotizar Daños (IA)</Text>
                        )}
                    </Pressable>

                    {/* Mostramos el spinner mientras carga la IA */}
                    {loadingQuote && <ActivityIndicator size="small" color="#1b3d5c" style={{marginTop: 15}} />}

                    {/* Mostramos la cotización (la tabla de texto) */}
                    {estimatedCost && !loadingQuote && (
                        <View style={styles.quoteResultContainer}>
                            <Text style={styles.quoteResultText}>{estimatedCost}</Text>
                        </View>
                    )}
                </View>
                    <Pressable
                    onPress={async () => {
                        try {
                        const testData = {
                            vehicle: { marca: "Toyota", modelo: "Camry", anio: "2025" },
                            damages: [{ tipo: "Golpe", ubicacion: "Cajuela", comentarios: "Fuerte" }],
                            kilometraje: "5000",
                            tipoInspeccion: "Entrada"
                        };
                        const result: any = await getEstimate(testData);
                        console.log("✅ Resultado Cloud Function:", result.data);
                        Alert.alert("Éxito", "Función ejecutada correctamente.");
                        } catch (error: any) {
                        console.error("❌ Error al llamar la función:", error);
                        Alert.alert("Error", error.message);
                        }
                    }}
                    style={{ padding: 15, backgroundColor: "#1b3d5c", margin: 20, borderRadius: 10 }}
                    >
                    <Text style={{ color: "white", textAlign: "center" }}>Probar función Firebase</Text>
                    </Pressable>
                {/* Botón Guardar */}
                <Pressable
                style={styles.btnGuardar}
                onPress={handleSaveInspection}
                disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={styles.btnGuardarTexto}>Guardar Inspección</Text>
                )}
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
    };

    // --- Estilos (sin cambios necesarios) ---
    const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    backButton: { padding: 5 },
    titulo: { color: '#1b3d5c', fontWeight: '600', fontSize: 22, fontFamily: 'RobotoCondensed' },
    scrollContainer: { padding: 20, paddingBottom: 40 }, // Aumentar padding inferior por si acaso
    infoVehiculo: { fontSize: 16, color: '#555', marginBottom: 20, fontFamily: 'RobotoCondensed', textAlign: 'center' },
    label: { fontSize: 18, color: '#1b3d5c', fontWeight: '600', marginBottom: 10, fontFamily: 'RobotoCondensed' },
    tipoContainer: { flexDirection: 'row', marginBottom: 20 },
    tipoButton: { flex: 1, padding: 15, borderRadius: 8, borderWidth: 1.5, borderColor: '#B3B3B4', alignItems: 'center', marginRight: 10 },
    tipoButtonSelected: { backgroundColor: '#1b3d5c', borderColor: '#1b3d5c' },
    tipoButtonText: { fontSize: 16, color: '#555', fontFamily: 'RobotoCondensed', fontWeight: '500' },
    tipoButtonTextSelected: { color: '#FFF' },
    input: { color: '#000', backgroundColor: '#FFF', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 8, borderColor: '#B3B3B4', borderWidth: 1.5, marginBottom: 20, fontSize: 16, fontFamily: 'RobotoCondensed' },
    danosSection: { marginTop: 20, marginBottom: 30, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 20 },
    noDanosText: { color: '#888', textAlign: 'center', fontStyle: 'italic', marginBottom: 15, fontFamily: 'RobotoCondensed' },
    danoCard: { flexDirection: 'row', backgroundColor: '#F9F9F9', padding: 15, borderRadius: 8, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
    danoTipo: { fontSize: 16, fontWeight: 'bold', color: '#333', fontFamily: 'RobotoCondensed' },
    danoComentario: { fontSize: 14, color: '#666', marginTop: 3, fontFamily: 'RobotoCondensed' },
    removeButton: { padding: 8, marginLeft: 10 },
    btnAddDano: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 8, borderWidth: 1.5, borderColor: '#1b3d5c', marginTop: 10 },
    btnAddDanoText: { color: '#1b3d5c', fontSize: 16, fontWeight: '600', marginLeft: 8, fontFamily: 'RobotoCondensed' },
    btnGuardar: { backgroundColor: '#1b3d5c', padding: 18, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    btnGuardarTexto: { color: '#FFF', fontSize: 18, fontWeight: '900', fontFamily: 'RobotoCondensed' },
    fotoIndicator: {
    fontSize: 12,
    color: 'blue',
    fontStyle: 'italic',
    marginTop: 3,
    fontFamily: 'RobotoCondensed',
},
    cotizadorSection: {
        marginTop: 20,
        marginBottom: 30,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingTop: 20,
        alignItems: 'center',
    },
    btnCalcular: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#1b3d5c',
        backgroundColor: '#EAF0F6',
    },
    btnCalcularDisabled: {
        borderColor: '#AAA',
        backgroundColor: '#FAFAFA',
    },
    btnCalcularText: {
        color: '#1b3d5c',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
        fontFamily: 'RobotoCondensed',
    },
    quoteResultContainer: { // Para mostrar la tabla
        marginTop: 15,
        padding: 15,
        backgroundColor: '#F9F9F9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#EEE',
        width: '100%', // Ocupa todo el ancho
    },
    quoteResultText: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', // ¡Mejor para tablas!
        fontSize: 12,
        color: '#333',
    },
    });

export default NewInspection;

