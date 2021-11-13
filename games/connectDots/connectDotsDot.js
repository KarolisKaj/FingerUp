import React, { Component } from 'react';
import { View, StyleSheet, Animated, PanResponder } from 'react-native';
import colorStyles from '../../styles/colorStyles'
import Svg, {
    Text as SvgText,
    Line,
    Circle
} from 'react-native-svg';

export default class ConnectDotsDot extends Component {
    constructor(props) {
        super(props);
        this.state = {
            marked: false,
            isStart: props.isStart,
            isEnd: props.isEnd,
            X: undefined,
            Y: undefined,
            dimension: 40,
            radius: 20
        };
        this.setCoordinates = this.setCoordinates.bind(this);
    }

    setCoordinates(e) {
        let target = e.currentTarget;
        target.measure((fx, fy, width, height, px, py) => {
            // console.log('Component width is: ' + width)
            // console.log('Component height is: ' + height)
            // console.log('X offset to frame: ' + fx)
            // console.log('Y offset to frame: ' + fy)
            // console.log('X offset to page: ' + px)
            // console.log('Y offset to page: ' + py)
            this.setState({ X: px, Y: py })
            // console.log(px, py)
            // console.log(fx, fy)
        })
        // console.log('circleComp', e.currentTarget);


    }

    render() {
        return (
            <View  >
                <Svg height={this.state.dimension} width={this.state.dimension} >
                    <Circle cx={this.state.radius} cy={this.state.radius} r={this.state.radius} fill="black" onLayout={this.setCoordinates} />
                </Svg>
            </View>
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
