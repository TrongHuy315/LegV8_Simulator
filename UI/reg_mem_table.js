// --- START OF FILE reg_mem_table.js ---

// import { registers } from "../script/main";

import {registers, memory} from '../script/main.js';
export function renderRegisterTable(container, displayState) {
    if (!container) return;
    // console.log("register table: ", registers);
    const specialNames = { 28: 'SP', 29: 'FP', 30: 'LR', 31: 'XZR' };

    let tableHtml = '<table class="register-table">';
    for (let row = 0; row < 8; row++) { // 8 rows
        tableHtml += '<tr>';
        for (let col = 0; col < 4; col++) { // 4 columns
            const index = row + col * 8; // Calculate the register index for vertical order
            const regName = specialNames[index] || `X${index}`;
            const value = registers[index];
            const displayValue = displayState.registerFormat === 'hex'
                ? `0x${value.toString(16)}` // Ensure 8 digits
                : value.toString(10);

            tableHtml += `
                <td class="reg-name">${regName}</td>
                <td class="reg-value">${displayValue}</td>
            `;
        }
        tableHtml += '</tr>';
    }
    tableHtml += '</table>';

    const hexActive = displayState.registerFormat === 'hex' ? 'active' : '';
    const decActive = displayState.registerFormat === 'dec' ? 'active' : '';

    container.innerHTML = `
        <div class="format-toggle" data-view="registers">
            <button class="${hexActive}" data-format="hex">Hex</button>
            <button class="${decActive}" data-format="dec">Dec</button>
        </div>
        ${tableHtml}
    `;
}
// Hàm này nhận vào:
// - container: Phần tử DOM để render bảng
// - memory: Mảng dữ liệu bộ nhớ
// - displayState: Trạng thái hiển thị (hex/dec)

export function renderMemoryView(container, displayState) {
    if (!container) return;

    const memoryToShow = 32; // Show 32 memory entries
    const rows = memoryToShow / 2; // Divide into 2 columns (16 rows each)
    const endAddress = 0x8000000000; // Example end address

    let tableHtml = '<table class="memory-table">';
    for (let row = 0; row < rows; row++) { // Loop through rows
        tableHtml += '<tr>';
        for (let col = 0; col < 2; col++) { // Loop through columns
            const index = row + col * rows; // Calculate memory index for vertical order
            const address = `0x${(endAddress - index * 8).toString(16).padStart(10, '0')}`;
            const memIndex = memory.length - 1 - index;
            const value = (memIndex >= 0) ? memory[memIndex] : 0;
            // console.log(address, memIndex, value);
            const displayValue = displayState.memoryFormat === 'hex'
                ? `0x${value.toString(16)}` // Ensure 8 digits
                : value.toString(10);

            tableHtml += `
                <td>
                    <span class="mem-address">${address}</span>
                </td>
                <td class="mem-value">${displayValue}</td>
            `;
        }
        tableHtml += '</tr>';
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
export function setupToggleListeners(container, displayState, regContainer, memContainer) {
    if (!container) return;

    container.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-format]');
        if (!button) return;
        // console.log("register: ", registers);
        const view = button.parentElement.dataset.view;
        const format = button.dataset.format;

        if (view === 'registers') {
            displayState.registerFormat = format;
            renderRegisterTable(regContainer, displayState); // Gọi lại với đúng tham số
        } else if (view === 'memory') {
            displayState.memoryFormat = format;
            renderMemoryView(memContainer, displayState); // Gọi lại với đúng tham số
        }
    });
}
