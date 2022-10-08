import * as React from 'react';
import { Component } from 'react';
import { View, Text, StyleSheet, Platform, ReactNativeComponentTree } from 'react-native';
import colorStyles from '../../styles/colorStyles'
import ReactDOMServer from 'react-dom/server';
import Svg, {
    Text as SvgText,
    Path,
} from 'react-native-svg';
import simplifySvgPath from '@luncheon/simplify-svg-path';


export default class OutlineShape extends Component {
    constructor(props) {
        super(props)
        this.state = {
            currentPath: null,
            shape: props.shape,
            points: props.points,
            isReadonly: props.points.length == 0
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
    // TODO: You can see what you drawn from this.state.points. I need to figure out the shape/borders of the char (B) and track what was drawn.
    // Like if there is no points between two borders in the middle of the letter then we are sure its bad already.
    render() {
        return (
            <View style={styles.container}>
                <Svg style={styles.contentContainer} height='100%' width='100%' fill="#000000"
                    onLayout={(e) => {
                    }
                    }
                >
                    <SvgText fill="#FFFFFF" x="50%" y="75%" textAnchor="middle" fontSize="512"
                        onMoveShouldSetResponder={() => true}
                        onStartShouldSetResponder={() => true}

                        onResponderMove={(e) => {
                            this.state.points.push([e.nativeEvent.locationX, e.nativeEvent.locationY]);
                            this.setState({ currentPath: this.createSVGPath(this.state.points, 1, true) });
                        }}
                        onResponderRelease={() => {
                            // TODO: set viewing state here?
                            this.setState({ points: [], currentPath: null })
                            // TODO: Validate that whole path was within letter and whole letter is completed.
                        }}
                        onLayout={(e) => {
                            // console.log(e.target)
                        }
                        }
                    >{this.state.shape}</SvgText>
                    <Path
                        d={this.state.currentPath}
                        fill="none"
                        stroke={colorStyles.intenseColor}
                        strokeWidth={5}
                        opacity={1}
                    />
                </Svg>
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
    contentContainer: {
        position: "absolute",
        top: 0, left: 0,
        right: 0, bottom: 0,
    }
})
