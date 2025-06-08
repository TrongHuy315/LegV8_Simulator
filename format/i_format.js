export const I_FORMAT_OPCODES = ['ADDI', 'SUBI', 'ANDI', 'ORRI', 'EORI'];
export function convert(line, rFormatRegex) {
    let match = line.match(rFormatRegex);
    const opcode = match[1].toUpperCase(); 
    const rd = parseInt(match[2], 10); 
    const rn = parseInt(match[3], 10); 
    const imm = parseInt(match[4], 10); 

    if (rd > 31 || rn > 31) {
        return { 
            error: true,
            message: `Số thanh ghi không hợp lệ (phải từ 0-31).`,
            raw: line 
        };
    }
    return {
        type: 'I', 
        opcode: opcode, 
        rd: rd, 
        rn: rn, 
        imm: imm,
        raw: line 
    };
}