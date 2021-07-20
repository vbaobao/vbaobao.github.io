const toggleVisibility = (elements) => {
  elements.forEach((element) => {
    element.target.classList.toggle('is-visible');
  });
};

const observer = new IntersectionObserver(toggleVisibility);
const animateUpElements = document.querySelectorAll('.up-show-on-scroll');
const animateDownElements = document.querySelectorAll('.down-show-on-scroll');
const animateRightElements = document.querySelectorAll('.right-show-on-scroll');
const animateLeftElements = document.querySelectorAll('.left-show-on-scroll');
const animateElements = [...animateUpElements, ...animateDownElements, ...animateRightElements, ...animateLeftElements];

animateElements.forEach((element) => {
  observer.observe(element);
});