<script>
    {/* // script.jsの一番上にこれを追加（超重要！） */}
document.addEventListener('DOMContentLoaded', () => {

 // ==================== 【1】今日の日付表示 ====================
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const today = new Date();
  document.getElementById('today').textContent = 
    `${today.getFullYear()}年${today.getMonth()+1}月${today.getDate()}日（${weekdays[today.getDay()]}）`;

  // ==================== 【2】変数キャッシュ ====================
  const input = document.getElementById('taskInput');
  const list  = document.getElementById('taskList');

  /* ==================== 【3】保存データ復元 ==================== */
  // これもそのまま
  const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  savedTasks.forEach(task => 
    addTaskToDOM(task.text, task.done, task.due || null, task.category || 'other')
  );

  /* ==================== 【4】addTask関数 ==================== */
  // ここから関数定義開始（既存のaddTaskがあれば上書き）
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

  /* ==================== 【5】addTaskToDOM関数 ==================== */
  // 既存のaddTaskToDOMを全部消して、これに置き換え
  function addTaskToDOM(text, done, due, category = 'other') {
    const li = document.createElement('li');
    let displayText = text;

    if (due) {
      displayText += `  [期限: ${due}]`;
      if (new Date(due + "T23:59:59") < new Date()) {
        li.style.color = '#d32f2f';
        displayText += ' ←超過';
      }
    }

    const colors = { work: '#d32f2f', private: '#1976d2', other: '#388e3c' };
    li.style.borderLeft = `8px solid ${colors[category]}`;
    li.style.paddingLeft = '16px';

    li.textContent = displayText;
    if (done) li.classList.add('done');

    li.onclick = () => {
      li.classList.toggle('done');
      saveTasks();
      updateVisibility();
    };

    const del = document.createElement('span');
    del.textContent = '削除';
    del.className = 'delete';
    del.onclick = (e) => {
      e.stopPropagation();
      li.remove();
      saveTasks();
    };
    li.appendChild(del);

    list.appendChild(li);
    updateVisibility();
  }

  /* ==================== 【6】完了非表示 ==================== */
  function updateVisibility() {
    const hide = document.getElementById('hideDone').checked;
    document.querySelectorAll('li').forEach(li => {
      if (hide && li.classList.contains('done')) {
        li.style.display = 'none';
      } else {
        li.style.display = '';
      }
    });
  }
  document.getElementById('hideDone').addEventListener('change', updateVisibility);

  /* ==================== 【7】saveTasks関数 ==================== */
  // 既存のsaveTasksがあれば上書き
  function saveTasks() {
    const tasks = Array.from(list.children).map(li => ({
      text: li.textContent
               .replace('削除', '')
               .replace(/ \[期限: .*\]/, '')
               .replace(' ←超過', '')
               .trim(),
      done: li.classList.contains('done'),
      due: li.textContent.match(/\[期限: ([0-9\-]+)\]/)?.[1] || null,
      category: li.style.borderLeft.includes('205,50,50') ? 'work' :
                li.style.borderLeft.includes('25,118,210') ? 'private' : 'other'
    }));
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  /* ==================== 【8】Enterキー対応 ==================== */
  input.addEventListener('keypress', e => {
    if (e.key === 'Enter') addTask();
  });

  }); 
  {/* ↑ DOMContentLoadedの閉じカッコ */}
</script>