// Add a new locale by adding one entry here — no other code needs to change.
export const LANGUAGES = {
  sv: 'Swedish',
  da: 'Danish',
  nl: 'Dutch',
  pl: 'Polish',
  it: 'Italian',
  es: 'Spanish',
  en: 'English',
}

export function languageName(code) {
  return LANGUAGES[code] || LANGUAGES.sv
}
