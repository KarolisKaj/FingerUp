import React, { Component } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import FlipCard from 'react-native-flip-card';
import colorStyles from '../../styles/colorStyles'

export default class Card extends Component {
    constructor(props) {
        super(props)
        this.state = {
            matchId: props.matchId,
            image: props.image,
            isFlipped: false,
            notifyFlipped: props.notifyFlipped,
            locked: false,
            id: props.id
        }
    }

    resetCard() {
        this.setState({ locked: false, isFlipped: false })
    }

    flipCardUp() {
        this.setState({ isFlipped: true, locked: true })
    }

    notifyParent() {
        if (this.state.locked) return
        let self = this;
        this.state.notifyFlipped(self)
    }

    render() {
        return (
            <FlipCard style={styles.cardContainer} ref={(card) => this.card = card} clickable={false} flip={this.state.isFlipped} flipHorizontal={true} flipVertical={true} friction={6}>
                <TouchableOpacity style={styles.closedCard} onPress={() => this.notifyParent()}><Text style={{ color: colorStyles.lowIntenseColor }}>Open me!</Text></TouchableOpacity>
                <TouchableOpacity style={styles.openedCard} >{this.state.image}</TouchableOpacity>
            </FlipCard>
        );
    }
}

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
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
