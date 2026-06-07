class SiteNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <nav>
      <a href="index.html">Dorm Scope</a>
      <form action="search.html" method="get">
        <input type="text" name="query" placeholder="Query">
        <button type="submit">Search</button>
      </form>
      <a href="wishlist.html">Wishlist</a>
    </nav>
    `;
  }
}

customElements.define('site-navbar', SiteNavbar);

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <footer>
      <p>DormScope 2026</p>
      <p><a href="about.html">About Us</a></p>
      <p><a href="contact.html">Contact Us</a></p>
    </footer>
    `;
  }
}

customElements.define('site-footer', SiteFooter);
