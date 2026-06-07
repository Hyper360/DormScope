class SiteNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <header>
      <nav aria-label="Main navigation">
        <a href="index.html">Home</a>
        <a href="search.html">Search</a>
        <a href="about.html">About</a>
        <a href="contact.html">Contact</a>
        <a href="credits.html">Credits</a>
        <form action="search.html" method="get">
          <input type="text" name="query" placeholder="Query">
          <button type="submit">Search</button>
        </form>
      </nav>
    </header>
    `;
  }
}

customElements.define('site-navbar', SiteNavbar);
