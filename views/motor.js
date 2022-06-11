import React, { Component } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import colorStyles from '../styles/colorStyles'

export default class Motor extends Component {
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
                    <View style={styles.button}>
                        <Button color={colorStyles.mediumIntenseColor} title="Pinch Fish" onPress={() => this.props.navigation.navigate('PinchFish')}></Button>
                    </View>
                    <View style={styles.button}>
                        <Button color={colorStyles.mediumIntenseColor} title="Connect Dots" onPress={() => this.props.navigation.navigate('ConnectDots')}></Button>
                    </View>
                    <View style={styles.button}>
                        <Button color={colorStyles.mediumIntenseColor} title="Card Match" onPress={() => this.props.navigation.navigate('CardMatch')}></Button>
                    </View>
                    <View style={styles.button}>
                        <Button color={colorStyles.mediumIntenseColor} title="Sea Match" onPress={() => this.props.navigation.navigate('SeaMatch')}></Button>
                    </View>
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
