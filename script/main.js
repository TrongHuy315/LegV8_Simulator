import * as format from '../format/format.js' // Và các module parse khác nếu cần
import * as utilUI from '../UI/util.js'
import * as setting from '../setting/setting.js'
import * as theme from '../UI/theme.js'
import * as fullScreen from '../UI/fullscreen.js'
import * as editor from './editor.js'
import * as regmemtable from '../UI/reg_mem_table.js'
import * as pathHighlighter from './pathHighlighter.js'
// import * as animationControl from '../UI/animation_control.js'
import * as speedControl from '../UI/speedControl.js'
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

// const pauseResumeButton = document.getElementById('pause-resume-button');
const speedSlider = document.getElementById('speed-slider'); 
const speedMultipliers = [0.25, 0.5, 1, 2, 4];

// --- Trạng thái Hoạt ảnh Không Đồng Bộ ---
export let activeTimeouts = {}; // Lưu các timeout đang chờ kết thúc: { animId: timeoutId }
let runningAnimations = new Set(); // Theo dõi các anim đang chạy (ID của <animateMotion>)

// Register storage (if not already declared)
export let registers = Array(32).fill(0); // 32 registers, all initialized to 0
export let memory = Array(1000).fill(0); 
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
    // console.log(registers[1]);
    regmemtable.renderRegisterTable(registerTableContainer, displayState);
    regmemtable.renderMemoryView(memoryTableContainer, displayState);
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
    console.log(runningAnimations);
    return new Promise((resolve, reject) => {
        // if (animationControl.getIsPaused()) {
        //     resolve();
        //     return;
        // }

        // Nếu không có đồ thị, không có dữ liệu animation, hoặc animation đã chạy, bỏ qua.
        if (!graph || !graph[animId] || runningAnimations.has(animId)) {
            resolve();
            return;
        }

        pathHighlighter.highlightPathForAnimation(animId);

        const animData = graph[animId];
        const nextAnims = animData.next || [];
        const animationElement = utilUI.getElement(svg, animId);
        const dotId = animId.replace(/^anim-/, 'dot-');
        const dotElement = utilUI.getElement(svg, dotId);

        if (!animationElement) {
            console.warn(`Không tìm thấy <animateMotion> với ID ${animId}`);
            resolve();
            return;
        }

        // const durationAttr = animationElement.getAttribute('dur');
        const baseDurationMs = parseDuration(setting.timeForEachAnim[animId]);

        const sliderValue = parseInt(speedSlider.value, 10);
        const currentMultiplier = speedMultipliers[sliderValue];
        
        // Tính toán thời gian thực tế sẽ mất để animation hoàn thành
        const actualDurationMs = baseDurationMs / currentMultiplier;

        if (dotElement) {
            dotElement.style.visibility = 'visible';
        }

        const onAnimationEnd = async () => {
            // Xóa chính nó khỏi danh sách đang theo dõi khi đã được thực thi
            delete activeTimeouts[animId];

            if (dotElement) {
                utilUI.hideDotForAnim(svg, runningAnimations, animId);
            } else {
                runningAnimations.delete(animId);
            }

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
                // Logic đặc biệt cho các cổng logic
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
                // Kích hoạt các animation tiếp theo trong chuỗi
                await Promise.all(nextAnims.map(nextId => triggerAnimation(nextId, graph, opcode)));
            }
            resolve(); 
        };

        const onFlagTimeout = () => {
             // Xóa chính nó khỏi danh sách đang theo dõi
            delete activeTimeouts[animId + '-flag'];
            
            if (setting.animToFlag[animId]) {
                let flag = setting.animToFlag[animId];
                if (setting.setBitOfInstruction[opcode]) {
                    setTextById(flag, setting.setBitOfInstruction[opcode][flag]);
                }
            }
        };

        try {
            if (animationElement.playbackRate !== undefined) {
                animationElement.playbackRate = currentMultiplier;
            }

            const newDuration = `${actualDurationMs / 1000}s`; // Convert milliseconds to seconds
            animationElement.setAttribute('dur', newDuration);
            animationElement.beginElement();
            // animationElement.setAttribute('dur', baseDurationMs);
            runningAnimations.add(animId);
            
            // Đặt timer chính và lưu thông tin chi tiết của nó
            const mainTimeoutId = setTimeout(onAnimationEnd, actualDurationMs);
            activeTimeouts[animId] = {
                id: mainTimeoutId,
                startTime: Date.now(),
                baseDuration: baseDurationMs,
                callback: onAnimationEnd
            };

            // Nếu có một hành động cờ song song, đặt timer cho nó với một ID duy nhất
            if (setting.animToFlag[animId]) {
                const flagTimeoutId = setTimeout(onFlagTimeout, actualDurationMs);
                const flagAnimId = animId + '-flag'; // Tạo ID duy nhất
                activeTimeouts[flagAnimId] = {
                    id: flagTimeoutId,
                    startTime: Date.now(),
                    baseDuration: baseDurationMs,
                    callback: onFlagTimeout
                };
            }

        } catch (e) {
            console.error(`Lỗi khi bắt đầu ${animId}:`, e);
            
            // Dọn dẹp nếu có lỗi xảy ra
            runningAnimations.delete(animId);
            delete activeTimeouts[animId];
            delete activeTimeouts[animId + '-flag']; // Cũng xóa timeout của cờ
            
            resolve(); // Đảm bảo promise vẫn được giải quyết để không làm treo chuỗi
        }
    });
}

let label = null;
async function simulateStep(parsedInstruction) {
    // const lightCircles = document.querySelectorAll('[id^="lightCircle-"]');
    // lightCircles.forEach(circle => circle.setAttribute('visibility', 'hidden'));
    // let result = format.parseFormatInstruction(instruction);
    // let parsedInstruction = utilUI.calparseFormatInstruction(result);
    // console.log(parsedInstruction, label);
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
            console.log("restart");
            editor.clearActiveLine();
            utilUI.cancelAllPendingTimeouts(activeTimeouts, runningAnimations);
            utilUI.hideAllDots(svg);
            pathHighlighter.resetHighlights();
            utilUI.resetLogicBit();
            registers.fill(0);  
            memory.fill(0); 
            let stack = [];
            componentInputCounter = {};
            label = null; 

            const formattedCode = format.normalizeText(instructionEditor.value);
            instructionEditor.value = formattedCode;
            editor.updateLineNumbers();

            const allFormattedLines = formattedCode.split('\n');
            
            // Tạo ra một mảng các OBJECT, mỗi object chứa text và originalIndex
            const instructionsToRun = allFormattedLines
                .map((line, index) => ({
                    text: line,
                    originalIndex: index 
                }))
                .filter(item => {
                    const trimmed = item.text.trim();
                    // Lọc bỏ comment, dòng trống, và dòng chỉ chứa label
                    return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('#') && !trimmed.endsWith(':');
                });

            const labelMap = new Map();
            allFormattedLines.forEach((line, index) => {
                const trimmedLine = line.trim();
                if (trimmedLine.endsWith(':')) {
                    const labelName = trimmedLine.slice(0, -1).trim().toUpperCase();
                    labelMap.set(labelName, index);
                }
            });

            for (let i = 0; i < instructionsToRun.length; i++) {
                // 'currentInstruction' giờ là một OBJECT
                let currentInstruction = instructionsToRun[i];
                // Truy cập các thuộc tính từ OBJECT
                let instructionText = currentInstruction.text;
                let lineIndexToHighlight = currentInstruction.originalIndex;

                editor.setActiveLine(lineIndexToHighlight);

                utilUI.cancelAllPendingTimeouts(activeTimeouts, runningAnimations);
                utilUI.hideAllDots(svg);
                pathHighlighter.resetHighlights();
                utilUI.resetLogicBit();
                
                let result = format.parseFormatInstruction(instructionText);
                let parsedInstruction = utilUI.calparseFormatInstruction(result);    
                
                await simulateStep(parsedInstruction);

                // ----- Xử lý logic nhảy (Branching) -----
                if (label != null) { 
                    const targetLineIndex = labelMap.get(label.toUpperCase());
                    if (targetLineIndex !== undefined) {
                        const nextI = instructionsToRun.findIndex(item => item.originalIndex >= targetLineIndex);
                        if (nextI !== -1) {
                            i = nextI - 1;
                        } else {
                            label = "Label_No_Executable_Instruction_Error"; break;
                        }
                    } else {
                        break; 
                    }
                }

                // Xử lý logic cho BL và BR
                if (parsedInstruction?.opcode == 'BL') {
                    if (i + 1 < instructionsToRun.length) {
                        const returnLineIndex = instructionsToRun[i + 1].originalIndex;
                        const returnAddress = address[returnLineIndex]; 
                        stack.push(returnAddress);
                    }
                }
                if (parsedInstruction?.opcode == 'BR' && stack.length > 0) {
                    const returnPc = stack.pop();
                    const returnLineIndex = changeToIDInstruction(returnPc);
                    if (returnLineIndex !== -1) {
                        const nextI = instructionsToRun.findIndex(item => item.originalIndex >= returnLineIndex);
                        if (nextI !== -1) {
                            i = nextI - 1;
                        }
                    }
                }
            }

            // Hiển thị lỗi nếu có
            if (label != null && !label.includes("_Error")) {
                outputArea.textContent = JSON.stringify({"error": `Không tìm thấy label "${label}"`}, null, 2);
            }
            
            setTimeout(() => {
                editor.clearActiveLine();
            }, 1000);
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
            editor.updateLineNumbers();
        });

        // Đồng bộ cuộn giữa editor và thanh số dòng
        instructionEditor.addEventListener('scroll', () => {
            editor.syncScroll();
        });

        // Gọi lần đầu tiên khi tải trang để hiển thị số dòng ban đầu
        editor.updateLineNumbers(); 
    }

    if (registerTableContainer && memoryTableContainer) {
        // Gọi hàm render và truyền các tham số cần thiết
        regmemtable.renderRegisterTable(registerTableContainer, displayState);
        regmemtable.renderMemoryView(memoryTableContainer, displayState);
        // console.log(registers);
        // Gọi hàm setup listener và truyền các tham số cần thiết
        regmemtable.setupToggleListeners(
            dataDisplayContainer, 
            displayState, 
            registerTableContainer, 
            memoryTableContainer,
        );

        // if (pauseResumeButton) {
        //     pauseResumeButton.addEventListener('click', () => {
        //         if (animationControl.getIsPaused()) {
        //             animationControl.resume(svg, activeTimeouts);
        //             pauseResumeButton.innerHTML = '⏸️'; // Icon Pause
        //             pauseResumeButton.title = 'Pause Animation (P)';
        //         } else {
        //             animationControl.pause(svg, activeTimeouts);
        //             pauseResumeButton.innerHTML = '▶️'; // Icon Play/Resume
        //             pauseResumeButton.title = 'Resume Animation (P)';
        //         }
        //     });
        // }
    }

    if (svg) {
        speedControl.initialize(svg);
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

        if ((event.key === 'p' || event.key === 'P') && event.target.tagName !== 'TEXTAREA') {
            event.preventDefault();
            // Kích hoạt sự kiện click trên nút để dùng chung logic
            // pauseResumeButton.click();
        }
    });
    // console.log("Global event listeners initialized.");
});

document.addEventListener('DOMContentLoaded', () => {
    const importInput = document.getElementById('import-code-input');

    // Lắng nghe sự kiện 'change' trên input file
    importInput.addEventListener('change', (event) => {
        const files = event.target.files;

        // Kiểm tra xem người dùng có chọn file nào không
        if (files.length === 0) {
            // console.log('No file selected.');
            return;
        }

        const file = files[0];

        // Tạo một đối tượng FileReader để đọc file
        const reader = new FileReader();

        // Định nghĩa hành động sẽ làm khi file được đọc xong
        reader.onload = (e) => {
            // Lấy nội dung file từ kết quả của reader
            const fileContent = e.target.result;
            // Gán nội dung đó vào textarea
            instructionEditor.value = fileContent;
            // Xóa giá trị của input để có thể upload lại cùng file
            importInput.value = '';

            editor.updateLineNumbers(instructionEditor, lineNumbersElement);
        };

        // Báo lỗi nếu có vấn đề khi đọc file
        reader.onerror = (e) => {
            alert('Error reading file: ' + e.target.error.name);
        };

        // Bắt đầu đọc file dưới dạng văn bản (text)
        reader.readAsText(file);
    });
});