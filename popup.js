document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("todoInput");
    const addButton = document.getElementById("addButton");
    const todoList = document.getElementById("todoList");
    const currentDateElement = document.getElementById("currentDate");
    const deleteCompletedButton = document.getElementById("deleteCompletedButton");
  
    // 오늘 날짜 표시
    const today = new Date().toLocaleDateString();
    currentDateElement.textContent = today;
  
    // 기존 할 일 로드
    chrome.storage.local.get(["todos"], (result) => {
      const todos = result.todos || [];
      renderTodos(todos);
    });
  
    // 새 할 일 추가 (공통 함수)
    function addTask() {
        const task = input.value.trim();
        if (task) {
            const id = Date.now().toString();
            addTodoToStorage(task, today, id, false);
            input.value = "";
        }
    }

    // Add 버튼 클릭 이벤트
    addButton.addEventListener("click", addTask);

    // 입력창에서 Enter 키 입력 이벤트 추가
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            addTask();
        }
    });
  
    // 완료된 항목 삭제
    deleteCompletedButton.addEventListener("click", () => {
      chrome.storage.local.get(["todos"], (result) => {
        const todos = result.todos || [];
        const updatedTodos = todos.filter(
          (todo) => !(todo.date === today && todo.completed)
        );
        chrome.storage.local.set({ todos: updatedTodos }, () => {
          renderTodos(updatedTodos);
        });
      });
    });
  
    // 할 일 목록 렌더링
    function renderTodos(todos) {
      todoList.innerHTML = "";
      todos
        .filter((todo) => todo.date === today)
        .forEach(({ text, id, completed }) => {
          const listItem = createTodoItem(text, id, completed);
          todoList.appendChild(listItem);
        });
    }
  
    // 새 할 일을 저장
    function addTodoToStorage(text, date, id, completed) {
      chrome.storage.local.get(["todos"], (result) => {
        const todos = result.todos || [];
        todos.push({ text, date, id, completed });
        chrome.storage.local.set({ todos }, () => {
          renderTodos(todos);
        });
      });
    }
  
    // 체크박스 기반으로 할 일 항목 생성
    function createTodoItem(text, id, completed) {
      const listItem = document.createElement("li");
      listItem.classList.add("todo-item");
  
      // 체크박스 생성
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = completed; // 상태에 따라 체크 여부 설정
      checkbox.addEventListener("change", () => {
        updateTodoStatus(id, checkbox.checked);
        taskText.classList.toggle("completed", checkbox.checked);
      });
  
      // 할 일 텍스트
      const taskText = document.createElement("span");
      taskText.textContent = text;
      if (completed) taskText.classList.add("completed");
  
      // 삭제 버튼
      const deleteButton = document.createElement("button");    
      deleteButton.classList.add("delete-btn");
        deleteButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        `;

      deleteButton.addEventListener("click", () => {
        listItem.remove();
        removeTodoFromStorage(id);
      });
  
      // 항목 구성
      listItem.appendChild(checkbox);
      listItem.appendChild(taskText);
      listItem.appendChild(deleteButton);
  
      return listItem;
    }
  
    // 할 일 상태 업데이트
    function updateTodoStatus(id, completed) {
      chrome.storage.local.get(["todos"], (result) => {
        const todos = result.todos || [];
        const updatedTodos = todos.map((todo) =>
          todo.id === id ? { ...todo, completed } : todo
        );
        chrome.storage.local.set({ todos: updatedTodos });
      });
    }
  
    // 할 일 삭제
    function removeTodoFromStorage(id) {
      chrome.storage.local.get(["todos"], (result) => {
        const todos = result.todos || [];
        const updatedTodos = todos.filter((todo) => todo.id !== id);
        chrome.storage.local.set({ todos: updatedTodos });
      });
    }
  });
  