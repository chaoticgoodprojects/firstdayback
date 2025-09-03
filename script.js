// ─── Playlist & State ─────────────────────────────────────
const playlist = [
  { title: "sure, ok", src: "sure, ok.mp3" },
  { title: "upstairs (212)", src: "upstairs (212).mp3" },
  { title: "moving out", src: "moving out.mp3" },
  { title: "us", src: "us.mp3" },
  { title: "gone on", src: "gone on.mp3" },
  { title: "lines", src: "lines.mp3" },
  { title: "wait, do you hear that", src: "wait, do you hear that.mp3" },
  { title: "paint", src: "paint.mp3" },
  { title: "twelve mile train tracks", src: "twelve mile train tracks.mp3" }
];
let currentIndex = 0;
let isShuffle = false;
let attemptedAutoplay = false;

// ─── DOM Element References ────────────────────────────────
const audio       = document.getElementById('audio-player');
const trackNow    = document.getElementById('track-now');
const playPauseBtn= document.getElementById('play-pause-btn');
const rewindBtn   = document.getElementById('rewind-btn');
const skipBtn     = document.getElementById('skip-btn');
const shuffleBtn  = document.getElementById('shuffle-btn');
const currentTime = document.getElementById('current-time');
const duration    = document.getElementById('duration');

// Window References
const documentsWindow = document.getElementById('documents-window');
const cmdWindow       = document.getElementById('cmd-window');
const picturesWindow  = document.getElementById('pictures-window');
const videoWindow     = document.getElementById('video-window');
const videoPlayer     = document.getElementById('video-player');

// ─── Utility Functions ─────────────────────────────────────
function centerWindow(win) {
  const winW = win.offsetWidth;
  const winH = win.offsetHeight;
  const scrW = window.innerWidth;
  const scrH = window.innerHeight;
  win.style.position = 'absolute';
  win.style.left     = `${(scrW - winW) / 2}px`;
  win.style.top      = `${(scrH - winH) / 2}px`;
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function loadTrack(index, autoplay = true) {
  currentIndex = index;
  const track = playlist[index];
  audio.src    = track.src;
  trackNow.textContent = `Now Playing: ${track.title}`;
  playPauseBtn.textContent = '[>]';
  if (autoplay) {
    audio.load();
    audio.play()
      .then(() => { playPauseBtn.textContent = '[||]'; })
      .catch(() => { playPauseBtn.textContent = '[>]'; });
  }
}

function skipTrack() {
  if (isShuffle) {
    let next;
    do { next = Math.floor(Math.random() * playlist.length); }
    while (next === currentIndex);
    loadTrack(next);
  } else {
    loadTrack((currentIndex + 1) % playlist.length);
  }
}

// ─── Audio Event Handlers ────────────────────────────────
audio.addEventListener('loadedmetadata', () => {
  duration.textContent = formatTime(audio.duration);
});
audio.addEventListener('timeupdate', () => {
  currentTime.textContent = formatTime(audio.currentTime);
});
audio.addEventListener('ended', skipTrack);

// ─── Button Event Handlers ───────────────────────────────
playPauseBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    playPauseBtn.textContent = '[||]';
  } else {
    audio.pause();
    playPauseBtn.textContent = '[>]';
  }
});
rewindBtn.addEventListener('click', () => { audio.currentTime = 0; });
skipBtn.addEventListener('click', skipTrack);
shuffleBtn.addEventListener('click', () => {
  isShuffle = !isShuffle;
  shuffleBtn.textContent = isShuffle ? '[SHUFFLE]' : '[shuffle]';
});

// ─── Unblock Autoplay on First Mouse Move ─────────────────
function tryAutoplayOnce() {
  if (!attemptedAutoplay && audio.paused) {
    audio.play()
      .then(() => { playPauseBtn.textContent = '[||]'; })
      .catch(() => { playPauseBtn.textContent = '[>]'; });
    attemptedAutoplay = true;
    window.removeEventListener('mousemove', tryAutoplayOnce);
  }
}
window.addEventListener('mousemove', tryAutoplayOnce);

// ─── Faux Terminal Boot Sequence ───────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('terminal-overlay');
  const output  = document.getElementById('terminal-output');
  const files   = [
    'maggie.exe', 'nathan.exe', 'spencer.exe',
    'garfield.exe','luke.exe','zion.exe','gurt.exe','ben.exe'
  ];
  let idx = 0;

  function printNext() {
    if (idx < files.length) {
      output.textContent += `Loading ${files[idx]}... Done\n`;
      idx++;
      setTimeout(printNext, 300);
    } else {
      output.innerHTML += '\nPress any key to continue <span class="blinking-cursor">_</span>';
      overlay.tabIndex = 0;
      overlay.focus();
      const proceed = () => {
  overlay.style.display = 'none';
  loadTrack(currentIndex, true);

revealAllWindows();

function revealAllWindows() {
  const exclude = new Set([
    'picture-viewer',
    'pictures-window',
    'video-window'
  ]);

  const wins = Array.from(document.querySelectorAll('.window'))
    .filter(win => !exclude.has(win.id));

  const total = 2000;                   // 2s total
  const step  = total / wins.length;    // interval per window

  wins.forEach((win, i) => {
    win.style.display = 'none';
    setTimeout(() => {
      win.style.display = 'block';
    }, i * step);
  });
}

  // ─── Schedule Toast After Entry ────────────────────
  setTimeout(() => {
    showNotification();
    setInterval(showNotification, 25000);
  }, 5000);

  overlay.removeEventListener('keydown', proceed);
  overlay.removeEventListener('click', proceed);
};
      overlay.addEventListener('keydown', proceed);
      overlay.addEventListener('click', proceed);
    }
  }

  printNext();
});

// ─── Dragging for Windows ────────────────────────────────
document.querySelectorAll('.window').forEach(win => {
  const bar = win.querySelector('.title-bar');
  if (!bar) return;

  let isDragging = false, offsetX = 0, offsetY = 0;

  const onMove = e => {
    if (!isDragging) return;
    const maxX = window.innerWidth - win.offsetWidth;
    const maxY = window.innerHeight - win.offsetHeight;
    const x = Math.min(Math.max(0, e.clientX - offsetX), maxX);
    const y = Math.min(Math.max(0, e.clientY - offsetY), maxY);
    win.style.left = `${x}px`;
    win.style.top  = `${y}px`;
  };

  const onUp = () => {
    isDragging = false;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  };

  bar.addEventListener('mousedown', e => {
    isDragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    win.style.zIndex = Date.now();
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
});

// ─── Minimize to Taskbar ─────────────────────────────────
document.querySelectorAll('.title-bar-controls button[aria-label="Minimize"]').forEach(minBtn => {
  minBtn.addEventListener('click', () => {
    const win = minBtn.closest('.window');
    const winId = win.id;
    const taskbar = document.getElementById('task-buttons');

    win.style.display = 'none';

    if (document.getElementById('task-' + winId)) return;
    const tbtn = document.createElement('button');
    tbtn.id        = 'task-' + winId;
    tbtn.className = 'xp xp-button';
    tbtn.textContent = win.querySelector('.title-bar-text').innerText;

    tbtn.addEventListener('click', () => {
      win.style.display = 'block';
      win.style.zIndex  = Date.now();
      tbtn.remove();
    });

    taskbar.appendChild(tbtn);
  });
});

// ─── Video Links ────────────────────────────────────────
document.querySelectorAll('.video-link').forEach(el => {
  el.addEventListener('click', () => {
    videoPlayer.src = el.dataset.src;
    videoWindow.style.display = 'block';
    centerWindow(videoWindow);
    videoWindow.style.zIndex = Date.now();
  });
});

// ─── Notes Links ────────────────────────────────────────
document.querySelectorAll('.notes-link').forEach(el => {
  el.addEventListener('click', () => {
    const win = document.getElementById(`notes-window-${el.dataset.id}`);
    win.style.display = 'block';
    centerWindow(win);
    win.style.zIndex = Date.now();
  });
});

// ─── Picture Links (per show) ───────────────────────────
document.querySelectorAll('.picture-link').forEach(el => {
  el.addEventListener('click', () => {
    const showId   = el.dataset.show || 'album';
    const viewerId = `picture-viewer-${showId}`;
    let viewer     = document.getElementById(viewerId);

    if (!viewer) {
      viewer = document.createElement('div');
      viewer.className = 'window';
      viewer.id        = viewerId;
      viewer.style.cssText = 'position:absolute;top:150px;left:150px;width:400px;height:300px;resize:both;overflow:auto;';
      viewer.innerHTML = `
        <div class="title-bar">
          <div class="title-bar-text">Picture Viewer — ${showId}</div>
          <div class="title-bar-controls">
            <button aria-label="Close"></button>
          </div>
        </div>
        <div class="window-body" style="height:calc(100% - 30px);padding:8px;">
          <img src="${el.dataset.src}" style="max-width:100%;max-height:100%;display:block;margin:0 auto;" />
        </div>
      `;
      document.getElementById('desktop').appendChild(viewer);
      centerWindow(viewer);
      viewer.style.zIndex = Date.now();

      const bar = viewer.querySelector('.title-bar'); let drag=false, offX=0, offY=0;
      bar.addEventListener('mousedown', e => { drag = true; offX = e.clientX - viewer.offsetLeft; offY = e.clientY - viewer.offsetTop; viewer.style.zIndex = Date.now(); });
      document.addEventListener('mousemove', e => { if (!drag) return; viewer.style.left = `${e.clientX - offX}px`; viewer.style.top = `${e.clientY - offY}px`; });
      document.addEventListener('mouseup', () => { drag = false; });
      viewer.querySelector('button[aria-label="Close"]').addEventListener('click', () => viewer.remove());
    } else {
      const img = viewer.querySelector('img');
      img.src = el.dataset.src;
      viewer.style.display = 'block';
      centerWindow(viewer);
      viewer.style.zIndex = Date.now();
    }
  });
});

// ─── Universal Close Buttons ─────────────────────────────
document.querySelectorAll('.title-bar-controls button[aria-label="Close"]').forEach(btn => {
  btn.addEventListener('click', () => {
    const win = btn.closest('.window');
    if (!win) return;
    win.style.display = 'none';
    if (win.contains(videoPlayer)) {
      videoPlayer.pause();
      videoPlayer.currentTime = 0;
    }
  });
});

// ─── Notification Popup Setup ─────────────────────────────
const toast      = document.getElementById('notification-toast');
const toastSound = document.getElementById('notification-sound');
const toastText  = document.getElementById('notification-text');

const messages = [
  "maggie: welcome!!",
  "nathan: has anyone seen my guitar?",
  "spencer: boy oh boy i can't wait to play these drums",
  "garfield: meow",
  "luke: pull up we listening to miles davis",
  "zion: i played this riff",
  "gurt: yo",
  "ben: it's a rough bounce wear headphones when u listen"
];
let msgIndex = 0;

function showNotification() {
  // pick & set the next message
  toastText.textContent = messages[msgIndex];
  msgIndex = (msgIndex + 1) % messages.length;

  // play sound & fade in/out
  toastSound.currentTime = 0;
  toastSound.play().catch(() => {});
  toast.style.display = 'block';
  requestAnimationFrame(() => toast.style.opacity = 1);
  setTimeout(() => toast.style.opacity = 0, 3000);
  setTimeout(() => toast.style.display = 'none', 3500);
}

// ─── Taskbar Clock & Mute Toggle ─────────────────────────
const clockEl  = document.getElementById('taskbar-clock');
const muteBtn  = document.getElementById('mute-button');
const audioEl  = document.getElementById('audio-player');

// a) Clock: update immediately & every minute
function updateClock() {
  const now = new Date();
  // date on first line
  const dateOpts = { weekday:'short', month:'short', day:'numeric' };
  // time on second line
  const timeOpts = { hour:'numeric', minute:'2-digit', hour12: true };
  const dateStr = now.toLocaleDateString('en-US', dateOpts);
  const timeStr = now.toLocaleTimeString('en-US', timeOpts);
  // inject with a <br>
  clockEl.innerHTML = `${dateStr}<br>${timeStr}`;
}
updateClock();
setInterval(updateClock, 60_000);

// b) Mute toggle: reflect current state & toggle on click
muteBtn.textContent = audioEl.muted ? '🔇' : '🔊';
muteBtn.addEventListener('click', () => {
  audioEl.muted = !audioEl.muted;
  muteBtn.textContent = audioEl.muted ? '🔇' : '🔊';
});

// ─── Gigs Tree Generation ─────────────────────────────────
const gigs = [
  {
    title: '4/26 – Subrosa (Santa Cruz)',
    id:    'subrosa',
    video: 'https://www.youtube.com/embed/bSBr6rU9spY',
    notesContent:  `4/26 Subrosa — So happy to be playing a show with so many friends. Shoutout Graeme for filming you’re the best.`,    
    flyer: 'subrosa-flyer.png',
    pics:  ['subrosa-1.png','subrosa-2.png']
  },
  {
    title: '5/9 – Ring of Hearts (Los Angeles)',
    id:    'ring',
    notesContent:  `5/9 — First time playing outside of Santa Cruz.. and in a boxing ring. #sick`,
    flyer: 'ringofhearts-flyer.jpg',
    pics:  ['ringofhearts-1.png','ringofhearts-2.png']
  },
  {
    title: '5/30 – Tamarack (Oakland)',
    id:    'tamarack',
    video: 'https://www.youtube.com/embed/iiS_NgCcXQo',
    notesContent:  `5/30 Tamarack — packed out, so much fun.
next time we should ask for an AC.`,
    flyer: 'tamarack-flyer.png',
    pics:  ['tamarack-1.png','tamarack-2.png']
  },
  {
    title: '6/1 – The A-Frame (Santa Cruz)',
    id:    'a-frame',
    video: 'https://www.youtube.com/embed/dB3zZMm12VY',
    notesContent:  `6/1 @ home. — 5/31 Album Release - Was fun throwing cake in everyone's face surrounded by our loved ones. So stoked for the album to come out tomorrow.`,
    pics:  ['pic-1.jpg','pic-2.jpg']
  },
  {
    title: '8/9 Firstfaintsysawtawny (Santa Cruz)',
    id:    'sc89',
    notesContent:  `8/9 Firstfaintsysawtawny - Our first show since the album release, so much love in our hearts. I can’t believe you guys knew the lyrics - maggie`,
    flyer: 'faints.png',
    pics:  ['faintspic1.jpg','faintspic2.jpg']
  },

  // …add more shows here…
];

function buildGigsTree() {
  const container = document.getElementById('gigs-list');
  container.innerHTML = '';  // clear any existing entries

  gigs.forEach(gig => {
    const li = document.createElement('li');
    li.innerHTML = `
      <details>
        <summary>${gig.title}</summary>
        <ul>
          <li><span class="video-link"   data-src="${gig.video}">Video</span></li>
          <li>
    <span 
      class="notes-link" 
      data-id="${gig.id}" 
      data-notes="${gig.notesContent.replace(/"/g,'&quot;')}"
    >Notes</span>
  </li>
          <li><span class="picture-link" data-src="${gig.flyer}" data-show="${gig.id}">Flyer</span></li>
          <li>
            <details>
              <summary>Pictures</summary>
              <ul>
                ${gig.pics.map(pic => `
                  <li>
                    <span class="picture-link"
                          data-src="${pic}"
                          data-show="${gig.id}">
                      ${pic}
                    </span>
                  </li>
                `).join('')}
              </ul>
            </details>
          </li>
        </ul>
      </details>
    `;
    container.appendChild(li);
  });

// ─── Updated Video Links Handler ────────────────────────
document.querySelectorAll('.video-link').forEach(el => {
  el.addEventListener('click', () => {
    const src = el.dataset.src;
    const body = videoWindow.querySelector('.window-body');

    // clear out whatever was there
    body.innerHTML = '';

    if (src.startsWith('https://www.youtube.com/embed/')) {
      // create an iframe for YouTube
      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.style.width  = '100%';
      iframe.style.height = '100%';
      body.appendChild(iframe);
    } else {
      // fallback to your existing <video> player
      const vid = document.createElement('video');
      vid.src = src;
      vid.controls = true;
      vid.style.width  = '100%';
      vid.style.height = '100%';
      body.appendChild(vid);
    }

    videoWindow.style.display = 'block';
    centerWindow(videoWindow);
    videoWindow.style.zIndex = Date.now();
  });
});

// ─── Re-bind Notes Links (use gig.title, not link text) ─────────────────────────
document.querySelectorAll('.notes-link').forEach(el => {
  el.addEventListener('click', () => {
    const id      = el.dataset.id;
    const gig     = gigs.find(g => g.id === id);
    const title   = gig ? gig.title : id;
    const content = el.dataset.notes.replace(/\\n/g, '<br>');
    let win       = document.getElementById(`notes-window-${id}`);

    if (!win) {
      win = document.createElement('div');
      win.className = 'window';
      win.id        = `notes-window-${id}`;
      win.style.cssText = 'display:none; position:absolute; width:300px;';

      win.innerHTML = `
        <div class="title-bar">
          <div class="title-bar-text">${title} Notes</div>
          <div class="title-bar-controls">
            <button aria-label="Close"></button>
          </div>
        </div>
        <div class="window-body" style="font-family: monospace; white-space: pre-wrap;"></div>
      `;
      document.getElementById('desktop').appendChild(win);

      // close button
      win.querySelector('button[aria-label="Close"]')
         .addEventListener('click', () => win.style.display = 'none');

      // make draggable (same as your other windows) …
      const bar = win.querySelector('.title-bar');
      let drag = false, offX = 0, offY = 0;
      bar.addEventListener('mousedown', e => {
        drag = true;
        offX = e.clientX - win.offsetLeft;
        offY = e.clientY - win.offsetTop;
        win.style.zIndex = Date.now();
      });
      document.addEventListener('mousemove', e => {
        if (!drag) return;
        win.style.left = `${e.clientX - offX}px`;
        win.style.top  = `${e.clientY - offY}px`;
      });
      document.addEventListener('mouseup', () => { drag = false; });
    }

    // inject notes & show
    win.querySelector('.window-body').innerHTML = content;
    win.style.display = 'block';
    centerWindow(win);
    win.style.zIndex  = Date.now();
  });
});



// ─── Re-bind Picture Links (single static viewer) ─────────
document.querySelectorAll('.picture-link').forEach(el => {
  el.addEventListener('click', () => {
    const src = el.dataset.src;
    const img = document.getElementById('picture-image');
    img.src = src;                              // update image
    const win = document.getElementById('picture-viewer');
    win.style.display = 'block';                // show the window
    centerWindow(win);                          // center it
    win.style.zIndex = Date.now();
  });
});

}

window.addEventListener('DOMContentLoaded', buildGigsTree);

// ─── Merch Purchase Button Handlers ─────────────────────
document.querySelectorAll('.purchase-button').forEach(btn => {
  btn.addEventListener('click', () => {
    const url = btn.dataset.url;
    window.open(url, '_blank');
  });
});

// ─── Social Media “Follow” Button Handler ─────────────────
const followBtn = document.getElementById('follow-button');
followBtn.addEventListener('click', () => {
  // find the checked radio in the “social” group
  const selected = document.querySelector('input[name="social"]:checked');
  if (!selected) {
    alert('Please select a platform first.');
    return;
  }
  // open the URL in a new tab
  window.open(selected.value, '_blank');
});

// ─── Upcoming Gigs Tree Generation ────────────────────────
const upcomingGigs = [
  { title: '9/18 – Neck of the Woods (Berkeley)',    tickets: 'https://app.showslinger.com/v4/first-day-back' },
  { title: '9/19 – Moroccan Lounge (Los Angeles)',    tickets: 'https://dice.fm/partner/crunchy-crunchy-llc/event/l8rl3l-first-day-back-the-ritornello-form-aplacewevealwaysbeen-19th-sep-oblivion-los-angeles-tickets' },
  { title: '9/20 – The Haven (Pomona)',    tickets: 'https://www.thehavenpomona.com/event-details/first-day-back-gapyear-clay-birds-the-ritornello-form' },
  { title: '9/22 – Che Cafe (Oceanside)',    tickets: 'https://m.bpt.me/event/6691400' },
  { title: '9/24 – Catalyst Atrium (Santa Cruz)',    tickets: 'https://www.etix.com/ticket/p/56564249/live-in-the-striumfirst-day-back-febuary-santa-cruz-the-catalyst-atrium' },
  { title: '10/8 – Teragram Ballroom (Los Angeles)',    tickets: 'https://www.ticketmaster.com/event/090062D9D2A25780' },
  { title: '11/15 – Underground Arts (Philadelphia)',    tickets: 'https://www.tixr.com/groups/undergroundarts/events/dilly-dally-fest-3-154618' },

  // …add more upcoming shows here…
];

// ─── Upcoming Gigs Tree Generation (expanded by default) ─────
function buildUpcomingTree() {
  const container = document.getElementById('upcoming-list');
  container.innerHTML = ''; // clear old list

  upcomingGigs.forEach(show => {
    const li = document.createElement('li');
    li.innerHTML = `
      <details open>
        <summary>${show.title}</summary>
        <ul>
          <li>
            <a 
              href="${show.tickets}" 
              target="_blank" 
              class="xp xp-button"
            >
              Purchase Tickets
            </a>
          </li>
        </ul>
      </details>
    `;
    container.appendChild(li);
  });
}

// fire it on load
window.addEventListener('DOMContentLoaded', buildUpcomingTree);