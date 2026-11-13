import { landingRotation } from "./show-core.js";
import { playShow, countdownTone } from "./draw-show.js?v=tasks-3";
function motion(el, frames, options) {
  let a, done;
  const finished = new Promise((resolve) => (done = resolve));
  const finish = () => {
    try {
      a?.finish();
    } catch {}
    done();
  };
  try {
    a = el.animate(frames, options);
    a.finished.then(done, done);
  } catch {
    done();
  }
  return { finished, finish };
}
export function playTaskShow(root, options) {
  let current = null,
    skipped = false;
  const finished = (async () => {
    const reduced = options.reduced;
    root.classList.add("is-ready");
    root.querySelector(".show-phase").textContent = options.t("planReady");
    if (!reduced) {
      current = motion(
        root.querySelector(".task-cue-card"),
        [
          { transform: "rotateY(180deg) scale(.93)" },
          { transform: "rotateY(360deg) scale(1)" },
        ],
        { duration: 350, easing: "ease-out", fill: "forwards" },
      );
      await current.finished;
      for (const n of [3, 2, 1]) {
        if (skipped) break;
        const counter = root.querySelector(".show-countdown");
        counter.hidden = false;
        counter.textContent = n;
        if (options.sound) countdownTone(n);
        current = motion(
          counter,
          [
            { opacity: 0, transform: "translate(-50%,-50%) scale(1.8)" },
            {
              opacity: 1,
              transform: "translate(-50%,-50%) scale(1)",
              offset: 0.3,
            },
            { opacity: 0, transform: "translate(-50%,-50%) scale(.75)" },
          ],
          { duration: 350, easing: "ease-out" },
        );
        await current.finished;
      }
    }
    root.querySelector(".show-countdown").hidden = true;
    root.classList.remove("is-ready");
    if (skipped)
      return {
        angle: landingRotation(
          options.members,
          options.chosenId,
          options.weighted,
        ),
        skipped: true,
      };
    root.querySelector(".show-phase").textContent = options.t("showDrawing");
    current = playShow(root, options);
    const result = await current.finished;
    return { ...result, skipped };
  })();
  return {
    finished,
    finish() {
      skipped = true;
      current?.finish();
    },
  };
}
export function deliverTask(from, target, { title, reduced = false }) {
  if (!from || !target || reduced)
    return { finished: Promise.resolve(), finish() {} };
  const to = target.getBoundingClientRect(),
    card = document.createElement("div");
  card.className = "task-flight";
  card.textContent = title;
  card.setAttribute("aria-hidden", "true");
  Object.assign(card.style, {
    left: from.left + "px",
    top: from.top + "px",
    width: from.width + "px",
    height: Math.min(from.height, 86) + "px",
  });
  document.body.append(card);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2),
    dy = to.top + to.height / 2 - (from.top + Math.min(from.height, 86) / 2);
  const animation = motion(
    card,
    [
      { transform: "translate(0,0) rotate(0deg) scale(1)", opacity: 1 },
      {
        transform: `translate(${dx * 0.5}px,${dy * 0.35 - 35}px) rotate(-7deg) scale(.8)`,
        opacity: 1,
        offset: 0.55,
      },
      {
        transform: `translate(${dx}px,${dy}px) rotate(4deg) scale(.13)`,
        opacity: 0.2,
      },
    ],
    { duration: 650, easing: "cubic-bezier(.2,.7,.2,1)", fill: "forwards" },
  );
  const finished = animation.finished.then(() => {
    card.remove();
    target.classList.add("just-received");
  });
  return {
    finished,
    finish() {
      animation.finish();
      card.remove();
    },
  };
}
