export function animation() {
    return {
        'anim-1': { next: [] },
        'anim-2': { next: [] },
        'anim-3': { next: ['anim-4', 'anim-5'] },
        'anim-4': { next: ['anim-9'] },
        'anim-5': { next: ['anim-6', 'anim-7']},
        'anim-6': { next: ['anim-2'] },
        'anim-7': { next: [] },
        'anim-8': { next: [] },
        'anim-9': { next: ['anim-10', 'anim-16'] },
        'anim-10': { next: ['anim-11', 'anim-12'] },
        'anim-11': { next: [] },
        'anim-12': { next: ['anim-13', 'anim-14'] },
        'anim-13': { next: ['anim-30'] },
        'anim-14': { next: ['anim-40', 'anim-41', 'anim-42', 'anim-43', 'anim-44', 'anim-45', 'anim-46', 'anim-47', 'anim-48', 'anim-49', 'anim-50'] },
        'anim-15': { next: [] },
        'anim-16': { next: ['anim-17', 'anim-20'] },
        'anim-17': { next: ['anim-19'] },
        'anim-18': { next: [] },
        'anim-19': { next: [] },
        'anim-20': { next: ['anim-22', 'anim-23'] },
        'anim-21': { next: ['anim-27'] },
        'anim-22': { next: [] },
        'anim-23': { next: [] },
        'anim-24': { next: [] },
        'anim-25': { next: [] },
        'anim-26': { next: [] },
        'anim-27': { next: ['anim-28', 'anim-29'] },
        'anim-28': { next: ['anim-37'] },
        'anim-29': { next: [] },
        'anim-30': { next: [] },
        'anim-31': { next: ['anim-55'] },
        'anim-32': { next: ['anim-33', 'anim-34'] },
        'anim-33': { next: [] },
        'anim-34': { next: ['anim-36'] },
        'anim-35': { next: [] },
        'anim-36': { next: [] },
        'anim-37': { next: ['anim-31', 'anim-32', 'anim-51'] },
        'anim-38': { next: [] },
        'anim-39': { next: [] },
        'anim-40': { next: ['anim-21'] },
        'anim-41': { next: [] },
        'anim-42': { next: [] },
        'anim-43': { next: [] },
        'anim-44': { next: [] },
        'anim-45': { next: ['anim-36'] },
        'anim-46': { next: [] },
        'anim-47': { next: [] },
        'anim-48': { next: [] },
        'anim-49': { next: ['anim-56'] },
        'anim-50': { next: [] },
        'anim-51': { next: ['anim-52'] },
        'anim-52': { next: ['anim-53'] },
        'anim-53': { next: ['anim-1'] },
        'anim-54': { next: [] },
        'anim-55': { next: ['anim-54'] },
        'anim-56': { next: [] },
    };
}

function toggleLight(id) {
    const circle = document.getElementById(id);
    if (circle.getAttribute('visibility') === 'hidden') {
        circle.setAttribute('visibility', 'visible');
    } else {
        circle.setAttribute('visibility', 'hidden');
    }
}

export const addAnimationEndActions = {
    'anim-1': () => toggleLight('lightCircle-pc'),
    'anim-40': () => toggleLight('lightCircle-mux1-turn0'),
    'anim-48': () => toggleLight('lightCircle-mux2-turn0'),
    'anim-45': () => toggleLight('lightCircle-mux3-turn0'),
    'anim-53': () => toggleLight('lightCircle-mux4-turn0'),
    'anim-30': () => toggleLight('lightCircle-alu-top'),
    'anim-37': () => toggleLight('lightCircle-alu-top'),
    'anim-8': () => toggleLight('lightCircle-addbranch-top'),
    'anim-38': () => toggleLight('lightCircle-addbranch-top'),
    'anim-47': () => toggleLight('lightCircle-flags-top'),
    'anim-31': () => toggleLight('lightCircle-flags-top'),
};
