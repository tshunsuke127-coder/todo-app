document.addEventListener('DOMContentLoaded', () => {

  // === 今日の日付 ===
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const today = new Date();
  document.getElementById('today').textContent = 
    `${today.getFullYear()}年${today.getMonth()+1}月${today.getDate()}日（${weekdays[today.getDay()]}）`;

  // === 要素キャッシュ ===
  const input = document.getElementById('taskInput');
  const list  = document.getElementById('taskList');

  // === 保存復元 ===
  const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  savedTasks.forEach(task => 
    addTaskToDOM(task.text, task.done, task.due, task.category)
  );

  // === addTask（外から呼べるように公開） ===
  function addTask() {
    const text     = input.value.trim();
    const dueDate  = document.getElementById('dueDateInput').value;
    const category = document.getElementById('categoryInput').value;
    if (!text) return;

    addTaskToDOM(text, false, dueDate || null, category);
    saveTasks();

    input.value = '';
    document.getElementById('dueDateInput').value = '';
  }
  window.addTask = addTask;  // ← 重要

  // === DOM追加 ===
  function addTaskToDOM(text, done, due, category = 'other') {
    const li = document.createElement('li');

    // タスク名は span に入れる（保存が安定）
    const nameSpan = document.createElement('span');
    nameSpan.className = "taskName";
    nameSpan.textContent = text;

    // 期限表示
    const dueSpan = document.createElement('span');
    if (due) {
      dueSpan.textContent = ` [期限: ${due}]`;

      if (new Date(due + "T23:59:59") < new Date()) {
        li.style.color = '#d32f2f';
        dueSpan.textContent += ' ←超過';
      }
    }

    // カテゴリ色
    const colors = { work: '#d32f2f', private: '#1976d2', other: '#388e3c' };
    li.style.borderLeft = `8px solid ${colors[category]}`;
    li.style.paddingLeft = '16px';
    li.dataset.category = category;

    // 完了状態
    if (done) li.classList.add('done');

    // 完了トグル
    li.onclick = () => {
      li.classList.toggle('done');
      saveTasks();
      updateVisibility();
    };

    // 削除ボタン
    const del = document.createElement('span');
    del.textContent = '削除';
    del.className = 'delete';
    del.onclick = (e) => {
      e.stopPropagation();
      li.remove();
      saveTasks();
    };



    // DOM構築
    li.appendChild(nameSpan);
    li.appendChild(dueSpan);
    li.appendChild(del);
    list.appendChild(li);

    updateVisibility();
  }

  // === 完了非表示 ===
  function updateVisibility() {
    const hide = document.getElementById('hideDone').checked;
    document.querySelectorAll('li').forEach(li => {
      li.style.display = (hide && li.classList.contains('done')) ? 'none' : '';
    });
  }
  document.getElementById('hideDone').addEventListener('change', updateVisibility);

  // === 保存 ===
  function saveTasks() {
    const tasks = Array.from(list.children).map(li => ({
      text: li.querySelector('.taskName').textContent,
      done: li.classList.contains('done'),
      due : li.textContent.match(/\[期限: ([0-9\-]+)/)?.[1] || null,
      category: li.dataset.category
    }));
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  // === Enterキー ===
  input.addEventListener('keypress', e => {
    if (e.key === 'Enter') addTask();
  });

  function sortTasks() {
  const items = Array.from(list.children);

  // 完了してないタスク → 完了済みの順に変更
  items.sort((a, b) => {
    const doneA = a.classList.contains('done') ? 1 : 0;
    const doneB = b.classList.contains('done') ? 1 : 0;
    return doneA - doneB; 
  });

  items.forEach(li => list.appendChild(li));
  saveTasks();
}
window.sortTasks = sortTasks;  // ← HTML から呼べるように

});

