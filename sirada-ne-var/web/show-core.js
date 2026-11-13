// Presentation geometry only. The recorded choice comes from groups-core.assign.
export function sectors(members, weighted = false) {
  const total = members.reduce((sum, m) => sum + (weighted ? m.weight : 1), 0);
  let angle = 0;
  return members.map((m) => {
    const sweep = ((weighted ? m.weight : 1) / total) * 360;
    const sector = {
      ...m,
      start: angle,
      end: angle + sweep,
      middle: angle + sweep / 2,
    };
    angle += sweep;
    return sector;
  });
}
export function landingRotation(members, chosenId, weighted = false) {
  const selected = sectors(members, weighted).find((m) => m.id === chosenId);
  if (!selected) throw Error("Selected member is not in the displayed draw");
  return (360 - selected.middle) % 360;
}
export function reel(members, chosenId, steps = 46) {
  const index = members.findIndex((m) => m.id === chosenId);
  if (index < 0) throw Error("Selected member is not in the displayed draw");
  return {
    rows: [
      members[members.length - 1],
      ...Array.from({ length: steps }, (_, i) => members[i % members.length]),
      members[index],
      members[(index + 1) % members.length],
    ],
    winnerIndex: steps + 1,
  };
}
