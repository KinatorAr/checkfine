import React, {useState} from 'react';
import {StyleSheet, Text, Modal, TextInput, View, ScrollView, Pressable, Alert} from 'react-native';
import { SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import { ScreenProps } from '../../App';

const register = ({setPage}: ScreenProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.titulo}>Crear una cuenta</Text>
        <View style={styles.seccionUno}>
          <TextInput style={[styles.input, styles.seccionUnoItem]} placeholder='Nombre(s)' placeholderTextColor={'#B3B3B4'}></TextInput>
          <TextInput style={[styles.input, styles.seccionUnoItem]} placeholder='Apellido P.' placeholderTextColor={'#B3B3B4'}></TextInput>
        </View>
        <View>
          <TextInput style={styles.input} placeholder='Correo eletronico' placeholderTextColor={'#B3B3B4'}></TextInput>
        </View>
        <View>
          <TextInput style={styles.input} placeholder='Nueva' placeholderTextColor={'#B3B3B4'}></TextInput>
        </View>
        <Text style={styles.subTitulo}>Fecha de nacimiento</Text>
        <View style={styles.seccionDos}>
          <TextInput style={[styles.input, styles.SeccionDosItem]} placeholder='Dia' placeholderTextColor={'#B3B3B4'}></TextInput>
          <TextInput style={[styles.input, styles.SeccionDosItem]} placeholder='Mes' placeholderTextColor={'#B3B3B4'}></TextInput>
          <TextInput style={[styles.input, styles.SeccionDosItem]} placeholder='Año' placeholderTextColor={'#B3B3B4'}></TextInput>
        </View>
        <Pressable style={styles.btn}>
          <Text style={styles.btnTexto}>Registrarse</Text>
        </Pressable>
        <Pressable onPress={() => setPage('login')}>
          <Text style= {styles.texto}>Ya tengo una cuenta</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    flex: 1,
    paddingLeft: 40,
    paddingRight: 40,

  },
    titulo: {
    color: '#1b3d5c',
    fontWeight: '700',
    fontSize: 38,
    fontFamily: 'RobotoCondensed',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 20,
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
    padding: 20,
    marginVertical: 10,
  },
  btnTexto: {
    color: '#FFF',
    fontFamily: 'RobotoCondensed',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 900
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
    paddingTop: 10
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
  seccionDos:{
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexBasis: '50%',
  },
  SeccionDosItem:{
    width: '30%',
  }
});

export default register
