function interpolate(currentTime, totalTime) {
  const position = currentTime / totalTime;

  let opacity = 0;

  if (position > 0 && position <= 0.5) {
    const elapsed = position - 0;
    const percentComplete = elapsed / 0.5;
    opacity = 0 + percentComplete * 0.1;
  }

  if (position > 0.5 && position <= 0.75) {
    const elapsed = position - 0.5;
    const percentComplete = elapsed / 0.25;
    opacity = 0.1 + percentComplete * 0.7;
  }

  if (position > 0.75 && position <= 1) {
    const elapsed = position - 0.75;
    const percentComplete = elapsed / 0.25;
    opacity = 0.8 + percentComplete * 0.2;
  }

  let paddingLeft = 10;

  if (position > 0 && position <= 1) {
    const elapsed = position - 0;
    const percentComplete = elapsed / 1;
    paddingLeft = 10 + percentComplete * 90;
  }

  return {
    opacity: opacity,
    paddingLeft: paddingLeft
  };
}
