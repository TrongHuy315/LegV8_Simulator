export const B_FORMAT_OPCODES = [
    // 'B', 'B.EQ', 'B.NE', 'B.LT', 'B.LO', 'B.LE', 
    // 'B.LS', 'B.GT', 'B.HI', 'B.GE', 'B.HS'
    'B', 'BL'
]; 
export function convert(line, BFormaxRegex) {
    let match = line.match(BFormaxRegex);
    const opcode = match[1].toUpperCase(); 
    const label = match[2]; 
    console.log()
    // console.log("opcode: ", opcode, "label: ", label);
    return {
        type: 'B', 
        opcode: opcode,  
        label: label, 
        raw: line 
    };
}