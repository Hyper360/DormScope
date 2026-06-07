class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <footer>
      <p>DormScope 2026</p>
      <p><a href="index.html">Home</a></p>
      <p><a href="search.html">Search</a></p>
      <p><a href="about.html">About Us</a></p>
      <p><a href="contact.html">Contact Us</a></p>
      <p><a href="credits.html">Credits</a></p>
    </footer>
    `;
  }
}

customElements.define('site-footer', SiteFooter);
