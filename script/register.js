import * as format from '../format/format.js' // Và các module parse khác nếu cần

export function RFormat(parsedInstruction, registers) {
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
        case 'XOR':
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

export function DFormat(parsedInstruction, registers, memory) {
    const { opcode, rd, rn, offset } = parsedInstruction;
    const address = registers[rn] + Number(offset);

    switch (opcode) {
        case 'LDUR':
            registers[rd] = memory[address] || 0;
            break;
        case 'STUR':
            memory[address] = registers[rd];
            break;
        default:
            break;
    }
}

export function CBFormat(parsedInstruction, registers, memory) {
    const { opcode, rt, offset } = parsedInstruction;
}