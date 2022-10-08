import * as React from 'react';
import { Component } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import colorStyles from '../../styles/colorStyles'
import Board from './connectDotsBoard'
import shapes from './dotShapes'
import * as Animatable from 'react-native-animatable';


export default class ConnectDots extends Component {
    constructor(props) {
        super(props)
        this.state = {
            marked: false,
            shape: shapes()[Math.floor(Math.random() * shapes().length)],
            timeElapsed: 0,
            timer: undefined,
            gameFinished: false
        }
        this.finishGame = this.finishGame.bind(this);
    }

    finishGame() {
        
        setTimeout(function () { this.setState({ gameFinished: true }) }.bind(this), 500);
        setTimeout(function () { this.props.navigation.navigate('GameOfLife') }.bind(this), 5000);
        setTimeout(function () { this.props.navigation.navigate('GameStart') }.bind(this), 10000);
    }

    componentDidMount() {
        this.state.timer = setInterval(() => {
            if (!this.state.gameFinished)
                this.setState({ timeElapsed: this.state.timeElapsed + 1 })
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.state.timer);
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.textContainer}>
                    <Text>Connect Dots</Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.bigText}>Time: {this.state.timeElapsed}</Text>
                </View>
                <View style={styles.boardContainer}>
                    <Board dotsCount={this.state.shape.size} shapeCoordinates={this.state.shape.shape} notifyGameFinished={this.finishGame} />
                </View>
                {
                    this.state.gameFinished && <View style={styles.center}>
                        <Animatable.Text style={styles.bigText} animation="pulse" easing="ease-out" iterationCount="infinite">You won in {this.state.timeElapsed} seconds!</Animatable.Text>
                    </View>
                }
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
    bigText: {
        fontSize: 32
    }
})
