import * as setting from '../setting/setting.js'
import * as normalR from '../script/Animation/R_format/normal.js';
import * as normalI from '../script/Animation/I_format/normal.js';
import * as ldur from '../script/Animation/D_format/ldur.js';
import * as stur from '../script/Animation/D_format/stur.js';

// Hàm tiện ích để lấy phần tử SVG bằng ID (An toàn hơn)
export function getElement(svg, id) {
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
export function hideDotForAnim(svg, runningAnimations, animId) {
    const dotId = animId.replace(/^anim-/, 'dot-');
    const dot = getElement(svg, dotId);
    if (dot) {
        dot.style.visibility = 'hidden';
    }
    runningAnimations.delete(animId);
}

export function hideAllDots(svg) {
    try {
        const allDots = svg.querySelectorAll('.data-dot');
        allDots.forEach(dot => {
            if (dot) {
                 dot.style.visibility = 'hidden';
            }
        });
    } catch (e) {
        console.error("Lỗi khi ẩn các chấm tròn:", e);
    }
}

// Hàm hủy tất cả các timeout đang chờ (khi reset)
export function cancelAllPendingTimeouts(activeTimeouts, runningAnimations) {
     const keys = Object.keys(activeTimeouts);
     if (keys.length > 0) {
        keys.forEach(animId => {
            clearTimeout(activeTimeouts[animId]);
        });
     }
    activeTimeouts = {}; // Reset đối tượng lưu timeout
    runningAnimations.clear(); // Reset tập anim đang chạy
}

// Remove All Highlights Function **** ---
export function removeAllHighlights(svg) {
    try {
       const highlightedElements = svg.querySelectorAll('.highlighted');
       highlightedElements.forEach(el => {
           el.classList.remove('highlighted');
       });
       // // console.log("Removed all highlights.");
   } catch (e) {
       console.error("Lỗi khi xóa highlights:", e);
   }
}

// Highlight Function 
export function highlightComponent(svg, componentId) {
    if (!componentId) return;
    const componentElement = getElement(svg, componentId);
    if (componentElement) {
        // // console.log(`Highlighting ${componentId}`); // Debug
        componentElement.classList.add('highlighted');

        // Schedule removal of highlight
        setTimeout(() => {
            componentElement.classList.remove('highlighted');
            // // console.log(`Unhighlighting ${componentId}`); // Debug
        }, setting.HIGHLIGHT_DURATION_MS);
    } else {
        console.warn(`Component to highlight not found: ${componentId}`);
    }
}
export function setMuxSelect(muxId, selected) {
    const zero = document.getElementById(`${muxId}-0`);
    const one = document.getElementById(`${muxId}-1`);
    if (zero && one) {
        zero.setAttribute('fill', selected === 0 ? 'red' : 'black');
        one.setAttribute('fill', selected === 1 ? 'red' : 'black');
    }
}

export function toggleLight(id) {
    const circle = document.getElementById(id);
    if (circle.getAttribute('visibility') === 'hidden') {
        circle.setAttribute('visibility', 'visible');
    } else {
        circle.setAttribute('visibility', 'hidden');
    }
}

export function calculateEndAction(opcode, animId) {
    let endAction = null;
    if (opcode === 'ADD' || opcode === 'ORR' || opcode === 'SUB' || opcode === 'EOR' || opcode === 'AND') {
        endAction = normalR.animationEndActions;
    }
    else if(opcode === 'ADDI' || opcode === 'ORRI' || opcode === 'SUBI' || opcode === 'EORI' || opcode === 'ANDI') {
        endAction = normalI.animationEndActions;
    }
    else if (opcode === 'LDUR' || opcode === 'STUR') {
        if (opcode === 'LDUR') endAction = ldur.animationEndActions;
        else endAction = stur.animationEndActions;
    }
    return endAction[animId];
}

export function calParseInstruction(result) {
    let parsedInstruction = null;
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
    return parsedInstruction;
}

export function calculateGraph(opcode) {
    let instructionGraph = null;
    if (opcode === 'ADD' || opcode === 'SUB' || opcode === 'ORR' || opcode === 'EOR' || opcode === 'AND') {
        instructionGraph = normalR.animation();
    }
    else if (opcode === 'ADDI' || opcode === 'SUBI' || opcode === 'ORRI' || opcode === 'EORI' || opcode === 'ANDI') {
        instructionGraph = normalI.animation();
    }
    else if (opcode === 'LDUR' || opcode === 'STUR') {
        if (opcode === 'LDUR') instructionGraph = ldur.animation();
        else instructionGraph = stur.animation();
    }
    return instructionGraph;
}

let additionComponent = ["flags", "data-memory", "alu-control", "alu"];
export function calRequirements(opcode) {
    let requirements = setting.componentInputRequirements;
    let cnt;
    if (opcode === 'ADD' || opcode === 'SUB' || 
        opcode === 'ORR' || opcode === 'EOR' || opcode === 'AND'
    ) { // R-format
        cnt = [1, 999, 2, 3];
    }
    else if (opcode === 'ADDI' || opcode === 'SUBI' || 
        opcode === 'ORRI' || opcode === 'EORI' || opcode === 'ANDI'
    ) {
        cnt = [1, 999, 2, 3];
    }
    else if (opcode === 'LDUR' || opcode === 'STUR') { // D-format
        if (opcode === 'LDUR') {
            cnt = [1, 3, 1, 3];
        }
        else {
            cnt = [1, 999, 1, 3];
        }
    }
    else {
        cnt [0, 0, 0, 0];
    }
    for(let i = 0; i < additionComponent.length; i++) {
        requirements[additionComponent[i]] = cnt[i];
    }
    return requirements;
}