(() => {
  const template = document.getElementById("code-copy-button");
  const config = template.dataset;

  document.querySelectorAll("pre > code").forEach((codeblock) => {
    const container = codeblock.parentNode.parentNode;

    const copybutton = template.content.cloneNode(true).querySelector("button");
    let resetTimer;

    function setCopied(copied) {
      const label = copied ? config.copiedLabel : config.copyLabel;
      copybutton.classList.toggle("is-copied", copied);
      copybutton.title = label;
      copybutton.setAttribute("aria-label", label);
    }

    setCopied(false);

    function copyingDone() {
      clearTimeout(resetTimer);
      setCopied(true);
      resetTimer = setTimeout(() => setCopied(false), 2000);
    }

    copybutton.addEventListener("click", async () => {
      if ("clipboard" in navigator) {
        try {
          await navigator.clipboard.writeText(codeblock.textContent);
          copyingDone();
          return;
        } catch {
          // Clipboard API failed; try the fallback below.
        }
      }

      const range = document.createRange();
      range.selectNodeContents(codeblock);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      try {
        if (document.execCommand("copy")) {
          copyingDone();
        }
      } catch {
        // Keep the button unchanged when copying fails.
      }
      selection.removeRange(range);
    });

    if (container.classList.contains("highlight")) {
      container.appendChild(copybutton);
    } else if (container.parentNode.firstChild === container) {
    } else if (
      codeblock.parentNode.parentNode.parentNode.parentNode.parentNode
        .nodeName === "TABLE"
    ) {
      codeblock.parentNode.parentNode.parentNode.parentNode.parentNode.appendChild(
        copybutton,
      );
    } else {
      codeblock.parentNode.appendChild(copybutton);
    }
  });
})();
