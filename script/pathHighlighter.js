export const animationMap = {
    // --- FETCH STAGE ---
    'anim-1': ['1.1', '1.2', '1.3', '1.4', '1.5'],
    'anim-2': ['2.1'],
    'anim-3': ['3.1'],
    'anim-4': ['4.1'],
    'anim-5': ['5.1'], // Duplicate for visual effect
    'anim-6': ['6.1', '6.2'],
    'anim-7': ['7.1'],

    // --- DECODE STAGE (IMEM to other components) ---
    'anim-8':  ['8.1', '8.2', '8.3'], // Also part of fetch
    'anim-9':  ['9.1'],
    'anim-10': ['10.1'], // Path split from anim-9
    'anim-11': ['11.1'],
    'anim-12': ['12.1'], // Path split from anim-11
    'anim-13': ['13.1'],
    'anim-14': ['14.1', '14.2'], // Path split from anim-13
    'anim-16': ['16.1'],
    'anim-17': ['17.1'], // Split path for Rd
    'anim-18': ['18.1', '18.2'],
    'anim-19': ['19.1'],
    'anim-20': ['20.1', '20.2'],
    'anim-21': ['21.1'],
    'anim-22': ['22.1'],
    'anim-23': ['23.1', '23.2', '23.3', '23.4'],
    
    // --- EXECUTE STAGE ---
    'anim-24': ['24.1', '24.2'],
    'anim-25': ['25.1', '25.2'],
    'anim-26': ['26.1'],
    'anim-27': ['27.1'],
    'anim-28': ['28.1'], 
    'anim-29': ['29.1', '29.2'],
    'anim-30': ['30.1'],
    'anim-31': ['31.1'],
    'anim-32': ['32.1'],
    'anim-33': ['33.1'],
    'anim-34': ['34.1', '34.2', '34.3', '34.4'],
    'anim-35': ['35.1'],
    'anim-36': ['36.1', '36.2', '36.3', '36.4', '36.5'],
    'anim-37': ['37.1'],
    
    //
    'anim-38': ['38.1'],
    'anim-39': ['39.1'],

    // Note: Some animations like anim-16, anim-19, etc., might represent internal logic or splits
    // that don't have a distinct, long wire. They are handled by highlighting the components.
    // If they do have wires, their IDs should be added here.
};

/**
 * Xóa tất cả các highlight khỏi đường dẫn và thành phần.
 */
export function resetHighlights() {
    const activeElements = document.querySelectorAll('.active-path, .active-component');
    activeElements.forEach(el => {
        el.classList.remove('active-path', 'active-component');
    });
}

/**
 * Thêm highlight vào đường dẫn và các thành phần liên quan đến một animation.
 * @param {string} animId - ID của animation (ví dụ: 'anim-3').
 */
export function highlightPathForAnimation(animId) {
    const elementsToHighlight = animationMap[animId];

    if (!elementsToHighlight) {
        return;
    }

    elementsToHighlight.forEach(elementId => {
        const svgElement = document.getElementById(elementId);
        if (svgElement) {
            const tagName = svgElement.tagName.toLowerCase();
            if (tagName === 'polyline' || tagName === 'path') {
                svgElement.classList.add('active-path');
            } else {
                svgElement.classList.add('active-component');
            }
        } else {
            // It's okay for some IDs to not be found if they are logical groupings, so we won't warn.
            // console.warn(`SVG Element with id '${elementId}' not found for animation '${animId}'.`);
        }
    });
}
