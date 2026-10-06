function createUniformRandomGenerator(seed) {
  let state = seed >>> 0;

  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

export function createGaussianRandomGenerator(seed) {
  const getUniformRandom = createUniformRandomGenerator(seed);
  let spare = null;

  return () => {
    if (spare !== null) {
      const value = spare;
      spare = null;
      return value;
    }

    let u_1 = getUniformRandom();
    while (u_1 === 0) {
      u_1 = getUniformRandom();
    }
    const u_2 = getUniformRandom();

    const r = Math.sqrt(-2 * Math.log(u_1));
    const theta = 2 * Math.PI * u_2;

    spare = r * Math.sin(theta);
    return r * Math.cos(theta);
  };
}
