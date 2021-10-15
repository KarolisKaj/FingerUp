import * as React from 'react';
import { Component } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { color } from 'react-native-reanimated';
import colorStyles from '../../styles/colorStyles'
import Board from './connectDotsBoard'


export default class ConnectDots extends Component {
    constructor(props) {
        super(props)
        this.state = {
            marked: false,
            isStart: props.isStart,
            isEnd: props.isEnd
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.textContainer}>
                    <Text>Connect Dots</Text>
                </View>
                <View style={styles.boardContainer}>
                    <Board dotsCount={3} />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'stretch',
        backgroundColor: colorStyles.lowIntenseColor
    },
    textContainer: {
        flex: 1,
        alignItems: 'center'
    },
    boardContainer: {
        flex: 9,
        flexDirection: 'row',
        alignItems: 'stretch'
    },
    center: {
        position: 'absolute',
        top: 0, left: 0,
        right: 0, bottom: 0,
        backgroundColor: colorStyles.lowIntenseColor,
        justifyContent: 'center',
        alignItems: 'center',
    },
    victoryText: {
        fontSize: 32
    }
})
