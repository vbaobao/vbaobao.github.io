const emailLinks = document.querySelectorAll('.email-link');
const emailModal = document.getElementById('email-modal');

const displayModal = (modal) => () => modal.classList.toggle('is-visible');

emailLinks.forEach((element) => {
  element.addEventListener('click', displayModal(emailModal));
});

const closeButtons = document.querySelectorAll('.click-to-close');

closeButtons.forEach((element) => {
  element.addEventListener('click', displayModal(emailModal));
})