export const CB_FORMAT_OPCODES = ['CBZ', 'CBNZ']; 

export function convert(line, CBFormaxRegex) {
    let match = line.match(CBFormaxRegex);
    const opcode = match[1].toUpperCase(); 
    const rt = parseInt(match[2], 10); 
    const label = match[3]; 

    if (rt > 31) {
        return { 
            error: true,
            message: `Số thanh ghi không hợp lệ (phải từ 0-31).`,
            raw: line 
        };
    }

    return {
        type: 'CB', 
        opcode: opcode, 
        rt: rt, 
        label: label, 
        raw: line 
    };
}