import React, { useState, useMemo} from 'react';
import { StyleSheet, Text, TextInput, View, ScrollView, Pressable, Alert, Image} from 'react-native';
import { ScreenProps, Damage } from '../../App'; 
import { Svg, Path } from 'react-native-svg';
import { launchCamera, CameraOptions, ImagePickerResponse } from 'react-native-image-picker';
import {SafeAreaView} from 'react-native-safe-area-context';
import { CarDiagram, VehiclePart } from './CarDiagrama';

// --- Icono ArrowLeftIcon ---
const ArrowLeftIcon = ({ color, size }: { color?: string; size?: number }) => (
    <Svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path stroke="none" d="M0 0h24v24H0z" fill="none" /><Path d="M5 12l14 0" /><Path d="M5 12l6 6" /><Path d="M5 12l6 -6" />
    </Svg>
    );
// --- Icono Camera ---
const CameraIcon = ({ color, size }: { color?: string; size?: number }) => (
    <Svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path stroke="none" d="M0 0h24v24H0z" fill="none"/><Path d="M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2" /><Path d="M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
    </Svg>
);
// --- Icono XCircle ---
const XCircleIcon = ({ color, size }: { color?: string; size?: number }) => (
    <Svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <Path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
        <Path d="M10 10l4 4m0 -4l-4 4" />
    </Svg>
);

// Seccion de partes del vehiculo para el diagrama
// Mapeo de los IDs nombres de las partes del vehiculo
const PartesToAreaMap: Record<VehiclePart, string> = {
  'hood': 'Cofre', 'windshield': 'Parabrisas', 'roof': 'Techo', 'trunk': 'Cajuela',
  'front_bumper': 'Defensa Del.', 'rear_bumper': 'Defensa Tras.',
  'front_left_door': 'Puerta Del. Izq.', 'rear_left_door': 'Puerta Tras. Izq.',
  'front_right_door': 'Puerta Del. Der.', 'rear_right_door': 'Puerta Tras. Der.',
  'front_left_headlight': 'Faro Del. Izq.', 'front_right_headlight': 'Faro Del. Der.',
  'rear_left_headlight': 'Calavera Tras. Izq.', 'rear_right_headlight': 'Calavera Tras. Der.',
  'front_left_tire': 'Llanta Del. Izq.', 'front_right_tire': 'Llanta Del. Der.',
  'rear_left_tire': 'Llanta Tras. Izq.', 'rear_right_tire': 'Llanta Tras. Der.',
};


const AddDamage = ({ setPage, addDamageToList }: ScreenProps) => {
    // Estados para este formulario
    const [tipoDano, setTipoDano] = useState('');
    const [ubicacion, setUbicacion] = useState('');
    const [comentarios, setComentarios] = useState('');
    const [fotoUri, setFotoUri] = useState<string | null>(null); // Guardará la URI de la foto
    const [selectedParts, setSelectedParts] = useState<VehiclePart[]>([]);

    // Funcion para manejar la seleccion de partes en el diagrama
    const handlePartClick = (partId: VehiclePart) => {
        setSelectedParts((prev) =>
        prev.includes(partId) ? prev.filter((p) => p !== partId) : [...prev, partId]
        );
    };

    const handleClearSelection = () => {
        setSelectedParts([]); // Simplemente vacía el array
    };

    // Calculamos los nombres de áreas seleccionadas
    const uniqueDamagedAreas = useMemo(() => {
        return selectedParts.map((part) => PartesToAreaMap[part]).filter(Boolean);
    }, [selectedParts]);
    
    // --- Función para tomar la foto ---
    const handleTakePhoto = () => {
        const options: CameraOptions = {
        mediaType: 'photo', // Para fotos
        quality: 0.7, // Comprimir un poco la imagen (0 a 1)
        saveToPhotos: false, // No guardar en la galería pública por defecto
        // cameraType: 'back', // Usar cámara trasera
        };

        launchCamera(options, (response: ImagePickerResponse) => {
        if (response.didCancel) {
            console.log('Usuario canceló la cámara');
        } else if (response.errorCode) {
            console.error('Error de ImagePicker: ', response.errorMessage);
            Alert.alert('Error', 'No se pudo abrir la cámara.');
        } else if (response.assets && response.assets.length > 0) {
            // ¡Éxito! response.assets es un array, tomamos la primera foto
            const uri = response.assets[0].uri;
            if (uri) {
            console.log('URI de la foto:', uri);
            setFotoUri(uri); // Guardamos la URI local en el estado
            }
        }
        });
    };

    // --- Función para Guardar el Daño (Temporalmente) ---
    const handleSaveDamage = () => {
        const ubicacionString = uniqueDamagedAreas.join(', ')

        if (!tipoDano || selectedParts.length === 0) {
        Alert.alert('Campos requeridos', 'Por favor, indica el tipo y selecciona el área dañada en el diagrama.');
        return;
        }
        
        // Creamos el objeto Damage con los datos del formulario
        const nuevoDano: Damage = {
        id: Math.random().toString(), // ID temporal
        tipo: tipoDano,
        ubicacion: ubicacionString,
        comentarios: comentarios,
        fotoUri: fotoUri || undefined, // Guardamos la URI si existe
        };

        // Verificamos si la función existe antes de llamarla
        if (addDamageToList) {
            addDamageToList(nuevoDano); 
        } else {
            // Opcional: Avisar si la función no se pasó (no debería pasar)
            console.error("Error: addDamageToList no fue proporcionado.");
            Alert.alert("Error", "No se pudo agregar el daño.");
            return; // Detenemos la ejecución si no podemos agregar
        }
        // Regresamos a la pantalla anterior
        setPage('NewInspection'); 
    };

    return (
        <SafeAreaView style={styles.container}>
        {/* --- Header --- */}
        <View style={styles.header}>
            <Pressable onPress={() => setPage('NewInspection')} style={styles.backButton}>
            <ArrowLeftIcon color="#1b3d5c" size={28} />
            </Pressable>
            <Text style={styles.titulo}>Agregar Daño</Text>
            <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* --- Tipo de Daño --- */}
            <Text style={styles.label}>Tipo de Daño</Text>
            <TextInput
            style={styles.input}
            placeholder="Ej. Rayón, Abolladura, Golpe, Interior"
            placeholderTextColor="#B3B3B4"
            value={tipoDano}
            onChangeText={setTipoDano}
            />
            {/* --- Ubicación --- */}
            <View style={styles.labelContainer}>
                <Text style={styles.labelEliminar}>Ubicación</Text>
                {/* Mostramos el botón solo si hay algo seleccionado */}
                {selectedParts.length > 0 && (
                    <Pressable style={styles.clearButton} onPress={handleClearSelection}>
                        <XCircleIcon color="#D9534F" size={16} />
                        <Text style={styles.clearButtonText}>Limpiar</Text>
                    </Pressable>
                )}
            </View>
            <View style={styles.svgContainer}>
                <CarDiagram selectedParts={selectedParts} onPartClick={handlePartClick} height={220}/>
            </View>
            <View style={styles.selectedAreasContainer}>
                {uniqueDamagedAreas.length > 0 ? (
                    uniqueDamagedAreas.map(area => (
                        <Text key={area} style={styles.selectedAreaBadge}>{area}</Text>
                    ))
                ) : (
                    <Text style={styles.noSelectionText}>Ninguna área seleccionada.</Text>
                )}
            </View>
            {/* <TextInput
            style={styles.input}
            placeholder="Ej. Puerta delantera izquierda, Cofre"
            placeholderTextColor="#B3B3B4"
            value={ubicacion}
            onChangeText={setUbicacion}
            /> */}

            {/* --- Comentarios --- */}
            <Text style={styles.label}>Comentarios (Opcional)</Text>
            <TextInput
            style={[styles.input, styles.textArea]} // Estilo para hacerlo más alto
            placeholder="Describe el daño..."
            placeholderTextColor="#B3B3B4"
            value={comentarios}
            onChangeText={setComentarios}
            multiline={true} // Permite múltiples líneas
            numberOfLines={4} // Altura inicial sugerida
            />

            {/* --- Foto --- */}
            <Text style={styles.label}>Fotografía</Text>
            {/* Mostramos la VISTA PREVIA primero si ya hay foto */}
            {fotoUri ? (
            <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: fotoUri }} style={styles.photoPreview} resizeMode="cover" />
                <Pressable onPress={() => setFotoUri(null)} style={styles.removePhotoBtn}>
                    <Text style={styles.removePhotoText}>X</Text>
                </Pressable>
            </View>
            ) : (
            // Si NO hay foto, mostramos el botón para tomarla
            <Pressable style={styles.photoButton} onPress={handleTakePhoto}>
                <CameraIcon color="#1b3d5c" size={24} />
                <Text style={styles.photoButtonText}>Tomar Foto</Text>
            </Pressable>
            )}

            {/* --- Botón de Guardar Daño --- */}
            <Pressable
            style={styles.btnGuardar}
            onPress={handleSaveDamage}
            // disabled={loading} // No hay 'loading' aquí, es instantáneo
            >
            <Text style={styles.btnGuardarTexto}>Guardar Daño</Text>
            </Pressable>

        </ScrollView>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    backButton: { padding: 5 },
    titulo: { color: '#1b3d5c', fontWeight: '600', fontSize: 22, fontFamily: 'RobotoCondensed' },
    scrollContainer: { padding: 20 },
    label: { fontSize: 18, color: '#1b3d5c', fontWeight: '600', marginBottom: 10, fontFamily: 'RobotoCondensed' },
    input: { color: '#000', backgroundColor: '#FFF', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 8, borderColor: '#B3B3B4', borderWidth: 1.5, marginBottom: 20, fontSize: 16, fontFamily: 'RobotoCondensed' },
    textArea: {
        height: 100, // Altura inicial para comentarios
        textAlignVertical: 'top', // Para que el texto empiece arriba en Android
    },
    photoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#1b3d5c',
        marginBottom: 20,
    },
    photoButtonText: {
        color: '#1b3d5c',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
        fontFamily: 'RobotoCondensed',
    },
    photoPreviewContainer: {
        position: 'relative', // Para posicionar el botón de borrar
        marginBottom: 20,
        alignItems: 'center',
    },
    photoPreview: {
        width: '100%',
        height: 200, // Ajusta la altura como necesites
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#EEE'
    },
    removePhotoBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removePhotoText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        lineHeight: 20, // Ajuste para centrar la X
    },
    btnGuardar: { backgroundColor: '#1b3d5c', padding: 18, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    btnGuardarTexto: { color: '#FFF', fontSize: 18, fontWeight: '900', fontFamily: 'RobotoCondensed' },
        svgContainer: {
        alignItems: 'center',
        marginBottom: 15,
        paddingVertical: 10, // Añadir padding vertical
        borderWidth: 1,
        borderColor: '#EEE',
        borderRadius: 8,
        backgroundColor: '#F9F9F9', // Fondo suave
    },
    selectedAreasContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
        minHeight: 30,
    },
    selectedAreaBadge: {
        backgroundColor: '#D9534F', // Rojo
        color: 'white',
        paddingHorizontal: 12, // Más padding
        paddingVertical: 6,
        borderRadius: 15,
        marginRight: 8, // Más espacio
        marginBottom: 8,
        fontSize: 14,
        fontFamily: 'RobotoCondensed',
        overflow: 'hidden',
        fontWeight: '500', // Un poco más grueso
    },
    noSelectionText: {
        fontSize: 14,
        color: '#888',
        fontStyle: 'italic',
        fontFamily: 'RobotoCondensed',
    },
        labelContainer: { // Nuevo contenedor para el label y el botón
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    labelEliminar: { // Quitado marginBottom
        fontSize: 18,
        color: '#1b3d5c',
        fontWeight: '600',
        fontFamily: 'RobotoCondensed',
    },
    clearButton: { // Nuevo estilo
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 5,
        backgroundColor: '#FEE2E2', // Fondo rojo claro
    },
    clearButtonText: { // Nuevo estilo
        color: '#D9534F', // Texto rojo
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
        fontFamily: 'RobotoCondensed',
    },
});

export default AddDamage;
