import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import colorStyles from '../../styles/colorStyles'
import LottieView from 'lottie-react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler'
import * as Animatable from 'react-native-animatable';
import playSounds from '../../services/audioService';
import Header from '../../views/components/header.js'
import Images from '../../services/imagesLoader'
import Svg, {
    Circle,
} from 'react-native-svg';

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
                setTimeout(function () { this.props.navigation.navigate('GameStart') }.bind(this), 10000);
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
            playSounds.feedback.playCorrectAnswer();
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <Header style={styles.textContainer} title="Pinch Fish">
                </Header>
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
                {this.state.timeLeft === 0 && <Animatable.View animation="pulse" easing="ease-out" iterationCount="infinite" style={styles.center}>
                    <View style={styles.center}>
                        <Text style={{...styles.bigText, marginVertical:100 }}>Well done! Your score is {this.state.killedTimes}!</Text>
                        <Svg height="100" width="100" viewBox="0 0 100 100">
                            <Circle
                                cx="50"
                                cy="50"
                                r="50"
                                fill="green"
                            />
                            <Images.thumbsUp fill="white" width="100" height="100" viewBox="0 0 525 525"></Images.thumbsUp>
                        </Svg>

                    </View>
                </Animatable.View>}


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
