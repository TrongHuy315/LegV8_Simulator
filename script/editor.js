// --- START OF FILE editor.js ---
export function updateLineNumbers(textAreaElement, lineNumbersElement) {
    if (!textAreaElement || !lineNumbersElement) {
        // console.warn("Editor elements not found for updateLineNumbers");
        return;
    }

    const text = textAreaElement.value;
    const linesArray = text.split('\n');
    const lineCount = linesArray.length;

    // Luôn hiển thị ít nhất 1 dòng số, ngay cả khi textarea trống,
    // hoặc khớp chính xác số dòng nếu đó là ý muốn.
    // Ví dụ: nếu textarea trống hoàn toàn, lineCount sẽ là 1 (do split trả về mảng một phần tử rỗng).
    // Nếu muốn hiển thị "0" hoặc không hiển thị gì khi trống, cần logic khác.
    // Hiện tại, Math.max(1, lineCount) đảm bảo luôn có ít nhất số "1".
    const numLinesToDisplay = Math.max(1, lineCount);

    let html = '';
    for (let i = 1; i <= numLinesToDisplay; i++) {
        html += `<span>${i}</span>`;
    }
    lineNumbersElement.innerHTML = html;

    // Gọi syncScroll sau khi cập nhật số dòng để đảm bảo vị trí cuộn đúng
    // nếu chiều cao của lineNumbersElement thay đổi (do thêm/bớt số dòng)
    syncScroll(textAreaElement, lineNumbersElement);
}

export function syncScroll(textAreaElement, lineNumbersElement) {
    if (!textAreaElement || !lineNumbersElement) {
        // console.warn("Editor elements not found for syncScroll");
        return;
    }
    // Gán scrollTop của lineNumbersElement bằng scrollTop của textAreaElement
    lineNumbersElement.scrollTop = textAreaElement.scrollTop;
}
// --- END OF FILE editor.js ---
