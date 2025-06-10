import * as setting from '../setting/setting.js'
import * as normalR from '../script/Animation/R_format/normal.js';
import * as flagR from '../script/Animation/R_format/addFlag.js';
import * as branchRegister from '../script/Animation/R_format/BranchRegister.js';
import * as flagI from '../script/Animation/I_format/addFlag.js';
import * as normalI from '../script/Animation/I_format/normal.js';
import * as ldur from '../script/Animation/D_format/ldur.js';
import * as stur from '../script/Animation/D_format/stur.js';
import * as CBZ_NotBranch from '../script/Animation/CB_format/CBZ_notBranch.js';
import * as CBZ_Branch from '../script/Animation/CB_format/CBZ_Branch.js';
import * as Branch from '../script/Animation/B_format/branch.js';
import * as BranchLink from '../script/Animation/B_format/BracnhLink.js';
import {setTextById} from './logic_bit_set.js'

// Hàm tiện ích để lấy phần tử SVG bằng ID (An toàn hơn)
export function getElement(svg, id) {
    if (!svg) {
        console.error("Tham chiếu SVG chưa sẵn sàng.");
        return null;
    }
    try {
        const element = svg.getElementById(id);
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
    const lightCircles = document.querySelectorAll('[id^="lightCircle-"]');
    lightCircles.forEach(circle => circle.setAttribute('visibility', 'hidden'));
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
export function resetLogicBit() {
    for (let key in setting.setBitOfInstruction["ADD"]) {
        setTextById(key, "");
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

export function calparseFormatInstruction(result) {
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

export function calculateEndAction(opcode, animId, branch = false) {
    let endAction = null;
    if (opcode === 'ADD' || opcode === 'ORR' || opcode === 'SUB' || opcode === 'EOR' || opcode === 'AND') {
        endAction = normalR.animationEndActions;
    }
    else if (opcode === 'BR') {
        endAction = branchRegister.animationEndActions;
    }
    else if(opcode === 'ADDI' || opcode === 'ORRI' || opcode === 'SUBI' || opcode === 'EORI' || opcode === 'ANDI') {
        endAction = normalI.animationEndActions;
    }
    else if (opcode === 'ADDS' || opcode === 'SUBS') {
        endAction = flagR.animationEndActions;
    }
    else if (opcode === 'ADDIS' || opcode === 'SUBIS') {
        endAction = flagI.animationEndActions;
    }
    else if (opcode === 'LDUR' || opcode === 'STUR') {
        if (opcode === 'LDUR') endAction = ldur.animationEndActions;
        else endAction = stur.animationEndActions;
    }
    else if (opcode === 'CBZ' || opcode === 'CBNZ') {
        if (branch) endAction = CBZ_Branch.animationEndActions;
        else endAction = CBZ_NotBranch.animationEndActions;
    }
    else if (opcode === 'B' || opcode === 'BL') {
        if (opcode === 'B') endAction = Branch.animationEndActions;
        else endAction = BranchLink.animationEndActions;
    }
    return endAction[animId];
}

export function calculateGraph(opcode, branch = false) {
    let instructionGraph = null;
    if (opcode === 'ADD' || opcode === 'SUB' || opcode === 'ORR' || opcode === 'EOR' || opcode === 'AND') {
        instructionGraph = normalR.animation();
    }
    else if (opcode === 'ADDI' || opcode === 'SUBI' || opcode === 'ORRI' || opcode === 'EORI' || opcode === 'ANDI') {
        instructionGraph = normalI.animation();
    }
    else if (opcode === 'ADDS' || opcode === 'SUBS') {
        instructionGraph = flagR.animation();
    }
    else if (opcode === 'ADDIS' || opcode === 'SUBIS') {
        instructionGraph = flagI.animation();
    }
    else if (opcode === 'LDUR' || opcode === 'STUR') {
        if (opcode === 'LDUR') instructionGraph = ldur.animation();
        else instructionGraph = stur.animation();
    }
    else if (opcode === 'CBZ' || opcode === 'CBNZ') {
        instructionGraph = branch ? CBZ_Branch.animation() : CBZ_NotBranch.animation();
    }
    else if (opcode === 'B' || opcode === 'BL') {
        if (opcode === 'B') instructionGraph = Branch.animation();
        else instructionGraph = BranchLink.animation();
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
    else if (opcode === 'ADDS' || opcode === 'SUBS') {
        cnt = [2, 999, 2, 3];
    }
    else if (opcode === 'ADDIS' || opcode === 'SUBIS') {
        cnt = [2, 999, 2, 3];
    }
    else if (opcode === 'LDUR' || opcode === 'STUR') { // D-format
        if (opcode === 'LDUR') {
            cnt = [1, 3, 1, 3];
        }
        else {
            cnt = [1, 999, 1, 3];
        }
    }
    else if (opcode === 'CBZ' || opcode === 'CBNZ') {
        cnt = [1, 999, 1, 2]
    }
    else if (opcode === 'B' || opcode === 'BL') {
        cnt = [1, 999, 999, 999];
        requirements["and-gate2"] = 1;
    }
    else {
        cnt = [1, 2, 2, 2];
    }
    for(let i = 0; i < additionComponent.length; i++) {
        requirements[additionComponent[i]] = cnt[i];
    }
    return requirements;
}