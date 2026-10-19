export const REPO = 'https://github.com/onuracar-dev/production-engineering-handbook/';

function toRoman(n) {
  const marks = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let out = '';
  for (const [value, mark] of marks) {
    while (n >= value) { out += mark; n -= value; }
  }
  return out;
}
// Book numerals, generated so a new domain never runs out of them.
export const ROMAN = Array.from({ length: 39 }, (_, i) => toRoman(i + 1));

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
export const countWord = (n) => WORDS[n] ?? String(n);

// One entry per domain, in folder order: [spine label, cloth colour, label colour].
// Adding a domain? Add a line here and in HEIGHTS, or the build stops with an error.
export const SPINE = [
  ['Networking & I/O', '#33506d', '#ecdcb8'],
  ['Security & Sandboxing', '#7b2f2b', '#ecd29c'],
  ['Concurrency', '#3d5a3b', '#e9d6a6'],
  ['Memory & Performance', '#b37d2e', '#2b2420'],
  ['OS & Processes', '#4b4559', '#e8d8b6'],
  ['Agents & Automation', '#2e6562', '#ecdcb8'],
  ['Fintech & Billing', '#8c4a2a', '#f1e0bb'],
  ['DevOps & Recovery', '#2b2e35', '#d8b56d'],
  ['Frontend Architecture', '#6a6e3b', '#f1e3c0'],
];

// Spine heights in shelf units (desktop scale), one per domain.
export const HEIGHTS = [282, 304, 268, 292, 252, 240, 274, 290, 258];
