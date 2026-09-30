// @ts-nocheck -- premium costume pack
import { CharacterAction, CharacterItem } from '../types';

/** Costumes that stay free for everyone. Everything else is premium. */
export const FREE_CHARACTER_IDS = [
  'firefighter', 'police_officer', 'builder', 'doctor', 'lion', 'tiger', 'dog', 'dinosaur',
];

type ActTuple = [id: string, emoji: string, title: string, sentence: string, word: string];

const act = ([id, emoji, actionTitle, actionSentence, targetWord]: ActTuple): CharacterAction => ({
  id, emoji, actionTitle, actionSentence, targetWord,
  repeatPrompt: `Can you say ${targetWord}?`,
  praise: 'Well done!',
});

/** Fourth picture added to the original nine costumes when premium is unlocked. */
export const PREMIUM_EXTRA_ACTIONS: Record<string, CharacterAction> = {
  firefighter: act(['helmet', '⛑️', 'Wear strong helmets', 'Firemen wear strong helmets.', 'helmet']),
  police_officer: act(['help', '🤝', 'Help lost children', 'Policemen help lost children.', 'help']),
  builder: act(['crane', '🏗️', 'Lift with cranes', 'Builders lift things with cranes.', 'crane']),
  doctor: act(['heart', '❤️', 'Listen to hearts', 'Doctors listen to hearts.', 'heart']),
  lion: act(['king', '👑', 'Rule as kings', 'Lions are kings of the jungle.', 'king']),
  tiger: act(['orange', '🟠', 'Have orange fur', 'Tigers have orange fur.', 'orange']),
  dog: act(['woof', '🐶', 'Bark woof woof', 'Dogs bark woof woof.', 'woof']),
  dinosaur: act(['egg', '🥚', 'Hatch from eggs', 'Dinosaurs hatch from eggs.', 'egg']),
  star: act(['wish', '✨', 'Grant wishes', 'Stars help us make wishes.', 'wish']),
};

interface Def {
  id: string; name: string; plural: string; category: string; icon: string;
  primary: string; accent: string; sound: string; blurb: string;
  acts: ActTuple[]; extra?: string[];
}

const DEFS: Def[] = [
  // Animals
  { id: 'cat', name: 'Cat', plural: 'cats', category: 'animal', icon: '🐱', primary: '#f97316', accent: '#fed7aa', sound: 'twinkle',
    blurb: 'Cats are soft and say meow!', extra: ['kitty', 'kitten', 'tat', 'pussycat'], acts: [
      ['meow', '😺', 'Say meow', 'Cats say meow.', 'meow'],
      ['whiskers', '🐈', 'Twitch whiskers', 'Cats have long whiskers.', 'whiskers'],
      ['purr', '😻', 'Purr softly', 'Cats purr when they are happy.', 'purr'],
      ['milk', '🥛', 'Lap up milk', 'Cats lap up milk.', 'milk']] },
  { id: 'rabbit', name: 'Rabbit', plural: 'rabbits', category: 'animal', icon: '🐰', primary: '#f472b6', accent: '#fce7f3', sound: 'twinkle',
    blurb: 'Rabbits hop hop hop!', extra: ['bunny', 'wabbit', 'babbit', 'bun'], acts: [
      ['hop', '🐇', 'Hop hop hop', 'Rabbits hop hop hop.', 'hop'],
      ['ears', '👂', 'Wiggle long ears', 'Rabbits have long ears.', 'ears'],
      ['carrot', '🥕', 'Munch carrots', 'Rabbits munch carrots.', 'carrot'],
      ['nose', '👃', 'Twitch noses', 'Rabbits twitch their noses.', 'nose']] },
  { id: 'monkey', name: 'Monkey', plural: 'monkeys', category: 'animal', icon: '🐵', primary: '#a16207', accent: '#fde68a', sound: 'tiger_growl',
    blurb: 'Monkeys swing in the trees!', extra: ['monkee', 'munkey', 'ooh ooh', 'chimp'], acts: [
      ['banana', '🍌', 'Eat bananas', 'Monkeys eat bananas.', 'banana'],
      ['swing', '🌳', 'Swing in trees', 'Monkeys swing in the trees.', 'swing'],
      ['tail', '🐒', 'Hold on with tails', 'Monkeys hold on with their tails.', 'tail'],
      ['climb', '🧗', 'Climb up high', 'Monkeys climb up high.', 'climb']] },
  { id: 'elephant', name: 'Elephant', plural: 'elephants', category: 'animal', icon: '🐘', primary: '#64748b', accent: '#cbd5e1', sound: 'dino_roar',
    blurb: 'Elephants are big and have long trunks!', extra: ['efant', 'ellie', 'elefant', 'nelly'], acts: [
      ['trunk', '🐘', 'Swing long trunks', 'Elephants swing their long trunks.', 'trunk'],
      ['stomp', '👣', 'Stomp stomp', 'Elephants stomp stomp stomp.', 'stomp'],
      ['ears', '👂', 'Flap big ears', 'Elephants flap their big ears.', 'ears'],
      ['splash', '💦', 'Splash water', 'Elephants splash water.', 'splash']] },
  { id: 'penguin', name: 'Penguin', plural: 'penguins', category: 'animal', icon: '🐧', primary: '#0f172a', accent: '#f8fafc', sound: 'whistle',
    blurb: 'Penguins waddle on the ice!', extra: ['pengwin', 'pingu', 'pengin', 'guin'], acts: [
      ['waddle', '🐧', 'Waddle along', 'Penguins waddle along.', 'waddle'],
      ['slide', '❄️', 'Slide on tummies', 'Penguins slide on their tummies.', 'slide'],
      ['fish', '🐟', 'Catch fish', 'Penguins catch fish.', 'fish'],
      ['ice', '🧊', 'Live on the ice', 'Penguins live on the ice.', 'ice']] },
  { id: 'owl', name: 'Owl', plural: 'owls', category: 'animal', icon: '🦉', primary: '#78350f', accent: '#fcd34d', sound: 'whistle',
    blurb: 'Owls say hoot hoot at night!', extra: ['owel', 'ow', 'hooty', 'howl'], acts: [
      ['hoot', '🦉', 'Hoot hoot', 'Owls say hoot hoot.', 'hoot'],
      ['wings', '🪶', 'Flap wings', 'Owls flap their wings.', 'wings'],
      ['night', '🌙', 'Stay up at night', 'Owls stay up at night.', 'night'],
      ['tree', '🌳', 'Sit in trees', 'Owls sit in trees.', 'tree']] },
  { id: 'frog', name: 'Frog', plural: 'frogs', category: 'animal', icon: '🐸', primary: '#16a34a', accent: '#bbf7d0', sound: 'twinkle',
    blurb: 'Frogs say ribbit and jump!', extra: ['fog', 'froggy', 'toad', 'wog'], acts: [
      ['ribbit', '🐸', 'Say ribbit', 'Frogs say ribbit.', 'ribbit'],
      ['jump', '⬆️', 'Jump high', 'Frogs jump high.', 'jump'],
      ['lily_pad', '🪷', 'Sit on lily pads', 'Frogs sit on lily pads.', 'lily pad'],
      ['fly', '🪰', 'Catch flies', 'Frogs catch flies.', 'fly']] },
  // People who help us
  { id: 'nurse', name: 'Nurse', plural: 'nurses', category: 'occupation', icon: '👩‍⚕️', primary: '#0ea5e9', accent: '#e0f2fe', sound: 'heartbeat',
    blurb: 'Nurses help us feel better!', extra: ['nurs', 'nuss'], acts: [
      ['bandage', '🩹', 'Wrap bandages', 'Nurses wrap bandages.', 'bandage'],
      ['thermometer', '🌡️', 'Check temperatures', 'Nurses use a thermometer.', 'thermometer'],
      ['care', '💗', 'Take care of us', 'Nurses take care of us.', 'care'],
      ['hug', '🤗', 'Give kind hugs', 'Nurses give kind hugs.', 'hug']] },
  { id: 'vet', name: 'Vet', plural: 'vets', category: 'occupation', icon: '🐕‍🦺', primary: '#14b8a6', accent: '#ccfbf1', sound: 'dog_bark',
    blurb: 'Vets look after animals!', extra: ['vets', 'bet', 'animal doctor'], acts: [
      ['puppy', '🐶', 'Help puppies', 'Vets help puppies.', 'puppy'],
      ['stethoscope', '🩺', 'Listen with stethoscopes', 'Vets listen with a stethoscope.', 'stethoscope'],
      ['gentle', '🤲', 'Be very gentle', 'Vets are very gentle.', 'gentle'],
      ['kitten', '🐱', 'Help kittens', 'Vets help kittens.', 'kitten']] },
  { id: 'farmer', name: 'Farmer', plural: 'farmers', category: 'occupation', icon: '🧑‍🌾', primary: '#65a30d', accent: '#fef08a', sound: 'hammer',
    blurb: 'Farmers grow food and look after animals!', extra: ['farma', 'farm', 'fama'], acts: [
      ['tractor', '🚜', 'Drive tractors', 'Farmers drive tractors.', 'tractor'],
      ['cow', '🐄', 'Milk cows', 'Farmers milk cows.', 'cow'],
      ['harvest', '🌾', 'Harvest wheat', 'Farmers harvest wheat.', 'harvest'],
      ['pig', '🐖', 'Feed pigs', 'Farmers feed pigs.', 'pig']] },
  { id: 'chef', name: 'Chef', plural: 'chefs', category: 'occupation', icon: '🧑‍🍳', primary: '#dc2626', accent: '#ffffff', sound: 'hammer',
    blurb: 'Chefs cook yummy food!', extra: ['shef', 'cook', 'sheff'], acts: [
      ['hat', '👨‍🍳', 'Wear tall hats', 'Chefs wear tall white hats.', 'hat'],
      ['stir', '🥣', 'Stir the pot', 'Chefs stir the pot.', 'stir'],
      ['yummy', '😋', 'Make yummy food', 'Chefs make yummy food.', 'yummy'],
      ['pizza', '🍕', 'Bake pizza', 'Chefs bake pizza.', 'pizza']] },
  { id: 'teacher', name: 'Teacher', plural: 'teachers', category: 'occupation', icon: '🧑‍🏫', primary: '#7c3aed', accent: '#ede9fe', sound: 'whistle',
    blurb: 'Teachers help us learn!', extra: ['teecha', 'teach', 'cheecha'], acts: [
      ['book', '📚', 'Read books', 'Teachers read books.', 'book'],
      ['pencil', '✏️', 'Write with pencils', 'Teachers write with pencils.', 'pencil'],
      ['learn', '🧠', 'Help us learn', 'Teachers help us learn.', 'learn'],
      ['sing', '🎵', 'Sing songs', 'Teachers sing songs.', 'sing']] },
  // Adventure and fantasy
  { id: 'pirate', name: 'Pirate', plural: 'pirates', category: 'fantasy', icon: '🏴‍☠️', primary: '#1f2937', accent: '#fbbf24', sound: 'lion_roar',
    blurb: 'Pirates sail the seas! Ahoy!', extra: ['piwate', 'pirat', 'arr', 'ahoy'], acts: [
      ['ship', '🚢', 'Sail ships', 'Pirates sail big ships.', 'ship'],
      ['treasure', '💰', 'Find treasure', 'Pirates find treasure.', 'treasure'],
      ['ahoy', '👋', 'Shout ahoy', 'Pirates shout ahoy.', 'ahoy'],
      ['parrot', '🦜', 'Have parrots', 'Pirates have parrots.', 'parrot']] },
  { id: 'astronaut', name: 'Astronaut', plural: 'astronauts', category: 'fantasy', icon: '🧑‍🚀', primary: '#1e3a8a', accent: '#e2e8f0', sound: 'twinkle',
    blurb: 'Astronauts fly into space!', extra: ['astronot', 'spaceman', 'astro', 'nonaut'], acts: [
      ['rocket', '🚀', 'Fly rockets', 'Astronauts fly rockets.', 'rocket'],
      ['moon', '🌕', 'Walk on the moon', 'Astronauts walk on the moon.', 'moon'],
      ['stars', '✨', 'See the stars', 'Astronauts see the stars.', 'stars'],
      ['float', '🎈', 'Float in space', 'Astronauts float in space.', 'float']] },
  { id: 'princess', name: 'Princess', plural: 'princesses', category: 'fantasy', icon: '👸', primary: '#db2777', accent: '#fbcfe8', sound: 'twinkle',
    blurb: 'Princesses live in castles!', extra: ['pwincess', 'princes', 'cess'], acts: [
      ['crown', '👑', 'Wear crowns', 'Princesses wear crowns.', 'crown'],
      ['castle', '🏰', 'Live in castles', 'Princesses live in castles.', 'castle'],
      ['sparkle', '✨', 'Sparkle and shine', 'Princesses sparkle and shine.', 'sparkle'],
      ['dress', '👗', 'Wear pretty dresses', 'Princesses wear pretty dresses.', 'dress']] },
  { id: 'knight', name: 'Knight', plural: 'knights', category: 'fantasy', icon: '🛡️', primary: '#475569', accent: '#e5e7eb', sound: 'hammer',
    blurb: 'Knights are brave and strong!', extra: ['nite', 'night', 'nigh'], acts: [
      ['shield', '🛡️', 'Hold shields', 'Knights hold shields.', 'shield'],
      ['sword', '⚔️', 'Carry swords', 'Knights carry swords.', 'sword'],
      ['brave', '💪', 'Be brave', 'Knights are brave.', 'brave'],
      ['horse', '🐴', 'Ride horses', 'Knights ride horses.', 'horse']] },
  { id: 'fairy', name: 'Fairy', plural: 'fairies', category: 'fantasy', icon: '🧚', primary: '#a855f7', accent: '#f5d0fe', sound: 'twinkle',
    blurb: 'Fairies have magic wands!', extra: ['fairie', 'faiwy', 'fay'], acts: [
      ['wand', '🪄', 'Wave wands', 'Fairies wave magic wands.', 'wand'],
      ['wings', '🦋', 'Flutter wings', 'Fairies flutter their wings.', 'wings'],
      ['magic', '✨', 'Make magic', 'Fairies make magic.', 'magic'],
      ['flower', '🌸', 'Sleep in flowers', 'Fairies sleep in flowers.', 'flower']] },
  { id: 'superhero', name: 'Superhero', plural: 'superheroes', category: 'fantasy', icon: '🦸', primary: '#2563eb', accent: '#ef4444', sound: 'lion_roar',
    blurb: 'Superheroes save the day!', extra: ['super hero', 'hero', 'supa', 'superman'], acts: [
      ['cape', '🦸', 'Wear capes', 'Superheroes wear capes.', 'cape'],
      ['fly', '☁️', 'Fly high', 'Superheroes fly high.', 'fly'],
      ['rescue', '🆘', 'Rescue people', 'Superheroes rescue people.', 'rescue'],
      ['strong', '💪', 'Be super strong', 'Superheroes are super strong.', 'strong']] },
  // Everyday heroes and fun
  { id: 'pilot', name: 'Pilot', plural: 'pilots', category: 'occupation', icon: '🧑‍✈️', primary: '#0369a1', accent: '#fde047', sound: 'whistle',
    blurb: 'Pilots fly aeroplanes!', extra: ['pilo', 'pie lot', 'plane man'], acts: [
      ['plane', '✈️', 'Fly planes', 'Pilots fly planes.', 'plane'],
      ['clouds', '☁️', 'Fly through clouds', 'Pilots fly through clouds.', 'clouds'],
      ['wings', '🛫', 'Wear shiny wings', 'Pilots wear shiny wings.', 'wings'],
      ['sky', '🌤️', 'Zoom across the sky', 'Pilots zoom across the sky.', 'sky']] },
  { id: 'train_driver', name: 'Train Driver', plural: 'train drivers', category: 'occupation', icon: '🚂', primary: '#b91c1c', accent: '#1f2937', sound: 'whistle',
    blurb: 'Train drivers drive trains! Choo choo!', extra: ['train', 'choo choo', 'driver', 'twain'], acts: [
      ['whistle', '📯', 'Blow whistles', 'Train drivers blow the whistle.', 'whistle'],
      ['tracks', '🛤️', 'Follow tracks', 'Trains follow the tracks.', 'tracks'],
      ['choo_choo', '🚂', 'Go choo choo', 'Trains go choo choo.', 'choo choo'],
      ['station', '🚉', 'Stop at stations', 'Trains stop at stations.', 'station']] },
  { id: 'footballer', name: 'Footballer', plural: 'footballers', category: 'occupation', icon: '⚽', primary: '#15803d', accent: '#ffffff', sound: 'whistle',
    blurb: 'Footballers kick the ball!', extra: ['football', 'soccer', 'footie', 'footballa'], acts: [
      ['kick', '🦵', 'Kick the ball', 'Footballers kick the ball.', 'kick'],
      ['goal', '🥅', 'Shoot at goals', 'Footballers shoot at the goal.', 'goal'],
      ['score', '🎉', 'Score and cheer', 'Footballers score and cheer.', 'score'],
      ['ball', '⚽', 'Bounce the ball', 'Footballers bounce the ball.', 'ball']] },
  { id: 'dancer', name: 'Dancer', plural: 'dancers', category: 'occupation', icon: '💃', primary: '#e11d48', accent: '#fecdd3', sound: 'twinkle',
    blurb: 'Dancers move to music!', extra: ['dance', 'danca', 'ballerina'], acts: [
      ['twirl', '💃', 'Twirl around', 'Dancers twirl around.', 'twirl'],
      ['music', '🎶', 'Dance to music', 'Dancers dance to music.', 'music'],
      ['tiptoes', '🩰', 'Stand on tiptoes', 'Dancers stand on tiptoes.', 'tiptoes'],
      ['clap', '👏', 'Clap hands', 'Dancers clap their hands.', 'clap']] },
  { id: 'clown', name: 'Clown', plural: 'clowns', category: 'fantasy', icon: '🤡', primary: '#f43f5e', accent: '#facc15', sound: 'twinkle',
    blurb: 'Clowns make us laugh!', extra: ['clownie', 'cown', 'klown'], acts: [
      ['nose', '🔴', 'Wear red noses', 'Clowns wear red noses.', 'nose'],
      ['juggle', '🤹', 'Juggle balls', 'Clowns juggle balls.', 'juggle'],
      ['giggle', '😂', 'Make us giggle', 'Clowns make us giggle.', 'giggle'],
      ['balloon', '🎈', 'Make balloons', 'Clowns make balloon animals.', 'balloon']] },
];

export const PREMIUM_CHARACTERS: CharacterItem[] = DEFS.map((d) => ({
  id: d.id,
  name: d.name,
  pluralName: d.plural,
  category: d.category,
  premium: true,
  descriptionSentence: `${d.name}! ${d.blurb}`,
  repeatEncouragement: `Can you say it with me? ${d.name}!`,
  cleanModelSentence: `Nice! ${d.name}! Say it with me: ${d.name.toLowerCase()}!`,
  actions: d.acts.map(act),
  relatedWords: d.acts.slice(0, 2).map(([, emoji, , , word]) => ({ word, emoji })),
  soundType: d.sound,
  iconEmoji: d.icon,
  primaryColor: d.primary,
  accentColor: d.accent,
  nearMisses: [d.name.toLowerCase(), d.plural, ...(d.extra || []), ...d.acts.map((a) => a[4])],
}));

/** Actions shown for a costume given the parent's premium status. */
export function actionsFor(char: CharacterItem, premiumUnlocked: boolean): CharacterAction[] {
  if (!premiumUnlocked) return char.actions.slice(0, 3);
  const extra = PREMIUM_EXTRA_ACTIONS[char.id];
  return extra ? [...char.actions, extra] : char.actions;
}

export function isCharacterLocked(char: CharacterItem, premiumUnlocked: boolean): boolean {
  return !premiumUnlocked && !FREE_CHARACTER_IDS.includes(char.id);
}
