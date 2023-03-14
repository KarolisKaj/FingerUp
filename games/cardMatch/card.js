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
        this.setState({ isFlipped: !this.state.isFlipped }, (() => this.state.notifyFlipped(this.state.displayValue, this.props.id, this.state.isFlipped, self)).bind(self));
    }

    render() {
        return (
            <FlipCard style={styles.cardContainer} flip={this.state.isFlipped} flipHorizontal={true} flipVertical={true} friction={6}>
                <View style={styles.closedCard}><Text style={{ color: colorStyles.lowIntenseColor }}>Open me!</Text></View>
                <View style={styles.openedCard}><Text>{this.state.displayValue}</Text></View>
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
