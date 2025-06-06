export function animation() {
    return {
        'anim-1': { },       // PC -> Instruction Memory
        'anim-2': { },       // Instruction fetched
        'anim-3': { next: ['anim-4', 'anim-5'] },
        'anim-4': { next: ['anim-9'] },
        'anim-5': { next: ['anim-6', 'anim-7'] },
        'anim-6': { next: ['anim-2'] },
        'anim-7': { next: [] },

        'anim-8': { next: [] },  // Unused

        'anim-9': { next: ['anim-10', 'anim-16'] }, // Send fields to register + control
        'anim-10': { next: ['anim-12'] },
        'anim-12': { next: ['anim-13', 'anim-14'] },
        'anim-13': { next: ['anim-30'] },
        'anim-14': { next: ['anim-40', 'anim-41', 'anim-42', 'anim-43', 'anim-44', 'anim-45', 'anim-46', 'anim-47', 'anim-48', 'anim-49', 'anim-50'] },

        'anim-16': { next: ['anim-17', 'anim-20'] }, // ALUSrc, Reg2Loc
        'anim-17': { next: ['anim-19'] },
        'anim-19': { next: ['anim-22'] },           // offset sign extend

        'anim-20': { next: ['anim-22', 'anim-24'] }, // Register file
        'anim-22': { next: ['anim-24'] },           // Read Rn & Rt
        'anim-24': { next: ['anim-26'] },           // ALU src mux
        'anim-26': { next: ['anim-37'] },           // ALU operation
        'anim-37': { next: ['anim-32'] },
        'anim-32': { next: ['anim-33'] },           // ALU -> Address
        'anim-33': { next: ['anim-34'] },           // MemRead or MemWrite

        // IF LDUR -> read data -> register
        'anim-34': { next: ['anim-36'] },           // Mem -> WB
        'anim-36': { next: [] },                    // WB done

        // IF STUR -> write data, done
        'anim-35': { next: [] },                    // Store path

        'anim-40': { next: ['anim-21'] },
        'anim-21': { next: ['anim-27'] },
        'anim-27': { next: ['anim-28'] },
        'anim-28': { next: ['anim-37'] },           // ALUOp setup
        'anim-30': { next: [] },                    // write reg
        'anim-50': { next: [] },

        // Memory WB route
        'anim-45': { next: [] }, // MemToReg
        'anim-44': { next: [] }, // MemRead
        'anim-46': { next: [] }, // MemWrite

        'anim-42': { next: ['anim-52'] },  // FlagBranch
        'anim-43': { next: ['anim-52'] },  // ZeroBranch
        'anim-54': { next: ['anim-52'] },  // Zero bit from ALU
        'anim-52': { next: ['anim-53'] },  // OR logic
        'anim-53': { next: ['anim-1'] },   // Control signal to MUX (PC)

    };
}
