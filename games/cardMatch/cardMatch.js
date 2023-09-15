import React, { Component } from 'react';
import { View, Text, StyleSheet } from "react-native";
import CardMatchBoard from './cardMatchBoard.js'
import * as Animatable from 'react-native-animatable';
import colorStyles from '../../styles/colorStyles'
import Header from '../../views/components/header.js'

export default class CardMatch extends Component {
    constructor(props) {
        super(props)
        this.state = {
            hasFinished: false
        };
    }

    gameFinished() {
        setTimeout(function () { this.setState({ hasFinished: true }) }.bind(this), 1000);
        setTimeout(function () { this.props.navigation.navigate('GameOfLife') }.bind(this), 5000);
        setTimeout(function () { this.props.navigation.navigate('GameStart') }.bind(this), 10000);
    }

    render() {
        return (
            <View style={styles.container}>
                <Header style={styles.textContainer} title="Card Game"></Header>
                <View style={styles.boardContainer}>
                    <CardMatchBoard flipDelay={2000} onFinished={this.gameFinished.bind(this)}></CardMatchBoard>
                </View>
                {this.state.hasFinished && <View style={styles.center}>
                    <Animatable.Text style={styles.victoryText} animation="pulse" easing="ease-out" iterationCount="infinite" >You won!</Animatable.Text>
                </View>}
            </View>
        )
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
