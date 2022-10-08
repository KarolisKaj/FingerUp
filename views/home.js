import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import colorStyles from '../styles/colorStyles'
import storage from '../services/storage'

export default class Home extends Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        // do stuff while splash screen is shown
        // After having done stuff (such as async tasks) hide the splash screen
        // SplashScreen.hide();
    }

    render() {
        return (
            <ImageBackground source={require('../assets/beach_image.png')} style={styles.bckgrndImage}>
                <View style={styles.container}>
                    <View style={styles.textContainer}>
                        <Text style={styles.welcome}>Hello! Pick saved player or create one!</Text>
                    </View>
                    <View style={styles.gamesContainer}>
                        <TouchableOpacity style={styles.button} onPress={() => {
                            // TOOD: need to improve and allow localstorage persistance
                            // id = storage.createPlayer("John")
                            // storage.setActivePlayer(id)
                        }}>
                            <View style={styles.innerBtnView}  >
                                <Image style={styles.innerBtnImage} source={require('../assets/edit.png')} />
                                <Text style={styles.innerBtnText}>Create Player</Text>
                            </View>
                        </TouchableOpacity >
                    </View>
                </View >
            </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({
    bckgrndImage: {
        resizeMode: 'cover',
    },
    container: {
        height: '100%',
        width: '100%',
    },
    textContainer: {
        flexShrink: 1,
    },
    gamesContainer: {
        flex: 1,
        flexWrap: 'wrap',
        alignSelf: 'center'
    },
    welcome: {
        fontSize: 30,
        textAlign: 'center',
        marginTop: 40,
        margin: 10,
        color: colorStyles.lowIntenseColor
    },
    button: {
        flexGrow: 1,
        flexShrink: 1,
        alignSelf: 'center',
        borderRadius: 20,
        backgroundColor: colorStyles.mediumIntenseColor,
        opacity: 0.85,
        elevation: 2,
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        minHeight: 100,
        maxHeight: 200,
        aspectRatio: 1,
        margin: '1%',
    },
    innerBtnView: {
        flex: 1,
        alignItems: 'center',
        margin: 5
    },
    innerBtnText: {
        fontSize: 30,
    },
    innerBtnImage: {
        flex: 1.5,
        aspectRatio: 1,
    },
    spacer: {
        flex: 1,
        minHeight: 10,
        minWidgh: 10
    },
});
