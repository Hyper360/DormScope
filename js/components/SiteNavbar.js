const navbarStyles = document.createElement('link');
navbarStyles.rel = 'stylesheet';
navbarStyles.href = new URL('../../css/navbar.css', document.currentScript.src).href;
document.head.appendChild(navbarStyles);

class SiteNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <nav aria-label="Main navigation">
      <span id="header-title">DormScope 2026</span>
      <a href="index.html">Home</a>
      <a href="search.html">Search</a>
      <a href="about.html">About</a>
      <a href="contact.html">Contact</a>
      <a href="credits.html">Credits</a>
      <form action="search.html" method="get">
        <input type="text" name="location" placeholder="Location">
        <button type="submit">Search</button>
      </form>
    </nav>
    `;
  }
}

customElements.define('site-navbar', SiteNavbar);
