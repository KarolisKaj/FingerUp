import React, { Component } from 'react';
import { View, StyleSheet, Animated, PanResponder } from 'react-native';
import colorStyles from '../../styles/colorStyles'
import Svg, {
    Text as SvgText,
    Path,
    Circle
} from 'react-native-svg';

export default class ConnectDotsDot extends Component {
    constructor(props) {
        super(props);
        this.state = {
            marked: false,
            isStart: props.isStart,
            isEnd: props.isEnd
        };
    }

    pan = new Animated.ValueXY();
    panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event([
            null,
            { dx: this.pan.x, dy: this.pan.y }
        ], { useNativeDriver: false }),
        onPanResponderRelease: () => {
            Animated.spring(this.pan, { toValue: { x: 0, y: 0 } }, { useNativeDriver: true }).start();
        }

    });
    render() {
        return (
            <Animated.View
                style={{
                    transform: [{ translateX: this.pan.x }, { translateY: this.pan.y }]
                }}
                {...this.panResponder.panHandlers}
            >
                <Svg height="40" width="40">
                    <Circle cx="20" cy="20" r="20" fill="black" />
                </Svg>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    cell: {
        flex: 1,
        borderWidth: 1,
        borderColor: colorStyles.lowIntenseColor
    }
});
