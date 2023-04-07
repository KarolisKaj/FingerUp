import Brachiosaurus from '../assets/dinosaurs/brachiosaurus.svg'
import Gorgonopsia from '../assets/dinosaurs/gorgonopsia.svg'
import Parasaurolophus from '../assets/dinosaurs/parasaurolophus.svg'
import Plesiosaurus from '../assets/dinosaurs/plesiosaurus.svg'
import Pterosaur from '../assets/dinosaurs/pterosaur.svg'
import Stegosaurus from '../assets/dinosaurs/stegosaurus.svg'
import Styracosaurus from '../assets/dinosaurs/styracosaurus.svg'
import Tyrannosaurus from '../assets/dinosaurs/tyrannosaurus.svg'
import ThumbsUp from '../assets/thumbs_up.svg'

const images = {
    seaAnimals: {
        crab: require('../assets/seaAnimals/crab.png'),
        dolphin: require('../assets/seaAnimals/dolphin.png'),
        jellyfish: require('../assets/seaAnimals/jellyfish.png'),
        octopus: require('../assets/seaAnimals/octopus.png'),
        turtle: require('../assets/seaAnimals/turtle.png'),
        whale: require('../assets/seaAnimals/whale.png'),
    },
    dinosaurs: {
        brachiosaurus: Brachiosaurus,
        gorgonopsia: Gorgonopsia,
        parasaurolophus: Parasaurolophus,
        plesiosaurus: Plesiosaurus,
        pterosaur: Pterosaur,
        stegosaurus: Stegosaurus,
        styracosaurus: Styracosaurus,
        tyrannosaurus: Tyrannosaurus,
    },
    background: require('../assets/background.png'),
    accessibility: require('../assets/accessibility.png'),
    card: require('../assets/card.png'),
    edit: require('../assets/edit.png'),
    fish: require('../assets/fish.png'),
    hand: require('../assets/hand.png'),
    connections: require('../assets/connections.png'),
    matching: require('../assets/matching.png'),
    next: require('../assets/next.png'),
    check: require('../assets/check.png'),
    thumbsUp: ThumbsUp,
};

export default images;
