// Định nghĩa các giá trị cố định sẽ được sử dụng trong mã.
import * as D_format from './d_format.js';
import * as R_format from './r_format.js';
import * as CB_format from './cb_format.js';
import * as I_format from './i_format.js';
import * as B_format from './b_format.js';
import * as update from '../script/register.js'
export const FORMAT_OPCODES = {
    R_FORMAT: {
        opcode: R_format.R_FORMAT_OPCODES, 
        update: update.RFormat,
    },
    D_FORMAT: {
        opcode: D_format.D_FORMAT_OPCODES, 
        update: update.DFormat 
    },
    I_FORMAT: {
        opcode: I_format.I_FORMAT_OPCODES, 
        update: update.IFormat 
    },
    CB_FORMAT: {
        opcode: CB_format.CB_FORMAT_OPCODES, 
        update: update.CBFormat 
    },
    B_FORMAT: {
        opcode: B_format.B_FORMAT_OPCODES, 
        update: update.BFormat 
    }
};

//|B.EQ|B.NE|B.LT|B.LO|B.LE|B.LS|B.GT|B.HI|B.GE|B.HS
export function parseFormatInstruction(line) {
    line = line.trim().toUpperCase(); // 1. Chuẩn hóa: Xóa khoảng trắng thừa đầu/cuối và chuyển thành chữ HOA.
    if (!line || line.startsWith('//') || line.startsWith('#')) {
        return null; 
    }
    line = line.replace(/\/\/.*$/g, '').trim();
    //line = line.replace(/\/\/.*$/g, '').replace(/.*$/g, '').trim();
    const specialRegisters = {
        SP: 'X28',
        FP: 'X29',
        LR: 'X30',
        XZR: 'X31'
    };
    line = line.replace(/\b(SP|FP|LR|XZR)\b/g, match => specialRegisters[match]);
    const rFormatRegex = /^\s*(ADD|SUB|AND|ORR|EOR|ADDS|SUBS)\s+X(\d+)\s*,\s*X(\d+)\s*,\s*X(\d+)\s*(?:#.*)?$/i;
    const rFormatRegexNumber = /^\s*(LSL|LSR)\s+X(\d+)\s*,\s*X(\d+)\s*,\s*#(\d+)\s*(?:#.*)?$/i;
    const rFormatBranchR = /^\s*(BR)\s+X(\d+)\s*(?:#.*)?$/i;
    const dFormaxRegex = /^\s*(LDUR|STUR)\s+X(\d+)\s*,\s*\[X(\d+)\s*,\s*#(-?\d+)\s*\](?:#.*)?$/i;
    const iFormatRegex = /^\s*(ADDI|SUBI|ANDI|ORRI|EORI|ADDIS|SUBIS)\s+X(\d+)\s*,\s*X(\d+)\s*,\s*#(\d+)\s*(?:#.*)?$/i;
    const CBFormaxRegex = /^\s*(CBZ|CBNZ)\s+X(\d+)\s*,\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:#.*)?$/i;
    const labelRegex = /^\s*([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/;
    const bFormaxRegex = /^\s*(B|BL)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:#.*)?$/i;
    // console.log("match: ", line.match(bFormaxRegex));
    let convert = line => {
        if (line.match(rFormatRegex)) { 
            return R_format.convert(line, rFormatRegex);
        } else if (line.match(rFormatRegexNumber)) {
            return R_format.convertI(line, rFormatRegexNumber);
        } else if (line.match(rFormatBranchR)) {
            return R_format.convertBranch(line, rFormatBranchR);
        } 
        else if (line.match(dFormaxRegex)) {
            return D_format.convert(line, dFormaxRegex);
        } else if (line.match(CBFormaxRegex)) {
            return CB_format.convert(line, CBFormaxRegex);
        } else if (line.match(iFormatRegex)) {
            return I_format.convert(line, iFormatRegex);
        }
        else if (line.match(bFormaxRegex)) {
            return B_format.convert(line, bFormaxRegex);
        }
        else { 
            return { 
                error: true,
                message: `Lỗi cú pháp: Lệnh không nhận dạng được hoặc sai định dạng.`,
                raw: line
            };
        }
    };
    let normalForm = convert(line);
    if (normalForm?.error) {
        if (line.match(labelRegex)) {
            const match = line.match(labelRegex);
            let label = match[1]; 
            line = match[2]; 
            let tmp = convert(line);
            return {
                ...tmp,
                label: label
            }
        }
        else return normalForm;
    }
    else return normalForm;
}

export function normalizeText(text) {
    const LABEL_WIDTH = 9;
    const OPCODE_WIDTH = 7;

    const instructions = text.split('\n').filter(line => {
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('#');
    });

    const formattedInstructions = instructions.map(line => {
        const labelRegex = /^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/;
        const match = line.match(labelRegex);

        if (match) {
            const label = match[1].toUpperCase();
            const instruction = match[2].trim().toUpperCase();
            const [opcode, ...operands] = instruction.split(/\s+/);
            return `${(label + ':').padEnd(LABEL_WIDTH)} ${opcode.padEnd(OPCODE_WIDTH)} ${operands.join(' ')}`;
        } else {
            const cleanLine = line.trim().toUpperCase();
            const [opcode, ...operands] = cleanLine.split(/\s+/);
            return `${''.padEnd(LABEL_WIDTH)} ${opcode.padEnd(OPCODE_WIDTH)} ${operands.join(' ')}`;
        }
    });

    return formattedInstructions.join('\n');
}
