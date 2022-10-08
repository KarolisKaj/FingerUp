import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground, FlatList, Modal, TextInput, Pressable } from 'react-native';
import colorStyles from '../styles/colorStyles'
import storage from '../services/storage'
import images from '../services/imagesLoader'

export default class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
            players: [],
            showCreatePlayerModal: false,
            newPlayerName: "",
        }
    }

    async componentDidMount() {
        let players = await storage.getPlayers()
        this.setState({ players: players })
        // do stuff while splash screen is shown
        // After having done stuff (such as async tasks) hide the splash screen
        // SplashScreen.hide();
    }

    render() {
        return (
            <ImageBackground source={images.beach_image} style={styles.bckgrndImage}>
                <View style={styles.container}>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={this.state.showCreatePlayerModal}
                        onRequestClose={() => {
                            this.setState({ showCreatePlayerModal: !this.state.showCreatePlayerModal })
                        }}>
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <Text style={styles.modalText}>Enter new player name:</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder=""
                                    keyboardType="default"
                                    defaultValue=""
                                    autoCorrect={false}
                                    autoCapitalize={true}
                                    maxLength={50}
                                    value={this.state.newPlayerName}
                                    onSubmitEditing={async (e) => {
                                        console.log(e.nativeEvent.text)
                                        let id = await storage.createPlayer(e.nativeEvent.text)
                                        storage.setActivePlayer(id)
                                        this.setState({ newPlayerName: "", showCreatePlayerModal: false })
                                        await this.componentDidMount()
                                    }}
                                    onChangeText={newText => {
                                        this.setState({ newPlayerName: newText.replace(/[^a-z ]/gi, '') })
                                    }}
                                />
                            </View>
                        </View>
                    </Modal>
                    <View style={styles.textContainer}>
                        <Text style={styles.welcome}>Hello! Pick saved player or create one!</Text>
                    </View>
                    <View style={styles.gamesContainer}>
                        <FlatList style={styles.list}
                            data={this.state.players}
                            renderItem={({ item }) => <TouchableOpacity key={item.id} style={styles.listBtn}
                                onPress={() => {
                                    storage.setActivePlayer(item.id)
                                    this.props.navigation.navigate('GameStart')
                                }}>
                                <Text style={styles.listTxt}>{item.name}</Text>
                            </TouchableOpacity>}>
                        </FlatList>
                        <TouchableOpacity style={styles.button} onPress={() => {
                            this.setState({ showCreatePlayerModal: !this.state.showCreatePlayerModal })
                        }}>
                            <View style={styles.innerBtnView}  >
                                <Image style={styles.innerBtnImage} source={images.edit} />
                                <Text style={styles.innerBtnText}>Create Player</Text>
                            </View>
                        </TouchableOpacity >
                    </View>
                </View >
            </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({
    bckgrndImage: {
        resizeMode: 'cover',
    },
    container: {
        height: '100%',
        width: '100%',
    },
    textContainer: {
        flexShrink: 1,
    },
    gamesContainer: {
        flex: 1,
    },
    welcome: {
        fontSize: 30,
        textAlign: 'center',
        marginTop: 40,
        margin: 10,
        color: colorStyles.lowIntenseColor
    },
    button: {
        flexGrow: 1,
        flexShrink: 1,
        alignSelf: 'center',
        borderRadius: 20,
        backgroundColor: colorStyles.mediumIntenseColor,
        opacity: 0.85,
        elevation: 2,
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        minHeight: 100,
        maxHeight: 200,
        aspectRatio: 1,
        margin: '1%',
    },
    innerBtnView: {
        flex: 1,
        alignItems: 'center',
        margin: 5
    },
    innerBtnText: {
        fontSize: 30,
    },
    innerBtnImage: {
        flex: 1.5,
        aspectRatio: 1,
    },
    spacer: {
        flex: 1,
        minHeight: 10,
        minWidgh: 10
    },
    list: {
        flex: 1,
        borderColor: colorStyles.mediumIntenseColor,
        borderWidth: 1,
        width: '100%'
    },
    listBtn: {
        flex: 1,
        borderRadius: 20,
        backgroundColor: colorStyles.mediumIntenseColor,
        margin: 10,
        fontSize: 26

    },
    listTxt: {
        flex: 1,
        fontSize: 26,
        alignSelf: 'center',
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: colorStyles.lowIntenseColor,
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalText: {
        marginBottom: 15,
        fontSize: 26,
        textAlign: "center"
    },
    input: {
        minWidgh: "100%",
        fontSize: 26,
        backgroundColor: colorStyles.lowerIntenseColor,
        alignSelf: 'stretch',
        blurOnSubmit: true,
        textAlign: 'center'
    }
});
