export const D_FORMAT_OPCODES = ['LDUR', 'STUR']
export function convert(line, dFormaxRegex) {
    let match = line.match(dFormaxRegex);
    const opcode = match[1].toUpperCase(); 
    const rt = parseInt(match[2], 10); 
    const rn = parseInt(match[3], 10); 
    const offset = parseInt(match[4], 10); 

    if (rt > 31 || rn > 31) {
        return { 
            error: true,
            message: `Số thanh ghi không hợp lệ (phải từ 0-31).`,
            raw: line 
        };
    }

    return {
        type: 'D', 
        opcode: opcode, 
        rt: rt,
        rn: rn,
        offset: offset,
        raw: line 
    };
}