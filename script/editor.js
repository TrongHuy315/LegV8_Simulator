// editor.js

// --- Tham chiếu đến các phần tử DOM liên quan đến editor ---
const editor = document.getElementById('instruction-editor');
const lineNumbersContainer = document.getElementById('lineNumbers');

let currentActiveLine = -1; // Theo dõi index của dòng đang active

/**
 * Cập nhật cột số dòng dựa trên nội dung của textarea.
 */
export function updateLineNumbers() {
    if (!editor || !lineNumbersContainer) return;

    const text = editor.value;
    const lineCount = text.split('\n').length;
    const numLinesToDisplay = Math.max(1, lineCount);

    let html = '';
    for (let i = 1; i <= numLinesToDisplay; i++) {
        html += `<span>${i}</span>`;
    }
    lineNumbersContainer.innerHTML = html;

    // Nếu đang có một dòng active, áp lại style cho nó sau khi render lại
    if (currentActiveLine !== -1) {
        const activeSpan = lineNumbersContainer.children[currentActiveLine];
        if (activeSpan) {
            activeSpan.classList.add('active-line-number');
        }
    }
}

/**
 * Đồng bộ vị trí cuộn của cột số dòng.
 */
export function syncScroll() {
    if (!editor || !lineNumbersContainer) return;
    lineNumbersContainer.scrollTop = editor.scrollTop;
}

/**
 * Xóa style active khỏi dòng hiện tại.
 */
export function clearActiveLine() {
    if (currentActiveLine !== -1 && lineNumbersContainer.children[currentActiveLine]) {
        lineNumbersContainer.children[currentActiveLine].classList.remove('active-line-number');
    }
    currentActiveLine = -1;
}

/**
 * Đặt style active cho một dòng cụ thể.
 * @param {number} lineIndex - Index của dòng (bắt đầu từ 0).
 */
export function setActiveLine(lineIndex) {
    // Xóa active line cũ trước
    clearActiveLine();

    if (!lineNumbersContainer || lineIndex < 0 || lineIndex >= lineNumbersContainer.children.length) {
        return; // Index không hợp lệ
    }

    const activeSpan = lineNumbersContainer.children[lineIndex];
    const lineText = editor.value.split('\n')[lineIndex]?.trim();

    // Chỉ active nếu dòng đó không phải là dòng trống
    if (activeSpan && lineText) {
        activeSpan.classList.add('active-line-number');
        currentActiveLine = lineIndex;

        // Tự động cuộn đến dòng đó nếu nó nằm ngoài tầm nhìn
        activeSpan.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}
