// Định nghĩa các giá trị cố định sẽ được sử dụng trong mã.
import * as D_format from './d_format.js';
import * as R_format from './r_format.js';
import * as CB_format from './cb_format.js';
import * as I_format from './i_format.js';
import * as update from '../script/register.js'
export const FORMAT_OPCODES = {
    R_FORMAT: {
        opcode: R_format.R_FORMAT_OPCODES, 
        update: update.RFormat 
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
    // B_FORMAT: {
    //     opcode: format.B_FORMAT_OPCODES, 
    //     update: update.BFormat 
    // }
};
export function parseRFormatInstruction(line) {
    line = line.trim().toUpperCase(); // 1. Chuẩn hóa: Xóa khoảng trắng thừa đầu/cuối và chuyển thành chữ HOA.
    if (!line || line.startsWith('//') || line.startsWith('#')) {
        return null; 
    }
    const rFormatRegex = /^\s*(ADD|SUB|AND|ORR|EOR)\s+X(\d+)\s*,\s*X(\d+)\s*,\s*X(\d+)\s*(?:#.*)?$/i;
    const rFormatRegexNumber = /^\s*(LSL|LSR)\s+X(\d+)\s*,\s*X(\d+)\s*,\s*#(\d+)\s*(?:#.*)?$/i;
    const dFormaxRegex = /^\s*(LDUR|STUR)\s+X(\d+)\s*,\s*\[X(\d+)\s*,\s*#(-?\d+)\s*\](?:#.*)?$/i;
    const iFormatRegex = /^\s*(ADDI|SUBI|ANDI|ORRI|EORI)\s+X(\d+)\s*,\s*X(\d+)\s*,\s*#(\d+)\s*(?:#.*)?$/i;
    const CBFormaxRegex = /^\s*(CBZ)\s+X(\d+)\s*,\s*(-?\d+)\s*(?:#.*)?$/i;
    const BFormaxRegex = /^\s*(B)\s+(-?\d+)\s*(?:#.*)?$/i;
    if (line.match(rFormatRegex)) { 
        console.log("Line", line.match(rFormatRegex));
        return R_format.convert(line, rFormatRegex);
    } else if (line.match(rFormatRegexNumber)) {
        return R_format.convertI(line, rFormatRegexNumber);
    } else if (line.match(dFormaxRegex)) {
        return D_format.convert(line, dFormaxRegex);
    } else if (line.match(CBFormaxRegex)) {
        return CB_format.convert(line, CBFormaxRegex);
    } else if (line.match(iFormatRegex)) {
        return I_format.convert(line, iFormatRegex);
    }
    else { 
        return { 
            error: true,
            message: `Lỗi cú pháp: Lệnh không nhận dạng được hoặc sai định dạng.`,
            raw: line
        };
    }
}
