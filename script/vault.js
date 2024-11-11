/* <div class="box">の中に data-id="newTab"を入れると新しいタブで開く */
document.querySelectorAll('.box').forEach(box => {
    box.addEventListener('click', function() {
        const link = this.getAttribute('data-link');
        const target = this.getAttribute('data-id') === 'newTab' ? '_blank' : '_self';
        window.open(link, target);
    });
});

const boxes = document.querySelectorAll('.box');

function startAnimation(event) {
    const box = event.currentTarget;
    clearTimeout(box.animationTimeout);
    box.classList.add('animate');
    box.animationTimeout = setTimeout(() => {
        box.classList.remove('animate');
    }, 400);
}

boxes.forEach(box => {
    box.addEventListener('mouseenter', startAnimation);
    box.addEventListener('click', startAnimation);
});
