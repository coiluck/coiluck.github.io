document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.account');
    buttons.forEach(btn => {
      btn.addEventListener('mouseenter', e => {
        e.target.classList.add('is-poyo');
      });
      btn.addEventListener('animationend', e => {
        e.target.classList.remove('is-poyo');
      });
    });
  });
  