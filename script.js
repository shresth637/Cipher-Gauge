(function(){

  // ---------- Gear rendering ----------
  function gearPath(teeth, outerR, innerR, holeR){
    const cx=50, cy=50;
    let d = '';
    const step = (Math.PI*2)/(teeth*2);
    for(let i=0;i<teeth*2;i++){
      const r = (i%2===0)? outerR : innerR;
      const a = i*step - Math.PI/2;
      const x = cx + r*Math.cos(a);
      const y = cy + r*Math.sin(a);
      d += (i===0?'M':'L') + x.toFixed(2) + ',' + y.toFixed(2) + ' ';
    }
    d += 'Z';
    return d;
  }

  function buildGear(svgEl, teeth, outerR, innerR, holeR){
    svgEl.innerHTML = `
      <defs>
        <radialGradient id="gg${teeth}" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stop-color="#e9c876"/>
          <stop offset="60%" stop-color="#b98f3f"/>
          <stop offset="100%" stop-color="#6a4e1f"/>
        </radialGradient>
      </defs>
      <path d="${gearPath(teeth, outerR, innerR)}" fill="url(#gg${teeth})" stroke="#3a2c15" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="${holeR+6}" fill="#241a10" stroke="#5a4526" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="${holeR}" fill="#0d0906"/>
    `;
  }

  buildGear(document.getElementById('gearLeft'), 10, 46, 36, 9);
  buildGear(document.getElementById('gearRight'), 8, 46, 34, 8);
  buildGear(document.getElementById('gearTiny'), 6, 46, 32, 7);

  let leftSpin = 0, rightSpin = 0, tinySpin = 0;
  let spinSpeed = 0.15; // degrees per frame baseline, scales with score
  function animateGears(){
    leftSpin -= spinSpeed;
    rightSpin += spinSpeed*1.4;
    tinySpin -= spinSpeed*2.1;
    document.getElementById('gearLeft').style.transform = `rotate(${leftSpin}deg)`;
    document.getElementById('gearRight').style.transform = `rotate(${rightSpin}deg)`;
    document.getElementById('gearTiny').style.transform = `rotate(${tinySpin}deg)`;
    requestAnimationFrame(animateGears);
  }
  requestAnimationFrame(animateGears);

  // ---------- Gauge dial: bands + ticks ----------
  const PIVOT = {x:150, y:160};
  const R_BAND_OUT = 128, R_BAND_IN = 96;
  const R_TICK_OUT = 128, R_TICK_IN = 118, R_LABEL = 106;

  function pt(radius, gDeg){
    const rad = gDeg * Math.PI/180;
    return { x: PIVOT.x + radius*Math.sin(rad), y: PIVOT.y - radius*Math.cos(rad) };
  }

  const bandColors = ['#8c3a2b', '#b6663b', '#b98f3f', '#e9c876', '#6f9a82'];
  const romans = ['I','II','III','IV','V'];
  const bandsG = document.getElementById('bands');
  const ticksG = document.getElementById('ticks');

  for(let i=0;i<5;i++){
    const g1 = -90 + i*36;
    const g2 = -90 + (i+1)*36;
    const p1o = pt(R_BAND_OUT, g1), p2o = pt(R_BAND_OUT, g2);
    const p1i = pt(R_BAND_IN, g2), p2i = pt(R_BAND_IN, g1);
    const d = `M${p1o.x.toFixed(2)},${p1o.y.toFixed(2)} A${R_BAND_OUT},${R_BAND_OUT} 0 0 1 ${p2o.x.toFixed(2)},${p2o.y.toFixed(2)} L${p1i.x.toFixed(2)},${p1i.y.toFixed(2)} A${R_BAND_IN},${R_BAND_IN} 0 0 0 ${p2i.x.toFixed(2)},${p2i.y.toFixed(2)} Z`;
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d', d);
    path.setAttribute('fill', bandColors[i]);
    path.setAttribute('opacity', '0.85');
    bandsG.appendChild(path);

    // roman numeral label at band center
    const mid = -90 + i*36 + 18;
    const lp = pt(R_LABEL, mid);
    const text = document.createElementNS('http://www.w3.org/2000/svg','text');
    text.setAttribute('x', lp.x.toFixed(2));
    text.setAttribute('y', lp.y.toFixed(2));
    text.setAttribute('text-anchor','middle');
    text.setAttribute('dominant-baseline','middle');
    text.setAttribute('font-family',"'Cinzel', serif");
    text.setAttribute('font-size','13');
    text.setAttribute('font-weight','700');
    text.setAttribute('fill','#14100b');
    text.textContent = romans[i];
    ticksG.appendChild(text);
  }

  // tick lines at boundaries
  for(let i=0;i<=5;i++){
    const g = -90 + i*36;
    const p1 = pt(R_TICK_OUT+4, g);
    const p2 = pt(R_TICK_IN-2, g);
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', p1.x.toFixed(2)); line.setAttribute('y1', p1.y.toFixed(2));
    line.setAttribute('x2', p2.x.toFixed(2)); line.setAttribute('y2', p2.y.toFixed(2));
    line.setAttribute('stroke', '#0d0906');
    line.setAttribute('stroke-width', '2');
    ticksG.appendChild(line);
  }

  // ---------- Password analysis ----------
  const commonWords = new Set([
    'password','123456','123456789','qwerty','letmein','admin','welcome',
    'iloveyou','football','monkey','dragon','master','abc123','111111',
    '000000','password1','12345678','sunshine','princess','login','passw0rd',
    'starwars','trustno1','whatever','qazwsx','shadow','superman','baseball'
  ]);

  function hasSequential(s){
    const lower = s.toLowerCase();
    const seqs = ['abcdefghijklmnopqrstuvwxyz','0123456789','qwertyuiop'];
    for(const seq of seqs){
      for(let i=0;i<=seq.length-4;i++){
        const fwd = seq.slice(i,i+4);
        const rev = fwd.split('').reverse().join('');
        if(lower.includes(fwd) || lower.includes(rev)) return true;
      }
    }
    return false;
  }

  function hasRepeats(s){
    return /(.)\1\1/.test(s); // same char 3+ times in a row
  }

  function analyze(pw){
    const len = pw.length;
    const hasUpper = /[A-Z]/.test(pw);
    const hasLower = /[a-z]/.test(pw);
    const hasNum = /[0-9]/.test(pw);
    const hasSym = /[^A-Za-z0-9]/.test(pw);
    const lower = pw.toLowerCase();
    const isCommon = commonWords.has(lower) || (len>0 && [...commonWords].some(w => lower === w));
    const meetsCommonCheck = len>0 && !isCommon;

    let charset = 0;
    if(hasLower) charset += 26;
    if(hasUpper) charset += 26;
    if(hasNum) charset += 10;
    if(hasSym) charset += 32;
    if(charset===0) charset = 1;

    const entropyBits = len>0 ? len * Math.log2(charset) : 0;

    // ---- score 0-100 ----
    let score = 0;
    if(len>0){
      score += Math.min(len, 20) * 3;              // up to 60 for length
      const variety = [hasUpper,hasLower,hasNum,hasSym].filter(Boolean).length;
      score += (variety-1) * 10;                    // up to 30 for variety
      if(len>=12) score += 8;
      if(len>=16) score += 8;
      if(isCommon) score = Math.min(score, 8);
      if(hasSequential(pw)) score -= 15;
      if(hasRepeats(pw)) score -= 12;
    }
    score = Math.max(0, Math.min(100, Math.round(score)));

    return { len, hasUpper, hasLower, hasNum, hasSym, meetsCommonCheck, entropyBits, score, isCommon };
  }

  function humanizeCrackTime(entropyBits){
    if(entropyBits<=0) return '—';
    const guessesPerSecond = 1e10; // fast offline attack assumption
    const seconds = Math.pow(2, entropyBits) / guessesPerSecond;
    const units = [
      [60, 'seconds'],
      [60, 'minutes'],
      [24, 'hours'],
      [365, 'days'],
      [100, 'years'],
      [10, 'centuries'],
      [1000, 'millennia']
    ];
    if(seconds < 1) return 'instantaneous';
    let val = seconds, i = 0;
    const labels = ['seconds','minutes','hours','days','years','centuries','millennia'];
    const divisors = [60,60,24,365,100,10];
    let idx = 0;
    for(; idx < divisors.length; idx++){
      if(val < divisors[idx]) break;
      val = val / divisors[idx];
    }
    if(idx >= divisors.length && val > 1000) return 'beyond the age of the mechanism';
    return `~${val < 10 ? val.toFixed(1) : Math.round(val)} ${labels[idx]}`;
  }

  const levels = [
    { max:19,  word:'RAW ORE',        tag:'Unshaped and vulnerable to any blow.' },
    { max:39,  word:'ROUGH-FORGED',   tag:'Hammered once, but the cracks still show.' },
    { max:59,  word:'TEMPERED',       tag:'Heat-treated. A worthy attempt.' },
    { max:79,  word:'HARDENED STEEL', tag:'Precision-machined. Difficult to breach.' },
    { max:100, word:'MASTERWORK',     tag:'Forged beyond reproach. The gauge sings.' }
  ];

  function levelFor(score){
    for(const lv of levels) if(score <= lv.max) return lv;
    return levels[levels.length-1];
  }

  // ---------- DOM wiring ----------
  const input = document.getElementById('pwInput');
  const toggleBtn = document.getElementById('toggleBtn');
  const needle = document.getElementById('needle');
  const levelWord = document.getElementById('levelWord');
  const levelTagline = document.getElementById('levelTagline');
  const entropyVal = document.getElementById('entropyVal');
  const crackVal = document.getElementById('crackVal');
  const steamVent = document.getElementById('steamVent');
  const tags = document.querySelectorAll('.tag');

  function setTag(key, met){
    const el = document.querySelector(`.tag[data-key="${key}"]`);
    if(!el) return;
    el.classList.toggle('met', met);
    el.querySelector('.stamp').textContent = met ? '✓' : '✕';
  }

  function update(){
    const pw = input.value;
    const r = analyze(pw);

    const deg = -90 + (r.score/100)*180;
    needle.style.transform = `rotate(${deg}deg)`;

    if(pw.length===0){
      levelWord.textContent = 'AWAITING CIPHER';
      levelTagline.textContent = 'Turn the key. Set the mechanism in motion.';
      entropyVal.textContent = '0 bits';
      crackVal.textContent = '—';
      steamVent.classList.remove('active');
      spinSpeed = 0.15;
    } else {
      const lv = levelFor(r.score);
      levelWord.textContent = lv.word;
      levelTagline.textContent = lv.tag;
      entropyVal.textContent = `${r.entropyBits.toFixed(1)} bits`;
      crackVal.textContent = humanizeCrackTime(r.entropyBits);
      steamVent.classList.toggle('active', r.score >= 80);
      spinSpeed = 0.15 + (r.score/100) * 1.6;
    }

    setTag('len', r.len >= 12);
    setTag('up', r.hasUpper);
    setTag('low', r.hasLower);
    setTag('num', r.hasNum);
    setTag('sym', r.hasSym);
    setTag('common', r.meetsCommonCheck);
  }

  input.addEventListener('input', update);

  toggleBtn.addEventListener('click', () => {
    const isPw = input.type === 'password';
    input.type = isPw ? 'text' : 'password';
    toggleBtn.textContent = isPw ? '◎' : '◉';
  });

  update();
})();
