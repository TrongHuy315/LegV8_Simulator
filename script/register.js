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

export function IFormat(parsedInstruction, registers, memory) {
    const { opcode, rd, rn, imm } = parsedInstruction;

    switch (opcode) {
        case 'ADDI':
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
    console.log("register 2: ", registers[1]);
}

export function CBFormat(parsedInstruction, registers, memory) {
    const { opcode, rt, offset } = parsedInstruction;
}

export function BFormat(parsedInstructionm, registers, memory) {
    
}