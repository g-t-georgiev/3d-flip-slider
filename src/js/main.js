const slider = document.querySelector('[data-slider]');
const slidesTrack = slider.querySelector('[data-track]');
const slides = slidesTrack.querySelectorAll('[data-slide]');
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
            arrowLeft.toggleAttribute('disabled', activeIndex === 0);
            arrowRight.toggleAttribute('disabled', activeIndex === slides.length - 1);
            page.setAttribute('data-active', '');
            slide.classList.add('curr');
            activeTarget = slide;
            return;
        }
    });
}

setupSwipingAction();

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

function setupSwipingAction() {
    let rotation = 0;
    let offsetX = slidesTrack.clientLeft;
    let startX = offsetX;
    let newIndex, nextTarget;
    let isDragging = false;

    slidesTrack.addEventListener('mousedown', onTouchStart);
    slidesTrack.addEventListener('touchstart', onTouchStart);
    document.addEventListener('mouseup', onTouchEnd);
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('touchcancel', onTouchEnd);
    document.addEventListener('mousemove', onTouchMove);
    document.addEventListener('touchmove', onTouchMove, { passive: false });


    /**
     * Handle touch start or pointer down events.
     * @param {PointerEvent | MouseEvent | TouchEvent} event 
     * @returns {void}
     */
    function onTouchStart(event) {
        let clientX = event.clientX;
        if ('TouchEvent' in window && event instanceof TouchEvent) {
            clientX = event.touches[0].clientX;
        }
        isDragging = true;
        startX = clientX - offsetX;
    }

    /**
     * Handle touch end/cancel or pointer up events.
     * @param {PointerEvent | MouseEvent | TouchEvent} event 
     * @returns {void}
     */
    function onTouchEnd(event) {
        if (!isDragging) return;
        isDragging = false;
        activeTarget?.style.removeProperty('rotate');
        nextTarget?.style.removeProperty('visibility');
        nextTarget?.style.removeProperty('rotate');
        togglePagination(newIndex);
        toggleSlides(newIndex);
    }

    /**
     * Handle touch move or pointer move events.
     * @param {PointerEvent | MouseEvent | TouchEvent} event 
     * @returns {void}
     */
    function onTouchMove(event) {
        if (!isDragging) return;
        event.preventDefault();
        let clientX = event.clientX;
        if ('TouchEvent' in window && event instanceof TouchEvent) {
            clientX = event.touches[0].clientX;
        }

        let deltaX = (clientX - offsetX) - startX;
        rotation = deltaX / 2 * 1;

        activeTarget.style.setProperty('rotate', `y ${rotation}deg`);

        if (Math.abs(rotation) < 90) {
            newIndex = activeIndex;
            return;
        }
        
        newIndex = activeIndex - Math.sign(rotation);
        newIndex = Math.max(Math.min(slides.length - 1, newIndex), 0);
        nextTarget = slides.item(newIndex);
        nextTarget?.style.setProperty('rotate', `y ${(newIndex < activeIndex ? -180 : 180) + rotation}deg`);
        nextTarget?.style.setProperty('visibility', 'visible');
    }
}