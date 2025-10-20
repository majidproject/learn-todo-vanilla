/**
 * 💻 Developed by: **Majid Mansouri**
 * Role: Full-Stack Developer | Software Engineer
 *
 * Project Goal: Part of the comprehensive 12-Month Full-Stack Learning Roadmap.
 *
 * Status: Ready for W02-S03 Testing
 *
 * NOTE: All DOM queries are moved inside the init() function or relevant exported functions
 * to ensure code is testable using JSDOM/Vitest.
 */

const STORAGE_KEY = 'stack_tracker_v2';
let todos = []; // ⬅️ متغیر state که باید ریست شود
let currentFilter = 'all'; 


// --- State Management for Testing ---

// ⬅️ EXPORT: برای دسترسی تست‌ها به آرایه داخلی
export function getTodos() {
  return todos;
}

// ⬅️ EXPORT: برای پاک کردن آرایه داخلی قبل از هر تست
export function resetTodos(newTodos = []) {
  todos = newTodos;
}

// ⬅️ EXPORT: برای تنظیم دستی فیلتر در تست
export function setCurrentFilter(filter) {
  currentFilter = filter;
}


// --- Persistence ---

export function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    todos = raw ? JSON.parse(raw).map(t => ({ ...t, category: t.category || 'General' })) : [];
  } catch (err) {
    console.error('Failed to load todos', err);
    todos = [];
  }
}

export function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}


// --- Core Logic & Rendering ---

// ⬅️ EXPORT: برای تست‌کردن Toggle
export function toggleTodo(id) {
  todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  saveTodos();
  renderTodos();
}

// ⬅️ EXPORT: برای تست‌کردن Remove
export function removeTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  renderTodos();
}


// ⬅️ EXPORT: تابع اصلی افزودن (که در تست‌ها صدا زده می‌شود)
export function addTodo() {
  // این عناصر را هنگام اجرا پیدا می‌کند (هم در مرورگر و هم در JSDOM)
  const todoInputEl = document.querySelector('#newTodo');
  // ⬅️ FIX: یافتن #taskCategory اختیاری است، در غیر این صورت از 'General' استفاده می‌شود
  const categorySelectEl = document.querySelector('#taskCategory'); 
  
  if (!todoInputEl) return; // تنها اگر ورودی اصلی نباشد، برگرد

  const text = todoInputEl.value.trim();
  // اعمال مقدار پیش‌فرض اگر عنصر وجود نداشته باشد
  const category = categorySelectEl ? categorySelectEl.value : 'General'; 
  if (!text) return;

  const newTodo = {
    id: Date.now().toString(),
    text,
    completed: false,
    category: category
  };
  todos.unshift(newTodo);
  saveTodos();
  renderTodos();
  todoInputEl.value = '';
  todoInputEl.focus();
}


export function updateProgressBar() {
  const progressBarEl = document.querySelector('#progressBar');
  const progressTextEl = document.querySelector('#progress-text');
  
  if (!progressBarEl || !progressTextEl) return; 

  const total = todos.length;
  const completedCount = todos.filter(t => t.completed).length;
  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  progressBarEl.style.width = `${percentage}%`;
  // ⬅️ CLEANUP: حذف متون غیرمعتبر مانند 
  progressTextEl.textContent = `Progress: ${completedCount}/${total} (${percentage}%) Mastered`;
}

export function renderTodos() {
  const todoListEl = document.querySelector('#todoList');
  if (!todoListEl) return; 

  updateProgressBar();
  todoListEl.innerHTML = '';

  const visible = todos.filter(t => {
    if (currentFilter === 'all') return true;
    if (currentFilter === 'active') return !t.completed;
    return t.completed;
  });

  visible.forEach((t) => {
    const li = document.createElement('li');
    li.dataset.id = t.id;
    li.dataset.category = t.category;
    
    //
    const categoryTag = document.createElement('span');
    categoryTag.className = 'category-tag';
    categoryTag.textContent = t.category;
    li.appendChild(categoryTag);

    const span = document.createElement('span');
    span.className = 'text';
    span.textContent = t.text;

    if (t.completed) {
      li.classList.add('completed');
    }

    // Toggle Listener: از تابع export شده استفاده می‌کند
    li.addEventListener('click', () => {
      toggleTodo(t.id);
    });

    // Delete Button: از تابع export شده استفاده می‌کند
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.textContent = 'Archive';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeTodo(t.id);
    });

    li.appendChild(span);
    li.appendChild(delBtn);
    todoListEl.appendChild(li);
  });
}

// --- Initialization and Event Handlers (Browser Only) ---

function handleFilterClick(event) {
  const filtersEl = document.querySelector('.filters');
  if (!filtersEl || event.target.tagName !== 'BUTTON') return;
  
  const btn = event.target;
  const filter = btn.dataset.filter;

  if (!filter) return;

  const prev = filtersEl.querySelector('.active');
  if (prev) prev.classList.remove('active');
  btn.classList.add('active');

  currentFilter = filter;
  renderTodos();
}

// ⬅️ تابع Event Handler برای دکمه Add
function handleAddTodo() {
    // از تابع اصلی export شده استفاده می‌کند تا logic تکرار نشود
    addTodo();
}

function init() {
  // 1. DOM Element Retrieval
  const todoInputEl = document.querySelector('#newTodo');
  const addBtnEl = document.querySelector('#addTodoBtn');
  const filtersEl = document.querySelector('.filters');
  
  // 2. Load and Initial Render
  loadTodos();
  renderTodos();

  // 3. Event Listeners Setup
  if (addBtnEl && todoInputEl) {
    addBtnEl.addEventListener('click', handleAddTodo);
    todoInputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAddTodo();
    });
  }

  // 4. Filter Listener Setup
  if (filtersEl) {
    filtersEl.addEventListener('click', handleFilterClick);
  }
}

// اجرای init فقط در محیط مرورگر
if (typeof window !== 'undefined') {
  init();
}