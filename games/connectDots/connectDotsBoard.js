import React, { Component } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import colorStyles from '../../styles/colorStyles'
import Dot from './connectDotsDot.js'
import Svg, {
    Line,
} from 'react-native-svg';

function createDots(dotsCount) {
    let dots = []
    Array.from({ length: dotsCount }, (_, i) => {
        dots.push([])
        Array.from({ length: dotsCount }, (_, j) => {
            let dotRef = React.createRef()
            dots[i].push(({ element: <Dot key={`${j},${i}`} ref={dotRef}></Dot>, ref: dotRef }))
        });
    });
    return dots
}

export default class ConnectDotsBoard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dotsCount: props.dotsCount,
            board: createDots(props.dotsCount),
            draggedX: undefined,
            draggedY: undefined,
            startedX: 0,
            startedY: 0,
            offsetY: undefined,
            lines: []
        };
        this.setCoordinates = this.setCoordinates.bind(this);
        this.onMoveShouldSetResponder = this.onMoveShouldSetResponder.bind(this);
        this.dotInCoordinates = this.dotInCoordinates.bind(this);
        this.panResponder =
            PanResponder.create({
                onStartShouldSetPanResponder: (evt, gestureState) => {
                    // return this.onMoveShouldSetResponder(evt)
                },
                onStartShouldSetPanResponderCapture: (evt, gestureState) => {
                    // return this.onMoveShouldSetResponder(evt)
                },
                onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
                    return this.onMoveShouldSetResponder(evt)
                },
                onMoveShouldSetPanResponder: (evt, gestureState) => {
                    return this.onMoveShouldSetResponder(evt)
                },
                onPanResponderMove: (evt, gestureState) => {
                    // if (this.state.startedX === 0 && this.state.startedY === 0) {
                    //     this.setState({ startedX: evt.nativeEvent.locationX, startedY: evt.nativeEvent.locationY })
                    // }
                    this.setState({ draggedX: evt.nativeEvent.locationX, draggedY: evt.nativeEvent.locationY })
                },
                onPanResponderRelease: (evt, gestureState) => {
                    let dot = this.dotInCoordinates(evt)
                    if (dot) {
                        let currentLines = this.state.lines
                        let r = dot.ref.current.state.radius
                        currentLines.push((<Line key={this.state.lines.length} x1={this.state.startedX} y1={this.state.startedY} x2={dot.ref.current.state.X + r} y2={dot.ref.current.state.Y - this.state.offsetY + r} stroke="green" strokeWidth="5" />))
                        // currentLines.push(<Line key={this.state.lines.length} x1={100} y1={100} x2={200} y2={200} stroke="green" strokeWidth="5" />);
                        this.setState({ lines: currentLines })
                    }
                    this.setState({ draggedX: 0, draggedY: 0, startedX: 0, startedY: 0 })
                },
                onPanResponderGrant: (evt, gestureState) => {
                    this.setState({ startedX: evt.nativeEvent.locationX, startedY: evt.nativeEvent.locationY })
                },
            });
    }

    dotInCoordinates(e) {
        let dot = this.state.board.flat().find(dot => {
            return dot.ref.current.state.X < e.nativeEvent.pageX
                && (dot.ref.current.state.X + dot.ref.current.state.dimension) > e.nativeEvent.pageX
                && dot.ref.current.state.Y < e.nativeEvent.pageY
                && (dot.ref.current.state.Y + dot.ref.current.state.dimension) > e.nativeEvent.pageY;
        });
        return dot
    }

    onMoveShouldSetResponder(e) {
        let dot = this.dotInCoordinates(e);
        if (dot) {
            let r = dot.ref.current.state.radius
            this.setState({ startedX: (dot.ref.current.state.X + r), startedY: (dot.ref.current.state.Y - this.state.offsetY + r) })
            return true
        }
        else {
            return false
        }
    }

    setCoordinates(e) {
        let target = e.currentTarget;
        setTimeout(() => target.measure((fx, fy, width, height, px, py) => {
            // console.log('Component width is: ' + width)
            // console.log('Component height is: ' + height)
            console.log('X offset to frame: ' + fx)
            console.log('Y offset to frame: ' + fy)
            console.log('X offset to page: ' + px)
            console.log('Y offset to page: ' + py)
            this.setState({ offsetY: py })
            // console.log(px, py)
            // console.log(fx, fy)
        }), 1)

    }

    render() {
        return (
            <View style={styles.boardContainer} onLayout={this.setCoordinates} >
                {this.state.board.map((line, index) => (<View key={index} style={styles.rowContainer}>{line.map(dot => dot.element)}</View>))}
                <View style={{ height: "100%", width: "100%", margin: 0, padding: 0, position: 'absolute', top: 0, left: 0 }}>
                    <Svg style={{ height: "100%", width: "100%", margin: 0, padding: 0, position: 'absolute', top: 0, left: 0 }}
                        {...this.panResponder.panHandlers}
                    >
                        <Svg>
                            <Line key={-1} x1={this.state.startedX} y1={this.state.startedY} x2={this.state.draggedX} y2={this.state.draggedY} stroke="black" strokeWidth="5" />
                        </Svg>
                        <Svg>
                            {this.state.lines}
                        </Svg>
                    </Svg>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    boardContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'space-around'

    },
    rowContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
});
