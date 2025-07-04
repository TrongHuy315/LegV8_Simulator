export const DEFAULT_ANIMATION_DURATION_MS = 1000; // Dự phòng nếu không đọc được 'dur'
export const HIGHLIGHT_DURATION_MS = 300; // How long the highlight stays (ms)
export const POST_HIGHLIGHT_HIDE_DELAY_MS = 150;

export const animationToComponentHighlight = {
    // Fetch Stage
    'anim-4': 'instruction-memory', // PC addr arrives at Inst Memory
    
    'anim-6': 'add-pc-4',           // PC+4 value arrives at adder
    'anim-7': 'add-pc-4',           // Constant 4 arrives at adder

    // Decode Stage / Control Signals
    'anim-14': 'control-unit',      // More instruction bits (for specific control signals)
    
    'anim-13': 'registers',         // ReadReg1 address arrives
    'anim-19': 'registers', 
    'anim-21': 'registers',         // ReadReg2 address arrives
    'anim-36': 'registers', 
    
    'anim-11': 'mux1',      // Inst bits arrive at WriteReg Mux selector (if applicable)
    'anim-18': 'mux1',      // Control Signal (Reg2Loc?) arrives at Mux
    
    'anim-23': 'alu-control',       // Instruction func/op bits arrive at ALU Control
    'anim-49': 'alu-control',       // ALUOp signal arrives at ALU Control

    // Register Read
    'anim-30': 'alu',               // ReadData1 arrives at ALU top input
    'anim-37': 'alu',
    'anim-56': 'alu',

    'anim-26': 'mux2',       // Sign-extended immediate arrives at Mux ALU Src input 1
    'anim-28': 'mux2',
    'anim-48': 'mux2',       // ALUSrc control signal arrives
    
    'anim-29': 'data-memory',       // ReadData2 arrives at Data Memory Write Data input
    'anim-33': 'data-memory',
    'anim-44': 'data-memory',
    'anim-46': 'data-memory',

    // Immediate / Sign Extend
    'anim-22': 'sign-extend',       // Instruction immediate bits arrive

    'anim-25': 'shift-left-2',      // Sign-extended immediate arrives at Shift Left 2 (for branch)

    // Execute Stage (ALU)
    'anim-31': 'flags',             // Zero flag output from ALU calculation

    // Branch Logic
    'anim-8': 'add-branch',         // PC+4 (or current PC?) arrives at branch adder
    'anim-38': 'add-branch',        // Shifted offset arrives at branch adder
    
    'anim-51': 'and-gate2',// Zero flag arrives at AND gate
    'anim-43': 'and-gate2',// ZeroBranch control signal arrives
    
    'anim-55': 'and-gate1',// Flags (non-zero) arrive
    'anim-42': 'and-gate1',// FlagBranch control signal arrives
    
    'anim-52': 'or-gate',    // Result from ZeroBranch AND arrives
    'anim-54': 'or-gate',    // Result from FlagBranch AND arrives
    'anim-41': 'or-gate',    // UncondBranch control signal arrives
    
    'anim-53': 'mux4',        // Branch taken signal arrives at Mux PC Src selector
    'anim-2': 'mux4',         // PC+4 arrives at Mux PC Src input 0
    'anim-39': 'mux4',        // Branch target address arrives at Mux PC Src input 1

    // Writeback Stage
    'anim-35': 'mux3',     // Data from Memory arrives at Mux Writeback input 1
    'anim-34': 'mux3',     // ALU result arrives at Mux Writeback input 0
    'anim-45': 'mux3',     // MemToReg control signal arrives
    'anim-13': 'registers',
    'anim-19': 'registers',
    'anim-36': 'registers',         // Data from Mux Writeback arrives at Register Write Data input
    'anim-21': 'registers',         // Write Register address arrives
    'anim-50': 'registers',         // RegWrite control signal arrives

    // PC Update
    'anim-1': 'pc',                 // Value from Mux PC Src arrives to update PC

    // Control signals arriving at destinations
    'anim-47': 'flags',             // FlagWrite control signal arrives
};
export let componentInputRequirements = {
    "registers-read1": 1,
    "registers-read2": 1,
    "or-gate": 3,
    "and-gate1": 2,
    "and-gate2": 2,
    "add-pc-4": 2,
    "add-branch": 2,
    "mux1": 2,
    "mux2": 2,
    "mux3": 2,
    "mux4": 2,
};

export const animToFlag = {
    "anim-40": "Reg2Loc",
    "anim-50": "RegWrite",
    "anim-48": "ALUSrc",
    "anim-47": "FlagWrite",
    //"anim-42": "FlagBranch",
    //"anim-43": "ZeroBranch",
    //"anim-41": "UncondBranch",
    "anim-53": "OrToMux",
    "anim-46": "MemWrite",
    "anim-45": "MemToReg",
    "anim-44": "MemRead",
    "anim-56": "ToALU",
    "anim-49": "ALUOp",
}

export const setBitOfInstruction = {
  "ADD": {
    "Reg2Loc": "0",
    "RegWrite": "1",
    "ALUSrc": "0",
    "FlagWrite": "0",
    "FlagBranch": "0",
    "ZeroBranch": "0",
    "UncondBranch": "0",
    "OrToMux": "0",
    "MemWrite": "0",
    "MemToReg": "0",
    "MemRead": "0",
    "ToALU": "0010",
    "ALUOp": "10"
  },
  "SUB": {
    "Reg2Loc": "0",
    "RegWrite": "1",
    "ALUSrc": "0",
    "FlagWrite": "0",
    "FlagBranch": "0",
    "ZeroBranch": "0",
    "UncondBranch": "0",
    "OrToMux": "0",
    "MemWrite": "0",
    "MemToReg": "0",
    "MemRead": "0",
    "ToALU": "0110",
    "ALUOp": "10"
  },
  "AND": {
    "Reg2Loc": "0",
    "RegWrite": "1",
    "ALUSrc": "0",
    "FlagWrite": "0",
    "FlagBranch": "0",
    "ZeroBranch": "0",
    "UncondBranch": "0",
    "OrToMux": "0",
    "MemWrite": "0",
    "MemToReg": "0",
    "MemRead": "0",
    "ToALU": "0000",
    "ALUOp": "10"
  },
  "ORR": {
    "Reg2Loc": "0",
    "RegWrite": "1",
    "ALUSrc": "0",
    "FlagWrite": "0",
    "FlagBranch": "0",
    "ZeroBranch": "0",
    "UncondBranch": "0",
    "OrToMux": "0",
    "MemWrite": "0",
    "MemToReg": "0",
    "MemRead": "0",
    "ToALU": "0001",
    "ALUOp": "10"
  },
  "EOR": {
    "Reg2Loc": "0",
    "RegWrite": "1",
    "ALUSrc": "0",
    "FlagWrite": "0",
    "FlagBranch": "0",
    "ZeroBranch": "0",
    "UncondBranch": "0",
    "OrToMux": "0",
    "MemWrite": "0",
    "MemToReg": "0",
    "MemRead": "0",
    "ToALU": "0011",
    "ALUOp": "10"
  },
  "ADDS": {
    "Reg2Loc": "0",
    "RegWrite": "1", 
    "ALUSrc": "0",
    "FlagWrite": "1",      
    "FlagBranch": "0",
    "ZeroBranch": "0",
    "UncondBranch": "0",
    "OrToMux": "0",
    "MemWrite": "0",
    "MemToReg": "0",
    "MemRead": "0",
    "ToALU": "0010",       
    "ALUOp": "10",
  },
  "SUBS": {
    "Reg2Loc": "0",
    "RegWrite": "1", 
    "ALUSrc": "0",
    "FlagWrite": "1",      
    "FlagBranch": "0",
    "ZeroBranch": "0",
    "UncondBranch": "0",
    "OrToMux": "0",
    "MemWrite": "0",
    "MemToReg": "0",
    "MemRead": "0",
    "ToALU": "0110",
    "ALUOp": "10",
  },
  "ADDI": {
    "Reg2Loc": "0",
    "RegWrite": "1",
    "ALUSrc": "1",
    "FlagWrite": "0",
    "FlagBranch": "0",
    "ZeroBranch": "0",
    "UncondBranch": "0",
    "OrToMux": "0",
    "MemWrite": "0",
    "MemToReg": "0",
    "MemRead": "0",
    "ToALU": "0010",
    "ALUOp": "00"
  },
  "SUBI": {
    "Reg2Loc": "0",
    "RegWrite": "1",
    "ALUSrc": "1",
    "FlagWrite": "0",
    "FlagBranch": "0",
    "ZeroBranch": "0",
    "UncondBranch": "0",
    "OrToMux": "0",
    "MemWrite": "0",
    "MemToReg": "0",
    "MemRead": "0",
    "ToALU": "0110",
    "ALUOp": "00"
  },
  "ORRI": {
      "Reg2Loc": "0",
      "RegWrite": "1",
      "ALUSrc": "1",
      "FlagWrite": "0",
      "FlagBranch": "0",
      "ZeroBranch": "0",
      "UncondBranch": "0",
      "OrToMux": "0",
      "MemWrite": "0",
      "MemToReg": "0",
      "MemRead": "0",
      "ToALU": "0001",
      "ALUOp": "11"
  },
  "ANDI": {
    "Reg2Loc": "0",
    "RegWrite": "1",
    "ALUSrc": "1",
    "FlagWrite": "0",
    "FlagBranch": "0",
    "ZeroBranch": "0",
    "UncondBranch": "0",
    "OrToMux": "0",
    "MemWrite": "0",
    "MemToReg": "0",
    "MemRead": "0",
    "ToALU": "0000",
    "ALUOp": "11"
  },
  "EORI": {
    "Reg2Loc": "0",
    "RegWrite": "1",
    "ALUSrc": "1",
    "FlagWrite": "0",
    "FlagBranch": "0",
    "ZeroBranch": "0",
    "UncondBranch": "0",
    "OrToMux": "0",
    "MemWrite": "0",
    "MemToReg": "0",
    "MemRead": "0",
    "ToALU": "0011",
    "ALUOp": "11"
  },
  "ADDIS": {
    "Reg2Loc": "0",         
    "RegWrite": "1",
    "ALUSrc": "1",          
    "FlagWrite": "1",       
    "FlagBranch": "0",
    "ZeroBranch": "0",
    "UncondBranch": "0",
    "OrToMux": "0",
    "MemWrite": "0",
    "MemToReg": "0",
    "MemRead": "0",
    "ToALU": "0010",
    "ALUOp": "10"
  },
  "SUBIS": {
    "Reg2Loc": "0",         
    "RegWrite": "1",
    "ALUSrc": "1",          
    "FlagWrite": "1",
    "FlagBranch": "0",
    "ZeroBranch": "0",
    "UncondBranch": "0",
    "OrToMux": "0",
    "MemWrite": "0",
    "MemToReg": "0",
    "MemRead": "0",
    "ToALU": "0110",        
    "ALUOp": "10"
  },
  "LDUR": {
    "Reg2Loc": "0",
    "RegWrite": "1",
    "ALUSrc": "1",
    "FlagWrite": "0",
    "FlagBranch": "0",
    "ZeroBranch": "0",
    "UncondBranch": "0",
    "OrToMux": "0",
    "MemWrite": "0",
    "MemToReg": "1",
    "MemRead": "1",
    "ToALU": "0010",
    "ALUOp": "00"
  },
  "STUR": {
    "Reg2Loc": "1",
    "RegWrite": "0",
    "ALUSrc": "1",
    "FlagWrite": "0",
    "FlagBranch": "0",
    "ZeroBranch": "0",
    "UncondBranch": "0",
    "OrToMux": "0",
    "MemWrite": "1",
    "MemToReg": "0",
    "MemRead": "0",
    "ToALU": "0010",
    "ALUOp": "00"
  },
  "CBZ": {
    "Reg2Loc": "1",
    "RegWrite": "0",
    "ALUSrc": "0",
    "FlagWrite": "0",
    "FlagBranch": "1",
    "ZeroBranch": "1",
    "UncondBranch": "0",
    "OrToMux": "0",
    "MemWrite": "0",
    "MemToReg": "0",
    "MemRead": "0",
    "ToALU": "0110",
    "ALUOp": "01"
  },
  "CBNZ": {
    "Reg2Loc": "1",
    "RegWrite": "0",
    "ALUSrc": "0",
    "FlagWrite": "0",
    "FlagBranch": "1",
    "ZeroBranch": "0",
    "UncondBranch": "0",
    "OrToMux": "0",
    "MemWrite": "0",
    "MemToReg": "0",
    "MemRead": "0",
    "ToALU": "0110",
    "ALUOp": "01"
  },
  "B": {
    "Reg2Loc": "0",
    "RegWrite": "0",
    "ALUSrc": "0",
    "FlagWrite": "0",
    "FlagBranch": "0",
    "ZeroBranch": "0",
    "UncondBranch": "1",
    "OrToMux": "1",
    "MemWrite": "0",
    "MemToReg": "0",
    "MemRead": "0",
    "ToALU": "0000",
    "ALUOp": "00"
  },
  "BL": {
    "Reg2Loc": "0",
    "RegWrite": "0",
    "ALUSrc": "0",
    "FlagWrite": "0",
    "FlagBranch": "0",
    "ZeroBranch": "0",
    "UncondBranch": "0",
    "OrToMux": "0",
    "MemWrite": "0",
    "MemToReg": "0",
    "MemRead": "0",
    "ToALU": "0000",
    "ALUOp": "00"
  }
};

export const timeForEachAnim = {
  "anim-1": "4.0s",
  "anim-2": "3.0s",
  "anim-3": "0.5s",
  "anim-4": "0.5s",
  "anim-5": "1.5s",
  "anim-6": "1.5s",
  "anim-7": "1.5s",
  "anim-39": "1.0s",
  "anim-38": "0.5s",
  "anim-8": "3.0s",
  "anim-24": "1.0s",
  "anim-25": "1.5s",
  "anim-9": "0.5s",
  "anim-16": "0.5s",
  "anim-20": "1.5s",
  "anim-22": "0.5s",
  "anim-10": "0.5s",
  "anim-12": "0.5s",
  "anim-14": "1.0s",
  "anim-13": "1.0s",
  "anim-11": "1.0s",
  "anim-17": "1.0s",
  "anim-19": "0.5s",
  "anim-18": "0.5s",
  "anim-21": "0.5s",
  "anim-23": "1.5s",
  "anim-27": "0.5s",
  "anim-28": "0.5s",
  "anim-26": "0.5s",
  "anim-30": "1.0s",
  "anim-37": "0.5s",
  "anim-29": "1.5s",
  "anim-32": "0.5s",
  "anim-33": "0.5s",
  "anim-34": "1.5s",
  "anim-36": "3.0s",
  "anim-35": "0.5s",
  "anim-31": "0.5s",
  "anim-50": "1.5s",
  "anim-49": "1.5s",
  "anim-56": "1.0s",
  "anim-48": "1.5s",
  "anim-47": "1.5s",
  "anim-46": "1.5s",
  "anim-45": "1.5s",
  "anim-44": "1.5s",
  "anim-43": "1.5s",
  "anim-51": "1.0s",
  "anim-52": "1.0s",
  "anim-42": "1.5s",
  "anim-55": "0.5s",
  "anim-54": "1.0s",
  "anim-41": "1.5s",
  "anim-53": "0.5s",
  "anim-40": "1.5s"
}