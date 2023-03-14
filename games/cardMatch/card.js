import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FlipCard from 'react-native-flip-card';
import colorStyles from '../../styles/colorStyles'

export default class Card extends Component {
    constructor(props) {
        super(props)
        this.state = {
            displayValue: props.displayValue,
            isFlipped: false,
            notifyFlipped: props.notifyFlipped,
            locked: false,
            id: props.id
        }
    }

    lockCard() {
        this.setState({ locked: true })
    }

    flipCard() {
        if (this.state.locked) return
        let self = this;
        this.card.flip()
        this.setState({ isFlipped: !this.state.isFlipped }, (() => this.state.notifyFlipped(this.state.displayValue, this.props.id, this.state.isFlipped, self)).bind(self));
    }

    render() {
        return (
            <FlipCard style={styles.cardContainer} ref={(card) => this.card = card} >
                <TouchableOpacity style={styles.closedCard} onPress={() => this.flipCard()} ><Text style={{color: colorStyles.lowIntenseColor}}>Open me!</Text></TouchableOpacity>
                <TouchableOpacity style={styles.openedCard} ><Text>{this.state.displayValue}</Text></TouchableOpacity>
            </FlipCard>
        );
    }
}

const styles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        alignItems: 'center',
        margin: 5
    },
    openedCard: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colorStyles.lowerIntenseColor
    },
    closedCard: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colorStyles.mediumIntenseColor
    }
})
