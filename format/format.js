// Định nghĩa các giá trị cố định sẽ được sử dụng trong mã.
export const R_FORMAT_OPCODES = ['ADD', 'SUB', 'AND', 'OR']; // Danh sách các mã lệnh (opcode) R-Format được hỗ trợ
export const D_format_OPCODES = ['LDUR', 'SDUR']
export const CB_format_OPCODES = ['CBZ']
import * as D_format from './d_format.js';
import * as R_format from './r_format.js';
import * as CB_format from './cb_format.js';

export function parseRFormatInstruction(line) {
    line = line.trim().toUpperCase(); // 1. Chuẩn hóa: Xóa khoảng trắng thừa đầu/cuối và chuyển thành chữ HOA.
    if (!line || line.startsWith('//') || line.startsWith('#')) {
        return null; // 2. Bỏ qua: Nếu dòng trống hoặc là comment thì không xử lý.
    }

    // 3. Biểu thức chính quy (Regex) cho định dạng R: OPCODE Rd, Rn, Rm
    //    - `^\s*`: Bắt đầu dòng, có thể có khoảng trắng.
    //    - `(ADD|SUB|AND|OR)`: Phải là một trong các opcode này (nhóm 1).
    //    - `\s+X(\d+)\s*`: Phải có khoảng trắng, chữ 'X', rồi một hoặc nhiều chữ số (thanh ghi Rd, nhóm 2), có thể có khoảng trắng sau đó.
    //    - `,\s*X(\d+)\s*`: Dấu phẩy, có thể có khoảng trắng, 'X', chữ số (thanh ghi Rn, nhóm 3).
    //    - `,\s*X(\d+)\s*`: Dấu phẩy, có thể có khoảng trắng, 'X', chữ số (thanh ghi Rm, nhóm 4).
    //    - `(?:#.*)?$`: Có thể có comment bắt đầu bằng # cho đến hết dòng (không bắt nhóm này), kết thúc dòng.
    //    - `i`: Không phân biệt chữ hoa/thường khi khớp opcode.
    const rFormatRegex = /^\s*(ADD|SUB|AND|OR|XOR)\s+X(\d+)\s*,\s*X(\d+)\s*,\s*X(\d+)\s*(?:#.*)?$/i;
    const rFormatRegexNumber = /^\s*(LSL|LSR)\s+X(\d+)\s*,\s*X(\d+)\s*,\s*(\d+)\s*(?:#.*)?$/i;
    const dFormaxRegex = /^\s*(LDUR|STUR)\s+X(\d+)\s*,\s*\[X(\d+)\s*,\s*(-?\d+)\s*\](?:#.*)?$/i;
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
    }
    else { 
        return { 
            error: true,
            message: `Lỗi cú pháp: Lệnh không nhận dạng được hoặc sai định dạng R-Format. Mong đợi: OPCODE Xd, Xn, Xm`,
            raw: line
        };
    }
}

// --- Điều khiển Hoạt ảnh ---

// **QUAN TRỌNG:** Danh sách ID của các hoạt ảnh (<animateMotion>) cần chạy ĐỒNG THỜI cho một lệnh R-Format.
// Các ID này phải khớp chính xác với ID trong file SVG của bạn và đại diện cho luồng dữ liệu/điều khiển của lệnh R.
export const R_FORMAT_ANIMATION_IDS = [
    'anim-1',
    'anim-2',
    'anim-3',
    'anim-4',
    'anim-5',
    'anim-6',
    'anim-7',
    'anim-8',
    'anim-9',
    'anim-10',
    'anim-11',
    'anim-12',
    'anim-13',
    'anim-14',
    // 'anim-15',
    'anim-16',
    'anim-17',
    'anim-18',
    'anim-19',
    'anim-20',
    'anim-21',
    'anim-22',
    'anim-23',
    'anim-24',
    'anim-25',
    'anim-26',
    'anim-27',
    'anim-28',
    'anim-29',
    'anim-30',
    'anim-31',
    'anim-32',
    'anim-33',
    'anim-34',
    'anim-35',
    'anim-36',
    'anim-37',
    'anim-38',
    'anim-39',
    'anim-40',
    'anim-41',
    'anim-42',
    'anim-43',
    'anim-44',
    'anim-45',
    'anim-46',
    'anim-47',
    'anim-48',
    'anim-49',
    'anim-50',
    'anim-51',
    'anim-52',
    'anim-53',
    'anim-54',
    'anim-55',
    'anim-56',
];

