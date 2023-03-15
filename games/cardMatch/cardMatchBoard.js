import React, { Component } from 'react';
import { View, StyleSheet } from "react-native";
import Card from './card.js'
import playSound from '../../services/audioService';
import soundFiles from '../../services/soundFileLocations'


function generateBoard(size, notifyFlipped) {
    let possibleValues = (size * size / 2)
    let board = []
    for (let i = 0; i < possibleValues; i++) {
        let cardRef1 = React.createRef()
        board.push({ element: (<Card key={`1x${i}`} id={`1x${i}`} ref={cardRef1} displayValue={i} notifyFlipped={notifyFlipped}></Card>), ref: cardRef1 });
        let cardRef2 = React.createRef()
        board.push({ element: (<Card key={`2x${i}`} id={`2x${i}`} ref={cardRef2} displayValue={i} notifyFlipped={notifyFlipped}></Card>), ref: cardRef2 });
    }
    board.sort((_, __) => {
        if (Math.random() > 0.5) {
            return 1
        }
        return -1
    })
    
    let result = []
    while (board.length) {
        result.push(board.splice(0, size));
    }
    return result
}

export default class CardMatchBoard extends Component {
    constructor(props) {
        super(props)
        let boardSize = 4
        this.state = {
            boardSize: boardSize,
            board: generateBoard(boardSize, this.handleCardInteraction.bind(this)),
            firstCardFlipped: undefined,
            secondCardFlipped: undefined,
            flipDelay: props.flipDelay,
            onFinished: props.onFinished,
            totalFoundCards: 0
        }
    }

    handleCardInteraction(card) {
        if (this.state.firstCardFlipped != undefined && this.state.secondCardFlipped != undefined) {
            return
        }
        if (this.state.firstCardFlipped === undefined) {
            this.state.firstCardFlipped = card
            this.state.firstCardFlipped.flipCardUp()
        }
        else if (this.state.secondCardFlipped === undefined) {
            this.state.secondCardFlipped = card
            this.state.secondCardFlipped.flipCardUp()
            if (this.state.secondCardFlipped.state.displayValue === this.state.firstCardFlipped.state.displayValue && this.state.firstCardFlipped.state.id !== this.state.secondCardFlipped.state.id) {
                this.setState({ firstCardFlipped: undefined, secondCardFlipped: undefined, totalFoundCards: this.state.totalFoundCards + 2 }, () => {
                    if (this.state.boardSize * this.state.boardSize === this.state.totalFoundCards) {
                        this.state.onFinished()
                    }
                })
                playSound(soundFiles.correctAnswerFile);
            }
            else {
                setTimeout(function () {
                    this.state.firstCardFlipped.resetCard()
                    this.state.secondCardFlipped.resetCard()
                    this.setState({ firstCardFlipped: undefined, secondCardFlipped: undefined })
                }.bind(this), this.state.flipDelay);
                playSound(soundFiles.wrongAnswerFile);
            }
        }
    }

    render() {
        return (
            <View style={styles.boardContainer}>
                {this.state.board.map((line, index) => (<View key={index} style={styles.rowContainer}>{line.map(card => card.element)}</View>))}
            </View>
        )
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
        alignItems: 'stretch',
        justifyContent: 'space-around'
    },
})
