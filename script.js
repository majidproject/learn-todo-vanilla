/**
 * 💻 Developed by: **Majid Mansouri**
 * Role: Full-Stack Developer | Software Engineer
 *
 * Project Goal: Part of the comprehensive 12-Month Full-Stack Learning Roadmap.
 *
 * Contact: mm.project.8902@gmail.com
 * LinkedIn: https://www.linkedin.com/in/majid-mansouri-a8163866
 * Portfolio: https://majidproject.github.io/web-portfolio/
 *
 * Status: Educational/Personal Use Only
 */

const todoListEl = document.querySelector('#todoList');
const todoInputEl = document.querySelector('#newTodo');
const categorySelectEl = document.querySelector('#taskCategory'); 
const addBtnEl = document.querySelector('#addTodoBtn');
const filtersEl = document.querySelector('.filters');
const progressBarEl = document.querySelector('#progressBar');     
const progressTextEl = document.querySelector('#progress-text');   

const STORAGE_KEY = 'stack_tracker_v2'; 
let todos = []; 

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    todos = raw ? JSON.parse(raw).map(t => ({...t, category: t.category || 'General'})) : [];
  } catch (err) {
    console.error('Failed to load todos', err);
    todos = [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function updateProgressBar() {
    const total = todos.length;
    const completedCount = todos.filter(t => t.completed).length;
    const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    
    progressBarEl.style.width = `${percentage}%`;
    progressTextEl.textContent = `Progress: ${completedCount}/${total} (${percentage}%) Mastered`;
}


let currentFilter = 'all'; // 'all' | 'active' | 'completed'

function renderTodos() {
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

    li.addEventListener('click', () => {
      toggleTodo(t.id);
    });

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

function addTodo() {
  const text = todoInputEl.value.trim();
  const category = categorySelectEl.value; 
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

function removeTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  renderTodos();
}

function toggleTodo(id) {
  todos = todos.map(t => t.id === id ? {...t, completed: !t.completed} : t);
  saveTodos();
  renderTodos();
}

filtersEl.addEventListener('click', (event) => {
  if (event.target.tagName !== 'BUTTON') return;
  const btn = event.target;
  const filter = btn.dataset.filter;

  if (!filter) return;

  const prev = filtersEl.querySelector('.active');
  if (prev) prev.classList.remove('active');
  btn.classList.add('active');

  currentFilter = filter;
  renderTodos();
});

addBtnEl.addEventListener('click', addTodo);
todoInputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo();
});

loadTodos();
renderTodos();