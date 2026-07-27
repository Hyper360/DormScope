const componentBaseUrl = new URL('./', document.currentScript.src);

['SiteNavbar.js', 'SiteFooter.js', 'DormListing.js'].forEach((fileName) => {
  const script = document.createElement('script');
  script.src = new URL(fileName, componentBaseUrl).href;
  script.defer = true;
  document.head.appendChild(script);
});
