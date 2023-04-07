import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import colorStyles from '../styles/colorStyles'
import images from '../services/imagesLoader'


export default class GameHome extends Component {
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
            <ImageBackground source={images.background} style={styles.bckgrndImage}>
                <View style={styles.container}>
                    <View style={styles.textContainer}>
                        <Text style={styles.welcome}>Hello dear traveler, choose an area to play in!</Text>
                    </View>
                    <View style={styles.gamesContainer}>
                        <TouchableOpacity style={styles.button} onPress={() => this.props.navigation.navigate('Movement')}>
                            <View style={styles.innerBtnView}  >
                                <Image style={styles.innerBtnImage} source={require('../assets/accessibility.png')} />
                                <Text style={styles.innerBtnText}>Movement</Text>
                            </View>
                        </TouchableOpacity >
                        <TouchableOpacity style={styles.button} onPress={() => this.props.navigation.navigate('FingerUp')}>
                            <View style={styles.innerBtnView}  >
                                <Image style={styles.innerBtnImage} source={require('../assets/hand.png')} />
                                <Text style={styles.innerBtnText}>Finger Up</Text>
                            </View>
                        </TouchableOpacity >
                        <TouchableOpacity style={styles.button} onPress={() => this.props.navigation.navigate('OutlineShapeGame')}>
                            <View style={styles.innerBtnView}  >
                                <Image style={styles.innerBtnImage} source={require('../assets/edit.png')} />
                                <Text style={styles.innerBtnText}>Lets write</Text>
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
        color: colorStyles.intenseColor
    },
    button: {
        flexGrow: 1,
        flexShrink: 1,
        alignSelf: 'center',
        borderRadius: 20,
        backgroundColor: colorStyles.lowIntenseColor,
        opacity: 0.85,
        elevation: 2,
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        minHeight: 100,
        maxHeight: 300,
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
