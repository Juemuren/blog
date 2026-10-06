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

export function mount(container) {
  container.classList.add("gaussian-demo");
  container.innerHTML = `
    <form class="gaussian-demo-controls">
      <label>种子
        <input name="seed" type="number" min="0" max="4294967295"
          step="1" value="114514" required inputmode="numeric">
      </label>
      <label>生成数量
        <input name="count" type="number" min="1" max="1000"
          step="1" value="5" required inputmode="numeric">
      </label>
      <button type="submit">生成</button>
    </form>
    <p class="gaussian-demo-hint">每次从指定种子重新生成，最多 1000 个；相同种子和数量会得到相同结果。</p>
    <pre class="gaussian-demo-output" tabindex="0" aria-label="生成的随机数"><code></code></pre>
    <p class="gaussian-demo-status" role="status"></p>
  `;

  const form = container.querySelector("form");
  const output = container.querySelector("code");
  const status = container.querySelector('[role="status"]');

  function generate() {
    if (!form.reportValidity()) return;
    const seed = form.elements.seed.valueAsNumber;
    const count = form.elements.count.valueAsNumber;
    const next = createGaussianRandomGenerator(seed);
    output.textContent = Array.from({ length: count }, () => next()).join("\n");
    status.textContent = `已生成 ${count} 个随机数（种子：${seed}）。`;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    generate();
  });
  generate();
}
