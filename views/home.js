import React, { Component } from 'react';
import { View, Text, StyleSheet, Button, TouchableHighlight, TouchableOpacity, Image } from 'react-native';
import Svg, { Circle, Path } from "react-native-svg"
import colorStyles from '../styles/colorStyles'

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
            <View style={styles.container}>
                <View style={styles.textContainer}>
                    <Text style={styles.welcome}>Hello dear traveler, choose an area to play in!</Text>
                </View>
                <View style={styles.gamesContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => this.props.navigation.navigate('Sensory')}>
                        <View style={styles.innerBtnView}  >
                            <Image style={styles.innerBtnImage} source={require('../assets/accessibility-outline.png')} />
                            <Text style={styles.innerBtnText}>Movement</Text>
                        </View>
                    </TouchableOpacity >
                    <View style={styles.spacer}></View>
                    <TouchableOpacity style={styles.button} onPress={() => this.props.navigation.navigate('Motor')}>
                        <View style={styles.innerBtnView}  >
                            <Image style={styles.innerBtnImage} source={require('../assets/hand.png')} />
                            <Text style={styles.innerBtnText}>Finger Up</Text>
                        </View>
                    </TouchableOpacity >
                    <View style={styles.spacer}></View>
                    <TouchableOpacity style={styles.button} onPress={() => this.props.navigation.navigate('OutlineShape')}>
                        <View style={styles.innerBtnView}  >
                            <Image style={styles.innerBtnImage} source={require('../assets/edit-outline.png')} />
                            <Text style={styles.innerBtnText}>Lets write</Text>
                        </View>
                    </TouchableOpacity >
                    <View style={styles.spacer}></View>
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
        flex: 5,
        flexWrap: 'wrap',
        alignSelf: 'center'
    },
    welcome: {
        fontSize: 30,
        textAlign: 'center'
    },
    button: {
        flex: 2,
        alignSelf: 'center',
        borderRadius: 20,
        backgroundColor: colorStyles.mediumIntenseColor,
        elevation: 2,
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        minHeight: 150
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
