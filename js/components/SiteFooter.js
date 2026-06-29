const footerStyles = document.createElement('link');
footerStyles.rel = 'stylesheet';
footerStyles.href = new URL('../../css/footer.css', import.meta.url).href;
document.head.appendChild(footerStyles);

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <div>
      <p><a href="index.html">Home</a></p>
      <p><a href="search.html">Search</a></p>
      <p><a href="about.html">About Us</a></p>
      <p><a href="contact.html">Contact Us</a></p>
      <p><a href="credits.html">Credits</a></p>
    </div>
    `;
  }
}

customElements.define('site-footer', SiteFooter);
