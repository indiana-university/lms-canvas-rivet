// Default rivet path
const defaultRivetPath = "/app/jsrivet";

// Create template
const template = document.createElement('template');
template.innerHTML = `
<link id="rivet-css" rel="stylesheet" type="text/css" href="/RIVET_PATH_PLACEHOLDER/rivet.min.css">
<style>
  #scroll-to-top-button {
    display: none; /* Hidden by default */
    position: fixed; /* Fixed/sticky position */
    bottom: 20px; /* Place the button at the bottom of the page */
    right: 30px; /* Place the button 30px from the right */
    z-index: 99; /* Make sure it does not overlap */
    cursor: pointer; /* Add a mouse pointer on hover */
  }
</style>
<button id="scroll-to-top-button" class="rvt-button rvt-button--secondary" title="Back to top">
  <span class="rvt-m-right-xxs">Back to Top</span>
  <svg fill="currentColor" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 15V4.156l4.854 4.107 1.292-1.526L8 .69.854 6.737l1.292 1.526L7 4.156V15h2Z"></path>
  </svg>
</button>
`;

class ScrollToTop extends HTMLElement {

  constructor() {
    super();

    // Register handlers
    this.buttonClick = this.buttonClick.bind(this);
    this.windowScroll = this.windowScroll.bind(this);

    // Create a shadow root
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));

    // Button click listener
    const myButton = this.shadowRoot.querySelector('#scroll-to-top-button');
    myButton.addEventListener("click", this.buttonClick, false);

    // Get the default/specified path
    let rivetPath = defaultRivetPath;
    if (this.hasAttribute("rivetpath")) {
      rivetPath = this.getAttribute("rivetpath");
    }

    // Replace placeholder path with desired path
    const rivetCss = this.shadowRoot.querySelector('#rivet-css');
    rivetCss.setAttribute("href", rivetCss.href.replace("/RIVET_PATH_PLACEHOLDER", rivetPath));

    // Window scroll listener
    window.addEventListener('scroll', this.windowScroll, false);
  }

  buttonClick(e) {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  }

  windowScroll(e) {
    const myButton = this.shadowRoot.querySelector('#scroll-to-top-button');
    if (myButton) {
        if (document.body.scrollTop > 1 || document.documentElement.scrollTop > 1) {
            myButton.style.display = "block";
        } else {
            myButton.style.display = "none";
        }
    }
  }

}

customElements.define("scroll-to-top", ScrollToTop);
