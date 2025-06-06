import * as setting from '../setting/setting.js'

// Hàm tiện ích để lấy phần tử SVG bằng ID (An toàn hơn)
export function getElement(svg, id) {
    if (!svg) {
        console.error("Tham chiếu SVG chưa sẵn sàng.");
        return null;
    }
    try {
        const element = svg.getElementById(id);
        // if (!element) { // Giảm log
        //     console.warn(`Không tìm thấy phần tử với ID "${id}" trong SVG.`);
        // }
        return element;
    } catch (e) {
        console.error(`Lỗi khi truy cập phần tử SVG với ID "${id}":`, e);
        return null;
    }
}
// Hàm ẩn chấm tròn tương ứng với animId
export function hideDotForAnim(svg, runningAnimations, animId) {
    const dotId = animId.replace(/^anim-/, 'dot-');
    const dot = getElement(svg, dotId);
    if (dot) {
        dot.style.visibility = 'hidden';
    }
    runningAnimations.delete(animId); // Xóa khỏi tập đang chạy
    // // console.log(`Đã ẩn dot và xóa khỏi running: ${animId}`);
}
// Hàm ẩn TẤT CẢ các chấm tròn (để reset)
export function hideAllDots(svg) {
    try {
        const allDots = svg.querySelectorAll('.data-dot');
        allDots.forEach(dot => {
            if (dot) {
                 dot.style.visibility = 'hidden';
            }
        });
        // // console.log("Đã ẩn tất cả các chấm tròn.");
    } catch (e) {
        console.error("Lỗi khi ẩn các chấm tròn:", e);
    }
}

// Hàm hủy tất cả các timeout đang chờ (khi reset)
export function cancelAllPendingTimeouts(activeTimeouts, runningAnimations) {
     const keys = Object.keys(activeTimeouts);
     if (keys.length > 0) {
        // console.log("Hủy các timeout đang chờ:", keys.length);
        keys.forEach(animId => {
            clearTimeout(activeTimeouts[animId]);
        });
     }
    activeTimeouts = {}; // Reset đối tượng lưu timeout
    runningAnimations.clear(); // Reset tập anim đang chạy
}

// Remove All Highlights Function **** ---
export function removeAllHighlights(svg) {
    try {
       const highlightedElements = svg.querySelectorAll('.highlighted');
       highlightedElements.forEach(el => {
           el.classList.remove('highlighted');
       });
       // // console.log("Removed all highlights.");
   } catch (e) {
       console.error("Lỗi khi xóa highlights:", e);
   }
}

// Highlight Function 
export function highlightComponent(svg, componentId) {
    if (!componentId) return;
    const componentElement = getElement(svg, componentId);
    if (componentElement) {
        // // console.log(`Highlighting ${componentId}`); // Debug
        componentElement.classList.add('highlighted');

        // Schedule removal of highlight
        setTimeout(() => {
            componentElement.classList.remove('highlighted');
            // // console.log(`Unhighlighting ${componentId}`); // Debug
        }, setting.HIGHLIGHT_DURATION_MS);
    } else {
        console.warn(`Component to highlight not found: ${componentId}`);
    }
}
export function setMuxSelect(muxId, selected) {
    const zero = document.getElementById(`${muxId}-0`);
    const one = document.getElementById(`${muxId}-1`);
    if (zero && one) {
        zero.setAttribute('fill', selected === 0 ? 'red' : 'black');
        one.setAttribute('fill', selected === 1 ? 'red' : 'black');
    }
}