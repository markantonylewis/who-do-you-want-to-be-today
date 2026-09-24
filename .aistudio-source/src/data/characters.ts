import { CharacterItem, CharacterId } from '../types';
import { getCustomTrainedWords } from '../utils/toddlerVoiceTraining';

export const CHARACTERS: CharacterItem[] = [
  {
    id: 'firefighter',
    name: 'Fireman',
    pluralName: 'firemen',
    category: 'occupation',
    descriptionSentence: 'Fireman! Firemen drive fire engines and put out fires!',
    repeatEncouragement: 'Can you say it with me? Fireman!',
    cleanModelSentence: 'Nice! Fireman! Say it with me: fireman!',
    actions: [
      {
        id: 'fire_engine',
        emoji: '🚒',
        actionTitle: 'Drive fire engines',
        actionSentence: 'Firemen drive fire engines.',
        repeatPrompt: 'Can you say fire engine?',
        targetWord: 'fire engine',
        praise: 'Well done!',
      },
      {
        id: 'water_hose',
        emoji: '💦',
        actionTitle: 'Squirt water hoses',
        actionSentence: 'Firemen squirt water hoses.',
        repeatPrompt: 'Can you say water hose?',
        targetWord: 'water hose',
        praise: 'Well done!',
      },
      {
        id: 'ladder',
        emoji: '🪜',
        actionTitle: 'Climb tall ladders',
        actionSentence: 'Firemen climb tall ladders.',
        repeatPrompt: 'Can you say ladder?',
        targetWord: 'ladder',
        praise: 'Well done!',
      },
    ],
    relatedWords: [
      { word: 'Fire Engine', emoji: '🚒', actionHint: 'Wee-woo wee-woo!' },
      { word: 'Water Hose', emoji: '💦', actionHint: 'Sploosh!' },
    ],
    soundType: 'siren',
    iconEmoji: '🧑‍🚒',
    primaryColor: '#ef4444', // vibrant red
    accentColor: '#fbbf24', // bright gold
    nearMisses: [
      'fireman', 'firemen', 'fire engine', 'firefighter', 'fire fighter', 'fire man', 'fifi', 'fire',
      'fighta', 'fia', 'faya', 'waterman', 'fire person', 'fire chief', 'wee woo', 'weewoo', 'pieman',
      'pie man', 'engine', 'wata', 'water hose', 'hose', 'siren', 'fi'
    ],
  },
  {
    id: 'police_officer',
    name: 'Policeman',
    pluralName: 'policemen',
    category: 'occupation',
    descriptionSentence: 'Policeman! Policemen keep everyone safe and help friends!',
    repeatEncouragement: 'Can you say it with me? Policeman!',
    cleanModelSentence: 'Great job! Policeman! Say it with me: policeman!',
    actions: [
      {
        id: 'police_car',
        emoji: '🚓',
        actionTitle: 'Drive police cars',
        actionSentence: 'Policemen drive police cars.',
        repeatPrompt: 'Can you say police car?',
        targetWord: 'police car',
        praise: 'Well done!',
      },
      {
        id: 'badge',
        emoji: '⭐',
        actionTitle: 'Wear shiny badges',
        actionSentence: 'Policemen wear shiny badges.',
        repeatPrompt: 'Can you say badge?',
        targetWord: 'badge',
        praise: 'Well done!',
      },
      {
        id: 'whistle',
        emoji: '🚨',
        actionTitle: 'Blow loud whistles',
        actionSentence: 'Policemen blow loud whistles.',
        repeatPrompt: 'Can you say whistle?',
        targetWord: 'whistle',
        praise: 'Well done!',
      },
    ],
    relatedWords: [
      { word: 'Police Car', emoji: '🚓', actionHint: 'Vroom vroom!' },
      { word: 'Shiny Badge', emoji: '⭐', actionHint: 'Sparkle sparkle!' },
    ],
    soundType: 'whistle',
    iconEmoji: '👮',
    primaryColor: '#2563eb', // bold police blue
    accentColor: '#facc15', // gold star
    nearMisses: [
      'policeman', 'policemen', 'police', 'police car', 'cop', 'popo', 'po po', 'police officer', 'policewoman',
      'officer', 'badge', 'whistle', 'peece', 'poliss', 'paman', 'po-po', 'paw patrol', 'chase', 'woo woo',
      'woowoo', 'siren', 'cops', 'po'
    ],
  },
  {
    id: 'builder',
    name: 'Builder',
    pluralName: 'builders',
    category: 'occupation',
    descriptionSentence: 'Builder! Builders build big houses and drive diggers!',
    repeatEncouragement: 'Can you say it with me? Builder!',
    cleanModelSentence: 'Awesome! Builder! Say it with me: builder!',
    actions: [
      {
        id: 'digger',
        emoji: '🚜',
        actionTitle: 'Drive diggers',
        actionSentence: 'Builders drive diggers.',
        repeatPrompt: 'Can you say digger?',
        targetWord: 'digger',
        praise: 'Well done!',
      },
      {
        id: 'hammer',
        emoji: '🔨',
        actionTitle: 'Tap with hammers',
        actionSentence: 'Builders tap with hammers.',
        repeatPrompt: 'Can you say hammer?',
        targetWord: 'hammer',
        praise: 'Well done!',
      },
      {
        id: 'bricks',
        emoji: '🧱',
        actionTitle: 'Lay bricks',
        actionSentence: 'Builders lay bricks.',
        repeatPrompt: 'Can you say brick?',
        targetWord: 'brick',
        praise: 'Well done!',
      },
    ],
    relatedWords: [
      { word: 'Digger', emoji: '🚜', actionHint: 'Scoop scoop!' },
      { word: 'Hammer', emoji: '🔨', actionHint: 'Tap-tap-tap!' },
    ],
    soundType: 'hammer',
    iconEmoji: '👷',
    primaryColor: '#f59e0b', // construction yellow/orange
    accentColor: '#3b82f6', // blue suspenders
    nearMisses: [
      'builder', 'digger', 'hammer', 'build', 'bricks', 'brick', 'construction', 'bob', 'bob the builder',
      'tool', 'worker', 'builda', 'bida', 'bobo', 'dig', 'digga', 'ham', 'hamma', 'fixer', 'hard hat', 'truck'
    ],
  },
  {
    id: 'doctor',
    name: 'Doctor',
    pluralName: 'doctors',
    category: 'occupation',
    descriptionSentence: 'Doctor! Doctors help you feel strong, healthy, and all better!',
    repeatEncouragement: 'Can you say it with me? Doctor!',
    cleanModelSentence: 'Super! Doctor! Say it with me: doctor!',
    actions: [
      {
        id: 'stethoscope',
        emoji: '🩺',
        actionTitle: 'Listen with stethoscopes',
        actionSentence: 'Doctors listen with stethoscopes.',
        repeatPrompt: 'Can you say stethoscope?',
        targetWord: 'stethoscope',
        praise: 'Well done!',
      },
      {
        id: 'plaster',
        emoji: '🩹',
        actionTitle: 'Put on plasters',
        actionSentence: 'Doctors put on plasters.',
        repeatPrompt: 'Can you say plaster?',
        targetWord: 'plaster',
        praise: 'Well done!',
      },
      {
        id: 'thermometer',
        emoji: '🌡️',
        actionTitle: 'Use thermometers',
        actionSentence: 'Doctors use thermometers.',
        repeatPrompt: 'Can you say thermometer?',
        targetWord: 'thermometer',
        praise: 'Well done!',
      },
    ],
    relatedWords: [
      { word: 'Stethoscope', emoji: '🩺', actionHint: 'Thump-thump, thump-thump!' },
      { word: 'Plaster', emoji: '🩹', actionHint: 'All better!' },
    ],
    soundType: 'heartbeat',
    iconEmoji: '🩺',
    primaryColor: '#06b6d4', // medical cyan/teal
    accentColor: '#f43f5e', // red cross
    nearMisses: [
      'doctor', 'doc', 'plaster', 'stethoscope', 'thermometer', 'docka', 'medic', 'nurse', 'hospital', 'steth', 'checkup',
      'bandaid', 'dr', 'medicine', 'feel better', 'docta', 'dada', 'doc-doc', 'hurt', 'owie', 'better', 'do'
    ],
  },
  {
    id: 'lion',
    name: 'Lion',
    pluralName: 'lions',
    category: 'animal',
    descriptionSentence: 'Lion! Lions have a big fluffy mane and give a loud, happy roar!',
    repeatEncouragement: 'Can you say it with me? Lion!',
    cleanModelSentence: 'Roar! Lion! Say it with me: lion!',
    actions: [
      {
        id: 'paw',
        emoji: '🐾',
        actionTitle: 'Patter with big paws',
        actionSentence: 'Lions patter with big paws.',
        repeatPrompt: 'Can you say paw?',
        targetWord: 'paw',
        praise: 'Well done!',
      },
      {
        id: 'mane',
        emoji: '👑',
        actionTitle: 'Shake fluffy manes',
        actionSentence: 'Lions have big fluffy manes.',
        repeatPrompt: 'Can you say mane?',
        targetWord: 'mane',
        praise: 'Well done!',
      },
    ],
    relatedWords: [
      { word: 'Fluffy Mane', emoji: '🦁', actionHint: 'So soft and big!' },
      { word: 'Big Paws', emoji: '🐾', actionHint: 'Patter patter!' },
    ],
    soundType: 'lion_roar',
    iconEmoji: '🦁',
    primaryColor: '#f97316', // lion amber
    accentColor: '#fde047', // sunny yellow
    nearMisses: [
      'lion', 'roar', 'rawr', 'simba', 'big cat', 'lyon', 'lion king', 'mane', 'paw', 'waw', 'wion', 'kitty', 'cat', 'meow', 'rowr', 'ra'
    ],
  },
  {
    id: 'tiger',
    name: 'Tiger',
    pluralName: 'tigers',
    category: 'animal',
    descriptionSentence: 'Tiger! Tigers have beautiful black stripes and run super fast in the jungle!',
    repeatEncouragement: 'Can you say it with me? Tiger!',
    cleanModelSentence: 'Woohoo! Tiger! Say it with me: tiger!',
    actions: [
      {
        id: 'jungle',
        emoji: '🌴',
        actionTitle: 'Run through jungles',
        actionSentence: 'Tigers run through the jungle.',
        repeatPrompt: 'Can you say jungle?',
        targetWord: 'jungle',
        praise: 'Well done!',
      },
      {
        id: 'stripes',
        emoji: '🐯',
        actionTitle: 'Show bold stripes',
        actionSentence: 'Tigers have orange and black stripes.',
        repeatPrompt: 'Can you say stripe?',
        targetWord: 'stripe',
        praise: 'Well done!',
      },
    ],
    relatedWords: [
      { word: 'Stripes', emoji: '🐯', actionHint: 'Black and orange stripes!' },
      { word: 'Jungle Tree', emoji: '🌴', actionHint: 'Swish swish!' },
    ],
    soundType: 'tiger_growl',
    iconEmoji: '🐯',
    primaryColor: '#ea580c', // tiger deep orange
    accentColor: '#18181b', // bold tiger black
    nearMisses: [
      'tiger', 'tigger', 'stripes', 'stripe', 'tyger', 'tigre', 'tiga', 'orange cat', 'jungle cat', 'grr', 'grrr', 'tigey', 'daniel'
    ],
  },
  {
    id: 'dog',
    name: 'Dog',
    pluralName: 'dogs',
    category: 'animal',
    descriptionSentence: 'Dog! Friendly puppies wag their tails and say woof-woof!',
    repeatEncouragement: 'Can you say it with me? Dog!',
    cleanModelSentence: 'Good doggy! Dog! Say it with me: dog!',
    actions: [
      {
        id: 'tail',
        emoji: '🐕',
        actionTitle: 'Wag happy tails',
        actionSentence: 'Dogs wag their tails.',
        repeatPrompt: 'Can you say tail?',
        targetWord: 'tail',
        praise: 'Well done!',
      },
      {
        id: 'bone',
        emoji: '🦴',
        actionTitle: 'Chew tasty bones',
        actionSentence: 'Dogs chew tasty bones.',
        repeatPrompt: 'Can you say bone?',
        targetWord: 'bone',
        praise: 'Well done!',
      },
    ],
    relatedWords: [
      { word: 'Puppy Tail', emoji: '🐕', actionHint: 'Wag wag wag!' },
      { word: 'Bone Toy', emoji: '🦴', actionHint: 'Crunch crunch!' },
    ],
    soundType: 'dog_bark',
    iconEmoji: '🐶',
    primaryColor: '#854d0e', // warm golden brown
    accentColor: '#f59e0b', // playful amber
    nearMisses: [
      'dog', 'doggy', 'doggie', 'puppy', 'pup', 'woof', 'bark', 'bow wow', 'puppies', 'doggies', 'wuff', 'dodo', 'doge', 'ruff', 'wo'
    ],
  },
  {
    id: 'dinosaur',
    name: 'Dinosaur',
    pluralName: 'dinosaurs',
    category: 'animal',
    descriptionSentence: 'Dinosaur! Dinosaurs have cool pointy spikes and take big giant stomps!',
    repeatEncouragement: 'Can you say it with me? Dinosaur!',
    cleanModelSentence: 'Tremendous! Dinosaur! Say it with me: dinosaur!',
    actions: [
      {
        id: 'footprint',
        emoji: '👣',
        actionTitle: 'Make big footprints',
        actionSentence: 'Dinosaurs make big footprints.',
        repeatPrompt: 'Can you say footprint?',
        targetWord: 'footprint',
        praise: 'Well done!',
      },
      {
        id: 'spikes',
        emoji: '🦕',
        actionTitle: 'Show pointy spikes',
        actionSentence: 'Dinosaurs have cool pointy spikes.',
        repeatPrompt: 'Can you say spike?',
        targetWord: 'spike',
        praise: 'Well done!',
      },
    ],
    relatedWords: [
      { word: 'Green Spikes', emoji: '🦕', actionHint: 'Pointy spikes!' },
      { word: 'Big Footprint', emoji: '🦖', actionHint: 'Stomp stomp stomp!' },
    ],
    soundType: 'dino_roar',
    iconEmoji: '🦖',
    primaryColor: '#16a34a', // bright dino green
    accentColor: '#84cc16', // lime spike
    nearMisses: [
      'dinosaur', 'dino', 'trex', 't-rex', 'rawr', 'dinosor', 'reptile', 'stegosaurus',
      'dinosaw', 'daisaur', 'monster', 'dida', 'nosa', 'stomp', 'rex', 'dina'
    ],
  },
  {
    id: 'star',
    name: 'Star',
    pluralName: 'stars',
    category: 'sky',
    descriptionSentence: 'Star! Stars twinkle bright in the night sky and make wishes come true!',
    repeatEncouragement: 'Can you say it with me? Star!',
    cleanModelSentence: 'Twinkle twinkle! Star! Say it with me: star!',
    actions: [
      {
        id: 'sky',
        emoji: '🌌',
        actionTitle: 'Twinkle in night skies',
        actionSentence: 'Stars twinkle in the night sky.',
        repeatPrompt: 'Can you say sky?',
        targetWord: 'sky',
        praise: 'Well done!',
      },
      {
        id: 'point',
        emoji: '⭐',
        actionTitle: 'Shine golden points',
        actionSentence: 'Stars have shiny golden points.',
        repeatPrompt: 'Can you say point?',
        targetWord: 'point',
        praise: 'Well done!',
      },
      {
        id: 'moon',
        emoji: '🌙',
        actionTitle: 'Glow near the moon',
        actionSentence: 'Stars glow right beside the moon.',
        repeatPrompt: 'Can you say moon?',
        targetWord: 'moon',
        praise: 'Well done!',
      },
    ],
    relatedWords: [
      { word: 'Night Sky', emoji: '🌌', actionHint: 'Twinkle twinkle!' },
      { word: 'Crescent Moon', emoji: '🌙', actionHint: 'Glow in the dark!' },
    ],
    soundType: 'twinkle',
    iconEmoji: '⭐',
    primaryColor: '#eab308', // luminous star gold
    accentColor: '#fef08a', // bright star yellow
    nearMisses: [
      'star', 'stars', 'twinkle', 'twinkle star', 'sky', 'sun', 'bright', 'yellow star', 'little star',
      'shooting star', 'starlight', 'twinkle twinkle', 'shine', 'night sky', 'tar', 'car', 'sta', 'ta', 'stah',
      'twinko', 'tinkle', 'stare', 'stari', 'starry', 'sparkle', 'are'
    ],
  },
];

export function findCharacter(query: string, customTrainedMap?: Record<string, string[]>): CharacterItem | null {
  const clean = query.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');
  if (!clean) return null;

  // 1. Check parent-trained custom words first (highest priority)
  const trained = customTrainedMap || (typeof window !== 'undefined' ? getCustomTrainedWords() : null);
  if (trained) {
    for (const char of CHARACTERS) {
      const customList = trained[char.id] || [];
      for (const customWord of customList) {
        const cw = customWord.toLowerCase().trim();
        if (cw && (clean === cw || clean.includes(cw) || cw.includes(clean))) {
          return char;
        }
      }
    }
  }

  // 2. Direct exact match on id or name
  for (const char of CHARACTERS) {
    if (char.id === clean || char.name.toLowerCase() === clean) {
      return char;
    }
  }

  // 3. Check near misses list
  for (const char of CHARACTERS) {
    for (const phrase of char.nearMisses) {
      if (clean === phrase || clean.includes(phrase)) {
        return char;
      }
      if (phrase.length <= 3 && phrase === clean) {
        return char;
      }
    }
  }

  // 4. Token fuzzy match (allow 2-letter toddler approximations)
  const words = clean.split(/\s+/).filter(Boolean);
  for (const word of words) {
    for (const char of CHARACTERS) {
      if (char.nearMisses.some(nm => nm === word || (word.length >= 3 && nm.includes(word)))) {
        return char;
      }
    }
  }

  return null;
}

export function getSingularName(char: CharacterItem): string {
  return char.name.toLowerCase();
}

export function getIndefiniteArticle(word: string): string {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

export function getPluralName(char: CharacterItem): string {
  if (char.pluralName) return char.pluralName;
  const lower = char.name.toLowerCase();
  if (lower.endsWith('man')) return lower.slice(0, -3) + 'men';
  if (lower.endsWith('s')) return lower;
  return `${lower}s`;
}
