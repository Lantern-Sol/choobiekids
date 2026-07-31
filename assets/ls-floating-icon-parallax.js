/**
 * <ls-floating-icon-parallax> — wraps a floating Choobies icon and gives it a
 * gentle drift as its section scrolls through the viewport.
 *
 * Implemented as a custom element (not an inline <script>) because Shopify's
 * theme editor re-renders sections via AJAX and swaps in new markup; scripts
 * inserted that way never execute, but a custom element's connectedCallback
 * fires regardless of how the element entered the DOM.
 */
// Class must live inside this guard, not just customElements.define() —
// this file loads once per section instance, and a bare top-level `class`
// throws "already declared" on the 2nd+ load.
if (!customElements.get('ls-floating-icon-parallax')) {
  class LsFloatingIconParallax extends HTMLElement {
    connectedCallback() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      // At 990px+ this theme moves scrolling from window to .page-wrapper
      // (base.css sets html/body to overflow: hidden there) — listen on
      // both since only one of them actually fires depending on viewport.
      this.scrollTarget = document.querySelector('.page-wrapper') || window;

      this.ticking = false;
      this.handleScroll = this.handleScroll.bind(this);
      window.addEventListener('scroll', this.handleScroll, { passive: true });
      this.scrollTarget.addEventListener('scroll', this.handleScroll, { passive: true });
      this.handleScroll();
    }

    disconnectedCallback() {
      window.removeEventListener('scroll', this.handleScroll);
      this.scrollTarget?.removeEventListener('scroll', this.handleScroll);
    }

    handleScroll() {
      if (this.ticking) return;
      this.ticking = true;
      requestAnimationFrame(() => this.update());
    }

    update() {
      const viewportHeight = window.innerHeight;
      const rect = this.getBoundingClientRect();
      const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
      const clamped = Math.min(Math.max(progress, 0), 1);
      const offset = (clamped - 0.5) * 60;

      this.style.translate = `0 ${offset.toFixed(1)}px`;

      this.ticking = false;
    }
  }

  customElements.define('ls-floating-icon-parallax', LsFloatingIconParallax);
}
