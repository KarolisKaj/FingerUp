import { Audio } from 'expo-av';

playSound = (file) => {
    (async (file) => {
        let soundObject = await Audio.Sound.createAsync(file);
        await soundObject.sound.playAsync()
    })(file)
}

locations = {
    feedback: {
        correctAnswerFile: require('../assets/sound/feedback/correct_answer.wav'),
        wrongAnswerFile: require('../assets/sound/feedback/wrong_answer.wav')
    },
    explanations: {

    }
}

export default playSounds = {
    feedback: {
        playCorrectAnswer: () => playSound(locations.feedback.correctAnswerFile),
        playWrongAnswer: () => playSound(locations.feedback.wrongAnswerFile)
    },
    explanations: {

    }
}
