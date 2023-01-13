import React, { useState, useEffect } from 'react';
import Main from '../layout/main';
import { StyleSheet, View, Text, Platform, PermissionsAndroid, ToastAndroid } from 'react-native';
import CustomSwitch from '../custom-elem/switch';

import { globalStyles } from '../../../styles/style';

export default function Settings(prop){
    const [switchStatus, setSwitchStatus] = useState(false);
    const [androidGranted, setAndroidGranted] = useState(false);

    useEffect(() => {
        (async() => {
            if(Platform.OS === 'android'){
                const hasPermissionWrite = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
                const hasPermissionRecord = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
                if(hasPermissionRecord && hasPermissionWrite){
                    setAndroidGranted(true);
                    setSwitchStatus(true);
                }
                else{
                    setAndroidGranted(false);
                    setSwitchStatus(false);
                }
            }
            else{
                setAndroidGranted(true);
                setSwitchStatus(true);
            }
        })();
    }, [prop.route.key]);

    const onChangeHandler = async() => {
        setSwitchStatus(true);
        if(!androidGranted){
            if(Platform.OS === 'android'){
                const RECORD_AUDIO = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
                if(RECORD_AUDIO !== 'granted') ToastAndroid.show('Использование микрофона запрещена', ToastAndroid.LONG);

                const WRITE_EXTERNAL_STORAGE = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
                if(WRITE_EXTERNAL_STORAGE !== 'granted') ToastAndroid.show('Запись в хранилише запрещено', ToastAndroid.LONG);

                const isGranted = WRITE_EXTERNAL_STORAGE === 'granted' && RECORD_AUDIO === 'granted';

                setAndroidGranted(isGranted);
                setSwitchStatus(isGranted);
            }
        }
    };

    return (
        <Main
            title={'Настройки'}
            stepRange={'100%'}
            activeTab={'Settings'}
        >
            <View style={styles.root}>
                <View style={styles.switchWrap}>
                    <Text style={[globalStyles.label, {marginBottom: 0}]}>Разрешить запись аудио</Text>
                    <CustomSwitch onChangeHandler={onChangeHandler} switchStatus={switchStatus}/>
                </View>
                <View style={styles.versionWrap}>
                    <Text style={[styles.version]}>Версия 1.01.1</Text>
                </View>
            </View>
        </Main>
    );
}

const styles = StyleSheet.create({
    root: {
        flexGrow: 1,
        paddingBottom: 100,
        justifyContent: 'space-between',
    },
    switchWrap: {
        marginTop: 15,
        marginBottom: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 44,
        paddingTop: 7,
        paddingBottom: 8
    },
    version: {
        fontSize: 13,
        color: '#000',
    },
    versionWrap: {
        alignItems: 'center',
    }
});
