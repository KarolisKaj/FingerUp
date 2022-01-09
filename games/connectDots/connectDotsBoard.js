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
            startedPageX: 0,
            startedPageY: 0,
            offsetY: undefined,
            lineColor: 'transparent',
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
                    console.log({ draggedX: evt.nativeEvent.locationX, draggedY: evt.nativeEvent.locationY })
                    return this.onMoveShouldSetResponder(evt)
                },
                onMoveShouldSetPanResponder: (evt, gestureState) => {
                    console.log({ draggedX: evt.nativeEvent.locationX, draggedY: evt.nativeEvent.locationY })
                    return this.onMoveShouldSetResponder(evt)
                },
                onPanResponderMove: (evt, gestureState) => {
                    console.log({ draggedX: evt.nativeEvent.locationX, draggedY: evt.nativeEvent.locationY })
                    this.setState({ draggedX: evt.nativeEvent.locationX, draggedY: evt.nativeEvent.locationY })
                },
                onPanResponderRelease: (evt, gestureState) => {
                    let startDot = this.dotInCoordinates(this.state.startedPageX, this.state.startedPageY)
                    let endDot = this.dotInCoordinates(evt.nativeEvent.pageX, evt.nativeEvent.pageY)
                    if (endDot && startDot) {
                        let currentLines = this.state.lines
                        let r = endDot.ref.current.state.radius
                        currentLines.push((<Line key={this.state.lines.length} x1={startDot.ref.current.state.X + r} y1={startDot.ref.current.state.Y - this.state.offsetY + r} x2={endDot.ref.current.state.X + r} y2={endDot.ref.current.state.Y - this.state.offsetY + r} stroke="green" strokeWidth="5" />))
                        this.setState({ lines: currentLines })
                    }
                    this.setState({ draggedX: 0, draggedY: 0, startedX: 0, startedY: 0, lineColor: 'transparent' })
                },
                onPanResponderGrant: (e, gestureState) => {
                    // let dot = this.dotInCoordinates(e.nativeEvent.pageX, e.nativeEvent.pageY);
                    // if (dot) {
                    //     let r = dot.ref.current.state.radius
                    //     this.setState({ startedX: (dot.ref.current.state.X + r), startedY: (dot.ref.current.state.Y - this.state.offsetY + r), startedPageX: e.nativeEvent.pageX, startedPageY: e.nativeEvent.pageY })
                    // }
                },
            });
    }

    dotInCoordinates(x, y) {
        let dot = this.state.board.flat().find(dot => {
            return dot.ref.current.state.X < x
                && (dot.ref.current.state.X + dot.ref.current.state.dimension) > x
                && dot.ref.current.state.Y < y
                && (dot.ref.current.state.Y + dot.ref.current.state.dimension) > y
        });
        return dot
    }

    onMoveShouldSetResponder(e) {
        let dot = this.dotInCoordinates(e.nativeEvent.pageX, e.nativeEvent.pageY);
        if (dot) {
            let r = dot.ref.current.state.radius
            this.setState({ startedX: (dot.ref.current.state.X + r), startedY: (dot.ref.current.state.Y - this.state.offsetY + r), startedPageX: e.nativeEvent.pageX, startedPageY: e.nativeEvent.pageY },
                () => { setTimeout(() => this.setState({ lineColor: 'black' }), 5) })
            return true
        }
        else {
            return false
        }
    }

    setMeasurementRec(target) {
        setTimeout(() => target.measure((fx, fy, width, height, px, py) => {
            // console.log(px, py)
            this.setState({ offsetY: py })
            if (px !== 0) {
                this.setMeasurementRec(target)
            }
        }), 10)
    }

    setCoordinates(e) {
        let target = e.currentTarget;
        setTimeout(() => this.setMeasurementRec(target), 50)
    }

    render() {
        return (
            <View style={styles.boardContainer} onLayout={this.setCoordinates} ref={view => { this.feedPost = view; }}>
                {this.state.board.map((line, index) => (<View key={index} style={styles.rowContainer}>{line.map(dot => dot.element)}</View>))}
                <View style={{ height: "100%", width: "100%", margin: 0, padding: 0, position: 'absolute', top: 0, left: 0 }}>
                    <Svg style={{ height: "100%", width: "100%", margin: 0, padding: 0, position: 'absolute', top: 0, left: 0 }}
                        {...this.panResponder.panHandlers}
                    >
                        <Svg>
                            <Line key={-1} x1={this.state.startedX} y1={this.state.startedY} x2={this.state.draggedX} y2={this.state.draggedY} stroke={this.state.lineColor} strokeWidth="5" />
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
