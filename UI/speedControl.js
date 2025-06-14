import { activeTimeouts } from '../script/main.js'

export const speedMultipliers = [0.25, 0.5, 1, 2, 4];

let speedSlider = null;
let speedLabel = null;
let svgElement = null; // Vẫn cần để tìm các animation

function updateAnimationSpeeds() {
    if (!speedSlider || !svgElement) return;

    const sliderValue = parseInt(speedSlider.value, 10);
    const newMultiplier = speedMultipliers[sliderValue];

    // Cập nhật nhãn hiển thị
    speedLabel.textContent = `${newMultiplier.toFixed(2)}x`;

    const allAnimations = svgElement.querySelectorAll('animateMotion[id]');
    allAnimations.forEach(animationElement => {
        if (animationElement.playbackRate !== undefined) {
            animationElement.playbackRate = newMultiplier;
        }
    });

    const now = Date.now();
    for (const animId in activeTimeouts) {
        const timeoutData = activeTimeouts[animId];
        
        // Hủy timeout cũ đi
        clearTimeout(timeoutData.id);

        // Tính thời gian đã trôi qua kể từ khi timeout được đặt
        const elapsedTime = now - timeoutData.startTime;

        // Tính thời gian còn lại của animation (phần chưa chạy) ở tốc độ 1x
        const remainingBaseDuration = timeoutData.baseDuration - elapsedTime;

        // Nếu đã quá thời gian thì gọi callback ngay và xóa khỏi danh sách
        if (remainingBaseDuration <= 0) {
            timeoutData.callback();
            delete activeTimeouts[animId];
            continue;
        }

        // Tính thời gian chờ mới dựa trên tốc độ mới
        const newRemainingWaitTime = remainingBaseDuration / newMultiplier;

        // Đặt lại timeout với thời gian mới
        const newTimeoutId = setTimeout(timeoutData.callback, newRemainingWaitTime);
        
        // Cập nhật lại thông tin trong activeTimeouts
        // Quan trọng: startTime và baseDuration không đổi, chỉ có ID thay đổi
        activeTimeouts[animId].id = newTimeoutId;
    }
}

export function initialize(svg) {
    svgElement = svg;
    speedSlider = document.getElementById('speed-slider');
    speedLabel = document.getElementById('speed-label');

    if (!speedSlider || !speedLabel || !svgElement) {
        console.error("Không tìm thấy các phần tử điều khiển tốc độ.");
        return;
    }

    speedSlider.addEventListener('input', updateAnimationSpeeds);

    updateAnimationSpeeds();
}
