// script/animationControl.js

/**
 * @fileoverview Manages the pausing and resuming of SVG animations and associated JavaScript timers.
 */

// --- Trạng thái toàn cục cho module này ---
// let isPaused = false;
// Mảng để lưu các timer đã bị tạm dừng để có thể khôi phục lại
let pausedTimeouts = []; 

/**
 * Tạm dừng tất cả các animation SVG và các timer JavaScript đang chờ.
 * @param {SVGElement} svgElement - Phần tử SVG gốc chứa các animation.
 * @param {Object} activeTimeouts - Đối tượng chứa các timer đang hoạt động từ general.js.
 */
// export function pause(svgElement, activeTimeouts) {
//     if (isPaused || !svgElement) return;
    
//     console.log("Pausing simulation...");
//     isPaused = true;
    
//     // 1. Đóng băng tất cả animation trực quan trong SVG
//     svgElement.pauseAnimations();

//     // 2. Tạm dừng các timer JavaScript
//     const pauseTime = Date.now();
//     for (const animId in activeTimeouts) {
//         if (Object.hasOwnProperty.call(activeTimeouts, animId)) {
//             const timeoutData = activeTimeouts[animId];
            
//             // Xóa timer hiện tại
//             clearTimeout(timeoutData.id);

//             // Tính toán và lưu thời gian còn lại
//             const remainingTime = timeoutData.firesAt - pauseTime;
            
//             // Lưu thông tin cần thiết để khôi phục
//             pausedTimeouts.push({
//                 animId: animId,
//                 callback: timeoutData.callback,
//                 remainingTime: remainingTime > 0 ? remainingTime : 0 // Đảm bảo không có thời gian âm
//             });
//         }
//     }
    
//     // Xóa các timer đang hoạt động vì chúng ta đã quản lý chúng trong pausedTimeouts
//     for (const key in activeTimeouts) {
//         delete activeTimeouts[key];
//     }
// }

/**
 * Tiếp tục các animation SVG và các timer JavaScript đã bị tạm dừng.
 * @param {SVGElement} svgElement - Phần tử SVG gốc.
 * @param {Object} activeTimeouts - Đối tượng để đăng ký lại các timer đã được khôi phục.
 */
// export function resume(svgElement, activeTimeouts) {
//     // if (!isPaused || !svgElement) return;
//     if (!svgElement) return;

//     console.log("Resuming simulation...");
//     // isPaused = false;

//     // 1. Bỏ đóng băng các animation trong SVG
//     svgElement.unpauseAnimations();

//     // 2. Khởi động lại các timer JavaScript với thời gian còn lại
//     pausedTimeouts.forEach(pausedData => {
//         // Tạo một timer mới với callback gốc và thời gian còn lại
//         const newTimeoutId = setTimeout(pausedData.callback, pausedData.remainingTime);

//         // Đăng ký lại timer này vào danh sách đang hoạt động
//         activeTimeouts[pausedData.animId] = {
//             id: newTimeoutId,
//             firesAt: Date.now() + pausedData.remainingTime,
//             callback: pausedData.callback
//         };
//     });

//     // Xóa danh sách các timer đã tạm dừng vì chúng đã được khôi phục
//     pausedTimeouts = [];
// }

/**
 * Trả về trạng thái tạm dừng hiện tại.
 * @returns {boolean} True nếu simulation đang bị tạm dừng.
 */
// export function getIsPaused() {
//     return isPaused;
// }
