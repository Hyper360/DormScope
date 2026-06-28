const navbarStyles = document.createElement('link');
navbarStyles.rel = 'stylesheet';
navbarStyles.href = new URL('../../css/navbar.css', import.meta.url).href;
document.head.appendChild(navbarStyles);

class SiteNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <header>
      <nav aria-label="Main navigation">
        <span id="header-title">DormScope 2026</span>
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
