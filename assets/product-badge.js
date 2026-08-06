import { Component } from '@theme/component';
import { StandardEvents } from '@shopify/events';

/**
 * A custom element that displays availability / discount badges for a product.
 * On the product page it reflects the SELECTED variant and re-renders on variant
 * change, mirroring the update pattern used by product-price.js: it listens for the
 * standard productSelect event and swaps its markup from the re-fetched section HTML.
 *
 * @extends {Component}
 */
class ProductBadge extends Component {
  connectedCallback() {
    super.connectedCallback();
    const closestSection = this.closest('.shopify-section, dialog');
    if (!closestSection) return;
    closestSection.addEventListener(StandardEvents.productSelect, this.#handleProductSelect);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    const closestSection = this.closest('.shopify-section, dialog');
    if (!closestSection) return;
    closestSection.removeEventListener(StandardEvents.productSelect, this.#handleProductSelect);
  }

  /**
   * Handles the product select event and swaps in the badge markup for the new variant.
   * @param {import('@shopify/events').ProductSelectEvent} event
   */
  #handleProductSelect = (event) => {
    // Ignore events originating from product cards (their own swatches picker).
    if (!(event.target instanceof Element) || event.target.closest('product-card')) return;

    event.promise
      .then(({ detail }) => {
        if (!detail?.html) return;

        const { html, newProduct } = detail;

        if (newProduct) {
          this.dataset.productId = newProduct.id;
        } else if (detail.productId && detail.productId !== this.dataset.productId) {
          return;
        }

        const updated = html.querySelector(`product-badge[data-block-id="${this.dataset.blockId}"]`);
        if (!updated) return;

        // Skip the swap when the badge is unchanged between variants, so it doesn't
        // flicker / re-animate needlessly. Otherwise swap (the CSS entrance animation
        // on the inline pills plays because the nodes are freshly inserted).
        const nextHTML = updated.innerHTML;
        if (nextHTML.trim() === this.innerHTML.trim()) return;
        this.innerHTML = nextHTML;
      })
      .catch((error) => {
        if (error?.name !== 'AbortError') console.warn('[product-badge] Event promise rejected:', error);
      });
  };
}

if (!customElements.get('product-badge')) {
  customElements.define('product-badge', ProductBadge);
}
