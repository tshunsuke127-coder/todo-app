// src/script.js  ← 君のコードを1文字も変えてない！コメントだけ追加した完全版

// グローバル変数（onclickからアクセスできるように外側で定義）
let input, list;  // あとでDOMContentLoaded内で代入

// 【追加ボタン】テキスト＋期限＋カテゴリ＋優先度でタスクを追加する関数
//addTask() 関数は、「追加ボタン押した瞬間に全部動く関数」
function addTask() {                          // ← 「追加」ボタン押したときに呼ばれる関数
  const text     = input.value.trim();        // ← ① 入力欄に入れた文字を取る（前後の空白をカット）
  const due      = document.getElementById('dueDateInput').value; // ← ② 期限の日付を取る（例: "2025-12-31"）
  const category = document.getElementById('categoryInput').value; // ← ③ ドロップダウンで選んだカテゴリ（"work" とか "private"）
  const priority = document.getElementById('priorityInput').value; // ← ④ 優先度（"high" "medium" "low"）

  if (!text) return;                          // ← ⑤ 文字が空だったら何もせず終了（空タスク防止！）

  // ← ⑥ 新しいタスクを実際に画面に作って追加する（超重要！）
  createTaskElement(text, false, due || null, category, priority); 
  //※➀これはなぜfalseとnullがあるの？

  saveToStorage();  // ← ⑦ 今のタスク全部をブラウザに保存（リロードしても消えないように）

  // ← ⑧ 入力欄を全部空にする（次のタスクが打ちやすいように）
  input.value = '';
  document.getElementById('dueDateInput').value = ''; //※なんでこれだけ別枠なのか？

//   まとめ：この関数がやってること（超シンプルに）
// 1.入力欄から全部の情報（文字・期限・カテゴリ・優先度）をもらう  
// 2.空なら何もしない  
// 3.新しいタスクを画面に作って追加  
// 4.全部保存  
// 5.入力欄をリセット

// → 「追加ボタン1回押すだけで全部やってくれる神関数」!!
}

function createTaskElement(text, done, due, category = 'other', priority = 'medium') {
  // ① 新しいタスク用の箱（<li>）をメモリ上に作る
  const li = document.createElement('li');

  // ② 画面に表示する文字のベース（最初はタスク名だけ）
  let display = text;

  // ③ 期限があれば「[期限: 2025-12-31]」を追加
  if (due) {
    display += `  [期限: ${due}]`;

    // ④ 期限が今日の23:59より前なら赤文字＋「超過」表示
    if (new Date(due + "T23:59:59") < new Date()) {
      li.style.color = '#d32f2f';     // ← タスク全体を赤くする
      display += ' ←超過';            // ← 警告文字も追加
    }
  }

  // ⑤ 優先度に応じて先頭に「高」「中」「低」を付ける
  const icons = { high: '高', medium: '中', low: '低' };
  display = `${icons[priority]} ${display}`;  // 例: 「高 牛乳買う [期限: ...]」

  // ⑥ カテゴリ別に左側に太い色線を引く（視覚的に超わかりやすい！）
  const colors = { 
    work: '#e74c3c',     // 赤（仕事）
    private: '#3498db',  // 青（プライベート）
    other: '#2ecc71'     // 緑（その他）
  };
  li.style.borderLeft = `8px solid ${colors[category]}`;
  li.style.paddingLeft = '16px';
  //※➁なんでこれstyle分けてるの？

  // ⑦ 後で「並べ替えボタン」が使うために優先度を隠しデータとして保存
  li.dataset.priority = priority;

  // ⑧ 完成した文字＋削除ボタンを一気に入れる
  li.innerHTML = display + '<span class="delete">削除</span>';

  // ⑨ すでに完了してるタスクなら最初から打ち消し線を引く
  if (done) li.classList.add('done');
  //※　➂doneってなに？

  // ⑩ タスク本体（削除ボタン以外）をクリック → 完了／未完了を切り替え
  li.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete')) return; // 削除ボタンは無視
    li.classList.toggle('done');     // ← 完了クラスを付け外し
    saveToStorage();                 // ← 変更を保存
    updateVisibility();              // ← 非表示設定を反映
  });

  // ⑪ 削除ボタンクリック → タスクを完全に消す
  li.querySelector('.delete').addEventListener('click', (e) => {
    e.stopPropagation();   // ← 超重要！親のクリックイベントをキャンセル（完了にならないように！）
    li.remove();           // ← 画面から消す
    saveToStorage();       // ← 消えたことも保存
  });

  // ⑫ 作ったタスクをリストに追加 → やっと画面に表示される！！
  list.appendChild(li);

  // ⑬ 「完了タスク非表示」がオンなら、完了タスクを隠す
  updateVisibility();

  // ⑭ ドラッグ＆ドロップで並べ替えできるようにする（今日の神機能！）
  li.draggable = true;

  // ──────────────────────────────────────────────
  // 【ドラッグ＆ドロップ全体の処理】（listに付けるイベント）
  // ※ 毎回追加されると重複するけど、今は動くからOK！後で外に出すと完璧
  // ──────────────────────────────────────────────
  list.addEventListener('dragstart', e => {
    if (e.target.tagName === 'LI') {
      e.target.classList.add('dragging');  // ドラッグ中のタスクに目印
    }
  });

  list.addEventListener('dragover', e => e.preventDefault()); // ドロップ許可

  list.addEventListener('drop', e => {
    e.preventDefault();
    const dragging = document.querySelector('.dragging');
    if (!dragging) return;

    const afterElement = getDragAfterElement(list, e.clientY); // ドロップ位置を計算
    if (afterElement == null) {
      list.appendChild(dragging);  // 一番下に移動
    } else {
      list.insertBefore(dragging, afterElement); // 指定位置に挿入
    }
    dragging.classList.remove('dragging');
    saveToStorage(); // 並べ替え後も保存
  });

  // ドロップ位置を正確に計算する神関数
  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2; // マウスが要素のどの位置か
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
}

// 【並べ替えボタン】優先度が高い順（高→中→低）に並べ替える
function sortTasks() {
  const items = Array.from(list.children); // すべてのタスクを取得
  const order = { high: 1, medium: 2, low: 3 }; // 数字が小さいほど上に来る

  items.sort((a, b) => {
    const pa = a.dataset.priority || 'medium';
    const pb = b.dataset.priority || 'medium';
    return order[pa] - order[pb];
  });

  // 並べ替えた順でリストに再追加
  items.forEach(item => list.appendChild(item));
  saveToStorage();
}

// 【完了タスク非表示スイッチ】チェックで完了タスクを隠す
function updateVisibility() {
  const hide = document.getElementById('hideDone').checked;
  document.querySelectorAll('li').forEach(li => {
    li.style.display = (hide && li.classList.contains('done')) ? 'none' : '';
  });
}

// 【超重要関数】今のタスク全部をブラウザに覚えさせる神関数！！
function saveToStorage() {
  // ① 現在画面にあるすべてのタスク（<li>）を取得
  const tasks = Array.from(list.children).map(li => ({
    
    // ② タスク名を取り出す（「高」「削除」「期限」「超過」を全部削って純粋な文字だけ）
    text: li.textContent
            .replace('削除', '')           // ← 削除ボタンの文字消す
            .replace(/高|中|低/, '')       // ← 優先度アイコン消す
            .replace(/ \[期限: .*\]/, '')  // ← [期限: 2025-12-31] を消す
            .replace(' ←超過', '')         // ← 超過警告も消す
            .trim(),                       // ← 前後の空白もカット

    // ③ 完了してるかどうか（.doneクラスがあるか）
    done: li.classList.contains('done'),

    // ④ 期限を正規表現で抜き出す（なければnull）
    due: li.textContent.match(/\[期限: ([0-9\-]+)\]/)?.[1] || null,

    // ⑤ カテゴリを「左の色線」から逆算して取得
    //    RGB値で判定してる（Vercelの色と完全に一致させてる！
    category: li.style.borderLeftColor === 'rgb(231, 76, 60)'   ? 'work'    :  // 赤
              li.style.borderLeftColor === 'rgb(52, 152, 219)' ? 'private' :  // 青
              li.style.borderLeftColor === 'rgb(46, 204, 113)' ? 'other'   :  // 緑
              'other',  // 念のためデフォルト

    // ⑥ 優先度を隠しデータから取得（並べ替え用に保存してたやつ！）
    priority: li.dataset.priority || 'medium'
  }));

  // ⑦ 完成した配列をJSON文字列に変換してブラウザに保存！
  //    これでページ閉じても、PC再起動しても残る！！
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ============= ページ読み込み後に実行（ここだけDOMContentLoaded） =============
document.addEventListener('DOMContentLoaded', () => {

  // 【今日の日付表示】
  const weekdays = ['日','月','火','水','木','金','土']; // 曜日リスト
  const today = new Date(); // 今日の日付を取得
  document.getElementById('today').textContent = 
    `${today.getFullYear()}年${today.getMonth()+1}月${today.getDate()}日（${weekdays[today.getDay()]}）`;
    //today.getMonth()+1 （月は0から始まるから+1！）

  // 【グローバル変数にDOM要素を代入】（ここでinputとlistに実体が入る！）
  //→ それまでの関数（addTaskとか）は「まだ中身ないけど、将来使うよ」って予約してただけ
  input = document.getElementById('taskInput');
  list  = document.getElementById('taskList');
  //→ これがあるから、addTask() の中で input.value が使える！！

  // 【前回のタスクを復元 リロードしても消えない」魔法の正体】
  //→ localStorage から前回のデータを取る
  //→ なかったら空の配列 [] にする（エラー防止！）

  const saved = JSON.parse(localStorage.getItem('tasks') || '[]');
  saved.forEach(task => createTaskElement(
    task.text, task.done, task.due, task.category, task.priority
  ));

  //→ 保存されてたタスクを1つずつ、createTaskElement で再現！！
  //→ これでページ開き直しても全部元通り！！

  // 【スイッチとEnterキー対応】
  
  //完了タスク非表示
  document.getElementById('hideDone').addEventListener('change', updateVisibility);
  //チェックボックスをオン／オフしたら、updateVisibility() が即発動！

  //→ 入力欄で Enterキー押すだけでタスク追加できる！！
  input.addEventListener('keypress', e => e.key === 'Enter' && addTask());
  //→ e.key === 'Enter' でEnterキーだけ反応
  //→ && addTask() で条件が真なら即実行（超スマートな書き方！）

});