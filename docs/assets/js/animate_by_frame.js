const toggleVisibility = (elements) => {
  elements.forEach((element) => {
    element.target.classList.toggle('is-visible');
  });
};

const observer = new IntersectionObserver(toggleVisibility);
const animateVerticalElements = document.querySelectorAll('.y-show-on-scroll');
const animateRightHorizontalElements = document.querySelectorAll('.x-right-show-on-scroll');
const animateLeftHorizontalElements = document.querySelectorAll('.x-left-show-on-scroll');

animateVerticalElements.forEach((element) => {
  observer.observe(element);
});

animateRightHorizontalElements.forEach((element) => {
  observer.observe(element);
});

animateLeftHorizontalElements.forEach((element) => {
  observer.observe(element);
});
