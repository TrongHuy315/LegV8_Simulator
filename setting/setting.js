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
    
    'anim-11': 'mux-reg-dest',      // Inst bits arrive at WriteReg Mux selector (if applicable)
    'anim-18': 'mux-reg-dest',      // Control Signal (Reg2Loc?) arrives at Mux
    
    'anim-23': 'alu-control',       // Instruction func/op bits arrive at ALU Control
    'anim-49': 'alu-control',       // ALUOp signal arrives at ALU Control

    // Register Read
    'anim-30': 'alu',               // ReadData1 arrives at ALU top input
    'anim-37': 'alu',
    'anim-56': 'alu',

    'anim-26': 'mux-alu-src',       // Sign-extended immediate arrives at Mux ALU Src input 1
    'anim-28': 'mux-alu-src',
    'anim-48': 'mux-alu-src',       // ALUSrc control signal arrives
    
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
    
    'anim-51': 'and-gate-zerobranch',// Zero flag arrives at AND gate
    'anim-43': 'and-gate-zerobranch',// ZeroBranch control signal arrives
    
    'anim-55': 'and-gate-flagbranch',// Flags (non-zero) arrive
    'anim-42': 'and-gate-flagbranch',// FlagBranch control signal arrives
    
    'anim-52': 'or-gate-branch',    // Result from ZeroBranch AND arrives
    'anim-54': 'or-gate-branch',    // Result from FlagBranch AND arrives
    'anim-41': 'or-gate-branch',    // UncondBranch control signal arrives
    
    'anim-53': 'mux-pc-src',        // Branch taken signal arrives at Mux PC Src selector
    'anim-2': 'mux-pc-src',         // PC+4 arrives at Mux PC Src input 0
    'anim-39': 'mux-pc-src',        // Branch target address arrives at Mux PC Src input 1

    // Writeback Stage
    'anim-35': 'mux-writeback',     // Data from Memory arrives at Mux Writeback input 1
    'anim-34': 'mux-writeback',     // ALU result arrives at Mux Writeback input 0
    'anim-45': 'mux-writeback',     // MemToReg control signal arrives
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
