// --- START OF FILE general.js ---

import * as format from '../format/format.js' // Và các module parse khác nếu cần
import * as normalR from './Animation/R_format/normal.js';
import * as normalD from './Animation/D_format/normal.js';
import * as normalCB from './Animation/CB_format/normal.js';
import * as utilUI from '../UI/util.js';
import * as setting from '../setting/setting.js';
import * as theme from '../UI/theme.js';
import * as update from './register.js';
import * as fullScreen from '../UI/fullscreen.js'
import * as editor from './editor.js'
import * as regmemtable from './reg_mem_table.js'

// --- Tham chiếu đến các Phần tử DOM ---
const simulateButton = document.getElementById('simulate-button');
const instructionEditor = document.getElementById('instruction-editor');
const outputArea = document.getElementById('json-output');
const svg = document.querySelector('svg'); // Cần kiểm tra svg có tồn tại không trước khi dùng
const themeToggleButton = document.getElementById('theme-toggle-button'); // *** ADDED ***
const simulationContainer = document.getElementById('simulation-container'); // *** ADDED for fullscreen ***
const lineNumbersElement = document.getElementById('lineNumbers');

const registerTableContainer = document.getElementById('register-table-container');
const memoryTableContainer = document.getElementById('memory-table-container');
const dataDisplayContainer = document.getElementById('data-display-container');

// --- Trạng thái Hoạt ảnh Không Đồng Bộ ---
let activeTimeouts = {}; // Lưu các timeout đang chờ kết thúc: { animId: timeoutId }
let runningAnimations = new Set(); // Theo dõi các anim đang chạy (ID của <animateMotion>)

// Register storage (if not already declared)
let registers = Array(32).fill(0); // 32 registers, all initialized to 0
let memory = Array(100000).fill(0); 
let componentInputCounter = {};

let displayState = {
    registerFormat: 'hex',
    memoryFormat: 'hex'
};

// Function to execute format command and update registers
function executeFormat(parsedInstruction) {
    if (!parsedInstruction || parsedInstruction.error) return;
    
    let memoryChanged = false;
    
    if (format.R_FORMAT_OPCODES.includes(parsedInstruction.opcode)) {
        update.RFormat(parsedInstruction, registers);
    } else if (format.D_format_OPCODES.includes(parsedInstruction.opcode)) {
        // Giả định hàm DFormat trả về true nếu nó ghi vào bộ nhớ (ví dụ STUR)
        memoryChanged = update.DFormat(parsedInstruction, registers, memory);
    } else if (format.CB_format_OPCODES.includes(parsedInstruction.opcode)) {
        update.CBFormat(parsedInstruction, registers, memory);
    }
    
    // Cập nhật giao diện với đầy đủ tham số
    regmemtable.renderRegisterTable(registerTableContainer, registers, displayState);
    if (memoryChanged) {
        regmemtable.renderMemoryView(memoryTableContainer, memory, displayState);
    }
}

// Function to render the register table (if not already present)
// function renderRegisterTable() {
//     const container = document.getElementById('register-table');
//     if (!container) return;
//     let html = '<table><tr><th>Register</th><th>Value</th></tr>';
//     for (let i = 0; i < 32; i++) {
//         html += `<tr><td>X${i}</td><td>${registers[i]}</td></tr>`;
//     }
//     html += '</table>';
//     container.innerHTML = html;
// }

// Hàm chuyển đổi giá trị 'dur' (vd: "1.5s", "500ms") sang milliseconds
function parseDuration(durationString) {
    if (!durationString) return setting.DEFAULT_ANIMATION_DURATION_MS;
    const lowerCase = durationString.toLowerCase().trim();
    let value = parseFloat(lowerCase);
    if (isNaN(value)) return setting.DEFAULT_ANIMATION_DURATION_MS; // Kiểm tra isNaN
    if (lowerCase.endsWith('ms')) {
        return value;
    } else if (lowerCase.endsWith('s')) {
        return value * 1000;
    }
    return value * 1000;
}

function triggerAnimation(animId, graph) {
    return new Promise((resolve, reject) => {
        if (!graph || !graph[animId] || runningAnimations.has(animId)) {
            resolve(); // Nothing to do
            return;
        }
        //console.log(animId);
        const animData = graph[animId];
        const nextAnims = animData.next || [];
        const animationElement = utilUI.getElement(svg, animId);
        const dotId = animId.replace(/^anim-/, 'dot-');
        const dotElement = utilUI.getElement(svg, dotId);

        if (!animationElement) {
            console.warn(`Không tìm thấy <animateMotion> với ID ${animId}`);
            resolve(); // End early
            return;
        }

        const durationAttr = animationElement.getAttribute('dur');
        const durationMs = parseDuration(durationAttr);

        if (dotElement) {
            dotElement.style.visibility = 'visible';
        }

        try {
            animationElement.beginElement();
            runningAnimations.add(animId);

            const timeoutId = setTimeout(async () => {
                if (dotElement) {
                    utilUI.hideDotForAnim(svg, runningAnimations, animId);
                } else {
                    runningAnimations.delete(animId);
                }

                delete activeTimeouts[animId];

                const componentIdToHighlight = setting.animationToComponentHighlight[animId];
                if (!componentInputCounter[componentIdToHighlight]) {
                    componentInputCounter[componentIdToHighlight] = 0;
                }
                ++componentInputCounter[componentIdToHighlight];
                if (componentIdToHighlight == 'mux3') {
                    console.log(componentInputCounter[componentIdToHighlight]);
                }
                const endAction = normalR.addAnimationEndActions[animId];
                if (typeof endAction === 'function') {
                    endAction();
                }
                if (componentInputCounter[componentIdToHighlight] >= (setting.componentInputRequirements[componentIdToHighlight] || 0)) {
                    // console.log("componentIDHighligh: ", componentIdToHighlight);
                    if (componentIdToHighlight) {
                        utilUI.highlightComponent(svg, componentIdToHighlight);
                    }

                    // const endAction = normalR.addAnimationEndActions[animId];
                    // if (typeof endAction === 'function') {
                    //     endAction();
                    // }
                    componentInputCounter[componentIdToHighlight] = 0;
                    await Promise.all(nextAnims.map(nextId => triggerAnimation(nextId, graph)));
                }
                // console.log("componentIDHighligh: ", componentIdToHighlight);
                // if (componentIdToHighlight) {
                //     utilUI.highlightComponent(svg, componentIdToHighlight);
                // }

                // const endAction = normalR.addAnimationEndActions[animId];
                // if (typeof endAction === 'function') {
                //     endAction();
                // }

                // // Wait for all next animations to finish
                // await Promise.all(nextAnims.map(nextId => triggerAnimation(nextId, graph)));

                resolve(); // Finish this one only after all children finish
            }, durationMs);

            activeTimeouts[animId] = timeoutId;
        } catch (e) {
            console.error(`Lỗi khi bắt đầu ${animId}:`, e);
            runningAnimations.delete(animId);
            resolve(); // Fail-safe
        }
    });
}

async function simulateStep(instruction) {
    const lightCircles = document.querySelectorAll('[id^="lightCircle-"]');
    lightCircles.forEach(circle => circle.setAttribute('visibility', 'hidden'));

    const trimmedLine = instruction.trim();
    if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('#')) {
        outputArea.textContent = JSON.stringify({
            status: "Bỏ qua dòng trống hoặc chú thích.",
            instruction: trimmedLine
        }, null, 2);
        return;
    }

    let parsedInstruction = null;
    let result = format.parseRFormatInstruction(trimmedLine);

    if (result?.error) {
        parsedInstruction = result;
    } else if (!result) {
        parsedInstruction = {
            error: true,
            message: "Lệnh không nhận dạng được.",
            raw: trimmedLine
        };
    } else {
        parsedInstruction = result;
    }

    let outputJson = {};

    if (parsedInstruction.error) {
        outputJson = {
            status: "Lỗi: " + parsedInstruction.message,
            instruction: parsedInstruction.raw
        };
        outputArea.textContent = JSON.stringify(outputJson, null, 2);
        return;
    }

    outputJson = {
        status: `Đang mô phỏng lệnh ${parsedInstruction.type || 'Unknown'}-Format`,
        details: parsedInstruction
    };

    let instructionGraph = null;
    const initialAnims = ['anim-3'];

    executeFormat(parsedInstruction);
    if (parsedInstruction.type === 'R') {
        instructionGraph = normalR.animation();
    } else if (parsedInstruction.type === 'D') {
        instructionGraph = normalD.animation();
    } else if (parsedInstruction.type === 'CB') {
        instructionGraph = normalCB.animation();
    }

    regmemtable.renderRegisterTable(registerTableContainer, registers, displayState);
    regmemtable.renderMemoryView(memoryTableContainer, memory, displayState);

    if (instructionGraph && initialAnims.length > 0) {
        let completed = 0;
        outputJson.status = `Đang tạo hoạt ảnh không đồng bộ cho ${parsedInstruction.opcode || parsedInstruction.type}`;
        outputArea.textContent = JSON.stringify(outputJson, null, 2);
        await Promise.all(
            initialAnims.map(startAnimId =>
                triggerAnimation(startAnimId, instructionGraph)
            )
        );

    } else {
        outputJson.status = "Không có đồ thị hoạt ảnh cụ thể cho lệnh này.";
        outputArea.textContent = JSON.stringify(outputJson, null, 2);
    }

}

// Load saved theme on startup
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light'; // Default to light
    theme.applyTheme(savedTheme, themeToggleButton);
});

window.addEventListener('load', () => {
    if(simulateButton) {
        simulateButton.addEventListener('click', async () => {
            const instructions = instructionEditor.value.split('\n').filter(line => {
                const trimmed = line.trim();
                return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('#');
            });
            console.log(instructions);
            for (let instruction of instructions) {
                utilUI.cancelAllPendingTimeouts(activeTimeouts, runningAnimations);
                utilUI.hideAllDots(svg);
                utilUI.removeAllHighlights(svg);
                componentInputCounter = {};
                console.log(instruction);
                await simulateStep(instruction);  // Wait for animation to finish
                console.log("finish instruction");
            }
        });
    } else {
        console.error("Không tìm thấy nút Simulate!");
    }

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => theme.toggleTheme(localStorage, themeToggleButton));
    } else {
        console.error("Theme toggle button not found!");
    }

    if(outputArea) {
        outputArea.textContent = JSON.stringify({ message: "Ready. Enter LEGv8 code. Shortcuts: (R)eset Zoom, (T)heme, F11 Fullscreen" }, null, 2);
    }

    if (instructionEditor) {
        // Cập nhật số dòng khi có bất kỳ thay đổi nào (gõ, dán, cắt)
        instructionEditor.addEventListener('input', () => {
            editor.updateLineNumbers(instructionEditor, lineNumbersElement)
        });

        // Đồng bộ cuộn giữa editor và thanh số dòng
        instructionEditor.addEventListener('scroll', () => {
            if (lineNumbersElement) {
                lineNumbersElement.scrollTop = instructionEditor.scrollTop;
            }
        });

        // Gọi lần đầu tiên khi tải trang để hiển thị số dòng ban đầu
        editor.updateLineNumbers(instructionEditor, lineNumbersElement); 
    }

    if (registerTableContainer && memoryTableContainer) {
        // Gọi hàm render và truyền các tham số cần thiết
        regmemtable.renderRegisterTable(registerTableContainer, registers, displayState);
        regmemtable.renderMemoryView(memoryTableContainer, memory, displayState);
        
        // Gọi hàm setup listener và truyền các tham số cần thiết
        regmemtable.setupToggleListeners(
            dataDisplayContainer, 
            displayState, 
            registers, 
            memory, 
            registerTableContainer, 
            memoryTableContainer
        );
    }

    // --- KEYBOARD SHORTCUTS ---
    document.addEventListener('keydown', (event) => {
        if (event.key === 'F11') {
            event.preventDefault();
            if (simulationContainer && fullScreen) { // Kiểm tra fullScreen
                fullScreen.toggleFullScreen(simulationContainer);
            }
        } else if ((event.key === 't' || event.key === 'T') && event.target.tagName !== 'TEXTAREA') {
            if (themeToggleButton && theme) { // Kiểm tra theme
                theme.toggleTheme(localStorage, themeToggleButton);
            }
        }
    });
    console.log("Global event listeners initialized.");
});
