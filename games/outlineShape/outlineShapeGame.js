import * as React from 'react';
import { Component } from 'react';
import { View, StyleSheet, Text, Button, TouchableOpacity, Image } from 'react-native';
import colorStyles from '../../styles/colorStyles'
import OutlineShape from './outlineShape';

export default class OutlineShapeGame extends Component {
    constructor(props) {
        super(props)
        this.state = {
            currentPage: 0,
            currentShape: "B",
            pages: [{ shape: "B", points: [] }, { shape: "A", points: [] }, { shape: "C", points: [] },]

        }
    }

    render() {
        return (
            <View style={styles.container}>
                {// TODO: pass in points to child and get it back then change to viewing mode.
                }
                <OutlineShape points={this.state.pages[this.state.currentPage].points}
                    shape={this.state.currentShape}
                    style={styles.contentContainer}>
                </OutlineShape>
                <View style={styles.contentContainer}>
                    {/* <View styles={styles.buttonView}>
                        <Button style={styles.button} title="Prev"
                            disabled={this.state.currentPage == 0}
                            onPress={() => this.setState({ currentPage: this.state.currentPage - 1, currentShape: this.state.pages[this.state.currentPage - 1].shape })}></Button>
                    </View>
                    <View styles={styles.buttonView}>
                        <Button style={styles.button} title="Next"
                            disabled={this.state.currentPage == this.state.pages.length - 1}
                            onPress={() => this.setState({ currentPage: this.state.currentPage + 1, currentShape: this.state.pages[this.state.currentPage + 1].shape })}></Button>
                    </View> */}
                    <TouchableOpacity style={{ ...styles.button, ...{ opacity: this.state.currentPage == 0 ? 0.1 : 0.85 }}}
                        disabled={this.state.currentPage == 0}
                        onPress={() => this.setState({ currentPage: this.state.currentPage - 1, currentShape: this.state.pages[this.state.currentPage - 1].shape })}>
                        <Image style={styles.innerBtnImage} source={require('../../assets/edit-outline.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ ...styles.button, ...{ opacity: this.state.currentPage == this.state.pages.length - 1 ? 0.1 : 0.85 }}} disabled={this.state.currentPage == this.state.pages.length - 1}
                        onPress={() => this.setState({ currentPage: this.state.currentPage + 1, currentShape: this.state.pages[this.state.currentPage + 1].shape })}>
                        <Image style={styles.innerBtnImage} source={require('../../assets/edit-outline.png')} />
                    </TouchableOpacity>
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
    contentContainer: {
        position: "absolute",
        top: 0, left: 0,
        right: 0, bottom: 0,
        minWidth: '100%',
        minHeight: '100%',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        flexDirection: 'row',
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
        maxHeight: '90%',
        aspectRatio: 1,
        alignSelf: 'center',

    },
})
