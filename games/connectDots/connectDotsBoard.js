import React, { Component } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import colorStyles from '../../styles/colorStyles'
import Dot from './connectDotsDot.js'
import Svg, {
    Line,
} from 'react-native-svg';
import playSound from '../../services/audioService';
import soundFiles from '../../services/soundFileLocations'

function createDots(dotsCount, shapeCoordinates) {
    let firstCoordinates = shapeCoordinates[0][0]
    let secondCoordinates = shapeCoordinates[0][1]
    let dots = []
    Array.from({ length: dotsCount }, (_, i) => {
        dots.push([])
        Array.from({ length: dotsCount }, (_, j) => {
            let dotRef = React.createRef()
            let isStart = firstCoordinates[0] === i && firstCoordinates[1] === j;
            let isEnd = secondCoordinates[0] === i && secondCoordinates[1] === j;
            let startEndState = { isStart, isEnd }
            dots[i].push({
                element: (<Dot startEndState={startEndState} key={`${j},${i}`} ref={dotRef}></Dot>),
                ref: dotRef,
                startEndState
            })
        });
    });
    return dots
}

export default class ConnectDotsBoard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dotsCount: props.dotsCount,
            shapeCoordinates: props.shapeCoordinates,
            board: createDots(props.dotsCount, props.shapeCoordinates),
            draggedX: undefined,
            draggedY: undefined,
            startedX: 0,
            startedY: 0,
            startedPageX: 0,
            startedPageY: 0,
            offsetY: undefined,
            lineColor: 'transparent',
            lines: [],
            notifyGameFinished: props.notifyGameFinished
        };
        this.setCoordinates = this.setCoordinates.bind(this);
        this.onMoveShouldSetResponder = this.onMoveShouldSetResponder.bind(this);
        this.dotInCoordinates = this.dotInCoordinates.bind(this);
        this.updateStartEnd = this.updateStartEnd.bind(this);
        this.panResponder =
            PanResponder.create({
                onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
                    return this.onMoveShouldSetResponder(evt)
                },
                onMoveShouldSetPanResponder: (evt, gestureState) => {
                    return this.onMoveShouldSetResponder(evt)
                },
                onPanResponderMove: (evt, gestureState) => {
                    this.setState({ draggedX: evt.nativeEvent.locationX, draggedY: evt.nativeEvent.locationY })
                },
                onPanResponderRelease: (evt, gestureState) => {
                    let startDot = this.dotInCoordinates(this.state.startedPageX, this.state.startedPageY)
                    let endDot = this.dotInCoordinates(evt.nativeEvent.pageX, evt.nativeEvent.pageY)
                    if (endDot && startDot && endDot.startEndState.isEnd && startDot.startEndState.isStart) {
                        let currentLines = this.state.lines
                        let r = endDot.ref.current.state.radius
                        currentLines.push((<Line key={this.state.lines.length} x1={startDot.ref.current.state.X + r} y1={startDot.ref.current.state.Y - this.state.offsetY + r} x2={endDot.ref.current.state.X + r} y2={endDot.ref.current.state.Y - this.state.offsetY + r} stroke="green" strokeWidth="5" />))
                        this.setState({ lines: currentLines })
                        this.updateStartEnd()
                        playSound(soundFiles.correctAnswerFile);
                    } else {
                        playSound(soundFiles.wrongAnswerFile);
                    }
                    this.setState({ draggedX: 0, draggedY: 0, startedX: 0, startedY: 0, lineColor: 'transparent' })
                }
            });
    }

    updateStartEnd() {
        this.state.board.forEach(row => {
            row.forEach(element => {
                element.startEndState.isStart = false;
                element.startEndState.isEnd = false;
                element.ref.current.renderState(element.startEndState);
            })
        });
        this.setState({ board: this.state.board })

        let movesMade = this.state.lines.length;
        this.state.shapeCoordinates.forEach(innerArray => {
            if (movesMade >= innerArray.length - 1) {
                movesMade -= innerArray.length - 1
            } else {
                let startDot = this.state.board[innerArray[movesMade][0]][innerArray[movesMade][1]];
                let endDot = this.state.board[innerArray[movesMade + 1][0]][innerArray[movesMade + 1][1]]
                startDot.startEndState.isStart = true
                endDot.startEndState.isEnd = true
                startDot.ref.current.renderState(startDot.startEndState)
                endDot.ref.current.renderState(endDot.startEndState)
            }
        });
        if (this.state.lines.length == this.state.shapeCoordinates.map(x => x.length - 1).reduce((a, b) => a + b, 0)) {
            this.state.notifyGameFinished()
        }
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
        if (dot && dot.startEndState.isStart) {
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
                <View {...this.panResponder.panHandlers} style={{ height: "100%", width: "100%", margin: 0, padding: 0, position: 'absolute', top: 0, left: 0 }}>
                    <Svg style={{ height: "100%", width: "100%", margin: 0, padding: 0, position: 'absolute', top: 0, left: 0}} >
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
        justifyContent: 'space-around',
    },
    rowContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
});
