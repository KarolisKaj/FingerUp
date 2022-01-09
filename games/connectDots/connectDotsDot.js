import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import colorStyles from '../../styles/colorStyles'
import Svg, {
    Text as SvgText,
    Circle
} from 'react-native-svg';

export default class ConnectDotsDot extends Component {
    constructor(props) {
        super(props);
        this.state = {
            marked: false,
            X: undefined,
            Y: undefined,
            dimension: 40,
            radius: 20,
            startEndState: props.startEndState
        };
        this.setCoordinates = this.setCoordinates.bind(this);
        this.measureRec = this.measureRec.bind(this);
        this.renderState = this.renderState.bind(this);
    }

    renderState(startEndState) {
        this.setState({ startEndState: startEndState })
    }

    setCoordinates(e) {
        var target = e.currentTarget;
        this.measureRec(target)
    }

    measureRec(target) {
        setTimeout(() => target.measure((fx, fy, width, height, px, py) => {
            this.setState({ X: px, Y: py })
            if (px !== this.state.X || py !== this.state.Y) {
                this.measureRec(target)
            }
        }), 250)
    }

    render() {
        return (
            <View ref={view => { this.feedPost = view; }} >
                <Svg height={this.state.dimension} width={this.state.dimension} >
                    <Circle cx={this.state.radius} cy={this.state.radius} r={this.state.radius} fill={this.state.startEndState.isStart ? 'yellow' : this.state.startEndState.isEnd ? 'green' : 'black'} onLayout={this.setCoordinates} />
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
