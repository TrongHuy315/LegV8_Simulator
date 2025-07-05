export function RFormat(parsedInstruction, registers, memory) {
    const { opcode, rd, rn, rm, shamt } = parsedInstruction;
    switch (opcode) {
        case 'ADD':
            registers[rd] = registers[rn] + registers[rm];
            break;
        case 'SUB':
            registers[rd] = registers[rn] - registers[rm];
            break;
        case 'AND':
            registers[rd] = registers[rn] & registers[rm];
            break;
        case 'OR':
            registers[rd] = registers[rn] | registers[rm];
            break;
        case 'EOR':
            registers[rd] = registers[rn] ^ registers[rm];
            break;
        case 'LSL':
            registers[rd] = registers[rn] << shamt;
            break;
        case 'LSR':
            registers[rd] = registers[rn] >>> shamt;
            break;
        default:
            break;
    }
}
let map_address = {
    "0x7fffffff08" : 0,
    "0x7fffffff88" : 16,
    "0x7fffffff10" : 1,
    "0x7fffffff90" : 17,
    "0x7fffffff18" : 2,
    "0x7fffffff98" : 18,
    "0x7fffffff20" : 3,
    "0x7fffffffa0" : 19,
    "0x7fffffff28" : 4,
    "0x7fffffffa8" : 20,
    "0x7fffffff30" : 5,
    "0x7fffffffb0" : 21,
    "0x7fffffff38" : 6,
    "0x7fffffffb8" : 22,
    "0x7fffffff40" : 7,
    "0x7fffffffc0" : 23,
    "0x7fffffff48" : 8,
    "0x7fffffffc8" : 24,
    "0x7fffffff50" : 9,
    "0x7fffffffd0" : 25,
    "0x7fffffff58" : 10,
    "0x7fffffffd8" : 16,
    "0x7fffffff60" : 11,
    "0x7fffffffe0" : 27,
    "0x7fffffff68" : 12,
    "0x7fffffffe8" : 28,
    "0x7fffffff70" : 13, 
    "0x7ffffffff0" : 29,
    "0x7fffffff78" : 14, 
    "0x7ffffffff8" : 30,
    "0x7fffffff80" : 15,
    "0x8000000000" : 31
};
export function DFormat(parsedInstruction, registers, memory) {
    const { opcode, rt, rn, offset } = parsedInstruction;
    console.log(parsedInstruction);
    const address = registers[rn] + Number(offset);
    console.log("Adress:", map_address["0x" + address.toString(16)]); 
    // address = 0;
    switch (opcode) {
        case 'LDUR':
            registers[rt] = memory[map_address["0x" + address.toString(16)]] || 0;
            break;
        case 'STUR':
            console.log("register: ", registers[rt]);
            memory[map_address["0x" + address.toString(16)]] = registers[rt];
            break;
        default:
            break;
    }
}

export function IFormat(parsedInstruction, registers, memory) {
    const { opcode, rd, rn, imm } = parsedInstruction;

    switch (opcode) {
        case 'ADDI':
            //console.log(rd, rn, imm);
            registers[rd] = registers[rn] + imm; 
            break;
        case 'SUBI':
            registers[rd] = registers[rn] - imm; 
            break;
        case 'ANDI':
            registers[rd] = registers[rn] & imm; 
            break;
        case 'ORRI':
            registers[rd] = registers[rn] | imm; // Bitwise OR with immediate value
            break;
        case 'EORI':
            registers[rd] = registers[rn] ^ imm; // Bitwise EOR with immediate value
            break;
        default:
            console.error(`Unsupported I-format opcode: ${opcode}`);
            break;
    }
    // console.log("register 2: ", registers[1]);
}

export function CBFormat(parsedInstruction, registers, memory) {
    const { opcode, rt, offset } = parsedInstruction;
}

export function BFormat(parsedInstructionm, registers, memory) {
    
}