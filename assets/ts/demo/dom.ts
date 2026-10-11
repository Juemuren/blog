export function requireElement<T extends Element = HTMLElement>(
  parent: ParentNode,
  selector: string,
): T {
  const element = parent.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing demo element: ${selector}`);
  }
  return element;
}

export function cloneTemplate(template: HTMLTemplateElement): HTMLElement {
  const element = template.content.firstElementChild?.cloneNode(true);
  if (!(element instanceof HTMLElement)) {
    throw new Error("Demo template must contain an HTML element");
  }
  return element;
}
