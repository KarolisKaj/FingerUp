import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default class Header extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.block1}></View>
                <View style={styles.textContainer}><Text style={styles.text}>{this.props.title}</Text></View>
                <View style={styles.instructions}></View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
    },
    block1: {
        flexGrow: 1,
        // backgroundColor: "yellow"
    },
    textContainer: {
        alignItems: 'center',
        flex: 3
    },
    text: {
        fontStyle: 'italic',
        fontSize: 24
    },
    instructions: {
        alignItems: 'center',
        flexGrow: 1,
        alignSelf: 'stretch',
        // backgroundColor: "red"
    },
})
