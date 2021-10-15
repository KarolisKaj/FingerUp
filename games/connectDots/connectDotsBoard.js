import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import colorStyles from '../../styles/colorStyles'
import Dot from './connectDotsDot.js'


function createDots(dotsCount) {
    let dots = []
    Array.from({ length: dotsCount }, (_, i) => {
        dots.push([])
        Array.from({ length: dotsCount }, (_, j) => {
            dots[i].push((<Dot key={`${j},${i}`}></Dot>))
        });
    });
    return dots
}

export default class ConnectDotsBoard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dotsCount: props.dotsCount,
            board: createDots(props.dotsCount)
        };
    }

    render() {
        return (
            <View style={styles.boardContainer}>
                {this.state.board.map((line, index) => (<View key={index} style={styles.rowContainer}>{line.map(card => card)}</View>))}
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
