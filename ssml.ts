export interface SsmlPreset {
  id: string;
  label: string;
  category: 'pause' | 'phonetics' | 'emphasis' | 'prosody' | 'say-as' | 'alias';
  description: string;
  template: string;
  defaultWrap?: string;
  icon?: string;
}

export const SSML_PRESETS: SsmlPreset[] = [
  // Pauses
  {
    id: 'pause-250ms',
    label: '250ms Pause',
    category: 'pause',
    description: 'Micro breath pause between ideas',
    template: '<break time="250ms"/>',
  },
  {
    id: 'pause-500ms',
    label: '500ms Pause',
    category: 'pause',
    description: 'Natural comma or sentence clause break',
    template: '<break time="500ms"/>',
  },
  {
    id: 'pause-1s',
    label: '1.0s Pause',
    category: 'pause',
    description: 'Paragraph transition or contemplative silence',
    template: '<break time="1s"/>',
  },
  {
    id: 'pause-2s',
    label: '2.0s Pause',
    category: 'pause',
    description: 'Cinematic or dramatic suspense pause',
    template: '<break time="2s"/>',
  },

  // Phonetics & Pronunciation
  {
    id: 'phoneme-ipa',
    label: 'IPA Phoneme',
    category: 'phonetics',
    description: 'Exact phonetic pronunciation using the International Phonetic Alphabet',
    template: '<phoneme alphabet="ipa" ph="{ipa}">{word}</phoneme>',
    defaultWrap: '<phoneme alphabet="ipa" ph="ˈsɜːrt.zɒd.eɪ.aɪ">{selected}</phoneme>',
  },
  {
    id: 'sub-alias',
    label: 'Alias Pronunciation',
    category: 'alias',
    description: 'Pronounce an acronym or technical abbreviation as spoken words',
    template: '<sub alias="{spoken}">{word}</sub>',
    defaultWrap: '<sub alias="Artificial Intelligence">{selected}</sub>',
  },

  // Emphasis
  {
    id: 'emphasis-strong',
    label: 'Strong Emphasis',
    category: 'emphasis',
    description: 'Accentuate and emphasize key words with acoustic intensity',
    template: '<emphasis level="strong">{selected}</emphasis>',
  },
  {
    id: 'emphasis-moderate',
    label: 'Moderate Emphasis',
    category: 'emphasis',
    description: 'Gentle conversational stress on selected text',
    template: '<emphasis level="moderate">{selected}</emphasis>',
  },
  {
    id: 'emphasis-reduced',
    label: 'Subtle / Reduced',
    category: 'emphasis',
    description: 'Soften acoustic weight for parenthetical or background remarks',
    template: '<emphasis level="reduced">{selected}</emphasis>',
  },

  // Prosody
  {
    id: 'prosody-slow',
    label: 'Slow Pacing',
    category: 'prosody',
    description: 'Deliberate, slow speech for solemn or dramatic lines',
    template: '<prosody rate="slow">{selected}</prosody>',
  },
  {
    id: 'prosody-fast',
    label: 'Fast Pacing',
    category: 'prosody',
    description: 'Brisk, upbeat delivery for excitement and quick disclaimers',
    template: '<prosody rate="fast">{selected}</prosody>',
  },
  {
    id: 'prosody-pitch-up',
    label: 'Higher Pitch',
    category: 'prosody',
    description: 'Elevate pitch by +2 semitones for interrogative or bright tone',
    template: '<prosody pitch="+2st">{selected}</prosody>',
  },
  {
    id: 'prosody-pitch-down',
    label: 'Lower Pitch',
    category: 'prosody',
    description: 'Deepen pitch by -2 semitones for gravitas and authority',
    template: '<prosody pitch="-2st">{selected}</prosody>',
  },

  // Say-As
  {
    id: 'say-as-chars',
    label: 'Spell Letters (Characters)',
    category: 'say-as',
    description: 'Pronounce each individual letter (e.g. N-A-S-A)',
    template: '<say-as interpret-as="characters">{selected}</say-as>',
  },
  {
    id: 'say-as-digits',
    label: 'Speak Digits',
    category: 'say-as',
    description: 'Speak each number digit individually (e.g. 1-2-3-4)',
    template: '<say-as interpret-as="digits">{selected}</say-as>',
  },
  {
    id: 'say-as-date',
    label: 'Format Date',
    category: 'say-as',
    description: 'Pronounce dates naturally according to calendar conventions',
    template: '<say-as interpret-as="date" format="mdy">{selected}</say-as>',
  },
  {
    id: 'say-as-telephone',
    label: 'Phone Number',
    category: 'say-as',
    description: 'Pronounce digits as a phone number with proper grouping',
    template: '<say-as interpret-as="telephone">{selected}</say-as>',
  },
];

export const COMMON_IPA_SYMBOLS = [
  { symbol: 'ˈ', name: 'Primary Stress', example: 'ˈsɜːrt' },
  { symbol: 'ˌ', name: 'Secondary Stress', example: 'ˌælə' },
  { symbol: 'iː', name: 'Long E', example: 'see, fleet' },
  { symbol: 'ɪ', name: 'Short I', example: 'bit, city' },
  { symbol: 'e', name: 'Short E', example: 'bed, red' },
  { symbol: 'æ', name: 'Short A', example: 'cat, apple' },
  { symbol: 'ɑː', name: 'Deep A', example: 'car, calm' },
  { symbol: 'ɒ', name: 'Short O', example: 'lot, hot' },
  { symbol: 'ɔː', name: 'Long O', example: 'law, thought' },
  { symbol: 'ʊ', name: 'Short U', example: 'put, look' },
  { symbol: 'uː', name: 'Long U', example: 'too, blue' },
  { symbol: 'ʌ', name: 'Cup Sound', example: 'sun, up' },
  { symbol: 'ɜː', name: 'Bird Sound', example: 'word, learn' },
  { symbol: 'ə', name: 'Schwa', example: 'about, neural' },
  { symbol: 'eɪ', name: 'A-I Diphthong', example: 'say, eight' },
  { symbol: 'aɪ', name: 'Eye Diphthong', example: 'my, sight' },
  { symbol: 'ɔɪ', name: 'Oy Diphthong', example: 'boy, voice' },
  { symbol: 'aʊ', name: 'Ow Diphthong', example: 'now, house' },
  { symbol: 'əʊ', name: 'Oh Diphthong', example: 'go, home' },
  { symbol: 'θ', name: 'Unvoiced Th', example: 'think, audio' },
  { symbol: 'ð', name: 'Voiced Th', example: 'this, there' },
  { symbol: 'ʃ', name: 'Sh Sound', example: 'speech, machine' },
  { symbol: 'ʒ', name: 'Zh Sound', example: 'vision, measure' },
  { symbol: 'tʃ', name: 'Ch Sound', example: 'chat, touch' },
  { symbol: 'dʒ', name: 'J Sound', example: 'jam, bridge' },
  { symbol: 'ŋ', name: 'Ng Sound', example: 'sing, song' },
];

export function wrapTextWithSsml(
  fullText: string,
  selectionStart: number,
  selectionEnd: number,
  tagTemplate: string,
  placeholder: string = 'text'
): { updatedText: string; newCursorStart: number; newCursorEnd: number } {
  const selectedContent = fullText.substring(selectionStart, selectionEnd) || placeholder;
  const wrapped = tagTemplate.includes('{selected}')
    ? tagTemplate.replace('{selected}', selectedContent)
    : tagTemplate;

  const updatedText =
    fullText.substring(0, selectionStart) + wrapped + fullText.substring(selectionEnd);
  const newCursorStart = selectionStart;
  const newCursorEnd = selectionStart + wrapped.length;

  return { updatedText, newCursorStart, newCursorEnd };
}
