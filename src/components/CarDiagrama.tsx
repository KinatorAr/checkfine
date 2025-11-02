import React from 'react';
import { Svg, Path, Circle, G } from 'react-native-svg';

// Definimos el tipo con TODAS las partes del SVG
export type VehiclePart =
    | 'hood' | 'windshield' | 'roof' | 'trunk'
    | 'front_bumper' | 'rear_bumper'
    | 'front_left_door' | 'rear_left_door'
    | 'front_right_door' | 'rear_right_door'
    | 'front_left_headlight' | 'front_right_headlight'
    | 'rear_left_headlight' | 'rear_right_headlight'
    | 'front_left_tire' | 'front_right_tire'
    | 'rear_left_tire' | 'rear_right_tire';

type CarDiagramProps = {
    selectedParts: VehiclePart[];
    onPartClick: (part: VehiclePart) => void;
    width?: number | string; // Permitir ancho customizado
    height?: number | string; // Permitir alto customizado
};

export const CarDiagram = ({
    selectedParts,
    onPartClick,
    width = "100%", // Ancho por defecto
    height = 200    // Alto por defecto
}: CarDiagramProps) => {

// Función para determinar el color de relleno
    const getFillColor = (part: VehiclePart) => {
        return selectedParts.includes(part) ? '#D9534F' : '#D1D5DB'; // Rojo si está seleccionado, Gris si no
    };

    // Colores base (puedes ajustarlos)
    const bodyFill = '#E5E7EB'; // Gris claro para el cuerpo
    const bodyStroke = '#4B5563'; // Gris oscuro para el borde
    const partStroke = '#6B7280'; // Gris medio para bordes de partes

return (
    // Usamos Svg de react-native-svg
    <Svg width={width} height={height} viewBox="0 0 200 100">
        <G>
            {/* Cuerpo del auto (no clickeable) */}
            <Path
            fill={bodyFill}
            stroke={bodyStroke}
            strokeWidth={0.5}
            d="M 50,5 H 150 C 155,5 155,10 150,10 L 160,20 L 165,25 V 75 L 160,80 L 150,90 C 155,90 155,95 150,95 H 50 C 45,95 45,90 50,90 L 40,80 L 35,75 V 25 L 40,20 L 50,10 C 45,10 45,5 50,5 Z"
            />

            {/* --- PARTES CLICKEABLES --- */}
            {/* Usamos onPress en lugar de onClick */}
            <Path id="hood" fill={getFillColor('hood')} stroke={partStroke} strokeWidth={0.5} onPressIn={() => onPartClick('hood')} d="M 55,12 H 145 L 155,22 H 45 Z" />
            <Path id="windshield" fill={getFillColor('windshield')} stroke={partStroke} strokeWidth={0.5} onPressIn={() => onPartClick('windshield')} d="M 155,23 H 45 L 50,33 H 150 Z" />
            <Path id="roof" fill={getFillColor('roof')} stroke={partStroke} strokeWidth={0.5} onPressIn={() => onPartClick('roof')} d="M 51,34 H 149 L 146,66 H 54 Z" />
            <Path id="trunk" fill={getFillColor('trunk')} stroke={partStroke} strokeWidth={0.5} onPressIn={() => onPartClick('trunk')} d="M 55,67 H 145 L 140,77 H 60 Z" />

            <Path id="front_bumper" fill={getFillColor('front_bumper')} stroke={partStroke} strokeWidth={0.5} onPressIn={() => onPartClick('front_bumper')} d="M 50,5 H 150 C 155,5 155,10 150,10 H 50 C 45,10 45,5 50,5 Z" />
            <Path id="rear_bumper" fill={getFillColor('rear_bumper')} stroke={partStroke} strokeWidth={0.5} onPressIn={() => onPartClick('rear_bumper')} d="M 50,95 H 150 C 155,95 155,90 150,90 H 50 C 45,90 45,95 50,95 Z" />

            <Path id="front_left_door" fill={getFillColor('front_left_door')} stroke={partStroke} strokeWidth={0.5} onPressIn={() => onPartClick('front_left_door')} d="M 44,23 L 38,26 V 48 L 51,49 V 33 Z" />
            <Path id="rear_left_door" fill={getFillColor('rear_left_door')} stroke={partStroke} strokeWidth={0.5} onPressIn={() => onPartClick('rear_left_door')} d="M 38,50 V 74 L 44,77 L 54,76 V 50 Z" />
            <Path id="front_right_door" fill={getFillColor('front_right_door')} stroke={partStroke} strokeWidth={0.5} onPressIn={() => onPartClick('front_right_door')} d="M 156,23 L 162,26 V 48 L 149,49 V 33 Z" />
            <Path id="rear_right_door" fill={getFillColor('rear_right_door')} stroke={partStroke} strokeWidth={0.5} onPressIn={() => onPartClick('rear_right_door')} d="M 162,50 V 74 L 156,77 L 146,76 V 50 Z" />

            <Path id="front_left_headlight" fill={getFillColor('front_left_headlight')} stroke={partStroke} strokeWidth={0.5} onPressIn={() => onPartClick('front_left_headlight')} d="M 40,11 H 50 V 19 H 42 Z" />
            <Path id="front_right_headlight" fill={getFillColor('front_right_headlight')} stroke={partStroke} strokeWidth={0.5} onPressIn={() => onPartClick('front_right_headlight')} d="M 160,11 H 150 V 19 H 158 Z" />
            <Path id="rear_left_headlight" fill={getFillColor('rear_left_headlight')} stroke={partStroke} strokeWidth={0.5} onPressIn={() => onPartClick('rear_left_headlight')} d="M 40,89 H 50 V 81 H 42 Z" />
            <Path id="rear_right_headlight" fill={getFillColor('rear_right_headlight')} stroke={partStroke} strokeWidth={0.5} onPressIn={() => onPartClick('rear_right_headlight')} d="M 160,89 H 150 V 81 H 158 Z" />

            {/* Usamos Circle de react-native-svg */}
            <Circle id="front_left_tire" fill={getFillColor('front_left_tire')} stroke={partStroke} strokeWidth={0.5} onPressIn={() => onPartClick('front_left_tire')} cx="33" cy="25" r="5" />
            <Circle id="front_right_tire" fill={getFillColor('front_right_tire')} stroke={partStroke} strokeWidth={0.5} onPressIn={() => onPartClick('front_right_tire')} cx="167" cy="25" r="5" />
            <Circle id="rear_left_tire" fill={getFillColor('rear_left_tire')} stroke={partStroke} strokeWidth={0.5} onPressIn={() => onPartClick('rear_left_tire')} cx="33" cy="75" r="5" />
            <Circle id="rear_right_tire" fill={getFillColor('rear_right_tire')} stroke={partStroke} strokeWidth={0.5} onPressIn={() => onPartClick('rear_right_tire')} cx="167" cy="75" r="5" />
        </G>
    </Svg>
    );
};
