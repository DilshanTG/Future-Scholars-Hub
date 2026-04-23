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

export function getRandomAvatar(gender: string): string {
  if (gender === 'Female') {
    return GIRL_AVATARS[Math.floor(Math.random() * GIRL_AVATARS.length)]
  }
  return BOY_AVATARS[Math.floor(Math.random() * BOY_AVATARS.length)]
}
