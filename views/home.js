import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import colorStyles from '../styles/colorStyles'

function Home({ navigation }) {
    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                <Text style={styles.welcome}>Hello dear traveler, choose a game to play!</Text>
            </View>
            <View style={styles.gamesContainer}>
                <View style={styles.button}>
                    <Button color={colorStyles.mediumIntenseColor} title="Game of Life" onPress={() => navigation.navigate('GameOfLife')}></Button>
                </View>
                <View style={styles.button}>
                    <Button color={colorStyles.mediumIntenseColor} title="Card Match" onPress={() => navigation.navigate('CardMatch')}></Button>
                </View>
                <View style={styles.button}>
                    <Button color={colorStyles.mediumIntenseColor} title="Pinch Fish" onPress={() => navigation.navigate('PinchFish')}></Button>
                </View>
                <View style={styles.button}>
                    <Button color={colorStyles.mediumIntenseColor} title="Sea Match" onPress={() => navigation.navigate('SeaMatch')}></Button>
                </View>
                <View style={styles.button}>
                    <Button color={colorStyles.mediumIntenseColor} title="Outline Shape" onPress={() => navigation.navigate('OutlineShape')}></Button>
                </View>
                <View style={styles.button}>
                    <Button color={colorStyles.mediumIntenseColor} title="Connect Dots" onPress={() => navigation.navigate('ConnectDots')}></Button>
                </View>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
        backgroundColor: colorStyles.lowIntenseColor,
    },
    textContainer: {
        flex: 1,
        paddingHorizontal: 10,
    },
    gamesContainer: {
        flex: 9,
        justifyContent: 'space-around',
        alignContent: 'space-around',
        flexWrap: 'wrap',
        flexDirection: 'row',
        alignSelf: 'flex-start'
    },
    welcome: {
        fontSize: 30,
        textAlign: 'center',
    },
    button: {
        margin:'5%'
    }
});

export default Home
