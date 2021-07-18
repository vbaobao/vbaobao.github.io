const toggleVisibility = (elements) => {
  elements.forEach((element) => {
    element.target.classList.toggle('is-visible');
  });
};

const observer = new IntersectionObserver(toggleVisibility);
const animateUpElements = document.querySelectorAll('.up-show-on-scroll');
const animateDownElements = document.querySelectorAll('.down-show-on-scroll');
const animateRightElements = document.querySelectorAll('.right-show-on-scroll');
const animateLeftElements = document.querySelectorAll('left-show-on-scroll');

animateUpElements.forEach((element) => {
  observer.observe(element);
});

animateDownElements.forEach((element) => {
  observer.observe(element);
});

animateRightElements.forEach((element) => {
  observer.observe(element);
});

animateLeftElements.forEach((element) => {
  observer.observe(element);
});
