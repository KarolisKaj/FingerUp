import React, { Component } from 'react';
import { View, StyleSheet } from "react-native";
import Card from './card.js'
import playSounds from '../../services/audioService';
import imageLoader from '../../services/imagesLoader'


function generateBoard(size, notifyFlipped) {
    let possibleValues = Math.floor(size * size / 2)
    let board = []
    let i = 0
    let colors = ['green', 'purple', 'black', 'brown', 'blue', 'orange', 'magenta', "pink"]
    for (const [key, Value] of Object.entries(imageLoader.dinosaurs)) {
        console.log(`${key}: ${Value}`);
        let cardRef1 = React.createRef()
        board.push({ element: (<Card key={`1x${i}`} id={`1x${i}`} ref={cardRef1} image={<Value style={{ fill: colors[i] }} height="80%" width="80%" />} matchId={i} notifyFlipped={notifyFlipped}></Card>), ref: cardRef1 });
        let cardRef2 = React.createRef()
        board.push({ element: (<Card key={`2x${i}`} id={`2x${i}`} ref={cardRef2} image={<Value style={{ fill: colors[i] }} height="80%" width="80%" />} matchId={i} notifyFlipped={notifyFlipped}></Card>), ref: cardRef2 });
        i = i + 1
        if (i >= possibleValues) {
            break
        }
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
            if (this.state.secondCardFlipped.state.matchId === this.state.firstCardFlipped.state.matchId && this.state.firstCardFlipped.state.id !== this.state.secondCardFlipped.state.id) {
                this.setState({ firstCardFlipped: undefined, secondCardFlipped: undefined, totalFoundCards: this.state.totalFoundCards + 2 }, () => {
                    if (this.state.boardSize * this.state.boardSize === this.state.totalFoundCards) {
                        this.state.onFinished()
                    }
                })
                playSounds.feedback.playCorrectAnswer();
            }
            else {
                setTimeout(function () {
                    this.state.firstCardFlipped.resetCard()
                    this.state.secondCardFlipped.resetCard()
                    this.setState({ firstCardFlipped: undefined, secondCardFlipped: undefined })
                }.bind(this), this.state.flipDelay);
                playSounds.feedback.playWrongAnswer();
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
