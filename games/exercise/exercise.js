import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import colorStyles from '../../styles/colorStyles'
import LottieView from 'lottie-react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler'
import * as Animatable from 'react-native-animatable';


export default class Exercise extends Component {
    constructor(props) {
        super(props)
        this.state = {
            windowWidth: Dimensions.get('window').width,
            isTransition: false,
            timeLeft: 30,
            timer: undefined
        }
    }

    componentDidMount() {
        this.startTimer();
    }

    componentWillUnmount() {
        this.cleanUp();
    }

    cleanUp() {
        clearInterval(this.state.timer);
    }

    startTimer() {
        this.state.timer = setInterval(() => {
            if (this.state.timeLeft < 1) {
                this.cleanUp();
                setTimeout(function () { this.props.navigation.navigate('GameOfLife') }.bind(this), 5000);
                setTimeout(function () { this.props.navigation.navigate('GameStart') }.bind(this), 10000);
                return
            }
            else {
                this.setState({ timeLeft: this.state.timeLeft - 1 })
                return
            }
        }, 1000);
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.textContainer}>
                    <Text>Pinch Fish</Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.bigText}>Time: {this.state.timeLeft}</Text>
                </View>

                <View style={styles.contentContainer}>
                    <LottieView style={{ width: this.state.windowWidth * 1 }} source={require('../../styles/animations/movement/flex-arms.json')}
                        ref={fishAnimation => { this.fishAnimation = fishAnimation; }} autoPlay />
                </View>
                {this.state.timeLeft === 0 && <View style={styles.center}>
                    <Animatable.Text style={styles.bigText} animation="pulse" easing="ease-out" iterationCount="infinite">Your score {this.state.killedTimes}!</Animatable.Text>
                </View>}
            </View >
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colorStyles.lowIntenseColor,
    },
    textContainer: {
        flex: 1,
        alignItems: 'center',
    },
    contentContainer: {
        alignItems: 'center',
        flex: 9,
        // backgroundColor: 'yellow',
        justifyContent: 'center'
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
