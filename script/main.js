// --- START OF FILE general.js ---

import * as format from '../format/format.js' // Và các module parse khác nếu cần
import * as utilUI from '../UI/util.js';
import * as setting from '../setting/setting.js';
import * as theme from '../UI/theme.js';
import * as fullScreen from '../UI/fullscreen.js'
import * as editor from './editor.js'
import * as regmemtable from '../UI/reg_mem_table.js'
import * as pathHighlighter from './pathHighlighter.js'; 
import {setTextById} from '../UI/logic_bit_set.js'

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
let memory = Array(1000).fill(0); 
let address = Array(1000).fill(0);
let componentInputCounter = {};

address[0] = 4194304;
for(let i = 1; i < 1000; i++) {
    address[i] = address[i - 1] + 4;
}
let changeToIDInstruction = pc => {
    for(let i = 0; i < 1000; i++) {
        if (address[i] == pc) return i;
    }
    return -1;
}

let displayState = {
    registerFormat: 'hex',
    memoryFormat: 'hex'
};

// Function to execute format command and update registers

function executeFormat(parsedInstruction) {
    if (!parsedInstruction || parsedInstruction.error) return;
    for (let formatKey in format.FORMAT_OPCODES) {
        const formats = format.FORMAT_OPCODES[formatKey];
        if (formats.opcode.includes(parsedInstruction.opcode)) {
            formats.update(parsedInstruction, registers, memory);
            break;
        }
    }
    regmemtable.renderRegisterTable(registerTableContainer, registers, displayState);
    regmemtable.renderMemoryView(memoryTableContainer, memory, displayState);
}

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

function triggerAnimation(animId, graph, opcode) {
    return new Promise((resolve, reject) => {
        if (!graph || !graph[animId] || runningAnimations.has(animId)) {
            resolve(); // Nothing to do
            return;
        }

        pathHighlighter.highlightPathForAnimation(animId);

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
            //console.log("ID: ", animId);
            const timeoutId = setTimeout(async () => {
                if (dotElement) {
                    utilUI.hideDotForAnim(svg, runningAnimations, animId);
                } else {
                    runningAnimations.delete(animId);
                }

                delete activeTimeouts[animId];

                const componentIdToHighlight = setting.animationToComponentHighlight[animId];
                let checkExists = (component) => {
                    if (!componentInputCounter[component]) {
                        componentInputCounter[component] = 0;
                    }
                }
                let endAction = utilUI.calculateEndAction(opcode, animId); 
                if (typeof endAction === 'function') {
                    endAction();
                }
                else if (Array.isArray(endAction)) {
                    endAction.forEach(fn => fn());
                }

                if (componentIdToHighlight) {
                    utilUI.highlightComponent(svg, componentIdToHighlight);
                }
                let requirements = utilUI.calRequirements(opcode);
                let input;
                if (animId === 'anim-13') {
                    input = 'registers-read1';
                }
                else if (animId === 'anim-21') {
                    input = 'registers-read2';
                }
                else {
                    input = componentIdToHighlight;
                }
                checkExists(input);
                ++componentInputCounter[input];
                if (componentInputCounter[input] >= (requirements[input] || 0)) {
                    // Special case
                    if (setting.setBitOfInstruction[opcode]) {
                        if (input == 'or-gate') {
                            let flag = 'UncondBranch';
                            setTextById(flag, setting.setBitOfInstruction[opcode][flag]);
                        }
                        else if (input == 'and-gate1') {
                            let flag = 'FlagBranch';
                            setTextById(flag, setting.setBitOfInstruction[opcode][flag]);
                        }
                        else if (input == 'and-gate2') {
                            let flag = 'ZeroBranch';
                            setTextById(flag, setting.setBitOfInstruction[opcode][flag]);
                        }
                    }
                    componentInputCounter[input] = 0;
                    await Promise.all(nextAnims.map(nextId => triggerAnimation(nextId, graph, opcode)));
                }
                resolve(); 
            }, durationMs);
            setTimeout(() => {
                if (setting.animToFlag[animId]) {
                    let flag = setting.animToFlag[animId];
                    if (setting.setBitOfInstruction[opcode]) {
                        setTextById(flag, setting.setBitOfInstruction[opcode][flag]);
                    }
                }
            }, durationMs);

            activeTimeouts[animId] = timeoutId;
        } catch (e) {
            console.error(`Lỗi khi bắt đầu ${animId}:`, e);
            runningAnimations.delete(animId);
            resolve(); // Fail-safe
        }
    });
}

let label = null;
async function simulateStep(parsedInstruction) {
    // const lightCircles = document.querySelectorAll('[id^="lightCircle-"]');
    // lightCircles.forEach(circle => circle.setAttribute('visibility', 'hidden'));
    // let result = format.parseFormatInstruction(instruction);
    // let parsedInstruction = utilUI.calparseFormatInstruction(result);
    console.log(parsedInstruction, label);
    if (label != null) {
        if (!parsedInstruction?.label) return;
        if (parsedInstruction.label != label) return;
        label = null;
    }
    //console.log(parsedInstruction);
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

    const initialAnims = ['anim-3'];
    
    executeFormat(parsedInstruction);
    let opcode = parsedInstruction.opcode;
    let branch = false;
    if (opcode === 'CBZ') {
        if (registers[+parsedInstruction.rt] == 0) {
            branch = true;
            label = parsedInstruction.label;
        }
    }
    else if (opcode === 'CBNZ') {
        if (registers[+parsedInstruction.rt] != 0) {
            branch = true;
            label = parsedInstruction.label;
        }
    }
    else if (opcode === 'B' || opcode == 'BL') {
        label = parsedInstruction.label;
        console.log("Branc and Link: ", label);
    }
    let instructionGraph = utilUI.calculateGraph(opcode, branch);
    if (instructionGraph && initialAnims.length > 0) {
        outputJson.status = `Đang tạo hoạt ảnh không đồng bộ cho ${opcode || parsedInstruction.type}`;
        outputArea.textContent = JSON.stringify(outputJson, null, 2);
        await Promise.all(
            initialAnims.map(startAnimId =>
                triggerAnimation(startAnimId, instructionGraph, opcode)
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
            registers = Array(32).fill(0); 
            memory = Array(100000).fill(0); 
            instructionEditor.value = format.normalizeText(instructionEditor.value);
            const instructions = instructionEditor.value.split('\n').filter(line => {
                const trimmed = line.trim();
                return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('#');
            });
            let saveIndexLabel = {};
            for(let i = 0; i < instructions.length; i++) {
                let instruction = instructions[i];
                if (!instruction) {
                    outputArea.textContent = JSON.stringify({
                        status: "Bỏ qua dòng trống hoặc chú thích.",
                        instruction: instruction
                    }, null, 2);
                    continue;
                }
                utilUI.cancelAllPendingTimeouts(activeTimeouts, runningAnimations);
                utilUI.hideAllDots(svg);
                utilUI.removeAllHighlights(svg);
                utilUI.resetLogicBit();
                pathHighlighter.resetHighlights();

                componentInputCounter = {};
                let result = format.parseFormatInstruction(instruction);
                let parsedInstruction = utilUI.calparseFormatInstruction(result);    
                await simulateStep(parsedInstruction);
                console.log(label);
                if (label != null) {
                    if (label in saveIndexLabel) {
                        i = saveIndexLabel[label] - 1;
                    }
                }
                else {
                    if (parsedInstruction?.label) {
                        if (
                            !(parsedInstruction.label in saveIndexLabel) && 
                            parsedInstruction.raw.includes(parsedInstruction.label) == false
                        ) {
                            saveIndexLabel[parsedInstruction.label] = i;
                        }
                    }
                }
                if (parsedInstruction.opcode == 'BL') {
                    registers[30] = address[i];
                }
                if (parsedInstruction.opcode == 'BR') {
                    i = changeToIDInstruction(registers[parsedInstruction.rd]);
                    console.log(registers[parsedInstruction.rd], i);
                }
            }
            if (label != null) {
                outputArea.textContent = JSON.stringify({"error": `Không tìm thấy label ${label}`}, null, 2);
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
