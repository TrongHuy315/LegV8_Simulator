// --- START OF FILE general.js ---

import * as format from '../format/format.js' // Và các module parse khác nếu cần
import * as normalR from './Animation/R_format/normal.js';
import * as normalD from './Animation/D_format/normal.js';
import * as normalCB from './Animation/CB_format/normal.js';
import * as utilUI from '../UI/util.js';
import * as setting from '../setting/setting.js';
import * as update from './register.js';

// --- Tham chiếu đến các Phần tử DOM ---
const simulateButton = document.getElementById('simulate-button');
const instructionEditor = document.getElementById('instruction-editor');
const outputArea = document.getElementById('json-output');
const svg = document.querySelector('svg'); // Cần kiểm tra svg có tồn tại không trước khi dùng
const themeToggleButton = document.getElementById('theme-toggle-button'); // *** ADDED ***
const simulationContainer = document.getElementById('simulation-container'); // *** ADDED for fullscreen ***

// --- Trạng thái Hoạt ảnh Không Đồng Bộ ---
let activeTimeouts = {}; // Lưu các timeout đang chờ kết thúc: { animId: timeoutId }
let runningAnimations = new Set(); // Theo dõi các anim đang chạy (ID của <animateMotion>)
let pendingDotsToHide = {};

// Register storage (if not already declared)
let registers = Array(32).fill(0); // 32 registers, all initialized to 0
let memory = Array(100000).fill(0); 
// Function to execute format command and update registers
function executeFormat(parsedInstruction) {
    if (!parsedInstruction || parsedInstruction.error) return;
    if (format.R_FORMAT_OPCODES.includes(parsedInstruction.opcode)) {
        update.RFormat(parsedInstruction, registers);
    }
    else if (format.D_format_OPCODES.includes(parsedInstruction.opcode)) {
        update.DFormat(parseDuration, registers, memory);
    }
    else if (format.CB_format_OPCODES.includes(parsedInstruction.opcode)) {
        update.CBFormat(parsedInstruction, registers, memory);
    }
    renderRegisterTable(); // Update the register table UI if you have this function
}

// Function to render the register table (if not already present)
function renderRegisterTable() {
    const container = document.getElementById('register-table');
    if (!container) return;
    let html = '<table><tr><th>Register</th><th>Value</th></tr>';
    for (let i = 0; i < 32; i++) {
        html += `<tr><td>X${i}</td><td>${registers[i]}</td></tr>`;
    }
    html += '</table>';
    container.innerHTML = html;
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
    'anim-11': () => toggleLight('lightCircle-muxregwritedest-top'),
    'anim-18': () => toggleLight('lightCircle-muxregwritedest-bottom'),
    'anim-40': () => {
        //toggleLight('lightCircle-muxregwritedest-top')
        //toggleLight('lightCircle-muxregwritedest-bottom')
    },
    'anim-28': () => toggleLight('lightCircle-muxalusrc-bottom'),
    'anim-26': () => toggleLight('lightCircle-muxalusrc-bottom'),
    'anim-30': () => toggleLight('lightCircle-alu-top'),
    'anim-37': () => toggleLight('lightCircle-alu-top'),
    'anim-35': () => toggleLight('lightCircle-muxwriteback-top'),
    'anim-34': () => toggleLight('lightCircle-muxwriteback-top'),
    'anim-8': () => toggleLight('lightCircle-addbranch-top'),
    'anim-38': () => toggleLight('lightCircle-addbranch-top'),
    'anim-2': () => toggleLight('lightCircle-muxpcsrc-top'),
    'anim-39': () => toggleLight('lightCircle-muxpcsrc-top'),
    'anim-47': () => toggleLight('lightCircle-flags-top'),
    'anim-31': () => toggleLight('lightCircle-flags-top'),
};


// --- **** START: Fullscreen Functionality **** ---
function toggleFullScreen() {
    if (!document.fullscreenElement &&    // Standard property
        !document.mozFullScreenElement && // Firefox
        !document.webkitFullscreenElement && // Chrome, Safari and Opera
        !document.msFullscreenElement ) {  // IE/Edge
        if (simulationContainer.requestFullscreen) {
            simulationContainer.requestFullscreen();
        } else if (simulationContainer.mozRequestFullScreen) { /* Firefox */
            simulationContainer.mozRequestFullScreen();
        } else if (simulationContainer.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
            simulationContainer.webkitRequestFullscreen();
        } else if (simulationContainer.msRequestFullscreen) { /* IE/Edge */
            simulationContainer.msRequestFullscreen();
        }
         // console.log("Entering Fullscreen");
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
        }
        // console.log("Exiting Fullscreen");
    }
}
// --- **** END: Fullscreen Functionality **** ---

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
    if (!graph || !graph[animId] || runningAnimations.has(animId)) {
        return;
    }

    const animData = graph[animId];
    const nextAnims = animData.next || [];
    const animationElement = utilUI.getElement(svg, animId);
    const dotId = animId.replace(/^anim-/, 'dot-');
    const dotElement = utilUI.getElement(svg, dotId); // utilUI.getElement cần svg

    if (!animationElement) {
        console.warn(`Không tìm thấy <animateMotion> với ID ${animId}`);
        return;
    }

    const durationAttr = animationElement.getAttribute('dur');
    const durationMs = parseDuration(durationAttr);

    if (dotElement) {
        dotElement.style.visibility = 'visible';
    }
    }

    try {
        animationElement.beginElement();
        runningAnimations.add(animId);

        animationElement.beginElement();
        runningAnimations.add(animId);

        const timeoutId = setTimeout(() => {
            if (dotElement) {
                utilUI.hideDotForAnim(svg, runningAnimations, animId);
            } else {
                runningAnimations.delete(animId);
                runningAnimations.delete(animId);
            }

            delete activeTimeouts[animId];

            const componentIdToHighlight = setting.animationToComponentHighlight[animId];
            if (componentIdToHighlight) {
                // Truyền svg vào highlightComponent nếu cần
                utilUI.highlightComponent(svg, componentIdToHighlight);
            }

            const endAction = addAnimationEndActions[animId];
            if (typeof endAction === 'function') {
                endAction();
                endAction();
            }

            nextAnims.forEach(nextAnimId => {
                triggerAnimation(nextAnimId, graph);
            });

        }, durationMs);
        }, durationMs);

        activeTimeouts[animId] = timeoutId;
    } catch (e) {
        console.error(`Lỗi khi bắt đầu ${animId}:`, e);
        runningAnimations.delete(animId);
        runningAnimations.delete(animId);
    }
}


function simulateStep(instruction) {
    return new Promise((resolve) => {
        // Reset trạng thái
        // utilUI.cancelAllPendingTimeouts(activeTimeouts, runningAnimations);
        // utilUI.hideAllDots(svg);
        // utilUI.removeAllHighlights(svg);

        const lightCircles = document.querySelectorAll('[id^="lightCircle-"]');
        lightCircles.forEach(circle => circle.setAttribute('visibility', 'hidden'));

        const trimmedLine = instruction.trim();
        if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('#')) {
            outputArea.textContent = JSON.stringify({
                status: "Bỏ qua dòng trống hoặc chú thích.",
                instruction: trimmedLine
            }, null, 2);
            resolve(); // Tránh treo Promise
            return;
        }

        let parsedInstruction = null;
        let rawLine = trimmedLine;
        let result = format.parseRFormatInstruction(trimmedLine);
        console.log("result", result);
        if (result && result.error) {
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
            console.error("Lỗi phân tích:", parsedInstruction.message, "trên dòng:", parsedInstruction.raw);
        } else {
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
                // TODO: executeDFormat(parsedInstruction); // Nếu có
            } else if (parsedInstruction.type === 'CB') {
                instructionGraph = normalCB.animation();
            } else if (parsedInstruction.type === 'B') {
                // instructionGraph = normalB.animation();
            }

            if (instructionGraph && initialAnims.length > 0) {
                initialAnims.forEach(startAnimId => {
                    triggerAnimation(startAnimId, instructionGraph);
                });
                outputJson.status = `Đang tạo hoạt ảnh không đồng bộ cho ${parsedInstruction.opcode || parsedInstruction.type}`;
            } else {
                console.warn(`Không có đồ thị hoạt ảnh nào cho lệnh: ${rawLine}`);
                outputJson.status = "Không có đồ thị hoạt ảnh cụ thể cho lệnh này.";
            }
        }

        outputArea.textContent = JSON.stringify(outputJson, null, 2);

        setTimeout(() => {
            resolve();
        }, 12100); // Delay đảm bảo mô phỏng hoàn thành
    });
}

// // --- **** START: Theme Toggle Functionality **** ---
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        if(themeToggleButton) themeToggleButton.textContent = '☀️'; // Sun icon for dark theme
    } else {
        document.body.classList.remove('dark-theme');
        if(themeToggleButton) themeToggleButton.textContent = '🌓'; // Moon icon for light theme
    }
}

function toggleTheme() {
    let currentTheme = localStorage.getItem('theme') || 'light';
    let newTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    // console.log("Theme toggled to:", newTheme);
}

// Load saved theme on startup
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light'; // Default to light
    applyTheme(savedTheme);
});
// --- **** END: Theme Toggle Functionality **** ---

window.addEventListener('load', () => {
    if(simulateButton) {
        simulateButton.addEventListener('click', async () => {
            utilUI.cancelAllPendingTimeouts(activeTimeouts, runningAnimations);
            utilUI.hideAllDots(svg);
            utilUI.removeAllHighlights(svg);

            const instructions = instructionEditor.value.split('\n').filter(line => {
                const trimmed = line.trim();
                return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('#');
            });

            for (let instruction of instructions) {
                console.log(instruction);
                await simulateStep(instruction);  // Wait for animation to finish
            }
        });

        // console.log("Sự kiện click đã được gắn vào nút Simulate.");
    } else {
        console.error("Không tìm thấy nút Simulate!");
    }

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
         // console.log("Theme toggle button listener attached.");
    } else {
        console.error("Theme toggle button not found!");
    }

    if(outputArea) {
        outputArea.textContent = JSON.stringify({ message: "Ready. Enter LEGv8 code. Shortcuts: (R)eset Zoom, (T)heme, F11 Fullscreen" }, null, 2);
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
                theme.toggleTheme(themeToggleButton);
            }
        }
    });
    console.log("Global event listeners initialized.");
});
// --- END OF FILE general.js ---
