import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import colorStyles from '../styles/colorStyles'

export default class FingerUp extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <ImageBackground source={require('../assets/beach_image.png')} style={styles.bckgrndImage}>
                <View style={styles.container}>
                    <View style={styles.textContainer}>
                        <Text style={styles.welcome}>Choose a game to play!</Text>
                    </View>
                    <View style={styles.gamesContainer}>
                        <TouchableOpacity style={styles.button} onPress={() => this.props.navigation.navigate('PinchFish')}>
                            <View style={styles.innerBtnView}  >
                                <Image style={styles.innerBtnImage} source={require('../assets/fish.png')} />
                                <Text style={styles.innerBtnText}>Pinch</Text>
                            </View>
                        </TouchableOpacity >
                        <TouchableOpacity style={styles.button} onPress={() => this.props.navigation.navigate('ConnectDots')}>
                            <View style={styles.innerBtnView}  >
                                <Image style={styles.innerBtnImage} source={require('../assets/connections.png')} />
                                <Text style={styles.innerBtnText}>Connect</Text>
                            </View>
                        </TouchableOpacity >
                        <TouchableOpacity style={styles.button} onPress={() => this.props.navigation.navigate('CardMatch')}>
                            <View style={styles.innerBtnView}  >
                                <Image style={styles.innerBtnImage} source={require('../assets/card.png')} />
                                <Text style={styles.innerBtnText}>Match</Text>
                            </View>
                        </TouchableOpacity >
                        <TouchableOpacity style={styles.button} onPress={() => this.props.navigation.navigate('SeaMatch')}>
                            <View style={styles.innerBtnView}  >
                                <Image style={styles.innerBtnImage} source={require('../assets/matching.png')} />
                                <Text style={styles.innerBtnText}>Drag</Text>
                            </View>
                        </TouchableOpacity >
                    </View>
                </View>
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
        flexshrink: 1,
    },
    gamesContainer: {
        flex: 1,
        flexWrap: 'wrap',
        alignSelf: 'center',
        flexDirection: 'column',
    },
    welcome: {
        fontSize: 30,
        textAlign: 'center',
        marginTop: 40,
        margin: 10,
        color: colorStyles.lowIntenseColor
    },
    button: {
        flex: 1,
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
        maxHeight: 300,
        aspectRatio: 1,
        margin: '1%'
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
        flex: 1,
        aspectRatio: 1,
    },
    spacer: {
        flex: 1,
        minHeight: 10,
        minWidgh: 10
    },
});
