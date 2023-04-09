import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import Svg, { Circle, } from 'react-native-svg';
import Images from '../../services/imagesLoader'


export default class EndText extends Component {
    constructor(props) {
        super(props)
        this.state = {
            text: this.props.text
        }
    }

    render() {
        return (
            <Animatable.View animation="pulse" easing="ease-out" iterationCount="infinite" style={styles.center}>
                <View style={styles.center}>
                    <Text style={styles.bigText}>{this.state.text}</Text>
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
            </Animatable.View>
        );
    }
}

const styles = StyleSheet.create({
    bigText: {
        fontSize: 32,
        marginVertical: 100
    },
    center: {
        position: 'absolute',
        top: 0, left: 0,
        right: 0, bottom: 0,
        backgroundColor: colorStyles.lowIntenseColor,
        justifyContent: 'center',
        alignItems: 'center',
    },
})
