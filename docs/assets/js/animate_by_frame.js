const toggleVisibility = (elements) => {
  elements.forEach((element) => {
    if (element.intersectionRatio) {
      element.target.classList.add('is-visible');
    } else {
      element.target.classList.remove('is-visible');
    }
  });
};

const setVisible = (elements) => {
  elements.forEach((element) => {
    element.target.classList.add('is-visible');
  });
};

const observerToggle = new IntersectionObserver(toggleVisibility);
const observerSet = new IntersectionObserver(setVisible);
const sidebar = document.querySelectorAll('.socials');
const nav = document.querySelectorAll('nav');
const animateUpElements = document.querySelectorAll('.up-show-on-scroll');
const animateDownElements = document.querySelectorAll('.down-show-on-scroll');
const animateRightElements = document.querySelectorAll('.right-show-on-scroll');
const animateLeftElements = document.querySelectorAll('.left-show-on-scroll');
const animateToggledElements = [
  ...animateUpElements,
  ...animateDownElements,
  ...animateLeftElements,
  ...animateRightElements
];

setTimeout(() => {
  nav.forEach((element) => {
    observerSet.observe(element);
  })
}, 500);

setTimeout(() => {
  sidebar.forEach((element) => {
    observerSet.observe(element);
  })
}, 1500);

setTimeout(() => {
  animateToggledElements.forEach((element) => {
    observerToggle.observe(element);
  });
}, 2000);