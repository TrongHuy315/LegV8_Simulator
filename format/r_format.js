export const R_FORMAT_OPCODES = ['ADD', 'SUB', 'AND', 'ORR', 'EOR', 'LSL', 'LSR']; // Danh sách các mã lệnh (opcode) R-Format được hỗ trợ
export function convert(line, rFormatRegex) {
    let match = line.match(rFormatRegex);
    const opcode = match[1].toUpperCase(); 
    const rd = parseInt(match[2], 10); 
    const rn = parseInt(match[3], 10); 
    const rm = parseInt(match[4], 10); 

    if (rd > 31 || rn > 31 || rm > 31) {
        return { 
            error: true,
            message: `Số thanh ghi không hợp lệ (phải từ 0-31).`,
            raw: line 
        };
    }
    return {
        type: 'R', 
        opcode: opcode, 
        rd: rd, 
        rn: rn, 
        rm: rm, 
        shamt: 0,
        raw: line 
    };
}
export function convertI(line, rFormatRegexNumber) {
    let match = line.match(rFormatRegexNumber);
    const opcode = match[1].toUpperCase(); 
    const rd = parseInt(match[2], 10); 
    const rn = parseInt(match[3], 10); 
    const shamt = parseInt(match[4], 10); 

    if (rd > 31 || rn > 31) {
        return { 
            error: true,
            message: `Số thanh ghi không hợp lệ (phải từ 0-31).`,
            raw: line 
        };
    }

    return {
        type: 'R', 
        opcode: opcode, 
        rd: rd, 
        rn: rn, 
        rm: 0,
        shamt: shamt,
        raw: line 
    };
}