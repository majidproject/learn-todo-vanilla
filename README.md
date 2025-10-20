# 🎯 Todo-Vanilla: Pure JavaScript Todo Application

**Project Status:** Completed W02-S03 (DOM Testing)

This project is a minimal, pure JavaScript (ES Modules) Todo list application developed as part of the 12-Month Full-Stack Learning Roadmap. The focus for **W02-S03** was achieving high test coverage and reliability for DOM manipulation logic using **Vitest** and **JSDOM**.

| Metric | Status | Link / Details |
| :--- | :--- | :--- |
| **Code Coverage** | **84%** | [![Code Coverage](https://img.shields.io/badge/Coverage-84%25-brightgreen?style=flat-square)]
| **Live Demo** | Available | ![Demo of Tech Stack Tracker](assets/demo-w02-s02.gif) |
| **Test Report** | 5/5 Tests Passed | [Test Run Link Placeholder] |

---

## ✨ Core Features

* **Task Management:** Add, Toggle (complete/incomplete), and Remove tasks.
* **Filtering:** View all, active, or completed tasks.
* **Visual Feedback:** Dynamic progress bar showing completion percentage.

---

## 🧪 Testing and Technical Challenges (W02-S03)

The primary goal was to ensure all DOM-interacting logic in `script.js` was fully testable and stable in a virtual DOM environment. The following major challenges were encountered and their solutions implemented to achieve 84% coverage:

### 1. Challenge: Stale DOM References (The Root Cause of Filter Failures)

* **Initial Error:** Tests failed with errors like `AssertionError: expected '' to contain 'Task B (Active)'` or `ReferenceError: cite_start is not defined`.
* **Root Issue:** Initial attempts used global variables in `script.js` to select DOM elements (e.g., `const todoListEl = document.querySelector('#todoList');`). In JSDOM, these references often became **stale** or invalid after the `beforeEach` hook cleared and reset the HTML structure for each test. This prevented `renderTodos()` from correctly appending new list items.
* **Resolution (The Stability Fix):** All global DOM element selectors were **removed**. DOM lookups (e.g., `document.querySelector('#todoList')`) are now performed **dynamically inside every function** (`addTodo()`, `renderTodos()`, `updateProgressBar()`). This guarantees a fresh, valid DOM reference for every action.

### 2. Challenge: Global State Contamination in Filtering

* **Initial Error:** After the core stability fixes, filter tests were failing because one test's filter setting contaminated the next one (e.g., the 'Active' test left `currentFilter` at 'active' for the 'Completed' test).
* **Root Issue:** The global state variable `currentFilter` was not being reset, despite the `todos` array being reset via `resetTodos()`.
* **Resolution (Test Isolation):** We added an exported helper function, `setCurrentFilter()`, to `script.js`. This function is explicitly called within the `beforeEach` hook in `script.test.js`:
    ```javascript
    beforeEach(() => {
        resetTodos([]); 
        setCurrentFilter('all'); // ⬅️ Ensures filter always starts at 'all'
        // ...
    });
    ```

### 3. Challenge: Complex Test Setup for Filters

* **Initial Approach:** Building the test state by simulating user input: `addTodo(); toggleTodo(); addTodo();`. This was brittle in JSDOM and prone to errors (as seen in earlier failures).
* **Final Resolution (Direct State Injection):** For filter tests, we switched to **direct state injection** to ensure test reliability:
    1.  Define the required state (e.g., one active, one completed todo).
    2.  Use the exported `resetTodos()` to inject the state directly into the application's internal array.
    3.  Call `setCurrentFilter()` and then `renderTodos()` exactly once.
    This pattern ensures the test only validates the filter logic, decoupling it from the DOM interaction simulation.

---

## 🚀 How to Run the Project and Tests

1.  **Clone the repository:**
    ```bash
    git clone [Your Repository URL]
    cd todo-vanilla
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run Tests (Check Status):**
    ```bash
    npm test
    ```
4.  **Generate Coverage Report (Verify DoD):**
    ```bash
    npm run coverage
    ```

    --------------------------------------------------------------------------

🧠 Created with ❤️ by **Majid Mansouri**  

### Connect with Me

Thank you for exploring this project! I'm committed to continuous learning and open to collaboration.

| Resource | Link |
| :--- | :--- |
| 🌐 **Portfolio** | [majidproject.github.io/web-portfolio/](https://majidproject.github.io/web-portfolio/) |
| 🔗 **LinkedIn**  | [linkedin.com/in/majid-mansouri-a8163866](https://www.linkedin.com/in/majid-mansouri-a8163866) |
| 📧 **Email**     | [mm.project.8902@gmail.com](mailto:mm.project.8902@gmail.com) |

*This repository is a result of my dedicated Full-Stack learning journey.*

--------------------------------------------------------------------------

> “Learning never stops — each commit is one step closer to mastery.”