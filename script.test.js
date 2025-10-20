// script.test.js

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, getByText, fireEvent } from '@testing-library/dom';

// ⬅️ گام ۱: استفاده از vi.mock برای تضمین بارگذاری صحیح ماژول
vi.mock('./script.js', async (importOriginal) => {
    const originalModule = await importOriginal();
    return {
        ...originalModule,
    };
});

// ⬅️ گام ۲: ایمپورت تمام توابع مورد نیاز
import { 
    addTodo, 
    resetTodos, 
    getTodos, 
    toggleTodo,
    removeTodo,
    renderTodos, 
    setCurrentFilter // ⬅️ CRITICAL: تابع تنظیم فیلتر
} from './script.js'; 


// ----------------------------------------------------
// شبیه‌سازی ساختار DOM لازم برای اجرای توابع
// ----------------------------------------------------
document.body.innerHTML = `
  <main class="todo-app">
    <h1>Todo List</h1>
    <section class="progress-bar-container">
        <div id="progressBar" style="width: 0%;"></div>
        <span id="progress-text">Progress: 0/0 (0%) Mastered</span>
    </section>
    <section class="input-row">
      <input id="newTodo" type="text" placeholder="Add a new task..." />
      <select id="taskCategory"><option value="Frontend">Frontend</option></select>
      <button id="addTodoBtn">Add</button>
    </section>
    <ul id="todoList" class="todo-list" aria-live="polite"></ul>
    <section class="filters" aria-label="Filters">
        <button data-filter="all" class="active">All</button>
        <button data-filter="active">Active</button>
        <button data-filter="completed">Completed</button>
    </section>
  </main>
`;


// ----------------------------------------------------
// تنظیمات قبل از هر تست (ریست کردن State برنامه)
// ----------------------------------------------------
beforeEach(() => {
    // 1. ریست کردن آرایه todos
    resetTodos([]); 
    
    // 2. پاک کردن DOM (لیست وظایف)
    document.querySelector('#todoList').innerHTML = '';

    // ⬅️ ۳. CRITICAL FIX: ریست کردن فیلتر قبل از هر تست
    setCurrentFilter('all'); 

    // 4. شبیه‌سازی‌ها
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {});
    vi.spyOn(Date, 'now').mockReturnValue(123456789); 

    document.querySelector('#newTodo').value = '';
});


// ----------------------------------------------------
// تست ۱ تا ۳: توابع هسته (Add, Toggle, Remove)
// ----------------------------------------------------
describe('Core Functionality', () => {
  it('should add a new task to the list and clear the input', () => {
    const input = document.querySelector('#newTodo');
    const todoList = document.querySelector('#todoList');
    const TASK_TEXT = 'Finalize W02-S03 Testing';
    input.value = TASK_TEXT;
    addTodo(); 
    expect(getByText(todoList, TASK_TEXT)).toBeInTheDocument();
    expect(getTodos()).toHaveLength(1);
    expect(input.value).toBe('');
  });

  it('should toggle a task from incomplete to completed when clicked', () => {
      const TEST_TASK = 'Toggle me!';
      document.querySelector('#newTodo').value = TEST_TASK;
      addTodo(); 
      let listItem = screen.getByText(TEST_TASK).closest('li');
      expect(listItem).not.toHaveClass('completed');
      const taskId = getTodos()[0].id;
      toggleTodo(taskId); 
      listItem = screen.getByText(TEST_TASK).closest('li'); 
      expect(listItem).toHaveClass('completed'); 
      expect(getTodos()[0].completed).toBe(true);
      toggleTodo(taskId);
      listItem = screen.getByText(TEST_TASK).closest('li');
      expect(listItem).not.toHaveClass('completed');
      expect(getTodos()[0].completed).toBe(false);
  });

  it('should remove a task from the list and DOM', () => {
      const TEST_TASK = 'Task to be removed';
      document.querySelector('#newTodo').value = TEST_TASK;
      addTodo(); 
      const todoList = document.querySelector('#todoList');
      expect(getTodos()).toHaveLength(1);
      expect(todoList.textContent).toContain(TEST_TASK);
      const taskId = getTodos()[0].id;
      removeTodo(taskId); 
      expect(getTodos()).toHaveLength(0);
      expect(todoList.textContent).not.toContain(TEST_TASK);
  });
});

// script.test.js

// ... (بقیه کدها و توابع ایمپورت شده ثابت می‌مانند)

// ----------------------------------------------------
// تست ۴ و ۵: منطق فیلتر (Filter Functionality) - با تنظیم مستقیم State
// ----------------------------------------------------
describe('Filter Functionality', () => {
    
    // تعریف حالت‌های نهایی مورد نیاز تست
    const initialTodos = [
        // آیتم تکمیل شده
        { id: '1', text: 'Task A (Completed)', completed: true, category: 'Frontend' }, 
        // آیتم فعال
        { id: '2', text: 'Task B (Active)', completed: false, category: 'Frontend' },  
        // آیتم تکمیل شده
        { id: '3', text: 'Task C (Completed)', completed: true, category: 'Frontend' }, 
        // آیتم فعال
        { id: '4', text: 'Task D (Active)', completed: false, category: 'Frontend' },   
    ];


    it('should display only active todos when "Active" filter is set', () => {
        
        // 1. آماده‌سازی داده (State) - تنظیم مستقیم حالت نهایی مورد نیاز
        resetTodos([
            // تنها آیتم‌هایی که برای این تست نیاز است (A تکمیل شده، B فعال)
            initialTodos[0], // Task A (Completed)
            initialTodos[1], // Task B (Active)
        ]);
        
        const todoList = document.querySelector('#todoList');
        
        // 2. تنظیم مستقیم فیلتر و رندر مجدد (فقط یک بار)
        setCurrentFilter('active'); 
        renderTodos(); 

        // 3. بررسی نتایج (Task A باید پنهان شود، Task B نمایش داده شود)
        expect(todoList.textContent).not.toContain('Task A (Completed)');
        expect(todoList.textContent).toContain('Task B (Active)');
        expect(todoList.querySelectorAll('li')).toHaveLength(1);
    });
    
    it('should display only completed todos when "Completed" filter is set', () => {
        
        // 1. آماده‌سازی داده (State) - تنظیم مستقیم حالت نهایی مورد نیاز
        resetTodos([
            // تنها آیتم‌هایی که برای این تست نیاز است (C تکمیل شده، D فعال)
            initialTodos[2], // Task C (Completed)
            initialTodos[3], // Task D (Active)
        ]);
        
        const todoList = document.querySelector('#todoList');
        
        // 2. تنظیم مستقیم فیلتر و رندر مجدد (فقط یک بار)
        setCurrentFilter('completed'); 
        renderTodos(); 

        // 3. بررسی نتایج (Task C باید نمایش داده شود، Task D پنهان شود)
        expect(todoList.textContent).toContain('Task C (Completed)');
        expect(todoList.textContent).not.toContain('Task D (Active)');
        expect(todoList.querySelectorAll('li')).toHaveLength(1);
    });
});