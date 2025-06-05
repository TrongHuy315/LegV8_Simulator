// --- START OF FILE general.js ---

import * as rFormat from '../format/r_format.js' // Và các module parse khác nếu cần
import * as addInstruction from './Animation/R_format/add.js';
import * as utilUI from '../UI/util.js';
import * as setting from '../setting/setting.js';

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
    if (isNaN(value)) return setting.DEFAULT_ANIMATION_DURATION_MS;
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
        // // console.log(`Bỏ qua trigger cho ${animId} (không có trong graph hoặc đang chạy)`);
        return;
    }

    const animData = graph[animId];
    const nextAnims = animData.next || []; // Lấy danh sách anim tiếp theo

    const animationElement = utilUI.getElement(svg, animId);
    const dotId = animId.replace(/^anim-/, 'dot-');
    const dotElement = utilUI.getElement(svg, dotId);

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

    // console.log(`Triggering ${animId} (SVG dur: ${durationAttr} -> ${durationMs}ms)`);

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
            // // console.log(`Hoạt ảnh ${animId} hoàn thành.`);
            if(dotElement) {
                utilUI.hideDotForAnim(svg, runningAnimations, animId); // Ẩn chấm tròn (nếu có)
            } else {
                runningAnimations.delete(animId); // Vẫn xóa khỏi running nếu không có dot
            }
            delete activeTimeouts[animId]; // Xóa timeout đã hoàn thành

            // --- **** START: Check and Trigger Highlight **** ---
            const componentIdToHighlight = setting.animationToComponentHighlight[animId];
            if (componentIdToHighlight) {
                utilUI.highlightComponent(svg, componentIdToHighlight);
            }
            // --- **** END: Check and Trigger Highlight **** ---

            // --- **** START: Execute End Action from Map **** ---
            const endAction = rFormat.addAnimationEndActions[animId];
            if (typeof endAction === 'function') {
                // console.log(`Executing end action for ${animId}`);
                endAction(); // Gọi hàm được định nghĩa trong map
            }
            // --- **** END: Execute End Action from Map ****

            // Kích hoạt các hoạt ảnh tiếp theo trong đồ thị
            // // console.log(`Kích hoạt tiếp theo từ ${animId}:`, nextAnims);
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


// --- Hàm Thực hiện một Bước Mô phỏng ---
function simulateStep(instruction) {
    // *** Reset trạng thái ***
    // utilUI.cancelAllPendingTimeouts(activeTimeouts, runningAnimations); // <-- HỦY TẤT CẢ TIMEOUT CŨ
    // utilUI.hideAllDots(svg);              // <-- Ẩn tất cả chấm tròn
    // utilUI.removeAllHighlights(svg);
    return new Promise((resolve) => {
        const lightCircles = document.querySelectorAll('[id^="lightCircle-"]');
        lightCircles.forEach(lightCircle => {
            lightCircle.setAttribute('visibility', 'hidden');
        });

        // const instructions = instructionEditor.value.split('\n');
        // console.log("instructions: ", instructions);
        let parsedInstruction = null;
        let rawLine = "Không tìm thấy lệnh hợp lệ.";

        console.log("instruction: ", instruction);
        const trimmedLine = instruction.trim();
        if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('#')) { 
            return; 
        }
        let result = rFormat.parseRFormatInstruction(trimmedLine);
        console.log(result);
        // Thêm parse cho I, D, B, CB... ở đây
        if (result && result.error) { 
            if (!parsedInstruction) { 
                parsedInstruction = result; 
                rawLine = result.raw || trimmedLine; 
            } 
        }
        else if (!result && !parsedInstruction) { 
            parsedInstruction = { error: true, message: "Lệnh không nhận dạng được.", raw: trimmedLine }; 
            rawLine = trimmedLine; 
        }
        else if (result && !result.error) { 
            parsedInstruction = result; 
            rawLine = result.raw || trimmedLine; 
            // break; 
        }
        let outputJson = {};
        if (!parsedInstruction || parsedInstruction.error) {
            if (!parsedInstruction) { 
                outputJson = { 
                    status: "Không tìm thấy lệnh hợp lệ trong editor.", 
                    instruction: rawLine 
                }; 
            }
            else { 
                outputJson = { 
                    status: "Lỗi: " + parsedInstruction.message, 
                    instruction: parsedInstruction.raw 
                }; 
                console.error("Lỗi phân tích:", parsedInstruction.message, "trên dòng:", parsedInstruction.raw); 
            }
        } else { 
            outputJson = { 
                status: `Đang mô phỏng lệnh ${parsedInstruction.type || 'Unknown'}-Format`, 
                details: parsedInstruction 
            };

            let instructionGraph = null; // Đồ thị cho lệnh này
            let initialAnims = [];      // Điểm bắt đầu

            // --- XÁC ĐỊNH ĐỒ THỊ PHỤ THUỘC VÀ ĐIỂM BẮT ĐẦU ---
            // *** CẦN ĐỊNH NGHĨA ĐỒ THỊ NÀY CẨN THẬN CHO MỖI LỆNH ***
            if (parsedInstruction.type === 'R') {
                if (parsedInstruction.opcode === 'ADD' || parsedInstruction.opcode === 'SUB') {
                    // console.log(`Định nghĩa đồ thị cho R-Format ${parsedInstruction.opcode}`);
                    instructionGraph = addInstruction.animationAdd();
                    initialAnims = ['anim-3']; // Bắt đầu từ fetch
                }
            }

            // --- Bắt đầu chạy hoạt ảnh từ điểm khởi đầu ---
            if (instructionGraph && initialAnims.length > 0) {
                // console.log(`Bắt đầu hoạt ảnh không đồng bộ cho ${parsedInstruction.opcode || parsedInstruction.type}`);
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
        setTimeout(() => {
            resolve();
        }, 10000);
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


// --- Gắn Bộ lắng nghe Sự kiện ---
// Đảm bảo SVG đã tải xong trước khi gắn sự kiện
window.addEventListener('load', () => {
    // Kiểm tra lại tham chiếu svg nếu cần
    // svg = document.querySelector('svg'); // Gán lại nếu chưa chắc chắn
    if(simulateButton) {
        simulateButton.addEventListener('click', async () => {
            utilUI.cancelAllPendingTimeouts(activeTimeouts, runningAnimations); // <-- HỦY TẤT CẢ TIMEOUT CŨ
            utilUI.hideAllDots(svg);              // <-- Ẩn tất cả chấm tròn
            utilUI.removeAllHighlights(svg);
            const instructions = instructionEditor.value.split('\n').filter(line => {
                const trimmed = line.trim();
                return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('#');
            });
            for (let instruction of instructions) {
                await simulateStep(instruction);
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
    // console.log("Keyboard listeners for F11 and T attached.");

});


// --- END OF FILE general.js ---
