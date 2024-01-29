const slider = document.querySelector('[data-slider]');
const slidesTrack = slider.querySelector('[data-track]');
const slides = slidesTrack.querySelectorAll('[data-slide]');
const arrows = slider.querySelector('[data-arrows]');
const arrowLeft = arrows.querySelector('[data-arrow-left]');
const arrowRight = arrows.querySelector('[data-arrow-right]');
const paginator = slider.querySelector('[data-paginator]');
const pages = [];

let index = 0;
let active = null;
let isLocked = false;

load();

function load() {
    if (slides.length > 0) {
        paginator.innerHTML = '';

        slides.forEach(function (slide, i) {
            const page = document.createElement('div');
            page.classList.add('flip-paginator-bullet');
            page.setAttribute('data-page', '');
            pages.push(page);
            paginator.append(page);

            slide.style.setProperty('--i', i);
            slide.style.setProperty('rotate', `y ${Math.sign(i - index) * 180}deg`);
            slide.style.setProperty('opacity', i === index ? 1 : 0);
            toggleArrowButtons(index);

            if (i === index) {
                page.setAttribute('data-active', '');
                slide.classList.add('current');
                active = slide;
                return;
            }
        });

        arrowLeft?.addEventListener('click', function () {
            if (isLocked) return;
            let nextIndex = index - 1;
            if (nextIndex < 0) return;
            toggleSlides(nextIndex);
        });
        
        arrowRight?.addEventListener('click', function () {
            if (isLocked) return;
            let nextIndex = index + 1;
            if (nextIndex >= slides.length) return;
            toggleSlides(nextIndex);
        });

        paginator?.addEventListener('click', function (event) {
            if (isLocked) return;
            const eventTarget = event.target;
            const isTargetElement = eventTarget !== null && eventTarget.matches('[data-page]');
            const isActiveTargetElement = isTargetElement && eventTarget.matches('[data-active]');
            if (!isTargetElement || isActiveTargetElement) return;
            const index = pages.findIndex(page => page === eventTarget);
            if (index == -1) return;
            toggleSlides(index);
        });

        setupSwipeActionHandlers();

        let timeoutId = setTimeout(function () {
            clearTimeout(timeoutId);
            slidesTrack.style.setProperty('visibility', 'visible');
        }, 500);
    }
}

function toggleSlides(newIndex) {
    if (newIndex < 0 || newIndex >= slides.length) return;

    isLocked = true;
    // console.log('Go to slide', newIndex);

    if (newIndex > index) {
        // console.log('Direction LTR');
    } else if (newIndex < index) {
        // console.log('Direction RTL');
    }

    let currentSlide = slides[index];
    currentSlide.style.setProperty('opacity', 1);
    
    let nextSlide = slides[newIndex];
    nextSlide.style.setProperty('opacity', 1);

    let finishedTasks = 0;
    const targetTasks = 2;
    const onTransitionsComplete = function () {
        finishedTasks = 0;
        currentSlide.removeEventListener('transitionend', onTransitionEndHandler1);
        nextSlide.removeEventListener('transitionend', onTransitionEndHandler2);
        slides.forEach(function (slide, i) {
            if (i === index) {
                slide.style.setProperty('opacity', 0);
                slide.classList.remove('current');
                return;
            }

            if (i === newIndex) {
                slide.style.setProperty('opacity', 1);
                slide.classList.add('current');
                return;
            }

            if (i < newIndex) {
                slide.style.setProperty('rotate', 'y -180deg');
            } else {
                slide.style.setProperty('rotate', 'y 180deg');
            }
        });

        toggleArrowButtons(newIndex);
        togglePagination(newIndex);
        index = newIndex;
        isLocked = false;
    };
    const onTransitionEndHandler1 = function (event) {
        if (event.propertyName !== 'rotate') return;
        finishedTasks++;
        if (finishedTasks === targetTasks) onTransitionsComplete();
    };
    const onTransitionEndHandler2 = function (event) {
        if (event.propertyName !== 'rotate') return;
        finishedTasks++;
        if (finishedTasks === targetTasks) onTransitionsComplete();
    };

    currentSlide.addEventListener('transitionend', onTransitionEndHandler1);
    nextSlide.addEventListener('transitionend', onTransitionEndHandler2);

    currentSlide.style.setProperty('rotate', `y ${Math.sign(index - newIndex) * 180}deg`);
    nextSlide.style.setProperty('rotate', `y 0deg`);
}

function togglePagination(newIndex) {
    let activePage = pages.find(page => page.hasAttribute('data-active'));
    if (activePage) activePage.removeAttribute('data-active');
    activePage = pages[newIndex];
    if (activePage) activePage.setAttribute('data-active', '');
}

function toggleArrowButtons(index) {
    arrowLeft.toggleAttribute('disabled', index === 0);
    arrowRight.toggleAttribute('disabled', index === slides.length - 1);
}

function setupSwipeActionHandlers() {
    let currentIndex;
    let slidesTotalWidth = 0;
    let scaleFactor = 0;
    let rotate = 0;
    let offsetX = slidesTrack.clientLeft;
    let startX = offsetX;
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
        currentIndex = index;
        startX = clientX - offsetX;
        slidesTotalWidth = Array.prototype.reduce.call(slides, (w, s) => {
            s.style.setProperty('opacity', 1);
            return w + s.clientWidth;
        }, 0);
        scaleFactor = (slidesTotalWidth - slidesTrack.clientWidth) / (slides.length * 2);
    }

    /**
     * Handle touch end/cancel or pointer up events.
     * @param {PointerEvent | MouseEvent | TouchEvent} event 
     * @returns {void}
     */
    function onTouchEnd(event) {
        if (!isDragging) return;
        isDragging = false;
        slides.forEach((slide, i) => {
            slide.style.setProperty('rotate', `y ${Math.sign(i - index) * 180}deg`);
            slide.style.setProperty('opacity', i === index ? 1 : 0);
        });
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

        slides.forEach((slide, i) => {
            // console.log('Current active index', index);
            rotate = ((deltaX + (scaleFactor * ((i - currentIndex) - 1))) * 360 / (scaleFactor * 2)) + 180;
            rotate = Math.max(-180, Math.min(rotate, 180));
            if (rotate > -90 && rotate <= 90 && index !== i) {
                index = i;
                toggleArrowButtons(index);
                togglePagination(index);
                // console.log('Active index changed', index);
            }

            slide.classList.toggle('current', i === index);
            slide.style.setProperty('rotate', `y ${rotate}deg`);
        });
    }
}