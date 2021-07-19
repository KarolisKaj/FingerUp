import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import colorStyles from '../../styles/colorStyles'

export default class OutlineShape extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }

    }


    render() {
        return (
            <View style={styles.container} onMoveShouldSetPanResponder={() => true} onPanResponderMove={(e, gs) => { console.log('touchMove', e.nativeEvent) }}>
                <View style={styles.textContainer}>
                    <Text>Outline Shape</Text>
                </View>
                <View style={styles.scoreContainer}>
                    <Text style={styles.bigText}>Time passed: {this.state.timeElapsed}</Text>
                </View>
                <View style={{ ...styles.contentContainer }}>
                    <View onTouchStart={(e) => { console.log('touchMove', e.nativeEvent) }}></View>
                </View>
                {
                    this.state.gameFinished && <View style={styles.center}>
                        <Animatable.Text style={styles.bigText} animation="pulse" easing="ease-out" iterationCount="infinite">You won in {this.state.timeElapsed} seconds!</Animatable.Text>
                    </View>
                }
            </View >
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colorStyles.lowIntenseColor,
        flexDirection: 'column',
    },
    textContainer: {
        flex: 1,
        alignItems: 'center',
    },
    scoreContainer: {
        flex: 19,
        alignItems: 'center',
    },
    contentContainer: {
        position: "absolute",
        top: 0, left: 0,
        right: 0, bottom: 0,
    },
    center: {
        position: 'absolute',
        top: 0, left: 0,
        right: 0, bottom: 0,
        backgroundColor: colorStyles.lowIntenseColor,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bigText: {
        fontSize: 32
    }
})
