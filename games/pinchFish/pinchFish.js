import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import colorStyles from '../../styles/colorStyles'
import LottieView from 'lottie-react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler'
import * as Animatable from 'react-native-animatable';
import playSound from '../../services/audioService';
import soundFiles from '../../services/soundFileLocations'
import storage from '../../services/storage'


export default class PinchFish extends Component {
    constructor(props) {
        super(props)
        this.state = {
            windowWidth: Dimensions.get('window').width,
            isTransition: false,
            pinchScaleThreshold: 0.8,
            killedTimes: 0,
            timeLeft: 30,
            timer: undefined
        }
    }

    componentDidMount() {
        this.startExplosion()
        this.startFish();
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
                setTimeout(function () { this.props.navigation.navigate('Home') }.bind(this), 10000);
            }
            else {
                this.setState({ timeLeft: this.state.timeLeft - 1 })
            }
        }, 1000);
    }

    startExplosion() {
        this.explosionAnimation && this.explosionAnimation.play();
    }

    endExplosion() {
        this.explosionAnimation && this.explosionAnimation.play(300, 300);
        this.explosionAnimation && this.explosionAnimation.pause();
    }

    startFish() {
        this.fishAnimation && this.fishAnimation.play();
    }

    endFish() {
        this.fishAnimation && this.fishAnimation.play(300, 300);
        this.fishAnimation && this.fishAnimation.pause();
    }

    onPinchStateChange(event) {
        if (this.state.isTransition)
            return;

        if (event.nativeEvent.oldState === State.ACTIVE && event.nativeEvent.scale < this.state.pinchScaleThreshold) {
            this.setState({ isTransition: true, killedTimes: this.state.killedTimes + 1 });
            this.startFish();
            setTimeout(function () { this.setState({ isTransition: false }); this.startFish(); }.bind(this), 1200);
            playSound(soundFiles.correctAnswerFile);
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.textContainer}>
                    <Text>Pinch Fish</Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.bigText}>Score: {this.state.killedTimes}</Text>
                    <Text style={styles.bigText}>Time: {this.state.timeLeft}</Text>
                </View>
                <PinchGestureHandler
                    onHandlerStateChange={this.onPinchStateChange.bind(this)}>
                    <View style={styles.contentContainer}>
                        {this.state.isTransition === false ?
                            <LottieView style={{ width: this.state.windowWidth * 1.5 }} source={require('../../styles/animations/pinch/fish.json')} ref={fishAnimation => { this.fishAnimation = fishAnimation; }} autoPlay /> :
                            <LottieView style={{ width: this.state.windowWidth * 1 }} source={require('../../styles/animations/pinch/explosion.json')} ref={explosionAnimation => { this.explosionAnimation = explosionAnimation; }} />}
                    </View>
                </PinchGestureHandler>
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
