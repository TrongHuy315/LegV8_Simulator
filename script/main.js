// --- START OF FILE general.js ---

import * as rFormat from '../format/r_format.js';
import * as addInstruction from './Animation/R_format/add.js';
import * as utilUI from '../UI/util.js';
import * as setting from '../setting/setting.js';
import * as theme from './theme.js'; // Sửa lỗi gõ nhầm
import * as fullScreen from './fullscreen.js';
import * as editor from './editor.js';

// --- Khai báo biến tham chiếu, CHƯA gán giá trị ---
let simulateButton;
let instructionEditor;
let outputArea;
let svg;
let themeToggleButton;
let simulationContainer;
let lineNumbersDiv; // Đổi tên từ lineNumbers để rõ là div

// --- Trạng thái Hoạt ảnh Không Đồng Bộ ---
let activeTimeouts = {};
let runningAnimations = new Set();
// let pendingDotsToHide = {}; // Xem xét nếu không dùng, có vẻ chưa được dùng

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
    // Mặc định coi là giây nếu không có đơn vị VÀ là số hợp lệ
    return value * 1000;
}

// Hàm bắt đầu một hoạt ảnh cụ thể và lên lịch kết thúc/bắt đầu tiếp theo
function triggerAnimation(animId, graph) {
    // Kiểm tra svg có tồn tại không trước khi dùng các hàm của utilUI
    if (!svg) {
        console.error("SVG element not available for triggerAnimation");
        return;
    }
    if (!graph || !graph[animId] || runningAnimations.has(animId)) {
        return;
    }

    const animData = graph[animId];
    const nextAnims = animData.next || [];

    const animationElement = utilUI.getElement(svg, animId); // utilUI.getElement cần svg
    const dotId = animId.replace(/^anim-/, 'dot-');
    const dotElement = utilUI.getElement(svg, dotId); // utilUI.getElement cần svg

    if (!animationElement) {
         console.warn(`Không tìm thấy thẻ <animateMotion> với ID ${animId}`);
         return;
    }
    // Không return nếu dotElement không tìm thấy, chỉ cảnh báo
    if (!dotElement) {
         console.warn(`Không tìm thấy thẻ <circle> với ID ${dotId} cho hoạt ảnh ${animId}`);
    }

    const durationAttr = animationElement.getAttribute('dur');
    const durationMs = parseDuration(durationAttr);

    if(dotElement) {
        dotElement.style.visibility = 'visible';
    }

    try {
        animationElement.beginElement();
        runningAnimations.add(animId);

        const timeoutId = setTimeout(() => {
            if(dotElement) {
                // Truyền svg vào hideDotForAnim nếu cần
                utilUI.hideDotForAnim(svg, runningAnimations, animId);
            } else {
                runningAnimations.delete(animId);
            }
            delete activeTimeouts[animId];

            const componentIdToHighlight = setting.animationToComponentHighlight[animId];
            if (componentIdToHighlight) {
                // Truyền svg vào highlightComponent nếu cần
                utilUI.highlightComponent(svg, componentIdToHighlight);
            }

            const endAction = rFormat.addAnimationEndActions[animId];
            if (typeof endAction === 'function') {
                endAction();
            }

            nextAnims.forEach(nextAnimId => {
                triggerAnimation(nextAnimId, graph);
            });

        }, durationMs);

        activeTimeouts[animId] = timeoutId;

    } catch (e) {
        console.error(`Lỗi khi bắt đầu ${animId}:`, e);
        runningAnimations.delete(animId);
    }
}


// --- Hàm Thực hiện một Bước Mô phỏng ---
function simulateStep(instruction) {
    return new Promise((resolve) => {
        if (!svg || !instructionEditor || !outputArea) {
            console.error("DOM elements (svg, instructionEditor, outputArea) not ready for simulateStep.");
            resolve();
            return;
        }

        const lightCircles = svg.querySelectorAll('[id^="lightCircle-"]'); // Truy vấn từ svg
        lightCircles.forEach(lightCircle => {
            lightCircle.setAttribute('visibility', 'hidden');
        });

        let parsedInstruction = null;
        let rawLine = "Không tìm thấy lệnh hợp lệ.";
        const trimmedLine = instruction.trim();

        if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('#')) {
            resolve(); // Bỏ qua dòng trống/comment và resolve Promise
            return;
        }

        let result = rFormat.parseRFormatInstruction(trimmedLine);

        if (result && result.error) {
            parsedInstruction = result; // Gán luôn nếu có lỗi
            rawLine = result.raw || trimmedLine;
        } else if (!result) { // Trường hợp parseRFormatInstruction trả về null/undefined
            parsedInstruction = { error: true, message: "Lệnh không nhận dạng được.", raw: trimmedLine };
            rawLine = trimmedLine;
        } else { // result không có error
            parsedInstruction = result;
            rawLine = result.raw || trimmedLine;
        }

        let outputJson = {};
        if (parsedInstruction.error) { // Chỉ cần kiểm tra parsedInstruction.error
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
            let initialAnims = [];

            if (parsedInstruction.type === 'R') {
                if (parsedInstruction.opcode === 'ADD' || parsedInstruction.opcode === 'SUB') {
                    instructionGraph = addInstruction.animationAdd();
                    initialAnims = ['anim-3'];
                }
            }

            if (instructionGraph && initialAnims.length > 0) {
                initialAnims.forEach(startAnimId => {
                    triggerAnimation(startAnimId, instructionGraph);
                });
                outputJson.status = `Đang tạo hoạt ảnh không đồng bộ cho ${parsedInstruction.opcode || parsedInstruction.type}`;
            } else {
                console.warn(`Không có đồ thị hoạt ảnh nào được định nghĩa cho lệnh: ${rawLine}`);
                outputJson.status = `Không có đồ thị hoạt ảnh cụ thể cho lệnh này.`;
            }
        }
        outputArea.textContent = JSON.stringify(outputJson, null, 2);
        // Cân nhắc lại cơ chế resolve này, nó không đợi animation thực sự xong.
        // Để đơn giản, tạm thời giữ lại.
        setTimeout(() => {
            resolve();
        }, 10000); // Thời gian chờ cho 1 lệnh
    });
}


// --- SỰ KIỆN CHÍNH ĐỂ KHỞI TẠO MỌI THỨ SAU KHI DOM SẴN SÀNG ---
document.addEventListener('DOMContentLoaded', () => {
    // --- GÁN GIÁ TRỊ CHO CÁC THAM CHIẾU DOM Ở ĐÂY ---
    simulateButton = document.getElementById('simulate-button');
    instructionEditor = document.getElementById('instruction-editor');
    outputArea = document.getElementById('json-output');
    svg = document.querySelector('svg');
    themeToggleButton = document.getElementById('theme-toggle-button');
    simulationContainer = document.getElementById('simulation-container');
    lineNumbersDiv = document.getElementById('lineNumbers');

    // Kiểm tra các phần tử DOM quan trọng
    if (!simulateButton) console.error("DOM Error: Simulate button not found!");
    if (!instructionEditor) console.error("DOM Error: Instruction editor not found!");
    if (!outputArea) console.error("DOM Error: Output area not found!");
    if (!svg) console.error("DOM Error: SVG element not found! Animations might not work.");
    if (!themeToggleButton) console.error("DOM Error: Theme toggle button not found!");
    if (!simulationContainer) console.error("DOM Error: Simulation container not found for fullscreen!");
    if (!lineNumbersDiv) console.error("DOM Error: Line numbers div not found!");

    // --- EDITOR FUNCTIONALITY ---
    if (instructionEditor && lineNumbersDiv) {
        editor.updateLineNumbers(instructionEditor, lineNumbersDiv); // Cập nhật lần đầu

        instructionEditor.addEventListener('input', () => {
            editor.updateLineNumbers(instructionEditor, lineNumbersDiv);
        });
        instructionEditor.addEventListener('scroll', () => {
            editor.syncScroll(instructionEditor, lineNumbersDiv);
        });
        console.log("Editor functionality initialized.");
    }

    // --- THEME ---
    const savedTheme = localStorage.getItem('theme') || 'light';
    // Truyền themeToggleButton nếu hàm applyTheme/toggleTheme trong theme.js cần
    theme.applyTheme(savedTheme, themeToggleButton);

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => theme.toggleTheme(themeToggleButton));
    }

    // --- SIMULATE BUTTON ---
    if (simulateButton) {
        simulateButton.addEventListener('click', async () => {
            console.log("Simulate button clicked!");
            if (!instructionEditor || !svg || !utilUI) { // Kiểm tra utilUI
                console.error("Cannot simulate: Critical elements (editor, SVG, or utilUI) missing.");
                return;
            }
            utilUI.cancelAllPendingTimeouts(activeTimeouts, runningAnimations);
            utilUI.hideAllDots(svg); // utilUI.hideAllDots cần svg
            utilUI.removeAllHighlights(svg); // utilUI.removeAllHighlights cần svg

            const instructions = instructionEditor.value.split('\n').filter(line => {
                const trimmed = line.trim();
                return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('#');
            });

            if (instructions.length === 0) {
                console.log("No instructions to simulate.");
                if(outputArea) outputArea.textContent = JSON.stringify({ message: "No instructions entered." }, null, 2);
                return;
            }

            for (let instruction of instructions) {
                await simulateStep(instruction);
            }
            console.log("All instructions processed.");
        });
    }

    // --- OUTPUT AREA INITIAL TEXT ---
    if (outputArea) {
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
