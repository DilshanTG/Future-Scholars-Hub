export const BOY_AVATARS = ['🦁','🐯','🦅','🐺','🦖','🐉','🦈','🐊','🦏','🐘','🦌','🐗','🦍','🐆','🦔','🐢','🦎','🐙','🦂','🦞']
export const GIRL_AVATARS = ['🌸','🌺','🌻','🌷','🌹','🏵️','💐','🦋','🐞','🐝','🦢','🦩','🦚','🐰','🦊','🐨','🐼','🦄','🌼','🪷']
export const ALL_AVATARS = [...BOY_AVATARS, ...GIRL_AVATARS]

export const GRADES = ['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','A/L']

export const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export const DISTRICTS = [
  'Colombo','Gampaha','Kalutara','Kandy','Matale','Nuwara Eliya','Galle','Matara','Hambantota',
  'Jaffna','Kilinochchi','Mannar','Vavuniya','Mullaitivu','Batticaloa','Ampara','Trincomalee',
  'Kurunegala','Puttalam','Anuradhapura','Polonnaruwa','Badulla','Monaragala','Ratnapura','Kegalle'
]

export const DEFAULT_STUDENT_PASSWORD = 'student123'

const CUTE_WORDS = [
  'bunny','kitty','puppy','panda','koala','tiger','zebra','llama','otter','pixie',
  'robin','daisy','tulip','maple','coral','pearl','amber','misty','sunny','bloom',
  'happy','jolly','zippy','jazzy','fuzzy','zany','perky','snazzy','velvet','dreamy',
  'starry','moony','golden','lunar','prism','cozy','lemon','cherry','mango','peach',
  'berry','melon','candy','honey','sugar','cookie','waffle','muffin','feather','breeze',
  'meadow','forest','river','cloud','sunset','unicorn','dragon','phoenix','fairy','sprite',
  'ripple','twinkle','giggle','bubble','dazzle','freckle','sprinkle','pebble','velvet','comet',
  'blossom','cuddle','fluffy','gentle','glitter','rainbow','shimmer','whisper','wonder','breeze',
]

export function generateStudentPassword(): string {
  const word = CUTE_WORDS[Math.floor(Math.random() * CUTE_WORDS.length)]
  const nums = String(Math.floor(Math.random() * 900) + 100)
  return word + nums
}

export function getRandomAvatar(gender: string): string {
  if (gender === 'Female') {
    return GIRL_AVATARS[Math.floor(Math.random() * GIRL_AVATARS.length)]
  }
  return BOY_AVATARS[Math.floor(Math.random() * BOY_AVATARS.length)]
}
