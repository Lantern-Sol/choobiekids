/**
 * <ls-content-cards> — syncs the mobile carousel's progress dashes with the
 * card scroller. Only does anything when the section's "horizontal scroll on
 * mobile" setting renders the dashes; on desktop the dashes are hidden by CSS
 * and this element quietly no-ops.
 *
 * Implemented as a custom element (not an inline <script>) because Shopify's
 * theme editor re-renders sections via AJAX and swaps in new markup; scripts
 * inserted that way never execute, but a custom element's connectedCallback
 * fires regardless of how the element entered the DOM.
 */
// Class must live inside this guard, not just customElements.define() —
// this file loads once per section instance, and a bare top-level `class`
// throws "already declared" on the 2nd+ load.
if (!customElements.get('ls-content-cards')) {
  class LsContentCards extends HTMLElement {
    connectedCallback() {
      this.scroller = this.querySelector('[data-cards-scroller]');
      this.dots = Array.from(this.querySelectorAll('[data-card-dot]'));
      this.cards = Array.from(this.querySelectorAll('[data-card-index]'));
      if (!this.scroller || this.dots.length === 0) return;

      // Clicking a dash scrolls its card into view.
      this.handleDotClick = this.handleDotClick.bind(this);
      this.dots.forEach((dot) => dot.addEventListener('click', this.handleDotClick));

      // Highlight the dash for whichever card is most visible in the scroller.
      this.observer = new IntersectionObserver(
        (entries) => this.onIntersect(entries),
        { root: this.scroller, threshold: 0.6 }
      );
      this.cards.forEach((card) => this.observer.observe(card));
    }

    disconnectedCallback() {
      this.observer?.disconnect();
      this.dots.forEach((dot) => dot.removeEventListener('click', this.handleDotClick));
    }

    handleDotClick(event) {
      const index = Number(event.currentTarget.dataset.cardDot);
      const card = this.cards[index];
      if (!card) return;
      // inline: 'start' respects the scroller's scroll-padding, so the card
      // lands at the page gutter; block: 'nearest' avoids a vertical jump.
      card.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }

    onIntersect(entries) {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = Number(entry.target.dataset.cardIndex);
        this.setActive(index);
      });
    }

    setActive(index) {
      this.dots.forEach((dot, i) => {
        const active = i === index;
        dot.classList.toggle('is-active', active);
        if (active) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });
    }
  }

  customElements.define('ls-content-cards', LsContentCards);
}
