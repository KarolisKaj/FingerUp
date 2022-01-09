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
        this.measureRec = this.measureRec.bind(this);
    }

    setCoordinates(e) {
        var target = e.currentTarget;
        this.measureRec(target)
    }

    measureRec(target){
        setTimeout(() => target.measure((fx, fy, width, height, px, py) => {
            console.log(px,py)
            this.setState({ X: px, Y: py })
            if(px !== this.state.X || py !== this.state.Y){
                this.measureRec(target)
            }
        }), 250)
    }

    render() {
        return (
            <View ref={view => { this.feedPost = view; }} >
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
