import * as React from 'react';
import { Component } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import Slider from '@react-native-community/slider'
import colorStyles from '../../styles/colorStyles'
import OutlineShape from './outlineShape';
import { TabView, TabBar } from 'react-native-tab-view';
import ImagesLoader from '../../services/imagesLoader'
import storage from '../../services/storage'


export default class OutlineShapeGame extends Component {
    constructor(props) {
        super(props)
        this.state = {
            currentPage: 0,
            pages: [{ key: 1, shape: "A", score: 50, drawingFinished: false, marked: false }, { key: 2, shape: "B", score: 50, drawingFinished: false, marked: false }, { key: 3, shape: "C", score: 50, drawingFinished: false, marked: false },],
        }
    }

    render() {
        return (
            <TabView key={1}
                swipeEnabled={false}
                navigationState={{ index: this.state.currentPage, routes: this.state.pages }}
                renderScene={(view) => {
                    let route = view.route
                    return (
                        <View key={route.shape} style={styles.container}>
                            <OutlineShape
                                style={styles.shapeContainer}
                                shape={route.shape}
                                isReadonly={route.drawingFinished}>
                            </OutlineShape>
                            {/* <View style={styles.bottomDialsContainer}><Text style={{ textAlign: 'center', fontSize: 200 }}>Hi</Text></View> */}
                            <View style={styles.bottomDialsContainer}>
                                <View style={styles.spaceTop}></View>
                                <View style={styles.spaceBottom}>
                                    {this.state.pages.every(x => x.drawingFinished) && <View style={styles.sliderContainer}>
                                        <Text style={{ textAlign: 'center', fontSize: 20 }}>
                                            Mark - {Math.round(this.state.pages[this.state.currentPage].score)}/100
                                        </Text>
                                        <Slider maximumValue={100} style={styles.slider}
                                            value={this.state.pages[this.state.currentPage].score}
                                            onValueChange={value => {
                                                this.state.pages[this.state.currentPage].score = value
                                                this.setState({ pages: this.state.pages })
                                            }}></Slider>
                                    </View>}
                                    <TouchableOpacity style={{ ...styles.button }}
                                        onPress={async () => {
                                            let markingMode = this.state.pages.every(x => x.drawingFinished)
                                            if (markingMode) {
                                                this.state.pages[this.state.currentPage].marked = true
                                                this.setState({ pages: this.state.pages })
                                                if (this.state.pages.every(x => x.marked)) {
                                                    await storage.updatePlayer(this.props.route.name, { shapes: this.state.pages.map(x => { return { shape: x.shape, score: x.score } }) })
                                                    setTimeout(function () { this.props.navigation.navigate('GameStart') }.bind(this), 10000);
                                                    this.props.navigation.navigate('GameOfLife')
                                                } else {
                                                    for (let i = 0; i < this.state.pages.length; i++) {
                                                        if (!this.state.pages[i].marked) {
                                                            this.setState({ currentPage: i })
                                                            return
                                                        }
                                                    }
                                                }
                                            }
                                            else {
                                                this.state.pages[this.state.currentPage].drawingFinished = true
                                                this.setState({ pages: this.state.pages })
                                                if (this.state.pages.every(x => x.drawingFinished)) {
                                                    this.setState({ currentPage: 0 })
                                                } else {
                                                    for (let i = 0; i < this.state.pages.length; i++) {
                                                        if (!this.state.pages[i].drawingFinished) {
                                                            this.setState({ currentPage: i })
                                                            return
                                                        }
                                                    }
                                                }
                                            }
                                        }}>
                                        <Image style={styles.innerBtnImage} source={ImagesLoader.check} />
                                    </TouchableOpacity>

                                </View>
                            </View>
                        </View>)
                }}
                onIndexChange={(index) => this.setState({ currentPage: index })}
                renderTabBar={props =>
                    <TabBar
                        {...props}
                        renderLabel={({ route, focused, color }) => (
                            <Text key={route.shape} style={{ color, marginTop: 30, fontSize: 22 }}>
                                {route.shape}
                            </Text>
                        )}
                        onTabPress={({ route, preventDefault }) => {
                            this.setState({ currentPage: this.state.pages.indexOf(route) })
                        }}
                    />
                }
            />
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
        backgroundColor: colorStyles.lowIntenseColor,
    },
    spaceTop: {
        flex: 1
    },
    shapeContainer: {
        topMargin: '50%'
    },
    bottomDialsContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    spaceBottom: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        flexDirection: 'row',
    },
    sliderContainer: {
        flex: 1,
        alignItems: 'stretch',
        justifyContent: 'space-around',
        flexDirection: 'column',
        selfAlign: 'stretch'
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
        margin: '5%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerBtnImage: {
        flex: 1,
        maxHeight: '80%',
        aspectRatio: 1,
        alignSelf: 'center',
    },
    slider: {
        color: colorStyles.mediumIntenseColor,
        padding: 0,
        margin: 10,
        selfAlign: 'stretch'

    }
})
