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
            slide.style.setProperty('transform', `rotateY(${Math.sign(i - index) * 180}deg)`);
            slide.style.setProperty('opacity', i === index ? 1 : 0);
            toggleArrowButtons(index, true);

            if (i === index) {
                page.setAttribute('data-active', '');
                slide.classList.add('current');
                active = slide;
                return;
            }
        });

        arrowLeft?.addEventListener('click', toLeft);
        
        arrowRight?.addEventListener('click', toRight);

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
    if (newIndex === index) return;

    const slidesCount = slides.length;
    // Determine direction based on linear diff with wrap consideration
    const linearDiff = newIndex - index;
    const isDirectionForward = linearDiff > 0 || (linearDiff < 0 && Math.abs(linearDiff) > slidesCount / 2);

    isLocked = true;
    console.log('Go to slide', newIndex, '\nCurrent slide', index);

    if (isDirectionForward) {
        console.log('Direction LTR');
    } else {
        console.log('Direction RTL');
    }

    let currentSlide = slides[index];
    currentSlide.style.setProperty('opacity', 1);

    currentSlide.style.setProperty(
        'transform', 
        `rotateY(${(isDirectionForward ? -1 : 1) * 180}deg)`
    );

    let nextSlide = slides[newIndex];
    nextSlide.style.setProperty('opacity', 1);
    nextSlide.style.setProperty('transform', 'rotateY(0deg)');

    let finishedTasks = 0;
    const targetTasks = 2;
    const onTransitionsComplete = function () {
        finishedTasks = 0;
        currentSlide.removeEventListener('transitionend', onTransitionEndHandler);
        nextSlide.removeEventListener('transitionend', onTransitionEndHandler);
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

            slide.style.setProperty(
                'transform', 
                `rotateY(${(i < newIndex ? -1 : 1) * 180}deg)`
            );
        });

        toggleArrowButtons(newIndex, true);
        togglePagination(newIndex);
        index = newIndex;
        isLocked = false;
    };
    const onTransitionEndHandler = function (event) {
        if (event.propertyName !== 'transform') return;
        finishedTasks++;
        if (finishedTasks === targetTasks) onTransitionsComplete();
    };

    currentSlide.addEventListener('transitionend', onTransitionEndHandler);
    nextSlide.addEventListener('transitionend', onTransitionEndHandler);
}

function togglePagination(newIndex) {
    let activePage = pages.find(page => page.hasAttribute('data-active'));
    if (activePage) activePage.removeAttribute('data-active');
    activePage = pages[newIndex];
    if (activePage) activePage.setAttribute('data-active', '');
}

function toggleArrowButtons(index, allowBidirectionalMove = false) {
    arrowLeft.toggleAttribute('disabled', !allowBidirectionalMove && index === 0);
    arrowRight.toggleAttribute('disabled', !allowBidirectionalMove && index === slides.length - 1);
}

function setupSwipeActionHandlers() {
    let currentIndex;
    let slidesTotalWidth = 0;
    let scaleFactor = 0;
    let rotate = 0;
    let offsetX = slidesTrack.clientLeft;
    let startX = offsetX;
    let isDragging = false;

    slidesTrack.addEventListener('dragstart', () => false);
    slidesTrack.addEventListener('dragover', () => false);
    slidesTrack.addEventListener('dragend', () => false);

    slidesTrack.addEventListener('pointerdown', onTouchStart);

    /**
     * Handle touch start or pointer down events.
     * @param {PointerEvent | MouseEvent | TouchEvent} event 
     * @returns {void}
     */
    function onTouchStart(event) {
        event.preventDefault();
        slidesTrack.setPointerCapture(event.pointerId);
        slidesTrack.addEventListener('pointerup', onTouchEnd);
        slidesTrack.addEventListener('pointermove', onTouchMove);
        
        let clientX = event.clientX;
        
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
        event.preventDefault();
        slidesTrack.removeEventListener('pointerup', onTouchEnd);
        slidesTrack.removeEventListener('pointermove', onTouchMove);
        
        if (!isDragging) return;
        isDragging = false;
        slides.forEach((slide, i) => {
            slide.style.setProperty('transform', `rotateY(${Math.sign(i - index) * 180}deg)`);
            slide.style.setProperty('opacity', i === index ? 1 : 0);
        });
    }

    /**
     * Handle touch move or pointer move events.
     * @param {PointerEvent | MouseEvent | TouchEvent} event 
     * @returns {void}
     */
    function onTouchMove(event) {
        event.preventDefault();
        
        if (!isDragging) return;
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
                toggleArrowButtons(index, true);
                togglePagination(index);
                // console.log('Active index changed', index);
            }

            slide.classList.toggle('current', i === index);
            slide.style.setProperty('transform', `rotateY(${rotate}deg)`);
        });
    }
    // function onTouchMove(event) {
    //     event.preventDefault();
        
    //     if (!isDragging) return;
    //     let clientX = event.clientX;
        
    //     if ('TouchEvent' in window && event instanceof TouchEvent) {
    //         clientX = event.touches[0].clientX;
    //     }
        
    //     let deltaX = (clientX - offsetX) - startX;
    //     let deltaIndex = deltaX / scaleFactor;
    //     let virtualIndex = currentIndex - deltaIndex; // Negative deltaX (left drag) increases virtualIndex
        
    //     slides.forEach((slide, i) => {
    //         // Compute effective relative position with wrap-around
    //         let relativeIndex = ((i - virtualIndex) % slides.length + slides.length) % slides.length;
    //         rotate = (relativeIndex * 360 / slides.length) - 180; // Map to -180 to 180 range
    //         rotate = Math.max(-180, Math.min(rotate, 180));
            
    //         // Snap index when crossing center (rotate near 0)
    //         if (Math.abs(rotate) < 90 && index !== i) {
    //             let newIndex = Math.round(virtualIndex) % slides.length;
    //             if (newIndex < 0) newIndex += slides.length;
    //             if (index !== newIndex) {
    //                 index = newIndex;
    //                 toggleArrowButtons(index, true);
    //                 togglePagination(index);
    //             }
    //         }

    //         slide.classList.toggle('current', i === index);
    //         slide.style.setProperty('rotate', `y ${rotate}deg`);
    //     });
    // }
}

function toLeft() {
    if (isLocked) return;
    let nextIndex = normalizeIndex(index - 1, slides.length);
    // if (nextIndex < 0) return;
    toggleSlides(nextIndex);
}

function toRight() {
    if (isLocked) return;
    let nextIndex = normalizeIndex(index + 1, slides.length);
    // if (nextIndex >= slides.length) return;
    toggleSlides(nextIndex);
}

function normalizeIndex(index, length) {
    return ((index % length) + length) % length;
}