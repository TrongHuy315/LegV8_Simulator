// --- START OF FILE reg_mem_table.js ---

// Hàm này nhận vào:
// - container: Phần tử DOM để render bảng
// - registers: Mảng dữ liệu thanh ghi
// - displayState: Trạng thái hiển thị (hex/dec)
export function renderRegisterTable(container, registers, displayState) {
    if (!container) return;

    const specialNames = { 28: 'SP', 29: 'FP', 30: 'LR', 31: 'XZR' };

    let gridHtml = '<div class="register-grid">';
    for (let i = 0; i < 16; i++) {
        const regName1 = specialNames[i] || `X${i}`;
        const value1 = registers[i];
        const displayValue1 = displayState.registerFormat === 'hex'
            ? `0x${value1.toString(16)}` : value1.toString(10);
        
        const regName2 = specialNames[i + 16] || `X${i + 16}`;
        const value2 = registers[i + 16];
        const displayValue2 = displayState.registerFormat === 'hex'
            ? `0x${value2.toString(16)}` : value2.toString(10);

        gridHtml += `
            <div class="register-item">
                <span class="reg-name">${regName1}</span>
                <span class="reg-value">${displayValue1}</span>
            </div>
            <div class="register-item">
                <span class="reg-name">${regName2}</span>
                <span class="reg-value">${displayValue2}</span>
            </div>
        `;
    }
    gridHtml += '</div>';

    const hexActive = displayState.registerFormat === 'hex' ? 'active' : '';
    const decActive = displayState.registerFormat === 'dec' ? 'active' : '';

    container.innerHTML = `
        <div class="format-toggle" data-view="registers">
            <button class="${hexActive}" data-format="hex">Hex</button>
            <button class="${decActive}" data-format="dec">Dec</button>
        </div>
        ${gridHtml}
    `;
}

// Hàm này nhận vào:
// - container: Phần tử DOM để render bảng
// - memory: Mảng dữ liệu bộ nhớ
// - displayState: Trạng thái hiển thị (hex/dec)
export function renderMemoryView(container, memory, displayState) {
    if (!container) return;

    const memoryToShow = 20;
    const endAddress = 0x7ffffffff8;
    
    let tableHtml = '<table class="memory-table">';
    for (let i = 0; i < memoryToShow; i++) {
        const address = `0x${(endAddress - i * 8).toString(16)}`;
        const memIndex = memory.length - 1 - i;
        const value = (memIndex >= 0) ? memory[memIndex] : 0;
        
        const displayValue = displayState.memoryFormat === 'hex'
            ? `0x${value.toString(16)}` : value.toString(10);

        tableHtml += `
            <tr>
                <td><span class="mem-address">${address}</span></td>
                <td class="mem-value">${displayValue}</td>
            </tr>
        `;
    }
    tableHtml += '</table>';

    const hexActive = displayState.memoryFormat === 'hex' ? 'active' : '';
    const decActive = displayState.memoryFormat === 'dec' ? 'active' : '';

    container.innerHTML = `
        <div class="format-toggle" data-view="memory">
            <button class="${hexActive}" data-format="hex">Hex</button>
            <button class="${decActive}" data-format="dec">Dec</button>
        </div>
        ${tableHtml}
    `;
}

// Hàm này nhận vào tất cả các đối tượng cần thiết để thiết lập listener
export function setupToggleListeners(container, displayState, registers, memory, regContainer, memContainer) {
    if (!container) return;

    container.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-format]');
        if (!button) return;

        const view = button.parentElement.dataset.view;
        const format = button.dataset.format;

        if (view === 'registers') {
            displayState.registerFormat = format;
            renderRegisterTable(regContainer, registers, displayState); // Gọi lại với đúng tham số
        } else if (view === 'memory') {
            displayState.memoryFormat = format;
            renderMemoryView(memContainer, memory, displayState); // Gọi lại với đúng tham số
        }
    });
}
