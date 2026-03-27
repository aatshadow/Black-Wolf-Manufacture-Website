/* ═══════════════════════════════════════
   BLACKWOLF — Cinematic Intro
   ═══════════════════════════════════════ */

(function() {
  'use strict';

  const cin = document.querySelector('.cinematic');
  if (!cin) return;

  /* Skip if already seen this session */
  if (sessionStorage.getItem('bw-intro-seen')) {
    cin.remove();
    return;
  }

  const scenes = cin.querySelectorAll('.cin-scene');
  const wipe = cin.querySelector('.cin-wipe');
  const flash = cin.querySelector('.cin-flash');
  const progress = cin.querySelector('.cin-progress');
  const counter = cin.querySelector('.cin-counter');
  const skip = cin.querySelector('.cin-skip');
  const totalScenes = scenes.length;
  let currentScene = 0;
  let running = true;

  /* ── Create Particles ── */
  function createParticles() {
    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div');
      p.className = 'cin-particle';
      p.style.setProperty('--px', Math.random() * 100 + '%');
      p.style.setProperty('--ps', (1 + Math.random() * 2) + 'px');
      p.style.setProperty('--po', (0.05 + Math.random() * 0.2).toFixed(2));
      p.style.setProperty('--pd', (8 + Math.random() * 12) + 's');
      p.style.setProperty('--pdelay', (Math.random() * 10) + 's');
      p.style.setProperty('--pdx', (-30 + Math.random() * 60) + 'px');
      cin.appendChild(p);
    }
  }

  function createBokeh() {
    for (let i = 0; i < 6; i++) {
      const b = document.createElement('div');
      b.className = 'cin-bokeh';
      b.style.setProperty('--bsz', (20 + Math.random() * 50) + 'px');
      b.style.setProperty('--bx', (10 + Math.random() * 80) + '%');
      b.style.setProperty('--by', (10 + Math.random() * 80) + '%');
      b.style.setProperty('--bo', (0.02 + Math.random() * 0.05).toFixed(3));
      b.style.setProperty('--bblur', (1 + Math.random() * 3) + 'px');
      b.style.setProperty('--bd', (10 + Math.random() * 10) + 's');
      b.style.setProperty('--bdelay', (Math.random() * 8) + 's');
      b.style.setProperty('--bmx', (-20 + Math.random() * 40) + 'px');
      b.style.setProperty('--bmy', (-40 + Math.random() * 20) + 'px');
      cin.appendChild(b);
    }
  }

  createParticles();
  createBokeh();

  /* ── Scene Management ── */
  function updateProgress() {
    const pct = ((currentScene + 1) / totalScenes) * 100;
    if (progress) progress.style.width = pct + '%';
  }

  function updateCounter() {
    if (counter) {
      counter.innerHTML = '<b>0' + (currentScene + 1) + '</b> / 0' + totalScenes;
    }
  }

  function showScene(index) {
    if (index >= totalScenes || !running) return;

    /* Exit current */
    scenes.forEach(s => {
      if (s.classList.contains('active')) {
        s.classList.remove('active');
        s.classList.add('exit');
      }
    });

    /* Wipe effect */
    if (index > 0 && wipe) {
      wipe.classList.remove('fade');
      wipe.classList.add('fire');
      setTimeout(() => {
        wipe.classList.remove('fire');
        wipe.classList.add('fade');
      }, 350);
    }

    /* Flash on first scene */
    if (index === 0 && flash) {
      flash.style.opacity = '0.15';
      setTimeout(() => { flash.style.opacity = '0'; }, 300);
    }

    currentScene = index;
    updateProgress();
    updateCounter();

    /* Activate next scene */
    setTimeout(() => {
      scenes.forEach(s => s.classList.remove('exit'));
      scenes[index].classList.add('active');
      animateScene(index);
    }, index > 0 ? 250 : 50);
  }

  function animateScene(index) {
    if (!running) return;

    switch(index) {
      case 0: /* Logo */
        scheduleNext(3500);
        break;

      case 1: /* Pillars */
        const pillars = scenes[1].querySelectorAll('.cin-pillar');
        pillars.forEach((p, i) => {
          setTimeout(() => {
            if (running) p.classList.add('show');
          }, 400 + i * 700);
        });
        scheduleNext(4000);
        break;

      case 2: /* Problem */
        const lines = scenes[2].querySelectorAll('.cin-problem-line');
        lines.forEach((l, i) => {
          setTimeout(() => {
            if (running) {
              l.classList.add('show');
              if (i === 2) {
                setTimeout(() => l.classList.add('glow'), 400);
              }
            }
          }, 400 + i * 900);
        });
        scheduleNext(4000);
        break;

      case 3: /* Solution */
        const solText = scenes[3].querySelector('.cin-solution-text');
        const tags = scenes[3].querySelectorAll('.cin-tag');
        setTimeout(() => {
          if (running && solText) solText.classList.add('show');
        }, 300);
        tags.forEach((t, i) => {
          setTimeout(() => {
            if (running) t.classList.add('show');
          }, 800 + i * 200);
        });
        scheduleNext(3500);
        break;

      case 4: /* Final */
        const f1 = scenes[4].querySelector('.cin-final-1');
        const f2 = scenes[4].querySelector('.cin-final-2');
        const fLines = scenes[4].querySelectorAll('.cin-final-line');
        setTimeout(() => { if (running && fLines[0]) fLines[0].classList.add('show'); }, 200);
        setTimeout(() => { if (running && f1) f1.classList.add('show'); }, 400);
        setTimeout(() => { if (running && f2) f2.classList.add('show'); }, 700);
        setTimeout(() => { if (running && fLines[1]) fLines[1].classList.add('show'); }, 1000);
        setTimeout(() => { if (running) endIntro(); }, 3000);
        break;
    }
  }

  let nextTimeout;
  function scheduleNext(delay) {
    nextTimeout = setTimeout(() => {
      if (running) showScene(currentScene + 1);
    }, delay);
  }

  function endIntro() {
    running = false;
    sessionStorage.setItem('bw-intro-seen', '1');
    cin.classList.add('done');
    setTimeout(() => cin.remove(), 1600);
  }

  function skipIntro() {
    running = false;
    clearTimeout(nextTimeout);
    sessionStorage.setItem('bw-intro-seen', '1');
    cin.classList.add('done');
    setTimeout(() => cin.remove(), 1200);
  }

  /* ── Init ── */
  if (skip) {
    skip.addEventListener('click', skipIntro);
    setTimeout(() => skip.classList.add('visible'), 800);
  }

  if (counter) {
    setTimeout(() => counter.classList.add('visible'), 600);
  }

  /* Add letterbox bars */
  setTimeout(() => cin.classList.add('bars'), 200);

  /* Start */
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    showScene(0);
  }, 400);

  /* Re-enable scroll after intro */
  const checkDone = setInterval(() => {
    if (!running || cin.classList.contains('done')) {
      document.body.style.overflow = '';
      clearInterval(checkDone);
    }
  }, 100);

  /* Keyboard skip */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      if (running) skipIntro();
    }
  });

})();
