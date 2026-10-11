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

export function setAttributes(
  element: Element,
  attributes: Record<string, string | number | boolean | undefined>,
): void {
  for (const [name, value] of Object.entries(attributes)) {
    if (value !== undefined) element.setAttribute(name, String(value));
  }
}

export function cloneTemplate(template: HTMLTemplateElement): HTMLElement {
  const element = template.content.firstElementChild?.cloneNode(true);
  if (!(element instanceof HTMLElement)) {
    throw new Error("Demo template must contain an HTML element");
  }
  return element;
}
