/**
 * <size-guide>
 *
 * Inline, animated "Not sure of the size? / Size guide" toggle used on the
 * product page. Expands/collapses a panel containing the size chart.
 *
 * The open/close animation itself is pure CSS (grid-template-rows 0fr -> 1fr on
 * `.ck-size-guide__panel.is-open`); this element only manages state:
 *   - toggles the `.is-open` class on the panel
 *   - keeps `aria-expanded` on the button in sync
 *   - applies `inert` while collapsed so the hidden content is skipped by
 *     keyboard/assistive tech.
 */
class SizeGuide extends HTMLElement {
  connectedCallback() {
    this.toggle = this.querySelector('.ck-size-guide__toggle');
    this.panel = this.querySelector('.ck-size-guide__panel');

    if (!this.toggle || !this.panel) return;

    this.handleClick = this.handleClick.bind(this);
    this.toggle.addEventListener('click', this.handleClick);
  }

  disconnectedCallback() {
    this.toggle?.removeEventListener('click', this.handleClick);
  }

  get open() {
    return this.panel.classList.contains('is-open');
  }

  handleClick() {
    this.setOpen(!this.open);
  }

  /**
   * @param {boolean} open
   */
  setOpen(open) {
    this.panel.classList.toggle('is-open', open);
    this.toggle.setAttribute('aria-expanded', String(open));

    if (open) {
      this.panel.removeAttribute('inert');
    } else {
      this.panel.setAttribute('inert', '');
    }
  }
}

if (!customElements.get('size-guide')) customElements.define('size-guide', SizeGuide);
