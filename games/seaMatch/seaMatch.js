import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import colorStyles from '../../styles/colorStyles'
import Draggable from 'react-native-draggable';
import { Square, Rectangle, Circle, Oval, Octagon, Trapezoid, Triangle, Hexagon, Pentagon } from 'react-native-shape';
import * as Animatable from 'react-native-animatable';
import playSounds from '../../services/audioService';
import Images from '../../services/imagesLoader'
import Header from '../../views/components/header.js'

export default class SeaMatch extends Component {
    constructor(props) {
        super(props)
        this.state = {
            timeLeft: 30,
            timer: undefined,
            shapeCount: 8,
            sizeOfShape: 60,
            margin: 30,
            oneSpaceHeight: Dimensions.get('window').height / 9,
            colors: ['green', 'purple', 'black', 'brown', 'blue', 'orange', 'magenta', "pink"],
            shapes: undefined,
            allShapes: undefined,
            shapesMap: undefined,
            timeElapsed: 0,
            gameFinished: false,
        }
    }

    componentDidMount() {
        this.createShapesMap()
        this.setState({ allShapes: this.createShapes(this.state.shapesMap) });
        this.state.timer = setInterval(() => {
            if (!this.state.gameFinished)
                this.setState({ timeElapsed: this.state.timeElapsed + 1 })
        }, 1000);
    }

    playCorrectSound() {
        playSounds.feedback.playCorrectAnswer();
    }

    playWrongSound() {
        playSounds.feedback.playWrongAnswer();
    }

    componentWillUnmount() {
        clearInterval(this.state.timer);
    }

    getRandomArray() {
        return Array.from({ length: this.state.shapeCount }, (_, k) => k).sort(() => .5 - Math.random());
    }

    createShapesMap() {
        createShape = (color, shapeSize, image) => {
            return <Image style={[styles.shape, { tintColor: color, maxWidth: shapeSize, maxHeight: shapeSize }]} source={image} />
        }
        createShapeSvg = (color, shapeSize, image) => {
            return image([styles.shape, { stroke: "red", fill: color, maxWidth: shapeSize, maxHeight: shapeSize }])
        }
        this.state.shapes = [
            (color) => createShapeSvg(color, this.state.sizeOfShape, (imageStyle) => (<Images.dinosaurs.brachiosaurus style={imageStyle} height="80" width="80"></Images.dinosaurs.brachiosaurus>)),
            (color) => createShapeSvg(color, this.state.sizeOfShape, (imageStyle) => (<Images.dinosaurs.gorgonopsia style={imageStyle} height="80" width="80"></Images.dinosaurs.gorgonopsia>)),
            (color) => createShapeSvg(color, this.state.sizeOfShape, (imageStyle) => (<Images.dinosaurs.parasaurolophus style={imageStyle} height="80" width="80"></Images.dinosaurs.parasaurolophus>)),
            (color) => createShapeSvg(color, this.state.sizeOfShape, (imageStyle) => (<Images.dinosaurs.plesiosaurus style={imageStyle} height="80" width="80"></Images.dinosaurs.plesiosaurus>)),
            (color) => createShapeSvg(color, this.state.sizeOfShape, (imageStyle) => (<Images.dinosaurs.pterosaur style={imageStyle} height="80" width="80"></Images.dinosaurs.pterosaur>)),
            (color) => createShapeSvg(color, this.state.sizeOfShape, (imageStyle) => (<Images.dinosaurs.stegosaurus style={imageStyle} height="80" width="80"></Images.dinosaurs.stegosaurus>)),
            (color) => createShapeSvg(color, this.state.sizeOfShape, (imageStyle) => (<Images.dinosaurs.styracosaurus style={imageStyle} height="80" width="80"></Images.dinosaurs.styracosaurus>)),
            (color) => createShapeSvg(color, this.state.sizeOfShape, (imageStyle) => (<Images.dinosaurs.tyrannosaurus style={imageStyle} height="80" width="80"></Images.dinosaurs.tyrannosaurus>))
        ]
        let slots = this.getRandomArray();
        let shapes = this.getRandomArray();
        this.state.shapesMap = Array(this.state.shapeCount).fill().map((_, i) => {
            let slotStartHeight = (slots[i] + 1) * this.state.oneSpaceHeight;
            let shapeStartHeight = (shapes[i] + 1) * this.state.oneSpaceHeight;
            let margin = (this.state.oneSpaceHeight - this.state.sizeOfShape) / 2;
            let shapeXPosition = Dimensions.get('window').width - this.state.sizeOfShape;
            return {
                slotStartY: slotStartHeight,
                slotStartX: margin,
                shapeStartY: shapeStartHeight,
                shapeStartX: shapeXPosition - this.state.margin,
                color: this.state.colors[shapes[i]],
                isMatched: false
            }
        });
    }

    createShapes(shapesMap) {
        return shapesMap.map((shapeMap, i) => {
            let getTopStyle = () => { return { top: shapeMap.slotStartY, position: 'absolute', left: this.state.margin } };
            return {
                shape: (!shapeMap.isMatched && <Draggable
                    key={`${shapeMap.shapeStartY}${shapeMap.shapeStartX}`}
                    x={shapeMap.shapeStartX}
                    y={shapeMap.shapeStartY}
                    renderSize={this.state.sizeOfShape}
                    renderColor={'transperant'}
                    shouldReverse
                    onDragRelease={((_, gestureState, __) => {
                        if (shapeMap.slotStartX < gestureState.moveX && gestureState.moveX < (shapeMap.slotStartX + this.state.sizeOfShape)) {
                            if (shapeMap.slotStartY < gestureState.moveY && gestureState.moveY < (this.state.sizeOfShape + shapeMap.slotStartY)) {
                                shapeMap.isMatched = true;
                                this.playCorrectSound();
                                if (this.state.shapesMap.every(x => x.isMatched))
                                    this.finishGame();
                                this.setState({ allShapes: this.createShapes(this.state.shapesMap) });
                            }
                            else {
                                this.playWrongSound();
                            }
                        }
                    }).bind(this)} >
                    <View style={{ width: this.state.sizeOfShape, height: this.state.sizeOfShape }}>
                        {this.state.shapes[i](shapeMap.color)}
                    </View>
                </Draggable>),
                slot: (<View style={getTopStyle()} key={`${shapeMap.slotStartY}${shapeMap.slotStartX}`}>
                    {this.state.shapes[i](shapeMap.isMatched ? shapeMap.color : 'grey')}
                </ View>)
            }
        });
    }

    finishGame() {
        this.state.gameFinished = true;
        setTimeout(function () { this.props.navigation.navigate('GameOfLife') }.bind(this), 5000);
        setTimeout(function () { this.props.navigation.navigate('GameStart') }.bind(this), 10000);
    }

    render() {
        return (
            <View style={styles.container}>
                <Header style={styles.textContainer} title="Sea Match"></Header>
                <View style={styles.scoreContainer}>
                    <Text style={styles.bigText}>Time passed: {this.state.timeElapsed}</Text>
                </View>
                <View style={{ ...styles.contentContainer, ...{ backgroundColor: 'transperant' } }}>
                    {this.state.allShapes && this.state.allShapes.map(x => x.shape)}
                    {this.state.allShapes && this.state.allShapes.map(x => x.slot)}
                </View>
                {
                    this.state.gameFinished && <View style={styles.center}>
                        <Animatable.Text style={styles.bigText} animation="pulse" easing="ease-out" iterationCount="infinite">You won in {this.state.timeElapsed} seconds!</Animatable.Text>
                    </View>
                }
            </View >
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colorStyles.lowIntenseColor,
        flexDirection: 'column',
    },
    textContainer: {
        flex: 1,
        alignItems: 'center',
    },
    scoreContainer: {
        flex: 19,
        alignItems: 'center',
    },
    contentContainer: {
        position: "absolute",
        top: 0, left: 0,
        right: 0, bottom: 0,
    },
    center: {
        position: 'absolute',
        top: 0, left: 0,
        right: 0, bottom: 0,
        backgroundColor: colorStyles.lowIntenseColor,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bigText: {
        fontSize: 32
    },
    shape: {
        aspectRatio: 1,
        padding: 0,
        margin: 0
    }
})
