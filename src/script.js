// src/script.js

document.addEventListener('DOMContentLoaded', () => {

  // 【1】今日の日付を「2025年12月6日（土）」の形で表示
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const today = new Date(); // 今日の日付オブジェクト
  document.getElementById('today').textContent = 
    `${today.getFullYear()}年${today.getMonth()+1}月${today.getDate()}日（${weekdays[today.getDay()]}）`;

  // 【2】よく使うDOM要素を変数にキャッシュ（高速化のため）
  const input = document.getElementById('taskInput');   // テキスト入力欄
  const list  = document.getElementById('taskList');   // <ul>のリスト本体

  // 【3】ページを開いたときに前回のタスクを復元
  const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  // 例: [{text:"買い物", done:false, due:"2025-12-10", category:"private"}, ...]
  savedTasks.forEach(task => 
    addTaskToDOM(task.text, task.done, task.due || null, task.category || 'other')
  );

  // 【4】「追加」ボタン押したとき or Enterキーの処理
  function addTask() {
    const text     = input.value.trim();                    // 入力したタスク名
    const dueDate  = document.getElementById('dueDateInput').value; // 期限
    const category = document.getElementById('categoryInput').value; // カテゴリ

    if (!text) return; // 空なら何もしない

    // 新しいタスクを画面に追加
    addTaskToDOM(text, false, dueDate || null, category);

    saveTasks();        // localStorageに保存
    input.value = '';   // 入力欄リセット
    document.getElementById('dueDateInput').value = '';
  }

  // 【5】実際に<li>要素を作ってリストに追加する超重要関数
  function addTaskToDOM(text, done, due, category = 'other') {
    const li = document.createElement('li');     // <li>作成
    let displayText = text;                      // 表示する文字列

    // 期限があれば「[期限: 2025-12-10]」を追加
    if (due) {
      displayText += `  [期限: ${due}]`;
      // 期限が今日23:59より前なら赤文字＋「超過」
      if (new Date(due + "T23:59:59") < new Date()) {
        li.style.color = '#d32f2f';
        displayText += ' ←超過';
      }
    }

    // カテゴリ別に左側に色線を引く
    const colors = { work: '#d32f2f', private: '#1976d2', other: '#388e3c' };
    li.style.borderLeft = `8px solid ${colors[category]}`;
    li.style.paddingLeft = '16px';

    li.textContent = displayText;                // 文字を入れる
    if (done) li.classList.add('done');          // 完了済みなら線を引く

    // タスクをクリック → 完了／未完了を切り替え
    li.onclick = () => {
      li.classList.toggle('done');
      saveTasks();
      updateVisibility();
    };

    // 削除ボタン（絵文字）
    const del = document.createElement('span');
    del.textContent = '削除';
    del.className = 'delete';
    del.onclick = (e) => {
      e.stopPropagation(); // liのクリックイベントをキャンセル
      li.remove();
      saveTasks();
    };
    li.appendChild(del);

    list.appendChild(li);                        // リストに追加
    updateVisibility();                          // 非表示設定を反映
  }

  // 【6】完了タスク非表示スイッチの処理
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
  // スイッチが動いたら即反映
  document.getElementById('hideDone').addEventListener('change', updateVisibility);

  // 【7】localStorageに今のタスク全部を保存（一番難しい部分！）
  function saveTasks() {
    const tasks = Array.from(list.children).map(li => ({
      text:     li.textContent
                  .replace('削除', '')
                  .replace(/ \[期限: .*\]/, '')
                  .replace(' ←超過', '')
                  .trim(),
      done:     li.classList.contains('done'),
      due:      li.textContent.match(/\[期限: ([0-9\-]+)\]/)?.[1] || null,
      category: li.style.borderLeft.includes('205,50,50')  ? 'work' :
                li.style.borderLeft.includes('25,118,210') ? 'private' : 'other'
    }));
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  // 【8】Enterキーでも追加できるように
  input.addEventListener('keypress', e => {
    if (e.key === 'Enter') addTask();
  });
});
