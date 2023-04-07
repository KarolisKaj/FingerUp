import React, { Component } from 'react';
import { View, Platform, PixelRatio, InteractionManager } from 'react-native';
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
        if (Platform.OS === 'ios') {
            let self = this.feedPost
            InteractionManager.runAfterInteractions(() => {
                self.measureInWindow((x, y, width, height) => {
                    this.setState({ X: x, Y: y });
                });
            })
        } else {
            let target = e.currentTarget;
            this.measureRec(target)
        }
    }

    measureRec(target) {
        setTimeout(() => target.measure((fx, fy, width, height, px, py) => {
            this.setState({ X: px, Y: py })
            if (px !== this.state.X || py !== this.state.Y) {
                this.measureRec(target)
            }
        }), 250)
    }

    measureInWindow(target) {
        setTimeout(() => target.measureInWindow((x, y, width, height) => {
            this.setState({ X: x, Y: y })
            console.log(`x - ${x}, y - ${y} `)
            if (x !== this.state.X || y !== this.state.Y) {
                this.measureInWindow(target)
            }
        }), 250)
    }

    render() {
        return (
            <View ref={view => { this.feedPost = view; }} >
                <Svg height={this.state.dimension} width={this.state.dimension} >
                    <Circle cx={this.state.radius} cy={this.state.radius} r={this.state.radius} fill={this.state.startEndState.isStart ? 'green' : this.state.startEndState.isEnd ? 'red' : 'black'} onLayout={this.setCoordinates} />
                </Svg>
            </View>
        );
    }
}
