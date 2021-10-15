import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
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

    getStyle() {
        let color = this.state.isAlive ? colorStyles.lowerIntenseColor : colorStyles.intenseColor;
        return {
            backgroundColor: color,
        }
    }

    render() {
        return (
            <Svg height="20" width="20">
                <Circle cx="10" cy="10" r="10" fill="black" />
            </Svg>
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
