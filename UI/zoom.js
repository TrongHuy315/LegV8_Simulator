// --- START OF FILE zoom.js ---

document.addEventListener('DOMContentLoaded', () => {

    const zoomContainer = document.getElementById('svg-container');
    const zoomContent = zoomContainer ? zoomContainer.querySelector('svg') : null;
    const resetButton = document.getElementById('reset-zoom-button'); // *** ADDED ***

    if (!zoomContainer || !zoomContent || !resetButton) { // *** ADDED check for button ***
        console.error('Zoom container, SVG element, or Reset button not found!');
        return;
    }

    // *** Initial values stored for reset ***
    const initialScale = 1;
    const initialOffsetX = 0;
    const initialOffsetY = 0;

    let scale = initialScale;
    let offsetX = initialOffsetX;
    let offsetY = initialOffsetY;

    const minScale = 0.3;
    const maxScale = 5;
    const zoomIntensity = 0.1;

    let isDragging = false;
    let startX, startY;
    let initialOffsetXDrag, initialOffsetYDrag; // Renamed to avoid conflict

    function applyTransform() {
        // Optional: Add bounds checks here if needed
        zoomContent.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    }

    // *** ADDED: Reset Function ***
    function resetZoom() {
        scale = initialScale;
        offsetX = initialOffsetX;
        offsetY = initialOffsetY;
        applyTransform();
        // console.log("Zoom Reset");
    }

    zoomContainer.addEventListener('wheel', (event) => {
        event.preventDefault();

        const rect = zoomContainer.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const mouseXOnContent = (mouseX - offsetX) / scale;
        const mouseYOnContent = (mouseY - offsetY) / scale;

        const delta = event.deltaY < 0 ? 1 : -1;
        const newScale = scale * (1 + delta * zoomIntensity);
        scale = Math.max(minScale, Math.min(maxScale, newScale));

        offsetX = mouseX - mouseXOnContent * scale;
        offsetY = mouseY - mouseYOnContent * scale;

        applyTransform();
    }, { passive: false });

    zoomContainer.addEventListener('mousedown', (event) => {
        if (event.button !== 0) return;
        // *** Prevent drag start on buttons ***
        if (event.target === resetButton || event.target.closest('#theme-toggle-button')) {
             return;
        }
        isDragging = true;
        startX = event.clientX;
        startY = event.clientY;
        initialOffsetXDrag = offsetX; // Use renamed variable
        initialOffsetYDrag = offsetY; // Use renamed variable
        zoomContainer.classList.add('dragging');
    });

    document.addEventListener('mousemove', (event) => {
        if (!isDragging) return;

        const dx = event.clientX - startX;
        const dy = event.clientY - startY;

        offsetX = initialOffsetXDrag + dx; // Use renamed variable
        offsetY = initialOffsetYDrag + dy; // Use renamed variable

        applyTransform();
    });

    document.addEventListener('mouseup', (event) => {
        if (isDragging && event.button === 0) {
            isDragging = false;
            zoomContainer.classList.remove('dragging');
        }
    });

     document.addEventListener('mouseleave', (event) => { // Changed target to document
         // Check if mouse leaves the window *while dragging*
         if (isDragging && !event.relatedTarget) {
            isDragging = false;
            zoomContainer.classList.remove('dragging');
         }
     });


    // *** ADDED: Reset Button Listener ***
    resetButton.addEventListener('click', resetZoom);

    // *** ADDED: Keyboard shortcut for Reset ***
    document.addEventListener('keydown', (event) => {
        // Use 'r' or 'R' key, avoid if typing in textarea
        if ((event.key === 'r' || event.key === 'R') && event.target.tagName !== 'TEXTAREA') {
            resetZoom();
        }
    });

    // Initial transform apply
    applyTransform();

});

// --- END OF FILE zoom.js ---
