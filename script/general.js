// --- START OF FILE general.js ---

import * as rFormat from './r_format.js' // Và các module parse khác nếu cần

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
const DEFAULT_ANIMATION_DURATION_MS = 1000; // Dự phòng nếu không đọc được 'dur'
const HIGHLIGHT_DURATION_MS = 300; // How long the highlight stays (ms)
const POST_HIGHLIGHT_HIDE_DELAY_MS = 150;
let pendingDotsToHide = {};
const animationToComponentHighlight = {
    // Fetch Stage
    'anim-4': 'instruction-memory', // PC addr arrives at Inst Memory
    
    'anim-6': 'add-pc-4',           // PC+4 value arrives at adder
    'anim-7': 'add-pc-4',           // Constant 4 arrives at adder

    // Decode Stage / Control Signals
    'anim-14': 'control-unit',      // More instruction bits (for specific control signals)
    
    'anim-13': 'registers',         // ReadReg1 address arrives
    'anim-19': 'registers', 
    'anim-21': 'registers',         // ReadReg2 address arrives
    'anim-36': 'registers', 
    
    'anim-11': 'mux-reg-dest',      // Inst bits arrive at WriteReg Mux selector (if applicable)
    'anim-18': 'mux-reg-dest',      // Control Signal (Reg2Loc?) arrives at Mux
    
    'anim-23': 'alu-control',       // Instruction func/op bits arrive at ALU Control
    'anim-49': 'alu-control',       // ALUOp signal arrives at ALU Control

    // Register Read
    'anim-30': 'alu',               // ReadData1 arrives at ALU top input
    'anim-37': 'alu',
    'anim-56': 'alu',

    'anim-26': 'mux-alu-src',       // Sign-extended immediate arrives at Mux ALU Src input 1
    'anim-28': 'mux-alu-src',
    'anim-48': 'mux-alu-src',       // ALUSrc control signal arrives
    
    'anim-29': 'data-memory',       // ReadData2 arrives at Data Memory Write Data input
    'anim-33': 'data-memory',
    'anim-44': 'data-memory',
    'anim-46': 'data-memory',

    // Immediate / Sign Extend
    'anim-22': 'sign-extend',       // Instruction immediate bits arrive

    'anim-25': 'shift-left-2',      // Sign-extended immediate arrives at Shift Left 2 (for branch)

    // Execute Stage (ALU)
    'anim-31': 'flags',             // Zero flag output from ALU calculation

    // Branch Logic
    'anim-8': 'add-branch',         // PC+4 (or current PC?) arrives at branch adder
    'anim-38': 'add-branch',        // Shifted offset arrives at branch adder
    
    'anim-51': 'and-gate-zerobranch',// Zero flag arrives at AND gate
    'anim-43': 'and-gate-zerobranch',// ZeroBranch control signal arrives
    
    'anim-55': 'and-gate-flagbranch',// Flags (non-zero) arrive
    'anim-42': 'and-gate-flagbranch',// FlagBranch control signal arrives
    
    'anim-52': 'or-gate-branch',    // Result from ZeroBranch AND arrives
    'anim-54': 'or-gate-branch',    // Result from FlagBranch AND arrives
    'anim-41': 'or-gate-branch',    // UncondBranch control signal arrives
    
    'anim-53': 'mux-pc-src',        // Branch taken signal arrives at Mux PC Src selector
    'anim-2': 'mux-pc-src',         // PC+4 arrives at Mux PC Src input 0
    'anim-39': 'mux-pc-src',        // Branch target address arrives at Mux PC Src input 1

    // Writeback Stage
    'anim-35': 'mux-writeback',     // Data from Memory arrives at Mux Writeback input 1
    'anim-34': 'mux-writeback',     // ALU result arrives at Mux Writeback input 0
    'anim-45': 'mux-writeback',     // MemToReg control signal arrives
    'anim-13': 'registers',
    'anim-19': 'registers',
    'anim-36': 'registers',         // Data from Mux Writeback arrives at Register Write Data input
    'anim-21': 'registers',         // Write Register address arrives
    'anim-50': 'registers',         // RegWrite control signal arrives

    // PC Update
    'anim-1': 'pc',                 // Value from Mux PC Src arrives to update PC

    // Control signals arriving at destinations
    'anim-47': 'flags',             // FlagWrite control signal arrives
};

// Hàm tiện ích để lấy phần tử SVG bằng ID (An toàn hơn)
function getElement(id) {
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
function hideDotForAnim(animId) {
    const dotId = animId.replace(/^anim-/, 'dot-');
    const dot = getElement(dotId);
    if (dot) {
        dot.style.visibility = 'hidden';
    }
    runningAnimations.delete(animId); // Xóa khỏi tập đang chạy
    // console.log(`Đã ẩn dot và xóa khỏi running: ${animId}`);
}

// --- **** START: Highlight Function **** ---
function highlightComponent(componentId) {
    if (!componentId) return;
    const componentElement = getElement(componentId);
    if (componentElement) {
        // console.log(`Highlighting ${componentId}`); // Debug
        componentElement.classList.add('highlighted');

        // Schedule removal of highlight
        setTimeout(() => {
            componentElement.classList.remove('highlighted');
            // console.log(`Unhighlighting ${componentId}`); // Debug
        }, HIGHLIGHT_DURATION_MS);
    } else {
        console.warn(`Component to highlight not found: ${componentId}`);
    }
}
// --- **** END: Highlight Function **** ---

// --- **** START: Remove All Highlights Function **** ---
function removeAllHighlights() {
    try {
       const highlightedElements = svg.querySelectorAll('.highlighted');
       highlightedElements.forEach(el => {
           el.classList.remove('highlighted');
       });
       // console.log("Removed all highlights.");
   } catch (e) {
       console.error("Lỗi khi xóa highlights:", e);
   }
}
// --- **** END: Remove All Highlights Function **** ---

// Hàm chuyển đổi giá trị 'dur' (vd: "1.5s", "500ms") sang milliseconds
function parseDuration(durationString) {
    if (!durationString) return DEFAULT_ANIMATION_DURATION_MS;
    const lowerCase = durationString.toLowerCase().trim();
    let value = parseFloat(lowerCase);
    if (isNaN(value)) return DEFAULT_ANIMATION_DURATION_MS;
    if (lowerCase.endsWith('ms')) {
        return value;
    } else if (lowerCase.endsWith('s')) {
        return value * 1000;
    }
    // Mặc định coi là giây nếu không có đơn vị
    return value * 1000;
}

// Hàm bắt đầu một hoạt ảnh cụ thể và lên lịch kết thúc/bắt đầu tiếp theo
function triggerAnimation(animId, graph) {
    // Kiểm tra đồ thị và trạng thái đang chạy
    if (!graph || !graph[animId] || runningAnimations.has(animId)) {
        // console.log(`Bỏ qua trigger cho ${animId} (không có trong graph hoặc đang chạy)`);
        return;
    }

    const animData = graph[animId];
    const nextAnims = animData.next || []; // Lấy danh sách anim tiếp theo

    const animationElement = getElement(animId);
    const dotId = animId.replace(/^anim-/, 'dot-');
    const dotElement = getElement(dotId);

    if (!animationElement) {
         console.warn(`Không tìm thấy thẻ <animateMotion> với ID ${animId}`);
         return;
    }
     if (!dotElement) {
         console.warn(`Không tìm thấy thẻ <circle> với ID ${dotId}`);
         // Vẫn có thể chạy hoạt ảnh logic (nếu có) nhưng không có hiển thị
         // return; // Hoặc quyết định dừng hẳn nếu không có dot
     }


    // *** Đọc thời lượng 'dur' từ chính thẻ <animateMotion> ***
    const durationAttr = animationElement.getAttribute('dur');
    const durationMs = parseDuration(durationAttr); // Chuyển đổi sang ms

    console.log(`Triggering ${animId} (SVG dur: ${durationAttr} -> ${durationMs}ms)`);

     // Hiển thị chấm tròn (nếu tìm thấy)
     if(dotElement) {
        dotElement.style.visibility = 'visible';
     }

    try {
        // Cân nhắc reset hoạt ảnh SMIL về đầu nếu cần
        // animationElement.endElement();
        animationElement.beginElement(); // Bắt đầu hoạt ảnh SMIL
        runningAnimations.add(animId); // Đánh dấu đang chạy

        // Lên lịch hành động KHI KẾT THÚC (dựa trên duration đọc được)
        const timeoutId = setTimeout(() => {
            // console.log(`Hoạt ảnh ${animId} hoàn thành.`);
            if(dotElement) {
                 hideDotForAnim(animId); // Ẩn chấm tròn (nếu có)
            } else {
                 runningAnimations.delete(animId); // Vẫn xóa khỏi running nếu không có dot
            }
            delete activeTimeouts[animId]; // Xóa timeout đã hoàn thành

            // --- **** START: Check and Trigger Highlight **** ---
            const componentIdToHighlight = animationToComponentHighlight[animId];
            if (componentIdToHighlight) {
                highlightComponent(componentIdToHighlight);
            }
            // --- **** END: Check and Trigger Highlight **** ---

            // --- **** START: Execute End Action from Map **** ---
            const endAction = rFormat.addAnimationEndActions[animId];
            if (typeof endAction === 'function') {
                console.log(`Executing end action for ${animId}`);
                endAction(); // Gọi hàm được định nghĩa trong map
            }
            // --- **** END: Execute End Action from Map **** ---

            // Kích hoạt các hoạt ảnh tiếp theo trong đồ thị
            // console.log(`Kích hoạt tiếp theo từ ${animId}:`, nextAnims);
            nextAnims.forEach(nextAnimId => {
                // Cần truyền lại đồ thị gốc
                triggerAnimation(nextAnimId, graph);
            });

        }, durationMs); // Timeout bằng đúng thời gian hoạt ảnh đọc được

        activeTimeouts[animId] = timeoutId; // Lưu lại ID timeout để có thể hủy

    } catch (e) {
        console.error(`Lỗi khi bắt đầu ${animId}:`, e);
        runningAnimations.delete(animId); // Xóa nếu không start được
    }
}

// Hàm hủy tất cả các timeout đang chờ (khi reset)
function cancelAllPendingTimeouts() {
     const keys = Object.keys(activeTimeouts);
     if (keys.length > 0) {
        console.log("Hủy các timeout đang chờ:", keys.length);
        keys.forEach(animId => {
            clearTimeout(activeTimeouts[animId]);
        });
     }
    activeTimeouts = {}; // Reset đối tượng lưu timeout
    runningAnimations.clear(); // Reset tập anim đang chạy
}

// Hàm ẩn TẤT CẢ các chấm tròn (để reset)
function hideAllDots() {
    try {
        const allDots = svg.querySelectorAll('.data-dot');
        allDots.forEach(dot => {
            if (dot) {
                 dot.style.visibility = 'hidden';
            }
        });
        // console.log("Đã ẩn tất cả các chấm tròn.");
    } catch (e) {
        console.error("Lỗi khi ẩn các chấm tròn:", e);
    }
}


// --- Hàm Thực hiện một Bước Mô phỏng ---
function simulateStep() {
    // *** Reset trạng thái ***
    cancelAllPendingTimeouts(); // <-- HỦY TẤT CẢ TIMEOUT CŨ
    hideAllDots();              // <-- Ẩn tất cả chấm tròn
    removeAllHighlights();

    const lightCircles = document.querySelectorAll('[id^="lightCircle-"]');
    lightCircles.forEach(lightCircle => {
        lightCircle.setAttribute('visibility', 'hidden');
    });

    const instructions = instructionEditor.value.split('\n');
    let parsedInstruction = null;
    let rawLine = "Không tìm thấy lệnh hợp lệ.";

    // (Logic parse lệnh - nên hỗ trợ nhiều loại)
     for (const line of instructions) {
         const trimmedLine = line.trim();
         if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('#')) { continue; }
         let result = rFormat.parseRFormatInstruction(trimmedLine);
         // Thêm parse cho I, D, B, CB... ở đây
         if (result && !result.error) { parsedInstruction = result; rawLine = result.raw || trimmedLine; break; }
         else if (result && result.error) { if (!parsedInstruction) { parsedInstruction = result; rawLine = result.raw || trimmedLine; } }
         else if (!result && !parsedInstruction) { parsedInstruction = { error: true, message: "Lệnh không nhận dạng được.", raw: trimmedLine }; rawLine = trimmedLine; }
     }

    // Xử lý kết quả phân tích
    let outputJson = {};
    if (!parsedInstruction || parsedInstruction.error) {
        if (!parsedInstruction) { outputJson = { status: "Không tìm thấy lệnh hợp lệ trong editor.", instruction: rawLine }; }
        else { outputJson = { status: "Lỗi: " + parsedInstruction.message, instruction: parsedInstruction.raw }; console.error("Lỗi phân tích:", parsedInstruction.message, "trên dòng:", parsedInstruction.raw); }
    } else { // Phân tích thành công
        outputJson = { status: `Đang mô phỏng lệnh ${parsedInstruction.type || 'Unknown'}-Format`, details: parsedInstruction };
        console.log("Đang mô phỏng:", parsedInstruction);

        let instructionGraph = null; // Đồ thị cho lệnh này
        let initialAnims = [];      // Điểm bắt đầu

        // --- XÁC ĐỊNH ĐỒ THỊ PHỤ THUỘC VÀ ĐIỂM BẮT ĐẦU ---
        // *** CẦN ĐỊNH NGHĨA ĐỒ THỊ NÀY CẨN THẬN CHO MỖI LỆNH ***
        if (parsedInstruction.type === 'R') {
             if (parsedInstruction.opcode === 'ADD' || parsedInstruction.opcode === 'SUB') {
                 console.log(`Định nghĩa đồ thị cho R-Format ${parsedInstruction.opcode}`);
                 instructionGraph = {
                    'anim-1': { next: [] },
                    'anim-2': { next: [] },
                    'anim-3': { next: ['anim-4', 'anim-5'] },
                    'anim-4': { next: ['anim-9'] },
                    'anim-5': { next: ['anim-6', 'anim-7', 'anim-8']},
                    'anim-6': { next: ['anim-2'] },
                    'anim-7': { next: [] },
                    'anim-8': { next: [] },
                    'anim-9': { next: ['anim-10', 'anim-16'] },
                    'anim-10': { next: ['anim-11', 'anim-12'] },
                    'anim-11': { next: [] },
                    'anim-12': { next: ['anim-13', 'anim-14'] },
                    'anim-13': { next: ['anim-30'] },
                    'anim-14': { next: ['anim-40', 'anim-41', 'anim-42', 'anim-43', 'anim-44', 'anim-45', 'anim-46', 'anim-47', 'anim-48', 'anim-49', 'anim-50'] },
                    'anim-15': { next: [] },
                    'anim-16': { next: ['anim-17', 'anim-20'] },
                    'anim-17': { next: ['anim-18', 'anim-19'] },
                    'anim-18': { next: [] },
                    'anim-19': { next: [] },
                    'anim-20': { next: ['anim-22', 'anim-23'] },
                    'anim-21': { next: ['anim-27'] },
                    'anim-22': { next: ['anim-24'] },
                    'anim-23': { next: [] },
                    'anim-24': { next: ['anim-25', 'anim-26'] },
                    'anim-25': { next: ['anim-38'] },
                    'anim-26': { next: [] },
                    'anim-27': { next: ['anim-28', 'anim-29'] },
                    'anim-28': { next: ['anim-37'] },
                    'anim-29': { next: [] },
                    'anim-30': { next: [] },
                    'anim-31': { next: [] },
                    'anim-32': { next: ['anim-33', 'anim-34'] },
                    'anim-33': { next: ['anim-35'] },
                    'anim-34': { next: ['anim-36'] },
                    'anim-35': { next: [] },
                    'anim-36': { next: [] },
                    'anim-37': { next: ['anim-31', 'anim-32'] },
                    'anim-38': { next: ['anim-39'] },
                    'anim-39': { next: ['anim-1'] },
                    'anim-40': { next: ['anim-21'] },
                    // 'anim-41': { next: [] },
                    // 'anim-42': { next: [] },
                    // 'anim-43': { next: [] },
                    'anim-44': { next: [] },
                    // 'anim-45': { next: [] },
                    // 'anim-46': { next: [] },
                    'anim-47': { next: [] },
                    'anim-48': { next: [] },
                    'anim-49': { next: ['anim-56'] },
                    'anim-50': { next: [] },
                    // 'anim-51': { next: [] },
                    // 'anim-52': { next: [] },
                    // 'anim-53': { next: [] },
                    // 'anim-54': { next: [] },
                    'anim-55': { next: [] },
                    'anim-56': { next: [] },
                 };
                 initialAnims = ['anim-3']; // Bắt đầu từ fetch
             }
             // else if (opcode === 'SUB') { instructionGraph = { ... }; initialAnims = ['anim-3']; }
             // ...
        }
        // else if (parsedInstruction.type === 'D') { ... }
        // ...

        // --- Bắt đầu chạy hoạt ảnh từ điểm khởi đầu ---
        if (instructionGraph && initialAnims.length > 0) {
            console.log(`Bắt đầu hoạt ảnh không đồng bộ cho ${parsedInstruction.opcode || parsedInstruction.type}`);
            initialAnims.forEach(startAnimId => {
                // Truyền đồ thị vào hàm trigger
                triggerAnimation(startAnimId, instructionGraph);
            });
            outputJson.status = `Đang tạo hoạt ảnh không đồng bộ cho ${parsedInstruction.opcode || parsedInstruction.type}`;
        } else {
            console.warn(`Không có đồ thị hoạt ảnh nào được định nghĩa cho lệnh: ${rawLine}`);
            outputJson.status = `Không có đồ thị hoạt ảnh cụ thể cho lệnh này.`;
        }
    }

    outputArea.textContent = JSON.stringify(outputJson, null, 2);
}

// --- **** START: Theme Toggle Functionality **** ---
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
    console.log("Theme toggled to:", newTheme);
}

// Load saved theme on startup
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light'; // Default to light
    applyTheme(savedTheme);
});
// --- **** END: Theme Toggle Functionality **** ---


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
         console.log("Entering Fullscreen");
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
        console.log("Exiting Fullscreen");
    }
}
// --- **** END: Fullscreen Functionality **** ---



// --- Gắn Bộ lắng nghe Sự kiện ---
// Đảm bảo SVG đã tải xong trước khi gắn sự kiện
window.addEventListener('load', () => {
    // Kiểm tra lại tham chiếu svg nếu cần
    // svg = document.querySelector('svg'); // Gán lại nếu chưa chắc chắn
    if(simulateButton) {
        simulateButton.addEventListener('click', simulateStep);
        console.log("Sự kiện click đã được gắn vào nút Simulate.");
    } else {
        console.error("Không tìm thấy nút Simulate!");
    }

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
         console.log("Theme toggle button listener attached.");
    } else {
        console.error("Theme toggle button not found!");
    }

    if(outputArea) {
    outputArea.textContent = JSON.stringify({ message: "Ready. Enter LEGv8 code. Shortcuts: (R)eset Zoom, (T)heme, F11 Fullscreen" }, null, 2);
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (event) => {
        // F11 for Fullscreen
        if (event.key === 'F11') {
             event.preventDefault(); // Prevent default browser fullscreen toggle
             toggleFullScreen();
        }
        // 't' or 'T' for Theme Toggle (avoid if typing)
        else if ((event.key === 't' || event.key === 'T') && event.target.tagName !== 'TEXTAREA') {
             toggleTheme();
        }
    });
    console.log("Keyboard listeners for F11 and T attached.");

});


// --- END OF FILE general.js ---
