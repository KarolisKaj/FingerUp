import * as React from 'react';
import { Component } from 'react';
import { View, StyleSheet, Text, Button, TouchableOpacity, Image, Slider } from 'react-native';
import colorStyles from '../../styles/colorStyles'
import OutlineShape from './outlineShape';

export default class OutlineShapeGame extends Component {
    constructor(props) {
        super(props)
        this.state = {
            currentPage: 0,
            pages: [{ shape: "B", points: [], score: 50 }, { shape: "A", points: [], score: 50 }, { shape: "C", points: [], score: 50 },],
            isDrawing: true
        }
    }

    render() {
        return (
            <View style={styles.container}>
                {this.state.currentPage > -1 && <OutlineShape points={this.state.pages[this.state.currentPage].points}
                    shape={this.state.pages[this.state.currentPage].shape}
                    style={styles.contentContainer}>
                </OutlineShape>}
                <View style={styles.contentContainer}>
                    <View style={styles.spaceTop}></View>
                    {this.state.isDrawing && <View style={styles.spaceBottom}>
                        <TouchableOpacity style={{ ...styles.button, ...{ transform: [{ rotate: '90deg' }] } }}
                            disabled={this.state.currentPage == 0}
                            onPress={() => {
                                this.setState({ currentPage: this.state.currentPage + 1 })
                                this.forceUpdate()
                            }}>
                            <Image style={styles.innerBtnImage} source={require('../../assets/next.png')} />
                        </TouchableOpacity></View>}
                    {!this.state.isDrawing && <View style={styles.spaceBottom}>
                        <TouchableOpacity style={{ ...styles.button, ...{ opacity: this.state.currentPage == 0 ? 0.1 : 0.85 }, ...{ transform: [{ rotate: '180deg' }] } }}
                            disabled={this.state.currentPage == 0}
                            onPress={() => {
                                this.setState({ currentPage: this.state.currentPage - 1 })
                                this.forceUpdate()
                            }}>
                            <Image style={styles.innerBtnImage} source={require('../../assets/next.png')} />
                        </TouchableOpacity>
                        <View style={styles.container}>
                            <Text style={{ textAlign: 'center', fontSize: 20 }}>
                                Mark - {Math.round(this.state.pages[this.state.currentPage].score)}/100
                            </Text>
                            <Slider maximumValue={100} style={styles.slider}
                                value={this.state.pages[this.state.currentPage].score}
                                onValueChange={value => {
                                    this.state.pages[this.state.currentPage].score = value
                                    this.setState({ pages: this.state.pages })
                                }}></Slider>
                        </View>
                        <TouchableOpacity style={{ ...styles.button, ...{ opacity: this.state.currentPage == this.state.pages.length - 1 ? 0.1 : 0.85 } }}
                            disabled={this.state.currentPage == this.state.pages.length - 1}
                            onPress={() => {
                                this.setState({ currentPage: this.state.currentPage + 1 })
                                this.forceUpdate()
                            }}>
                            <Image style={styles.innerBtnImage} source={require('../../assets/next.png')} />
                        </TouchableOpacity>
                    </View>}
                </View>
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
    spaceTop: {
        flex: 7
    },
    spaceBottom: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        flexDirection: 'row',
    },
    contentContainer: {
        position: "absolute",
        top: 0, left: 0,
        right: 0, bottom: 0,
        minWidth: '100%',
        minHeight: '100%',
        flex: 1,
        // alignItems:'stretch'
    },
    button: {
        flexGrow: 1,
        flexShrink: 1,
        alignSelf: 'center',
        borderRadius: 100,
        backgroundColor: colorStyles.mediumIntenseColor,
        opacity: 0.85,
        elevation: 2,
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        minHeight: 100,
        maxHeight: 100,
        maxWidth: 100,
        aspectRatio: 1,
        margin: '1%',
    },
    innerBtnImage: {
        flex: 1.5,
        aspectRatio: 1,
        aspectRatio: 1,
        alignSelf: 'center',

    },
    slider: {
        color: colorStyles.mediumIntenseColor,
        padding: 0,
        margin: 10
    }
})
