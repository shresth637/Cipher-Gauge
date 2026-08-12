# ⚙️ The Cipher Gauge

An interactive, clockpunk-themed password strength checker. Type a password into the brass slot and watch a pressure-gauge needle sweep across five forged tiers — from **Raw Ore** to **Masterwork** — while flanking gears spin faster and a steam vent puffs once your cipher is hardened enough.


## Features

- **Live SVG gauge** — a needle rotates in real time across five colour-coded strength bands (rust → verdigris), each labelled with roman numerals like a clock face.
- **Spinning gearwork** — three brass gears accelerate as your password strengthens, rendered and animated with plain SVG/CSS, no libraries.
- **Entropy & crack-time readout** — estimates entropy in bits and a rough "time to breach" using a fast offline-attack assumption, phrased in period voice ("beyond the age of the mechanism").
- **Wax-seal checklist** — live checks for length, upper/lower case, digits, symbols, and a small common-password blacklist (with basic sequential/repeated-character detection).
- **Fully client-side** — no network calls, no analytics, no password ever leaves the browser.
- **Accessible & responsive** — visible focus states, `prefers-reduced-motion` respected, scales down to mobile.

## Project structure

```
Cipher-Gauge/
├── index.html      # markup
├── style.css        # all styling (brass/wood clockpunk theme)
├── script.js         # gear rendering, gauge drawing, password analysis, DOM wiring
└── README.md
```

## Running locally

No build step or dependencies — it's static HTML/CSS/JS.

```bash
git clone https://github.com/shresth637/Cipher-Gauge.git
cd Cipher-Gauge
# open index.html directly, or serve it:
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## How strength is scored

This is a heuristic, client-side estimate meant for a fun/educational UI — not a substitute for a real password policy or a library like [zxcvbn](https://github.com/dropbox/zxcvbn). The score factors in:

- Length (up to 20 characters counted)
- Character variety (lower/upper/digits/symbols)
- Bonus for 12+ and 16+ character passwords
- A penalty if the password matches a small list of extremely common passwords
- A penalty for sequential runs (`abcd`, `1234`, `qwerty`) or 3+ repeated characters in a row

Entropy is estimated as `length × log2(charset size)`, and the displayed "time to breach" assumes 10 billion guesses/second (a fast offline attack) — purely illustrative, not a guarantee.

