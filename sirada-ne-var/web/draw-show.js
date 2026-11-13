import { sectors, landingRotation, reel } from "./show-core.js";
const palette = [
  "#e35255",
  "#f4c65a",
  "#48a99a",
  "#668ad6",
  "#bb78b7",
  "#f18c52",
  "#8ab765",
  "#b57c59",
];
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const point = (angle, r) => [
  200 + Math.sin((angle * Math.PI) / 180) * r,
  200 - Math.cos((angle * Math.PI) / 180) * r,
];
const shorten = (s, n = 13) =>
  Array.from(s).length > n
    ? Array.from(s)
        .slice(0, n - 1)
        .join("") + "…"
    : s;
function wheel(members, weighted, angle = 0, winnerId = "") {
  const slices = sectors(members, weighted);
  const bulbs = Array.from({ length: 24 }, (_, i) => {
    const [x, y] = point(i * 15, 179);
    return `<circle cx="${x}" cy="${y}" r="4" fill="#fff3c4"/>`;
  }).join("");
  return `<div class="show-wheel"><svg class="wheel-rim" viewBox="0 0 400 400" aria-hidden="true"><circle cx="200" cy="200" r="194" fill="#782c37"/><circle cx="200" cy="200" r="187" fill="#c34b4b" stroke="#f2cf7d" stroke-width="5"/><circle cx="200" cy="200" r="169" fill="#102e32"/>${bulbs}</svg><div class="wheel-rotor" style="transform:rotate(${angle}deg)"><svg viewBox="0 0 400 400" aria-hidden="true">${slices
    .map((s, i) => {
      const start = point(s.start, 163),
        end = point(s.end, 163),
        label = point(s.middle, 117);
      const path =
        s.end - s.start >= 359.99
          ? `<circle cx="200" cy="200" r="163" fill="${palette[i % palette.length]}"/>`
          : `<path d="M200 200 L${start.join(" ")} A163 163 0 ${s.end - s.start > 180 ? 1 : 0} 1 ${end.join(" ")} Z" fill="${palette[i % palette.length]}" stroke="${s.id === winnerId ? "#fff3be" : "#fffaeb70"}" stroke-width="${s.id === winnerId ? 5 : 2}"/>`;
      return `${path}<text transform="translate(${label.join(" ")}) rotate(${s.middle})" text-anchor="middle" dominant-baseline="middle" fill="#172b2c" font-size="${members.length > 15 ? 10 : members.length > 8 ? 12 : 17}" font-weight="800">${escape(shorten(s.name, members.length > 12 ? 8 : 13))}</text>`;
    })
    .join(
      "",
    )}</svg></div><span class="wheel-hub" aria-hidden="true">✦</span><span class="wheel-pointer" aria-hidden="true"></span></div>`;
}
export function showMarkup({
  members,
  weighted,
  kind = "wheel",
  sound = false,
  t,
  winnerId = "",
  angle = 0,
  drawing = false,
  taskTitle = "",
  taskPosition = "",
  people = members,
}) {
  const winner = members.find((m) => m.id === winnerId);
  const initial = members.length
    ? [members[members.length - 1], members[0], members[1 % members.length]]
    : [];
  return `<section id="draw-stage" class="draw-show ${winner ? "has-winner" : ""}" aria-label="${escape(t("showTitle"))}" aria-busy="${drawing}"><div class="show-header"><span class="show-kicker">${escape(t("showTitle"))}</span><div class="show-switch" role="group" aria-label="${escape(t("showTitle"))}">${["wheel", "slot"].map((k) => `<button type="button" data-action="presentation" data-kind="${k}" aria-pressed="${kind === k}">${escape(t(k === "wheel" ? "showWheel" : "showSlot"))}</button>`).join("")}</div></div>${taskTitle ? taskCue(taskTitle, taskPosition, t) : ""}<div class="show-arena ${kind === "slot" ? "is-slot" : ""}"><span class="show-countdown" aria-hidden="true" hidden></span>${kind === "wheel" ? wheel(members, weighted, angle, winnerId) : `<div class="slot-cabinet"><div class="slot-crown" aria-hidden="true">✦ &nbsp; ✦ &nbsp; ✦</div><div class="slot-window"><div class="slot-track">${(winner ? [members[(members.indexOf(winner) + members.length - 1) % members.length], winner, members[(members.indexOf(winner) + 1) % members.length]] : initial).map((m) => `<div class="slot-row">${escape(shorten(m.name, 22))}</div>`).join("")}</div><div class="slot-center" aria-hidden="true"></div></div><div class="slot-plate" aria-hidden="true">● &nbsp; ● &nbsp; ● &nbsp; ● &nbsp; ●</div></div>`}<div class="show-confetti" aria-hidden="true">${winner ? Array.from({ length: 24 }, (_, i) => `<i style="--x:${(i * 29) % 100}%;--r:${i * 47}deg;--delay:${(i % 5) * 0.05}s;--c:${palette[i % palette.length]}"></i>`).join("") : ""}</div></div>${participantLights(people, members, winnerId)}<div class="show-readout" role="status" aria-live="polite"><span class="show-phase">${escape(t(winner ? "showWinner" : drawing ? "showDrawing" : "showReady"))}</span><strong class="show-name">${winner ? escape(winner.name) : '<span aria-hidden="true">✦</span>'}</strong><span class="show-subline">${escape(t(winner ? "showOnce" : "showHint"))}</span></div><div class="show-tools"><button type="button" data-action="sound" aria-pressed="${sound}" class="show-sound">${escape(t(sound ? "showSoundOn" : "showSoundOff"))}</button><button type="button" data-action="reveal" class="show-reveal" ${drawing ? "" : "hidden"}>${escape(t("showReveal"))}</button></div></section>`;
}
let audio;
export function countdownTone(n) {
  tone(420 + (4 - n) * 100, 0.09, 0.025);
}
export function prepareAudio(enabled) {
  if (!enabled) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    audio.resume().catch(() => {});
  } catch {}
}
function tone(frequency, duration = 0.025, level = 0.025, delay = 0) {
  if (!audio || audio.state !== "running") return;
  const oscillator = audio.createOscillator(),
    gain = audio.createGain(),
    start = audio.currentTime + delay;
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(level, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.01);
  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
  };
}
export function playShow(
  root,
  { members, chosenId, weighted, kind, sound = false, reduced = false },
) {
  const angle = landingRotation(members, chosenId, weighted);
  const duration = reduced ? 120 : kind === "wheel" ? 5200 : 4600;
  let animation,
    frame = 0,
    lastTick = -1,
    settled = false,
    resolve;
  const finished = new Promise((done) => (resolve = done));
  root.classList.add("is-drawing");
  const end = () => {
    if (settled) return;
    settled = true;
    cancelAnimationFrame(frame);
    try {
      animation?.finish();
    } catch {}
    if (sound && !reduced) {
      tone(523, 0.18, 0.035);
      tone(659, 0.25, 0.03, 0.11);
      tone(784, 0.4, 0.03, 0.22);
    }
    root.classList.remove("is-drawing");
    resolve({ angle });
  };
  try {
    if (kind === "wheel") {
      animation = root
        .querySelector(".wheel-rotor")
        .animate(
          [
            { transform: "rotate(0deg)" },
            { transform: `rotate(${360 * 7 + angle}deg)` },
          ],
          { duration, easing: "cubic-bezier(.12,.62,.12,1)", fill: "forwards" },
        );
    } else {
      const track = root.querySelector(".slot-track"),
        sequence = reel(members, chosenId);
      track.innerHTML = sequence.rows
        .map(
          (m) => `<div class="slot-row">${escape(shorten(m.name, 22))}</div>`,
        )
        .join("");
      const height = track
        .querySelector(".slot-row")
        .getBoundingClientRect().height;
      animation = track.animate(
        [
          { transform: "translateY(0px)" },
          {
            transform: `translateY(-${(sequence.winnerIndex - 1) * height}px)`,
          },
        ],
        { duration, easing: "cubic-bezier(.12,.65,.1,1)", fill: "forwards" },
      );
    }
    const tick = () => {
      if (settled) return;
      const p = Math.min(1, Number(animation.currentTime || 0) / duration);
      const position = Math.floor(38 * (1 - Math.pow(1 - p, 3)));
      if (position !== lastTick) {
        lastTick = position;
        if (sound && !reduced) tone(kind === "wheel" ? 950 : 650, 0.025, 0.02);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    animation.finished.then(end, end);
  } catch {
    end();
  }
  return { finished, finish: end };
}

function taskCue(title, position, t) {
  return (
    '<div class="task-deck"><i aria-hidden="true"></i><i aria-hidden="true"></i><div class="task-cue-card"><div class="task-cue-front"><span>' +
    escape(t("task")) +
    "</span><strong>" +
    escape(title) +
    "</strong><small>" +
    escape(position) +
    '</small></div><div class="task-cue-back" aria-hidden="true">✦</div></div></div>'
  );
}
function participantLights(people, eligible, winnerId) {
  return (
    '<div class="participant-lights" role="list">' +
    people
      .map(
        (m, i) =>
          '<span role="listitem" data-light-member="' +
          escape(m.id) +
          '" class="participant-light ' +
          (m.id === winnerId ? "is-winner " : "") +
          (eligible.some((x) => x.id === m.id) ? "is-eligible " : "") +
          (!m.available ? "is-off" : "") +
          '" style="--person-i:' +
          i +
          '"><span class="light-avatar">' +
          escape(Array.from(m.name)[0] || "·") +
          '<small class="light-count">' +
          (m.count || 0) +
          '</small></span><span class="light-name">' +
          escape(m.name) +
          "</span></span>",
      )
      .join("") +
    "</div>"
  );
}
