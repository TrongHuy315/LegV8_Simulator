// Định nghĩa các giá trị cố định sẽ được sử dụng trong mã.
export const R_FORMAT_OPCODES = ['ADD', 'SUB', 'AND', 'OR']; // Danh sách các mã lệnh (opcode) R-Format được hỗ trợ

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
    const rFormatRegex = /^\s*(ADD|SUB|AND|OR)\s+X(\d+)\s*,\s*X(\d+)\s*,\s*X(\d+)\s*(?:#.*)?$/i;
    const match = line.match(rFormatRegex); // Thử khớp dòng lệnh với Regex.

    if (match) { // 4. Nếu khớp thành công:
        const opcode = match[1].toUpperCase(); // Lấy opcode từ nhóm 1.
        const rd = parseInt(match[2], 10); // Lấy số thanh ghi đích (Rd) từ nhóm 2, chuyển thành số nguyên.
        const rn = parseInt(match[3], 10); // Lấy số thanh ghi nguồn 1 (Rn) từ nhóm 3.
        const rm = parseInt(match[4], 10); // Lấy số thanh ghi nguồn 2 (Rm) từ nhóm 4.

        // 5. Kiểm tra tính hợp lệ cơ bản (ví dụ: số thanh ghi phải từ 0 đến 31).
        if (rd > 31 || rn > 31 || rm > 31) {
            return { // Trả về đối tượng lỗi nếu số thanh ghi không hợp lệ.
                error: true,
                message: `Số thanh ghi không hợp lệ (phải từ 0-31).`,
                raw: line // Giữ lại dòng lệnh gốc gây lỗi.
            };
        }

        // 6. Trả về đối tượng JSON mô tả lệnh đã được phân tích thành công.
        return {
            type: 'R', // Loại lệnh là R-Format.
            opcode: opcode, // Mã lệnh.
            rd: rd, // Thanh ghi đích.
            rn: rn, // Thanh ghi nguồn 1.
            rm: rm, // Thanh ghi nguồn 2.
            raw: line // Dòng lệnh gốc.
        };
    } else { // 7. Nếu không khớp với Regex R-Format:
        // Có thể thêm logic phân tích các định dạng khác (I, D, B...) ở đây sau này.
        return { // Trả về đối tượng lỗi cú pháp.
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

function toggleLight(id) {
    const circle = document.getElementById(id);
    if (circle.getAttribute('visibility') === 'hidden') {
        circle.setAttribute('visibility', 'visible');
    } else {
        circle.setAttribute('visibility', 'hidden');
    }
}

export const addAnimationEndActions = {
    'anim-1': () => toggleLight('lightCircle-pc'),
    'anim-11': () => toggleLight('lightCircle-muxregwritedest-top'),
    'anim-18': () => toggleLight('lightCircle-muxregwritedest-bottom'),
    'anim-40': () => {
        toggleLight('lightCircle-muxregwritedest-top'),
        toggleLight('lightCircle-muxregwritedest-bottom')
    },
    'anim-28': () => toggleLight('lightCircle-muxalusrc-bottom'),
    'anim-26': () => toggleLight('lightCircle-muxalusrc-bottom'),
    'anim-30': () => toggleLight('lightCircle-alu-top'),
    'anim-37': () => toggleLight('lightCircle-alu-top'),
    'anim-35': () => toggleLight('lightCircle-muxwriteback-top'),
    'anim-34': () => toggleLight('lightCircle-muxwriteback-top'),
    'anim-8': () => toggleLight('lightCircle-addbranch-top'),
    'anim-38': () => toggleLight('lightCircle-addbranch-top'),
    'anim-2': () => toggleLight('lightCircle-muxpcsrc-top'),
    'anim-39': () => toggleLight('lightCircle-muxpcsrc-top'),
    'anim-47': () => toggleLight('lightCircle-flags-top'),
    'anim-31': () => toggleLight('lightCircle-flags-top'),
};
