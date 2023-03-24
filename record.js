import React, { useState, useEffect, useContext } from 'react'
import {
    StyleSheet,
    View,
    Text,
    PermissionsAndroid,
    Platform,
    TouchableOpacity,
    ToastAndroid,

} from 'react-native'
import Btn from '../custom-elem/button'
import Subtitle from '../custom-elem/subtitle'
import Main from '../layout/main'
import Progress from '../custom-elem/progress'
import IcoRecord from '../custom-elem/icoRecord'
import RNFS from 'react-native-fs'

import AudioRecorderPlayer, {
    AVEncoderAudioQualityIOSType,
    AVEncodingOption,
    AudioEncoderAndroidType,
    AudioSourceAndroidType,
} from 'react-native-audio-recorder-player'

import RNFetchBlob from 'rn-fetch-blob'

import { globalStyles } from '../../../styles/style'
import notifee, { AndroidNotificationSetting } from "@notifee/react-native"
import { Context } from "../context"
import { Result } from "../../helpers/classes"

const audioRecorderPlayer = new AudioRecorderPlayer()
audioRecorderPlayer.setSubscriptionDuration(1)

export default function Record({navigation, route}) {
    const {listAlarms, setAlarms, YandexMetrica} = useContext(Context)
    const {data} = route.params && route.params
    const [start, setStart] = useState(false)
    const [duration, setDuration] = useState(0)
    const [granted, setAndroidGranted] = useState(false)
    const [id, setId] = useState(String(Date.now()))

    useEffect(() => {
        navigation.addListener('focus', () => {
            setId(String(Date.now()))
        })
    }, [navigation])

    useEffect(() => {
        if (duration > 14) onStopRecord()
    }, [duration])

    useEffect(() => {
        (async () => {
            if (Platform.OS === 'android') {
                const settings = await notifee.getNotificationSettings()
                if (settings.android.alarm !== AndroidNotificationSetting.ENABLED) {
                    await notifee.openAlarmPermissionSettings()
                }
                const hasPermissionWrite = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
                const hasPermissionRecord = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)

                if (hasPermissionRecord && hasPermissionWrite) {
                    setAndroidGranted(true)
                } else {
                    setAndroidGranted(false)
                }
            } else {
                setAndroidGranted(true)
            }
        })()
    }, [])

    const onStartRecord = async () => {

        if (!granted) {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)

                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    ToastAndroid.show('Использование микрофона запрещено', ToastAndroid.LONG)
                    return false
                }
            }

            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)

                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    ToastAndroid.show('Запись в хранилище запрещено', ToastAndroid.LONG)
                    return false
                }
            }

            setAndroidGranted(true)
        } else {

            if (!data && route.params.uri) {
                let exists = await RNFS.exists(route.params.uri)

                if (exists) {
                    await RNFS.unlink(route.params.uri)
                    await notifee.cancelTriggerNotifications([route.params.id, `r${route.params.id}`])
                    const filtersdList = listAlarms.filter(item => item.id !== route.params.id)
                    const updateArr = filtersdList ? [...filtersdList] : []
                    setAlarms(updateArr)
                    YandexMetrica.reportEvent('change_record')
                }
            }
            setStart(true)

            const path = Platform.OS === 'android' ? `${RNFetchBlob.fs.dirs.DocumentDir}/${id}.mp3` : `file://alarms/${id}.m4a`

            const audioSet = {
                AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
                AudioSourceAndroid: AudioSourceAndroidType.MIC,
                AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
                AVNumberOfChannelsKeyIOS: 2,
                AVFormatIDKeyIOS: AVEncodingOption.aac,
            }
            await audioRecorderPlayer.startRecorder(path, audioSet)
            audioRecorderPlayer.addRecordBackListener((e) => {
                setDuration((prev) => +prev + 1)
            })
        }
    }

    const onStopRecord = async () => {
        if (duration < 3) return
        setStart(false)
        const result = await audioRecorderPlayer.stopRecorder()
        audioRecorderPlayer.removeRecordBackListener()

        const obj = new Result(
          data ? data.time : route.params.time,
          data ? data.title : route.params.title,
          data ? data.description : route.params.description,
          data ? data.repeatStatus : route.params.repeatStatus,
          result,
          data ? data.alarmStatus : route.params.alarmStatus,
          data ? id : route.params.id,
          duration,
          !Boolean(data)
        )
        if (result !== 'Already stopped') {
            navigation.navigate('Result', {
                  ...obj
              }
            )
        }
        setDuration(0)

    }

    return (
      <Main
        title={!start ? 'Начнем запись?' : 'Пожалуйста, говорите:)'}
        stepRange={'30%'}
        activeTab={'Record'}
      >
          <Subtitle
            partBlue={!start ? 'Нажмите на микрофон,' : 'Пожелайте себе,'}
            partBlack={!start ? 'чтобы записать аудио' : ' самого доброго утра!'}
          />
          <View style={styles.root}>
              {
                  !start
                    ? <TouchableOpacity onPress={() => onStartRecord()}>
                        <IcoRecord />
                    </TouchableOpacity>

                    : <Progress fill={6.666 * duration} lastTime={15 - duration} />
              }
              <View>
                  <View style={start && styles.start}>
                      <Btn
                        title={!start ? 'Начать запись аудио' : 'Остановить запись...'}
                        handlePress={!start ? () => onStartRecord() : () => onStopRecord()}
                        isDisabled={Boolean(start)}
                      />
                  </View>
                  {
                      !start
                        ? <View style={styles.wrap}>
                            <View style={[globalStyles.subTitleWrap, globalStyles.borderBottomNone, {paddingBottom: 0}]}>
                                <Text style={[globalStyles.subtitle, styles.text]}>
                                    <Text style={{color: 'black'}}>Запись начинается с 3 секунд</Text>
                                </Text>
                            </View>
                        </View>
                        : null
                  }
              </View>
          </View>
      </Main>
    )
}

const styles = StyleSheet.create({

    root: {
        justifyContent: 'space-around',
        flexGrow: 1
    },

    wrap: {
        marginTop: 24,
        marginBottom: 24,
        height: 50
    },
    start: {
        marginBottom: 100
    },
    text: {
        flexDirection: 'row',
        flexGrow: 1,
        textAlign: 'center'
    }
})
