import React, { Component } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import colorStyles from '../styles/colorStyles'

export default class Sensory extends Component {
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
            <View style={styles.container}>
                <View style={styles.textContainer}>
                    <Text style={styles.welcome}>Choose a game to play!</Text>
                </View>
                <View style={styles.gamesContainer}>

                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
        backgroundColor: colorStyles.lowIntenseColor,
    },
    textContainer: {
        flex: 1,
        paddingHorizontal: 10,
    },
    gamesContainer: {
        flex: 9,
        justifyContent: 'space-around',
        alignContent: 'space-around',
        flexWrap: 'wrap',
        flexDirection: 'row',
        alignSelf: 'flex-start'
    },
    welcome: {
        fontSize: 30,
        textAlign: 'center',
    },
    button: {
        margin: '5%'
    }
});
