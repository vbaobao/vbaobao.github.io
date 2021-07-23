const toggleVisibility = (elements) => {
  elements.forEach((element) => {
    element.target.classList.toggle('is-visible');
  });
};

const setVisible = (elements) => {
  elements.forEach((element) => {
    element.target.classList.add('is-visible');
  });
};

const observerToggle = new IntersectionObserver(toggleVisibility);
const observerSet = new IntersectionObserver(setVisible);
const animateUpElements = document.querySelectorAll('.up-show-on-scroll');
const animateDownElements = document.querySelectorAll('.down-show-on-scroll');
const animateRightElements = document.querySelectorAll('.right-show-on-scroll');
const animateLeftElements = document.querySelectorAll('.left-show-on-scroll');
const animateToggledElements = [...animateDownElements, ...animateLeftElements];

setTimeout(() => {
  animateRightElements.forEach((element) => {
    observerSet.observe(element);
  })
}, 500);

setTimeout(() => {
  animateUpElements.forEach((element) => {
    observerSet.observe(element);
  })
}, 1500);

setTimeout(() => {
  animateToggledElements.forEach((element) => {
    observerToggle.observe(element);
  });
}, 3000);