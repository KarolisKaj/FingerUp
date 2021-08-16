import React, { Component, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colorStyles from '../../styles/colorStyles'
import Svg, {
    Circle,
    Ellipse,
    G,
    Text as SvgText,
    TSpan,
    TextPath,
    Path,
    Polygon,
    Polyline,
    Line,
    Rect,
    Use,
    Image,
    Symbol,
    Defs,
    LinearGradient,
    RadialGradient,
    Stop,
    ClipPath,
    Pattern,
    Mask,
} from 'react-native-svg';
import simplifySvgPath from '@luncheon/simplify-svg-path';

export default class OutlineShape extends Component {
    constructor(props) {
        super(props)
        this.state = {
            currentPath: null,
            points: []
        }
    }

    createSVGPath(points) {
        if (points.length > 1) {
            try {
                return simplifySvgPath(points, {
                    precision: 5,
                    tolerance: 1,
                });
            } catch (error) {
                console.log(error);
            }
        } else if (points.length === 1) {
            return `M${points[0][0]},${points[0][1]} L${points[0][0]},${points[0][1]}`;
        }
        return '';
    }

    render() {
        return (
            <View style={styles.container} onMoveShouldSetPanResponder={() => true}>
                <View style={styles.textContainer}>
                    <Text>Outline Shape</Text>
                </View>
                <View style={styles.scoreContainer}>
                    <Text style={styles.bigText}>Time passed: {this.state.timeElapsed}</Text>
                </View>
                <Svg style={styles.contentContainer} height='100%' width='100%' fill="#000000"
                    onMoveShouldSetResponder={() => true}
                    onStartShouldSetResponder={() => true}
                    onResponderMove={(e) => {
                        this.state.points.push([e.nativeEvent.locationX, e.nativeEvent.locationY]);
                        this.setState({ currentPath: this.createSVGPath(this.state.points, 1, true) });
                    }}
                    onResponderRelease={() => { this.setState({ points: [], currentPath: null }) }}>
                    <SvgText fill="#FFFFFF" x="50%" y="75%" textAnchor="middle" fontSize="512" >B</SvgText>
                    <Path
                        d={this.state.currentPath}
                        fill="none"
                        stroke={colorStyles.intenseColor}
                        strokeWidth={10}
                        opacity={1}
                    />
                </Svg>
                {
                    this.state.gameFinished &&
                    <View style={styles.center}>
                        <Animatable.Text style={styles.bigText} animation="pulse" easing="ease-out" iterationCount="infinite">You won in {this.state.timeElapsed} seconds!</Animatable.Text>
                    </View>
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colorStyles.lowIntenseColor,
        flexDirection: 'column',
    },
    textContainer: {
        flex: 1,
        alignItems: 'center',
    },
    scoreContainer: {
        flex: 19,
        alignItems: 'center',
    },
    contentContainer: {
        position: "absolute",
        top: 0, left: 0,
        right: 0, bottom: 0,
    },
    center: {
        position: 'absolute',
        top: 0, left: 0,
        right: 0, bottom: 0,
        backgroundColor: colorStyles.lowIntenseColor,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bigText: {
        fontSize: 32
    }
})
