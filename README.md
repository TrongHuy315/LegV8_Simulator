# LEGv8 Simulator

## Demo & Bio

- [Project GitHub Bio & Demo](https://tronghuy315.github.io/LegV8_Simulator/)

---

## Overview

This project is a **LEGv8 Simulator** designed to help users learn and visualize the execution of LEGv8 assembly instructions. The simulator provides an interactive interface for entering, editing, and simulating LEGv8 code, complete with animated data paths, register/memory views, and step-by-step execution.

---

## Features

- **Instruction Editor:** Write and edit LEGv8 assembly instructions with automatic formatting and comment handling.
- **Register & Memory Display:** View the current state of all registers and memory in real time.
- **Animated Data Path:** Visualize how instructions move through the LEGv8 datapath with SVG-based animations.
- **Speed Control:** Adjust the speed of the simulation to learn at your own pace.
- **Label & Branch Support:** Supports labels and branch instructions for realistic program flow.
- **Special Register Handling:** Automatically maps special registers (SP, FP, LR, XZR) to their corresponding X registers.
- **Comment Support:** Ignores comments in code for clean parsing and execution.
- **Error Handling:** Provides clear error messages for invalid instructions or missing labels.

---

## How to Use

1. **Write Instructions:**  
   Enter your LEGv8 assembly code in the instruction editor. You can use labels, comments (`//`), and special registers.

2. **Simulate:**  
   Click the **Simulate** button to run your code. The simulator will animate each instruction and update the register/memory views.

3. **Control Speed:**  
   Use the speed slider to adjust how fast the animations play.

4. **Step Execution:**  
   Step through your code instruction by instruction to observe datapath activity and register changes.

---

## Project Structure

- `/script/`  
  Main JavaScript logic for simulation, animation, and UI control.
- `/format/`  
  Parsing and normalization of LEGv8 instructions.
- `/UI/`  
  UI utilities, speed control, and SVG manipulation.
- `/css/`  
  Stylesheets for the simulator interface.
- `/README.md`  
  This documentation file.

---

## Requirements

- Modern web browser (Chrome, Firefox, Edge, etc.)
- No installation required; simply open the `index.html` file in your browser.

---

## Credits

- Developed by Dang Thanh Long - Do Trong Huy
- Inspired by LEGv8 educational resources and ARM architecture documentation.

---

## License

This project is for educational