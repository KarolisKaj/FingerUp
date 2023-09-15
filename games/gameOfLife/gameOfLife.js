import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Cell from './gameOfLifeCell';
import MakeTurn from './gameOfLifeLogic'
import colorStyles from '../../styles/colorStyles'


function generateBoard(size) {
    let board = []
    for (let i = 0; i < size; i++) {
        board.push([])
        for (let j = 0; j < size; j++) {
            let cellRef = React.createRef()
            board[i].push({ element: (<Cell key={`x${i}y${j}`} isAlive={Math.floor(Math.random() * 11) % 2 === 0} ref={cellRef}></Cell>), ref: cellRef })
        }
    }
    return board
}

export default class GameOfLife extends Component {
    constructor(props) {
        super(props)
        this.state = {
            boardState: generateBoard(20),
            isSpinning: true,
            lastExecution: 0
        }
        window.requestAnimationFrame(this.startSpining.bind(this));
    }

    componentWillUnmount() {
        this.stopSpinning()
    }

    startSpining(ts) {
        if (this.state.isSpinning === true) {
            if (ts - this.state.lastExecution > 50) {
                MakeTurn(this.state.boardState)
                this.state.lastExecution = ts
            }
            window.requestAnimationFrame(this.startSpining.bind(this))
        }
    }
    stopSpinning() {
        this.state.isSpinning = false
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.boardContainer}>
                    {
                        this.state.boardState.map((column, index) => (<View key={index} style={styles.textContainer}>{column.map(cell => cell.element)}</View>))
                    }
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: colorStyles.lowIntenseColor
    },
    textContainer: {
        flex: 1,
        alignItems: 'stretch'
    },
    boardContainer: {
        flex: 9,
        flexDirection: 'row',
        alignItems: 'stretch'
    }
})
