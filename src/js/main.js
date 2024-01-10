const slider = document.querySelector('[data-slider]');
const slides = slider.querySelectorAll('[data-slide]');
const arrows = slider.querySelector('[data-arrows]');
const arrowLeft = arrows.querySelector('[data-arrow-left]');
const arrowRight = arrows.querySelector('[data-arrow-right]');
const paginator = slider.querySelector('[data-paginator]');
const pages = [];

let activeIndex = 0;
let activeTarget = null;
let prevTarget = null;

arrowLeft?.addEventListener('click', function () {
    let nextIndex = activeIndex - 1;
    if (nextIndex < 0) return;
    togglePagination(nextIndex);
    toggleSlides(nextIndex);
});

arrowRight?.addEventListener('click', function () {
    let nextIndex = activeIndex + 1;
    if (nextIndex >= slides.length) return;
    togglePagination(nextIndex);
    toggleSlides(nextIndex);
});

paginator?.addEventListener('click', function (event) {
    const eventTarget = event.target;
    const isTargetElement = eventTarget !== null && eventTarget.matches('[data-page]');
    const isActiveTargetElement = isTargetElement && eventTarget.matches('[data-active]');
    if (!isTargetElement || isActiveTargetElement) return;
    const index = pages.findIndex(page => page === eventTarget);
    if (index == -1) return;
    togglePagination(index);
    toggleSlides(index);
});

if (slides.length > 0) {
    paginator.innerHTML = '';

    slides.forEach(function (slide, i) {
        const page = document.createElement('div');
        page.classList.add('flip-paginator-bullet');
        page.setAttribute('data-page', '');
        pages.push(page);
        paginator.append(page);
    
        if (i === activeIndex) {
            activeTarget = slide;
            slide.classList.add('curr');
            page.setAttribute('data-active', '');
            arrowLeft.toggleAttribute('disabled', activeIndex === 0);
            arrowRight.toggleAttribute('disabled', activeIndex === slides.length - 1);
            return;
        }
    });
}

function toggleSlides(index) {
    if (index < 0 || index >= slides.length) return;

    console.log('Go to slide', index);
    arrowLeft.toggleAttribute('disabled', index === 0);
    arrowRight.toggleAttribute('disabled', index === slides.length - 1);

    if (prevTarget) {
        prevTarget.classList.remove('prev');
    }

    if (activeTarget) {
        prevTarget = activeTarget;
        prevTarget.classList.add('prev');
        activeTarget.classList.remove('curr');
    }

    if (index > activeIndex) {
        console.log('Direction LTR');
    } else if (index < activeIndex) {
        console.log('Direction RTL');
    }

    const newActiveTarget = slides.item(index);
    if (newActiveTarget) {
        newActiveTarget.classList.add('curr');
        activeTarget = newActiveTarget;
        activeIndex = index;
    }


}

function togglePagination(index) {
    let activePage = pages.find((page, i) => page.hasAttribute('data-active'));
    if (activePage) activePage.removeAttribute('data-active');
    activePage = pages[index];
    if (activePage) activePage.setAttribute('data-active', '');
}