
import React, {useState} from 'react';
import {StyleSheet, Text, Modal, TextInput, View, ScrollView, Pressable, Alert} from 'react-native';
import { SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import { ScreenProps } from '../../App';

const login = ({setPage}: ScreenProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style= {styles.titulo}>CheckFine</Text>
        <View>
          <TextInput style= {styles.input} placeholder='Correo electronico' placeholderTextColor={'#B3B3B4'}></TextInput>
        </View>
        <View>
          <TextInput style= {styles.input} placeholder='Contraseña' placeholderTextColor={'#B3B3B4'}></TextInput>
        </View>
        <Pressable style = {styles.btn}>
          <Text style={styles.btnTexto}>Iniciar Sesión</Text>
        </Pressable>  
        <Text style={styles.subTitulo}>¿Has olvidado tus datos de inicio de sesión? {''}
          <Text style={styles.subTituloBold}>Obtén ayuda.</Text>
        </Text>
        <Pressable onPress={() => setPage('register')}>
          <Text style= {styles.texto}>No tengo una cuenta</Text>
        </Pressable>
        
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    flex: 1,
  },
  titulo: {
    color: '#1b3d5c',
    fontWeight: '700',
    fontSize: 38,
    fontFamily: 'RobotoCondensed',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  input:{
    backgroundColor: '#FFF',
    color: '#000',
    padding: 20,
    borderRadius: 5,
    borderColor: '#1B3D5C',
    borderWidth: 2,
    marginHorizontal: 30,
    marginVertical: 10,
  },
  btn: {
    backgroundColor: '#1B3D5C',
    padding: 20,
    marginVertical: 20,
    marginHorizontal: 30,
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
    marginHorizontal: 30,
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
    color: '#1B3D5C'
  },
});

export default login
