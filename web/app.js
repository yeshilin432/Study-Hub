/* ==================== StudyHub Web — app.js ==================== */

/* ========== Utility ========== */
function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}
function pad(n) { return String(n).padStart(2, '0'); }
function todayStr() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

/* ========== State ========== */
var currentUser = null;
var isOnlineMode = false;
var loginMode = 'login';
var currentPage = 'dashboard';
var roomUnsubscribers = [];
var selectedPomoId = null;
var pomoTimer = null;
var pomoRemaining = 0;
var pomoRunning = false;
var calMonth = new Date().getMonth();
var calYear = new Date().getFullYear();
var selectedDate = todayStr();
var currentRoom = null;
var roomFilter = 'joined';
var quoteMode = 'fixed';
var pomoColors = ['#4F6DEB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
var selectedPomoColor = '#4F6DEB';
var semesterStep = 0;

function isFirebaseReady() {
  return typeof firebase !== 'undefined' && firebase.auth && window.firebaseConfig && window.firebaseConfig.apiKey !== 'YOUR_API_KEY';
}

/* ========== Data Storage ========== */
function getStore() {
  try { return JSON.parse(localStorage.getItem('studyhub_v3') || '{}'); }
  catch(e) { return {}; }
}
function saveStore(data) {
  localStorage.setItem('studyhub_v3', JSON.stringify(data));
}
function getKey(key, def) {
  var s = getStore();
  return s[key] !== undefined ? s[key] : def;
}
function setKey(key, val) {
  var s = getStore();
  s[key] = val;
  saveStore(s);
}

/* ========== Init Default Data ========== */
function initDefaults() {
  var s = getStore();
  if (!s.todos) s.todos = [
    { id: uid(), content: '完成高数作业', done: false, date: todayStr() },
    { id: uid(), content: '背 50 个单词', done: true, date: todayStr() },
    { id: uid(), content: '复习线代第三章', done: false, date: todayStr() }
  ];
  if (!s.ddls) s.ddls = [
    { id: uid(), name: '英语四级报名', date: '09/20', urgent: false },
    { id: uid(), name: '数据结构大作业', date: '10/15', urgent: false },
    { id: uid(), name: '马原论文', date: '09/30', urgent: true }
  ];
  if (!s.courses) s.courses = [
    { id: uid(), name: '高等数学', teacher: '张教授', room: '教1-201', day: 1, period: 1, color: '#4F6DEB' },
    { id: uid(), name: '大学英语', teacher: '李老师', room: '教2-305', day: 1, period: 3, color: '#10B981' },
    { id: uid(), name: '数据结构', teacher: '王教授', room: '实验楼A302', day: 2, period: 2, color: '#F59E0B' },
    { id: uid(), name: '线性代数', teacher: '赵老师', room: '教1-101', day: 3, period: 1, color: '#8B5CF6' },
    { id: uid(), name: '计算机网络', teacher: '陈教授', room: '教3-401', day: 3, period: 3, color: '#EF4444' },
    { id: uid(), name: '毛泽东思想概论', teacher: '孙老师', room: '教1-201', day: 4, period: 2, color: '#EC4899' },
    { id: uid(), name: '高等数学', teacher: '张教授', room: '教1-201', day: 5, period: 1, color: '#4F6DEB' },
    { id: uid(), name: '大学物理', teacher: '周教授', room: '教2-201', day: 5, period: 3, color: '#14B8A6' }
  ];
  if (!s.periods) s.periods = [
    { n: 1, start: '08:00', end: '08:45' },
    { n: 2, start: '08:55', end: '09:40' },
    { n: 3, start: '10:00', end: '10:45' },
    { n: 4, start: '10:55', end: '11:40' },
    { n: 5, start: '14:00', end: '14:45' },
    { n: 6, start: '14:55', end: '15:40' },
    { n: 7, start: '16:00', end: '16:45' },
    { n: 8, start: '16:55', end: '17:40' }
  ];
  if (!s.pomodoros) s.pomodoros = [
    { id: uid(), name: '深度阅读', duration: 25, category: '阅读', color: '#10B981' },
    { id: uid(), name: '专注编程', duration: 50, category: '编程', color: '#4F6DEB' },
    { id: uid(), name: '英语听力', duration: 30, category: '学习', color: '#F59E0B' },
    { id: uid(), name: '高数复习', duration: 45, category: '复习', color: '#8B5CF6' },
    { id: uid(), name: '论文写作', duration: 60, category: '写作', color: '#EC4899' },
    { id: uid(), name: '快速记忆', duration: 20, category: '学习', color: '#14B8A6' }
  ];
  if (!s.focusRecords) s.focusRecords = [];
  if (!s.quoteNotes) s.quoteNotes = [
    { id: uid(), content: '星光不问赶路人，时光不负有心人。', source: '佚名', category: '诗词' },
    { id: uid(), content: '千里之行，始于足下。', source: '《道德经》', category: '书籍' },
    { id: uid(), content: '生活就像一盒巧克力，你永远不知道下一块是什么味道。', source: '阿甘正传', category: '电影' }
  ];
  if (!s.quoteFixed) s.quoteFixed = { text: '星光不问赶路人，时光不负有心人。', author: '—— 佚名' };
  if (!s.quoteMode) s.quoteMode = 'fixed';
  if (!s.stickyNote) s.stickyNote = '';
  if (!s.semesterGoals) s.semesterGoals = '';
  if (!s.rooms) s.rooms = [];
  if (!s.myRooms) s.myRooms = [];
  if (!s.theme) s.theme = 'default';
  if (!s.userNickname) s.userNickname = '学习者';
  saveStore(s);
}

/* ========== Quote System ========== */
var systemQuotes = [
  { text: '学而时习之，不亦说乎？', author: '—— 孔子' },
  { text: '千里之行，始于足下。', author: '—— 老子' },
  { text: '业精于勤，荒于嬉。', author: '—— 韩愈' },
  { text: '书山有路勤为径，学海无涯苦作舟。', author: '—— 韩愈' },
  { text: '少壮不努力，老大徒伤悲。', author: '—— 汉乐府' },
  { text: '宝剑锋从磨砺出，梅花香自苦寒来。', author: '—— 《警世贤文》' },
  { text: '一寸光阴一寸金，寸金难买寸光阴。', author: '—— 王贞白' },
  { text: '路漫漫其修远兮，吾将上下而求索。', author: '—— 屈原' },
  { text: '不积跬步，无以至千里。', author: '—— 荀子' },
  { text: '为中华之崛起而读书。', author: '—— 周恩来' }
];

function getDailyQuote() {
  var mode = getKey('quoteMode', 'fixed');
  if (mode === 'fixed') {
    var q = getKey('quoteFixed', { text: '星光不问赶路人，时光不负有心人。', author: '—— 佚名' });
    return { text: q.text, author: q.author };
  } else if (mode === 'random') {
    var dayIdx = new Date().getDate() % systemQuotes.length;
    return systemQuotes[dayIdx];
  } else {
    var notes = getKey('quoteNotes', []);
    if (notes.length === 0) return { text: '还没有收藏名言，快去添加吧～', author: '—— StudyHub' };
    var dayIdx = new Date().getDate() % notes.length;
    return { text: notes[dayIdx].content, author: '—— ' + notes[dayIdx].source };
  }
}

function setQuoteMode(mode) {
  setKey('quoteMode', mode);
  quoteMode = mode;
  document.querySelectorAll('.quote-mode-tab').forEach(function(t) {
    t.classList.toggle('active', t.getAttribute('data-param') === mode);
  });
  renderQuote();
  if (typeof trackEvent === 'function') trackEvent('quote_mode_change', { mode: mode });
}

function renderQuote() {
  var q = getDailyQuote();
  var rText = document.getElementById('rightQuoteText');
  var rAuth = document.getElementById('rightQuoteAuthor');
  var dText = document.getElementById('dashQuoteText');
  var dAuth = document.getElementById('dashQuoteAuthor');
  if (rText) rText.textContent = q.text;
  if (rAuth) rAuth.textContent = q.author;
  if (dText) dText.textContent = q.text;
  if (dAuth) dAuth.textContent = q.author;
}

/* ========== Holidays ========== */
var holidays = {
  '01-01': '元旦',
  '02-10': '春节',
  '02-11': '春节',
  '02-12': '春节',
  '02-13': '春节',
  '04-04': '清明节',
  '05-01': '劳动节',
  '05-02': '劳动节',
  '05-03': '劳动节',
  '06-10': '端午节',
  '09-17': '中秋节',
  '10-01': '国庆节',
  '10-02': '国庆节',
  '10-03': '国庆节',
  '10-04': '国庆节',
  '10-05': '国庆节',
  '10-06': '国庆节',
  '10-07': '国庆节'
};
function getHoliday(month, day) {
  var key = pad(month) + '-' + pad(day);
  return holidays[key] || null;
}

/* ========== Navigation ========== */
function navTo(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item[data-action="navTo"]').forEach(function(item) {
    item.classList.toggle('active', item.getAttribute('data-param') === page);
  });
  document.querySelectorAll('.page').forEach(function(p) {
    p.style.display = 'none';
  });
  var target = document.getElementById('page-' + page);
  if (target) target.style.display = 'block';

  if (page === 'dashboard') renderDashboard();
  if (page === 'schedule') renderSchedule();
  if (page === 'tasks') renderTasksPage();
  if (page === 'pomodoro') renderPomodoroPage();
  if (page === 'rooms') renderRoomsPage();
  if (page === 'calendar') renderCalendarPage();
  if (page === 'profile') renderProfilePage();

  if (typeof trackEvent === 'function') trackEvent('page_view', { page: page });
}

/* ========== Dashboard ========== */
function renderDashboard() {
  var todos = getKey('todos', []);
  var ddls = getKey('ddls', []);
  var focusRecords = getKey('focusRecords', []);
  var rooms = getKey('myRooms', []);
  var today = todayStr();

  var todayFocus = focusRecords.filter(function(r) { return r.date === today; })
    .reduce(function(sum, r) { return sum + r.duration; }, 0);
  var doneCount = todos.filter(function(t) { return t.done; }).length;
  var ddlCount = ddls.length;

  document.getElementById('statTodayFocus').textContent = todayFocus;
  document.getElementById('statTodoDone').textContent = doneCount + '/' + todos.length;
  document.getElementById('statDdlCount').textContent = ddlCount;
  document.getElementById('statRoomCount').textContent = rooms.length;

  renderTodaySchedule();
  renderDashboardTodos();
  renderPomoQuickGrid();
}

function renderTodaySchedule() {
  var courses = getKey('courses', []);
  var periods = getKey('periods', []);
  var todayDay = new Date().getDay();
  if (todayDay === 0) todayDay = 7;

  var todayCourses = courses.filter(function(c) { return c.day === todayDay; })
    .sort(function(a, b) { return a.period - b.period; });

  var html = '';
  if (todayCourses.length === 0) {
    html = '<div class="mini-empty">今天没有课，好好休息～</div>';
  } else {
    todayCourses.forEach(function(c) {
      var period = periods[c.period - 1] || { start: '', end: '' };
      html += '<div class="schedule-item">' +
        '<div class="si-bar" style="background:' + c.color + '"></div>' +
        '<span class="si-time">' + period.start + '</span>' +
        '<span class="si-name">' + escapeHtml(c.name) + '</span>' +
        '<span class="si-time">' + escapeHtml(c.room) + '</span>' +
        '</div>';
    });
  }
  document.getElementById('todaySchedulePreview').innerHTML = html;
}

function renderDashboardTodos() {
  var todos = getKey('todos', []);
  var html = '';
  if (todos.length === 0) {
    html = '<div class="mini-empty">暂无待办</div>';
  } else {
    todos.slice(0, 5).forEach(function(t) {
      html += '<div class="right-todo-item ' + (t.done ? 'done' : '') + '" data-action="toggleTodo" data-id="' + t.id + '">' +
        '<span class="checkbox">' + (t.done ? '✅' : '○') + '</span>' +
        '<span class="item-text">' + escapeHtml(t.content) + '</span>' +
        '</div>';
    });
  }
  document.getElementById('dashTodoList').innerHTML = html;
}

function renderPomoQuickGrid() {
  var pomos = getKey('pomodoros', []);
  var html = '';
  pomos.slice(0, 6).forEach(function(p) {
    html += '<div class="pomo-quick-card" style="background:' + p.color + '20;color:' + p.color + ';" data-action="selectPomo" data-id="' + p.id + '">' +
      '<div class="pomo-quick-name">' + escapeHtml(p.name) + '</div>' +
      '<div class="pomo-quick-dur">' + p.duration + 'min</div>' +
      '</div>';
  });
  document.getElementById('pomoQuickGrid').innerHTML = html;
}

/* ========== Right Sidebar ========== */
function renderRightSidebar() {
  renderQuote();
  document.getElementById('stickyNote').value = getKey('stickyNote', '');
  renderRightTodoList();
}

function renderRightTodoList() {
  var todos = getKey('todos', []);
  var html = '';
  todos.slice(0, 8).forEach(function(t) {
    html += '<div class="right-todo-item ' + (t.done ? 'done' : '') + '" data-action="toggleTodo" data-id="' + t.id + '">' +
      '<span class="checkbox">' + (t.done ? '✅' : '○') + '</span>' +
      '<span class="item-text">' + escapeHtml(t.content) + '</span>' +
      '</div>';
  });
  document.getElementById('rightTodoList').innerHTML = html;
}

/* ========== Schedule Page ========== */
function renderSchedule() {
  renderScheduleTimeCol();
  renderScheduleGrid();
}

function renderScheduleTimeCol() {
  var periods = getKey('periods', []);
  var html = '<div class="time-slot add" data-action="showAddPeriod">+ 新增</div>';
  periods.forEach(function(p, i) {
    html += '<div class="time-slot" data-action="showEditTime" data-period="' + p.n + '" title="点击修改">' +
      p.n + '节<br>' + p.start + '-' + p.end + '</div>';
  });
  document.getElementById('scheduleTimeCol').innerHTML = html;
}

function renderScheduleGrid() {
  var courses = getKey('courses', []);
  var periods = getKey('periods', []);
  var days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  var today = new Date();
  var todayDay = today.getDay();
  if (todayDay === 0) todayDay = 7;

  var html = '';
  for (var d = 1; d <= 7; d++) {
    var isToday = d === todayDay;
    var holiday = getHoliday(today.getMonth() + 1, today.getDate() - todayDay + d);
    html += '<div class="day-header' + (isToday ? ' today' : '') + '">' +
      days[d-1] +
      (holiday ? '<span class="cal-holiday">' + holiday + '</span>' : '') +
      '</div>';
  }

  for (var p = 0; p < periods.length; p++) {
    for (var d = 1; d <= 7; d++) {
      var course = courses.find(function(c) { return c.day === d && c.period === (p+1); });
      if (course) {
        html += '<div class="schedule-cell has-course" style="border-left-color:' + course.color + ';background:' + course.color + '15;color:' + course.color + ';">' +
          escapeHtml(course.name) + '<br>' +
          '<span style="font-size:10px;opacity:0.7;">' + escapeHtml(course.room) + '</span>' +
          '</div>';
      } else {
        html += '<div class="schedule-cell"></div>';
      }
    }
  }
  document.getElementById('scheduleGrid').innerHTML = html;
}

function showEditTime(periodN) {
  var periods = getKey('periods', []);
  var p = periods.find(function(p) { return p.n === Number(periodN); });
  if (!p) return;
  document.getElementById('editPeriodNum').value = p.n;
  document.getElementById('editStartTime').value = p.start;
  document.getElementById('editEndTime').value = p.end;
  showModal('editTimeModal');
}

function confirmEditTime() {
  var n = Number(document.getElementById('editPeriodNum').value);
  var start = document.getElementById('editStartTime').value;
  var end = document.getElementById('editEndTime').value;
  if (!n || !start || !end) return;
  var periods = getKey('periods', []);
  var idx = periods.findIndex(function(p) { return p.n === n; });
  if (idx >= 0) { periods[idx].start = start; periods[idx].end = end; }
  setKey('periods', periods);
  closeModal('editTimeModal');
  renderSchedule();
  syncToFirebase();
}

function confirmAddPeriod() {
  var start = document.getElementById('addStartTime').value;
  var end = document.getElementById('addEndTime').value;
  if (!start || !end) return;
  var periods = getKey('periods', []);
  periods.push({ n: periods.length + 1, start: start, end: end });
  setKey('periods', periods);
  closeModal('addPeriodModal');
  renderSchedule();
  syncToFirebase();
}

/* ========== Tasks Page ========== */
function renderTasksPage() {
  var todos = getKey('todos', []);
  var ddls = getKey('ddls', []);

  var todoHtml = '';
  if (todos.length === 0) {
    todoHtml = '<div class="mini-empty">暂无待办，点击右上角添加</div>';
  } else {
    todos.forEach(function(t) {
      todoHtml += '<div class="task-item ' + (t.done ? 'done' : '') + '" data-action="toggleTodo" data-id="' + t.id + '">' +
        '<span class="checkbox">' + (t.done ? '✅' : '○') + '</span>' +
        '<span class="task-text">' + escapeHtml(t.content) + '</span>' +
        '</div>';
    });
  }
  document.getElementById('fullTodoList').innerHTML = todoHtml;

  var ddlHtml = '';
  if (ddls.length === 0) {
    ddlHtml = '<div class="mini-empty">暂无DDL，点击右上角添加</div>';
  } else {
    ddls.sort(function(a, b) {
      var aParts = a.date.split('/'); var bParts = b.date.split('/');
      return (Number(aParts[0])*100 + Number(aParts[1])) - (Number(bParts[0])*100 + Number(bParts[1]));
    });
    ddls.forEach(function(d) {
      ddlHtml += '<div class="task-item ' + (d.urgent ? 'ddl-urgent' : '') + '" data-action="toggleDdl" data-id="' + d.id + '">' +
        '<span class="checkbox">' + (d.done ? '✅' : '○') + '</span>' +
        '<span class="task-text">' + escapeHtml(d.name) + '</span>' +
        '<span class="task-date">' + d.date + '</span>' +
        '</div>';
    });
  }
  document.getElementById('fullDdlList').innerHTML = ddlHtml;
}

function toggleTodo(id) {
  var todos = getKey('todos', []);
  var t = todos.find(function(t) { return t.id === id; });
  if (t) { t.done = !t.done; setKey('todos', todos); renderAll(); syncToFirebase(); }
}

function toggleDdl(id) {
  var ddls = getKey('ddls', []);
  var d = ddls.find(function(d) { return d.id === id; });
  if (d) { d.done = !d.done; setKey('ddls', ddls); renderAll(); syncToFirebase(); }
}

function confirmAddTodo() {
  var content = document.getElementById('todoInput').value.trim();
  if (!content) return;
  var todos = getKey('todos', []);
  todos.unshift({ id: uid(), content: content, done: false, date: todayStr() });
  setKey('todos', todos);
  document.getElementById('todoInput').value = '';
  closeModal('addTodoModal');
  renderAll();
  syncToFirebase();
}

function confirmAddDdl() {
  var name = document.getElementById('ddlNameInput').value.trim();
  var date = document.getElementById('ddlDateInput').value.trim();
  if (!name || !date) return;
  if (!/^\d{1,2}\/\d{1,2}$/.test(date)) { alert('日期格式应为 MM/DD，如 09/15'); return; }
  var ddls = getKey('ddls', []);
  ddls.push({ id: uid(), name: name, date: date, done: false, urgent: false });
  setKey('ddls', ddls);
  document.getElementById('ddlNameInput').value = '';
  document.getElementById('ddlDateInput').value = '';
  closeModal('addDdlModal');
  renderAll();
  syncToFirebase();
}

/* ========== Pomodoro Page ========== */
function renderPomodoroPage() {
  var pomos = getKey('pomodoros', []);
  var html = '';
  pomos.forEach(function(p) {
    html += '<div class="pomo-card-item ' + (selectedPomoId === p.id ? 'active' : '') + '" style="background:' + p.color + '20;color:' + p.color + ';" data-action="selectPomo" data-id="' + p.id + '">' +
      '<div class="pomo-card-name">' + escapeHtml(p.name) + '</div>' +
      '<div class="pomo-card-dur">' + p.duration + ' 分钟</div>' +
      '<div class="pomo-card-cat">' + escapeHtml(p.category) + '</div>' +
      '</div>';
  });
  document.getElementById('pomoCardGrid').innerHTML = html;
  renderColorPicker();
}

function renderColorPicker() {
  var html = '';
  pomoColors.forEach(function(c) {
    html += '<div class="color-opt ' + (selectedPomoColor === c ? 'selected' : '') + '" style="background:' + c + ';" data-action="selectPomoColor" data-color="' + c + '"></div>';
  });
  document.getElementById('pomoColorPicker').innerHTML = html;
}

function selectPomo(id) {
  selectedPomoId = id;
  var pomos = getKey('pomodoros', []);
  var p = pomos.find(function(p) { return p.id === id; });
  if (!p) return;
  document.getElementById('timerName').textContent = p.name;
  document.getElementById('timerCat').textContent = p.category;
  document.getElementById('timerClock').textContent = pad(Math.floor(p.duration / 60)) + ':' + pad(p.duration % 60);
  document.getElementById('pomoControls').style.display = 'flex';
  pomoRemaining = p.duration * 60;
  if (pomoTimer) { clearInterval(pomoTimer); pomoTimer = null; pomoRunning = false; }
  document.getElementById('startPomoBtn').textContent = '开始';
  renderPomodoroPage();
  if (typeof trackEvent === 'function') trackEvent('pomo_select', { name: p.name, duration: p.duration });
}

function startPomo() {
  if (!selectedPomoId) return;
  if (pomoRunning) {
    // pause
    clearInterval(pomoTimer);
    pomoTimer = null;
    pomoRunning = false;
    document.getElementById('startPomoBtn').textContent = '继续';
  } else {
    // start/resume
    pomoRunning = true;
    document.getElementById('startPomoBtn').textContent = '暂停';
    pomoTimer = setInterval(function() {
      pomoRemaining--;
      var m = Math.floor(pomoRemaining / 60);
      var s = pomoRemaining % 60;
      document.getElementById('timerClock').textContent = pad(m) + ':' + pad(s);
      if (pomoRemaining <= 0) {
        clearInterval(pomoTimer);
        pomoTimer = null;
        pomoRunning = false;
        finishPomo();
      }
    }, 1000);
  }
}

function stopPomo() {
  if (pomoTimer) { clearInterval(pomoTimer); pomoTimer = null; }
  pomoRunning = false;
  if (selectedPomoId) {
    var pomos = getKey('pomodoros', []);
    var p = pomos.find(function(p) { return p.id === selectedPomoId; });
    if (p) {
      document.getElementById('timerClock').textContent = pad(Math.floor(p.duration / 60)) + ':' + pad(p.duration % 60);
      pomoRemaining = p.duration * 60;
    }
  }
  document.getElementById('startPomoBtn').textContent = '开始';
}

function finishPomo() {
  var pomos = getKey('pomodoros', []);
  var p = pomos.find(function(p) { return p.id === selectedPomoId; });
  if (!p) return;
  var records = getKey('focusRecords', []);
  records.unshift({
    id: uid(),
    pomoId: p.id,
    name: p.name,
    category: p.category,
    duration: p.duration,
    date: todayStr(),
    timestamp: Date.now(),
    scene: currentRoom ? '自习室' : '独立'
  });
  setKey('focusRecords', records);
  alert('🎉 恭喜完成一个番茄钟！专注了 ' + p.duration + ' 分钟');
  stopPomo();
  renderAll();
  syncToFirebase();
  if (typeof trackEvent === 'function') trackEvent('pomo_complete', { name: p.name, duration: p.duration });
}

function confirmAddPomo() {
  var name = document.getElementById('pomoNameInput').value.trim();
  var duration = Number(document.getElementById('pomoDurationInput').value);
  var category = document.getElementById('pomoCategoryInput').value;
  if (!name || !duration || duration < 20 || duration > 180) {
    alert('请填写名称，时长 20-180 分钟'); return;
  }
  var pomos = getKey('pomodoros', []);
  pomos.push({ id: uid(), name: name, duration: duration, category: category, color: selectedPomoColor });
  setKey('pomodoros', pomos);
  closeModal('addPomoModal');
  document.getElementById('pomoNameInput').value = '';
  document.getElementById('pomoDurationInput').value = 25;
  renderPomodoroPage();
  syncToFirebase();
}

function selectPomoColor(color) {
  selectedPomoColor = color;
  renderColorPicker();
}

/* ========== Calendar Page ========== */
function renderCalendarPage() {
  renderCalGrid();
  renderCalDetail();
  var title = calYear + '年' + (calMonth + 1) + '月';
  document.getElementById('calTitle').textContent = title;
}

function prevMonth() {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendarPage();
}
function nextMonth() {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendarPage();
}

function renderCalGrid() {
  var firstDay = new Date(calYear, calMonth, 1);
  var lastDay = new Date(calYear, calMonth + 1, 0);
  var startWeekday = firstDay.getDay();
  if (startWeekday === 0) startWeekday = 7;
  var totalDays = lastDay.getDate();
  var todos = getKey('todos', []);
  var ddls = getKey('ddls', []);
  var today = new Date();
  var isTodayMonth = today.getFullYear() === calYear && today.getMonth() === calMonth;

  var html = '';
  var weekdays = ['一', '二', '三', '四', '五', '六', '日'];
  weekdays.forEach(function(d) {
    html += '<div class="cal-head">' + d + '</div>';
  });

  // prev month fill
  var prevLast = new Date(calYear, calMonth, 0).getDate();
  for (var i = startWeekday - 2; i >= 0; i--) {
    html += '<div class="cal-day other-month"><span class="day-num">' + (prevLast - i) + '</span></div>';
  }

  for (var d = 1; d <= totalDays; d++) {
    var dateKey = calYear + '-' + pad(calMonth + 1) + '-' + pad(d);
    var hasTodo = todos.some(function(t) { return t.date === dateKey && !t.done; });
    var dayDdls = ddls.filter(function(ddl) {
      var parts = ddl.date.split('/');
      return Number(parts[0]) === calMonth + 1 && Number(parts[1]) === d && !ddl.done;
    });
    var firstDdl = dayDdls[0];
    var holiday = getHoliday(calMonth + 1, d);
    var isToday = isTodayMonth && today.getDate() === d;
    var isSelected = selectedDate === dateKey;

    html += '<div class="cal-day' + (isToday ? ' today' : '') + (isSelected ? ' selected' : '') + '" data-action="selectCalDate" data-date="' + dateKey + '">';
    html += '<span class="day-num">' + d + '</span>';
    if (holiday) html += '<div class="cal-holiday">' + holiday + '</div>';
    if (firstDdl) html += '<div class="cal-ddl-name">' + escapeHtml(firstDdl.name) + '</div>';
    html += '<div class="cal-dots">';
    if (hasTodo) html += '<span class="dot green"></span>';
    if (dayDdls.length > 0) html += '<span class="dot red"></span>';
    html += '</div>';
    html += '</div>';
  }

  // next month fill
  var remaining = 42 - (startWeekday - 1 + totalDays);
  if (remaining < 0) remaining = 0;
  for (var i = 1; i <= remaining; i++) {
    html += '<div class="cal-day other-month"><span class="day-num">' + i + '</span></div>';
  }

  document.getElementById('calGrid').innerHTML = html;
}

function selectCalDate(dateStr) {
  selectedDate = dateStr;
  renderCalGrid();
  renderCalDetail();
}

function renderCalDetail() {
  var el = document.getElementById('calDetail');
  if (!selectedDate) {
    el.innerHTML = '<div class="cal-detail-empty">点击日期查看详情</div>';
    return;
  }
  var parts = selectedDate.split('-');
  var month = Number(parts[1]);
  var day = Number(parts[2]);
  var todos = getKey('todos', []).filter(function(t) { return t.date === selectedDate; });
  var ddls = getKey('ddls', []).filter(function(d) {
    var p = d.date.split('/');
    return Number(p[0]) === month && Number(p[1]) === day;
  });

  var html = '<div style="font-size:16px;font-weight:600;margin-bottom:16px;">' + month + '月' + day + '日</div>';

  html += '<div class="cal-detail-section">';
  html += '<div class="cal-detail-section-title"><span class="dot green"></span>待办 (' + todos.length + ')</div>';
  if (todos.length === 0) {
    html += '<div class="mini-empty">暂无待办</div>';
  } else {
    todos.forEach(function(t) {
      html += '<div class="detail-item ' + (t.done ? 'done' : '') + '" data-action="toggleTodo" data-id="' + t.id + '">' +
        '<span class="checkbox">' + (t.done ? '✅' : '○') + '</span>' +
        '<span class="item-text">' + escapeHtml(t.content) + '</span></div>';
    });
  }
  html += '</div>';

  html += '<div class="cal-detail-section">';
  html += '<div class="cal-detail-section-title"><span class="dot red"></span>DDL (' + ddls.length + ')</div>';
  if (ddls.length === 0) {
    html += '<div class="mini-empty">暂无DDL</div>';
  } else {
    ddls.forEach(function(d) {
      html += '<div class="detail-item ' + (d.done ? 'done' : '') + '" data-action="toggleDdl" data-id="' + d.id + '">' +
        '<span class="checkbox">' + (d.done ? '✅' : '○') + '</span>' +
        '<span class="item-text">' + escapeHtml(d.name) + '</span></div>';
    });
  }
  html += '</div>';

  el.innerHTML = html;
}

/* ========== Study Rooms ========== */
function renderRoomsPage() {
  document.getElementById('roomListGrid').style.display = '';
  document.getElementById('roomMeetingView').style.display = 'none';
  document.querySelectorAll('.room-tab-btn').forEach(function(b) {
    b.classList.toggle('active', b.getAttribute('data-param') === roomFilter);
  });

  var rooms = roomFilter === 'all' ? getKey('rooms', []) : getKey('myRooms', []);
  var html = '';
  if (rooms.length === 0) {
    html = '<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--text-muted);">暂无自习室，点击右上角创建</div>';
  } else {
    rooms.forEach(function(r) {
      var avatarColor = r.color || '#4F6DEB';
      html += '<div class="room-card" data-action="enterRoom" data-id="' + r.id + '">' +
        '<div class="room-card-header">' +
          '<div class="room-card-avatar" style="background:' + avatarColor + '20;color:' + avatarColor + ';">' + escapeHtml(r.name.charAt(0)) + '</div>' +
          '<div>' +
            '<div class="room-card-name">' + escapeHtml(r.name) + '</div>' +
            '<div class="room-card-meta">' + (r.memberCount || 1) + ' 人在线</div>' +
          '</div>' +
        '</div>' +
        '<div class="room-card-meta">室主：' + escapeHtml(r.owner || '未知') + '</div>' +
      '</div>';
    });
  }
  document.getElementById('roomListGrid').innerHTML = html;
}

function setRoomFilter(filter) {
  roomFilter = filter;
  renderRoomsPage();
}

function showRoomActions() { showModal('roomActionsModal'); }
function showCreateRoom() { closeModal('roomActionsModal'); showModal('createRoomModal'); }
function showJoinRoom() { closeModal('roomActionsModal'); showModal('joinRoomModal'); }

function confirmCreateRoom() {
  var name = document.getElementById('roomNameInput').value.trim();
  var owner = document.getElementById('roomOwnerInput').value.trim() || getKey('userNickname', '学习者');
  if (!name) return;
  var room = {
    id: uid(),
    name: name,
    owner: owner,
    color: pomoColors[Math.floor(Math.random() * pomoColors.length)],
    memberCount: 1,
    members: [{ id: uid(), name: owner, isOwner: true }],
    messages: [],
    createdAt: Date.now()
  };
  var rooms = getKey('rooms', []);
  rooms.push(room);
  setKey('rooms', rooms);
  var myRooms = getKey('myRooms', []);
  myRooms.push(room);
  setKey('myRooms', myRooms);
  document.getElementById('roomNameInput').value = '';
  document.getElementById('roomOwnerInput').value = '';
  closeModal('createRoomModal');
  renderRoomsPage();
  syncToFirebase();
  if (typeof trackEvent === 'function') trackEvent('room_create', { name: name });
}

function confirmJoinRoom() {
  var roomId = document.getElementById('roomJoinIdInput').value.trim();
  var nickname = document.getElementById('roomJoinNameInput').value.trim() || getKey('userNickname', '学习者');
  if (!roomId) return;
  var rooms = getKey('rooms', []);
  var room = rooms.find(function(r) { return r.id === roomId; });
  if (!room) { alert('自习室不存在'); return; }
  var myRooms = getKey('myRooms', []);
  if (!myRooms.find(function(r) { return r.id === roomId; })) {
    myRooms.push(room);
    setKey('myRooms', myRooms);
  }
  setKey('userNickname', nickname);
  document.getElementById('roomJoinIdInput').value = '';
  document.getElementById('roomJoinNameInput').value = '';
  closeModal('joinRoomModal');
  enterRoom(roomId);
  if (typeof trackEvent === 'function') trackEvent('room_join', { roomId: roomId });
}

function enterRoom(roomId) {
  var rooms = getKey('rooms', []);
  var room = rooms.find(function(r) { return r.id === roomId; });
  if (!room) { alert('自习室不存在'); return; }
  currentRoom = room;
  document.getElementById('roomListGrid').style.display = 'none';
  document.getElementById('roomMeetingView').style.display = 'flex';
  document.getElementById('meetingTitle').textContent = room.name;
  renderMeetingMembers();
  renderChatMessages();

  if (isOnlineMode && isFirebaseReady()) {
    subscribeToRoom(roomId);
  }
  if (typeof trackEvent === 'function') trackEvent('room_enter', { roomId: roomId });
}

function closeRoomDetail() {
  currentRoom = null;
  roomUnsubscribers.forEach(function(fn) { try { fn(); } catch(e) {} });
  roomUnsubscribers = [];
  renderRoomsPage();
}

function renderMeetingMembers() {
  if (!currentRoom) return;
  var members = currentRoom.members || [];
  var html = '';
  members.forEach(function(m) {
    var color = currentRoom.color || '#4F6DEB';
    html += '<div class="meeting-member">' +
      '<div class="mm-status-dot"></div>' +
      '<div class="mm-avatar" style="background:' + color + '20;color:' + color + ';">' + escapeHtml(m.name.charAt(0)) + '</div>' +
      '<div class="mm-name">' + escapeHtml(m.name) + '</div>' +
      (m.isOwner ? '<div style="font-size:10px;color:var(--text-muted);margin-top:2px;">室主</div>' : '') +
    '</div>';
  });
  document.getElementById('meetingMembersGrid').innerHTML = html;
}

function renderChatMessages() {
  if (!currentRoom) return;
  var msgs = currentRoom.messages || [];
  var nickname = getKey('userNickname', '学习者');
  var html = '';
  msgs.forEach(function(msg) {
    var isMe = msg.user === nickname;
    html += '<div class="chat-msg ' + (isMe ? 'me' : '') + '">' +
      '<div class="chat-avatar">' + escapeHtml(msg.user.charAt(0)) + '</div>' +
      '<div class="chat-content">' +
        '<div class="chat-bubble">' + escapeHtml(msg.text) + '</div>' +
        '<div class="chat-time">' + msg.time + '</div>' +
      '</div>' +
    '</div>';
  });
  document.getElementById('chatMessages').innerHTML = html;
  document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
}

function sendChat() {
  if (!currentRoom) return;
  var input = document.getElementById('chatInput');
  var text = input.value.trim();
  if (!text) return;
  var nickname = getKey('userNickname', '学习者');
  var now = new Date();
  var time = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
  currentRoom.messages.push({ user: nickname, text: text, time: time, timestamp: Date.now() });
  setKey('rooms', getKey('rooms', []));
  input.value = '';
  renderChatMessages();
  syncRoomToFirebase();
}

function playMusicSync() {
  var url = document.getElementById('ytUrlInput').value.trim();
  if (!url || !currentRoom) return;
  currentRoom.musicUrl = url;
  setKey('rooms', getKey('rooms', []));
  if (typeof MusicSync !== 'undefined' && MusicSync.playUrl) {
    MusicSync.playUrl(url);
  }
  syncRoomToFirebase();
}

function subscribeToRoom(roomId) {
  if (!isFirebaseReady()) return;
  try {
    var unsub = firebase.firestore().collection('rooms').doc(roomId)
      .onSnapshot(function(doc) {
        if (doc.exists) {
          var data = doc.data();
          if (data.members) currentRoom.members = data.members;
          if (data.messages) currentRoom.messages = data.messages;
          if (data.musicUrl) currentRoom.musicUrl = data.musicUrl;
          renderMeetingMembers();
          renderChatMessages();
        }
      });
    roomUnsubscribers.push(unsub);
  } catch(e) { console.warn('Room subscribe error:', e); }
}

function syncRoomToFirebase() {
  if (!isOnlineMode || !isFirebaseReady() || !currentRoom) return;
  try {
    firebase.firestore().collection('rooms').doc(currentRoom.id).set(currentRoom, { merge: true });
  } catch(e) {}
}

/* ========== Profile Page ========== */
function renderProfilePage() {
  var name = getKey('userNickname', '本地用户');
  document.getElementById('profileName').textContent = name;
  document.getElementById('profileAvatar').textContent = name.charAt(0);
  document.getElementById('profileEmail').textContent = isOnlineMode ? (currentUser && currentUser.email) : '本地模式';
  document.getElementById('sidebarName').textContent = name;
  document.getElementById('sidebarAvatar').textContent = name.charAt(0);

  var theme = getKey('theme', 'default');
  document.querySelectorAll('.theme-opt').forEach(function(t) {
    t.classList.toggle('active', t.getAttribute('data-param') === theme);
  });
}

function setTheme(theme) {
  document.body.className = 'theme-' + theme;
  setKey('theme', theme);
  document.querySelectorAll('.theme-opt').forEach(function(t) {
    t.classList.toggle('active', t.getAttribute('data-param') === theme);
  });
  if (typeof trackEvent === 'function') trackEvent('theme_change', { theme: theme });
}

/* ========== Full Pages ========== */
function openSemesterGoals() {
  document.getElementById('semesterGoalsInput').value = getKey('semesterGoals', '');
  document.getElementById('semesterGoalsPage').classList.add('show');
}
function saveSemesterGoals() {
  setKey('semesterGoals', document.getElementById('semesterGoalsInput').value);
  alert('已保存');
  syncToFirebase();
}

function openQuoteNotebook() {
  renderQuoteNotebook();
  document.getElementById('quoteNotebookPage').classList.add('show');
}
function renderQuoteNotebook() {
  var notes = getKey('quoteNotes', []);
  var html = '';
  notes.forEach(function(q) {
    html += '<div class="qn-item">' +
      '<div class="qn-content">' + escapeHtml(q.content) + '</div>' +
      '<div class="qn-source">' + escapeHtml(q.source) + '<span class="qn-tag">' + escapeHtml(q.category) + '</span></div>' +
    '</div>';
  });
  if (notes.length === 0) html = '<div class="mini-empty">还没有收藏名言，点击右上角添加</div>';
  document.getElementById('quoteNotebookList').innerHTML = html;
}
function showAddQuoteNote() { showModal('addQuoteNoteModal'); }
function confirmAddQuoteNote() {
  var content = document.getElementById('qnContentInput').value.trim();
  var source = document.getElementById('qnSourceInput').value.trim();
  var category = document.getElementById('qnCategoryInput').value;
  if (!content) return;
  var notes = getKey('quoteNotes', []);
  notes.push({ id: uid(), content: content, source: source || '佚名', category: category });
  setKey('quoteNotes', notes);
  document.getElementById('qnContentInput').value = '';
  document.getElementById('qnSourceInput').value = '';
  closeModal('addQuoteNoteModal');
  renderQuoteNotebook();
  renderQuote();
  syncToFirebase();
}

function openFocusRecords() {
  renderFocusRecords();
  document.getElementById('focusRecordsPage').classList.add('show');
}
function renderFocusRecords() {
  var records = getKey('focusRecords', []);
  var today = todayStr();
  var weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  var weekStartStr = weekStart.getFullYear() + '-' + pad(weekStart.getMonth()+1) + '-' + pad(weekStart.getDate());

  var todayTotal = records.filter(function(r) { return r.date === today; })
    .reduce(function(s, r) { return s + r.duration; }, 0);
  var weekTotal = records.filter(function(r) { return r.date >= weekStartStr; })
    .reduce(function(s, r) { return s + r.duration; }, 0);

  document.getElementById('focusToday').textContent = todayTotal + ' min';
  document.getElementById('focusWeek').textContent = weekTotal + ' min';

  var html = '';
  records.slice(0, 30).forEach(function(r) {
    html += '<div class="focus-record-item">' +
      '<span class="fr-icon">🍅</span>' +
      '<span class="fr-name">' + escapeHtml(r.name) + '</span>' +
      '<span class="fr-scene">' + escapeHtml(r.category) + ' · ' + escapeHtml(r.scene || '独立') + '</span>' +
      '<span class="fr-duration">' + r.duration + ' min</span>' +
    '</div>';
  });
  if (records.length === 0) html = '<div class="mini-empty">暂无专注记录</div>';
  document.getElementById('focusRecordList').innerHTML = html;
}

function openMonthlyReport() {
  renderMonthlyReport();
  document.getElementById('monthlyReportPage').classList.add('show');
}
function renderMonthlyReport() {
  var records = getKey('focusRecords', []);
  var todos = getKey('todos', []);
  var ddls = getKey('ddls', []);
  var now = new Date();
  var monthStr = now.getFullYear() + '-' + pad(now.getMonth() + 1);

  var monthRecords = records.filter(function(r) { return r.date.startsWith(monthStr); });
  var totalFocus = monthRecords.reduce(function(s, r) { return s + r.duration; }, 0);
  var todoDone = todos.filter(function(t) { return t.done; }).length;
  var ddlDone = ddls.filter(function(d) { return d.done; }).length;

  var encouragements = [
    '本月你专注了 ' + totalFocus + ' 分钟，坚持就是胜利！',
    '完成了 ' + todoDone + ' 个待办和 ' + ddlDone + ' 个DDL，效率满满！',
    '每一分钟的努力，都在塑造更好的你。',
    '继续保持，下个月你会更棒！'
  ];
  var encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];

  var html = '<div style="text-align:center;margin-bottom:32px;">' +
    '<h2 style="font-size:24px;margin-bottom:8px;">' + (now.getMonth()+1) + '月学习报告</h2>' +
    '<p style="color:var(--text-secondary);">' + encouragement + '</p>' +
  '</div>';

  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px;">' +
    '<div style="background:var(--surface);border-radius:14px;padding:24px;text-align:center;border:1px solid var(--border);box-shadow:var(--shadow);">' +
      '<div style="font-size:36px;font-weight:700;color:var(--primary);">' + totalFocus + '</div>' +
      '<div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">专注分钟</div>' +
    '</div>' +
    '<div style="background:var(--surface);border-radius:14px;padding:24px;text-align:center;border:1px solid var(--border);box-shadow:var(--shadow);">' +
      '<div style="font-size:36px;font-weight:700;color:var(--success);">' + todoDone + '</div>' +
      '<div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">完成待办</div>' +
    '</div>' +
    '<div style="background:var(--surface);border-radius:14px;padding:24px;text-align:center;border:1px solid var(--border);box-shadow:var(--shadow);">' +
      '<div style="font-size:36px;font-weight:700;color:var(--accent);">' + ddlDone + '</div>' +
      '<div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">完成DDL</div>' +
    '</div>' +
  '</div>';

  document.getElementById('monthlyReportBody').innerHTML = html;
}

function openSemesterSummary() {
  semesterStep = 0;
  document.getElementById('semesterOverlay').classList.add('show');
  showSemesterStep();
  document.getElementById('semesterOverlay').onclick = function() {
    semesterStep++;
    showSemesterStep();
  };
}
function showSemesterStep() {
  var records = getKey('focusRecords', []);
  var todos = getKey('todos', []);
  var ddls = getKey('ddls', []);
  var totalFocus = records.reduce(function(s, r) { return s + r.duration; }, 0);
  var lateNights = Math.floor(records.length / 10);
  var goals = getKey('semesterGoals', '');

  var steps = [
    '这一学期，你一共专注了 ' + totalFocus + ' 分钟',
    '完成了 ' + todos.filter(function(t){return t.done;}).length + ' 个待办事项',
    '攻克了 ' + ddls.filter(function(d){return d.done;}).length + ' 个 Deadline',
    '有 ' + lateNights + ' 天，你学习到了深夜',
    '那些深夜亮着的灯，终会照亮你前行的路',
    goals ? '还记得学期初你写下的目标吗？' : '每一次坚持，都是对自己的超越',
    '你已经很棒了',
    '下学期，继续加油 ✨'
  ];

  var textEl = document.getElementById('semesterText');
  var hintEl = document.getElementById('semesterHint');

  if (semesterStep >= steps.length) {
    document.getElementById('semesterOverlay').classList.remove('show');
    return;
  }

  textEl.classList.remove('show');
  setTimeout(function() {
    textEl.textContent = steps[semesterStep];
    textEl.classList.add('show');
    if (semesterStep === steps.length - 1) {
      textEl.classList.add('semester-final');
    }
  }, 200);
}

/* ========== Auth / Login ========== */
function switchLoginTab(tab) {
  loginMode = tab;
  document.querySelectorAll('.login-tab').forEach(function(t) {
    t.classList.toggle('active', t.getAttribute('data-param') === tab);
  });
  document.getElementById('nicknameField').style.display = tab === 'signup' ? 'block' : 'none';
  document.getElementById('loginBtn').textContent = tab === 'login' ? '登录' : '注册';
  document.getElementById('loginError').textContent = '';
}

function doLogin() {
  var email = document.getElementById('loginEmail').value.trim();
  var password = document.getElementById('loginPassword').value;
  var nickname = document.getElementById('loginNickname').value.trim();
  var errEl = document.getElementById('loginError');
  var btn = document.getElementById('loginBtn');

  if (!email || !password) { errEl.textContent = '请填写邮箱和密码'; return; }
  if (password.length < 6) { errEl.textContent = '密码至少6位'; return; }
  if (loginMode === 'signup' && !nickname) { errEl.textContent = '请填写昵称'; return; }

  if (!isFirebaseReady()) {
    errEl.textContent = 'Firebase 未配置，请使用本地模式';
    return;
  }

  btn.disabled = true;
  btn.textContent = '处理中...';

  var promise;
  if (loginMode === 'signup') {
    promise = firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(function(cred) {
        return cred.user.updateProfile({ displayName: nickname }).then(function() { return cred; });
      });
  } else {
    promise = firebase.auth().signInWithEmailAndPassword(email, password);
  }

  promise.then(function(cred) {
    currentUser = cred.user;
    isOnlineMode = true;
    setKey('userNickname', cred.user.displayName || email.split('@')[0]);
    onLoginSuccess();
  }).catch(function(err) {
    errEl.textContent = err.message;
    btn.disabled = false;
    btn.textContent = loginMode === 'login' ? '登录' : '注册';
  });
}

function enterLocalMode() {
  isOnlineMode = false;
  currentUser = null;
  onLoginSuccess();
  if (typeof trackEvent === 'function') trackEvent('local_mode_enter');
}

function onLoginSuccess() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('appLayout').style.display = 'flex';
  document.getElementById('logoutNav').style.display = isOnlineMode ? 'flex' : 'none';
  var name = getKey('userNickname', '学习者');
  document.getElementById('sidebarName').textContent = name;
  document.getElementById('sidebarAvatar').textContent = name.charAt(0);

  var theme = getKey('theme', 'default');
  document.body.className = 'theme-' + theme;

  initDefaults();
  renderAll();

  if (isOnlineMode) {
    loadFromFirebase();
  }
}

function showLogout() {
  if (!isOnlineMode) return;
  if (confirm('确定退出登录？')) {
    firebase.auth().signOut().then(function() {
      currentUser = null;
      isOnlineMode = false;
      document.getElementById('loginPage').style.display = 'flex';
      document.getElementById('appLayout').style.display = 'none';
      document.getElementById('loginEmail').value = '';
      document.getElementById('loginPassword').value = '';
    });
  }
}

/* ========== Firebase Sync ========== */
function syncToFirebase() {
  if (!isOnlineMode || !isFirebaseReady() || !currentUser) return;
  try {
    var data = getStore();
    firebase.firestore().collection('users').doc(currentUser.uid).set(data, { merge: true });
  } catch(e) {}
}

function loadFromFirebase() {
  if (!isOnlineMode || !isFirebaseReady() || !currentUser) return;
  try {
    firebase.firestore().collection('users').doc(currentUser.uid).get()
      .then(function(doc) {
        if (doc.exists) {
          var data = doc.data();
          var s = getStore();
          Object.keys(data).forEach(function(k) { s[k] = data[k]; });
          saveStore(s);
          renderAll();
        }
      }).catch(function() {});
  } catch(e) {}
}

/* ========== Modals ========== */
function showModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }

function closeFullPage(id) { document.getElementById(id).classList.remove('show'); }

/* ========== OCR Import ========== */
function showImportModal() { showModal('importModal'); }

/* ========== Notion Export ========== */
function showNotionExport() { showModal('notionExportModal'); }
function confirmNotionExport() {
  var token = document.getElementById('notionTokenInput').value.trim();
  var dbId = document.getElementById('notionDbIdInput').value.trim();
  if (!token || !dbId) {
    document.getElementById('notionStatus').textContent = '请填写 Token 和 Database ID';
    return;
  }
  if (typeof NotionExport !== 'undefined') {
    document.getElementById('notionStatus').textContent = '正在导出...';
    NotionExport.exportAll(token, dbId).then(function(result) {
      document.getElementById('notionStatus').textContent =
        '导出成功！Todo: ' + result.todoCount + ' 条, DDL: ' + result.ddlCount + ' 条';
    }).catch(function(err) {
      document.getElementById('notionStatus').textContent = '导出失败: ' + err.message;
    });
  }
}

/* ========== Data Import/Export ========== */
function exportData() {
  var data = getStore();
  var blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'studyhub-data.json';
  a.click();
  URL.revokeObjectURL(url);
}
function importData() { document.getElementById('importFileInput').click(); }

function handleImportFile(e) {
  var file = e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    try {
      var data = JSON.parse(ev.target.result);
      saveStore(data);
      alert('导入成功！');
      renderAll();
    } catch(err) {
      alert('导入失败：文件格式错误');
    }
  };
  reader.readAsText(file);
}

function enableNotifications() {
  if ('Notification' in window) {
    Notification.requestPermission().then(function(perm) {
      if (perm === 'granted') {
        alert('通知已开启');
        if (typeof EmailReminder !== 'undefined') EmailReminder.scheduleAll();
      } else {
        alert('通知被拒绝，你可以在浏览器设置中开启');
      }
    });
  } else {
    alert('你的浏览器不支持通知');
  }
}

/* ========== Sticky Note ========== */
function saveStickyNote() {
  var val = document.getElementById('stickyNote').value;
  setKey('stickyNote', val);
  syncToFirebase();
}

/* ========== Render All ========== */
function renderAll() {
  renderQuote();
  renderRightTodoList();
  if (currentPage === 'dashboard') renderDashboard();
  if (currentPage === 'schedule') renderSchedule();
  if (currentPage === 'tasks') renderTasksPage();
  if (currentPage === 'pomodoro') renderPomodoroPage();
  if (currentPage === 'rooms') renderRoomsPage();
  if (currentPage === 'calendar') renderCalendarPage();
  if (currentPage === 'profile') renderProfilePage();
}

/* ========== Event Binding ========== */
function bindEvents() {
  document.addEventListener('click', function(e) {
    var target = e.target;
    while (target && target !== document) {
      var action = target.getAttribute && target.getAttribute('data-action');
      if (action) break;
      target = target.parentElement;
    }
    if (!target || !action) return;
    var param = target.getAttribute('data-param');
    var id = target.getAttribute('data-id');
    var color = target.getAttribute('data-color');
    var period = target.getAttribute('data-period');

    switch(action) {
      case 'navTo': navTo(param); break;
      case 'switchLoginTab': switchLoginTab(param); break;
      case 'doLogin': doLogin(); break;
      case 'enterLocalMode': enterLocalMode(); break;
      case 'showLogout': showLogout(); break;
      case 'closeModal': closeModal(param); break;
      case 'closeFullPage': closeFullPage(param); break;
      case 'setQuoteMode': setQuoteMode(param); break;
      case 'setTheme': setTheme(param); break;
      case 'toggleTodo': toggleTodo(id); break;
      case 'toggleDdl': toggleDdl(id); break;
      case 'showAddTodo': showModal('addTodoModal'); break;
      case 'showAddDdl': showModal('addDdlModal'); break;
      case 'confirmAddTodo': confirmAddTodo(); break;
      case 'confirmAddDdl': confirmAddDdl(); break;
      case 'showAddPomo': showModal('addPomoModal'); break;
      case 'confirmAddPomo': confirmAddPomo(); break;
      case 'selectPomoColor': selectPomoColor(color); break;
      case 'selectPomo': selectPomo(id); break;
      case 'startPomo': startPomo(); break;
      case 'stopPomo': stopPomo(); break;
      case 'showAddPeriod': showModal('addPeriodModal'); break;
      case 'confirmAddPeriod': confirmAddPeriod(); break;
      case 'showEditTime': showEditTime(period); break;
      case 'confirmEditTime': confirmEditTime(); break;
      case 'showImportModal': showImportModal(); break;
      case 'prevMonth': prevMonth(); break;
      case 'nextMonth': nextMonth(); break;
      case 'selectCalDate': selectCalDate(param); break;
      case 'setRoomFilter': setRoomFilter(param); break;
      case 'showRoomActions': showRoomActions(); break;
      case 'showCreateRoom': showCreateRoom(); break;
      case 'showJoinRoom': showJoinRoom(); break;
      case 'confirmCreateRoom': confirmCreateRoom(); break;
      case 'confirmJoinRoom': confirmJoinRoom(); break;
      case 'enterRoom': enterRoom(id); break;
      case 'closeRoomDetail': closeRoomDetail(); break;
      case 'sendChat': sendChat(); break;
      case 'playMusicSync': playMusicSync(); break;
      case 'openSemesterGoals': openSemesterGoals(); break;
      case 'saveSemesterGoals': saveSemesterGoals(); break;
      case 'openQuoteNotebook': openQuoteNotebook(); break;
      case 'showAddQuoteNote': showAddQuoteNote(); break;
      case 'confirmAddQuoteNote': confirmAddQuoteNote(); break;
      case 'openFocusRecords': openFocusRecords(); break;
      case 'openMonthlyReport': openMonthlyReport(); break;
      case 'openSemesterSummary': openSemesterSummary(); break;
      case 'showNotionExport': showNotionExport(); break;
      case 'confirmNotionExport': confirmNotionExport(); break;
      case 'exportData': exportData(); break;
      case 'importData': importData(); break;
      case 'enableNotifications': enableNotifications(); break;
    }
  });

  // Sticky note auto-save
  var stickyEl = document.getElementById('stickyNote');
  if (stickyEl) {
    stickyEl.addEventListener('input', function() {
      clearTimeout(stickyEl._saveTimer);
      stickyEl._saveTimer = setTimeout(saveStickyNote, 500);
    });
  }

  // Import file
  var importEl = document.getElementById('importFileInput');
  if (importEl) importEl.addEventListener('change', handleImportFile);

  // Chat enter key
  var chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') sendChat();
    });
  }

  // Todo input enter key
  var todoInput = document.getElementById('todoInput');
  if (todoInput) {
    todoInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') confirmAddTodo();
    });
  }

  // Click modal overlay to close
  document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.classList.remove('show');
    });
  });
}

/* ========== Init ========== */
function init() {
  initDefaults();
  bindEvents();
  var theme = getKey('theme', 'default');
  document.body.className = 'theme-' + theme;
  quoteMode = getKey('quoteMode', 'fixed');
  document.querySelectorAll('.quote-mode-tab').forEach(function(t) {
    t.classList.toggle('active', t.getAttribute('data-param') === quoteMode);
  });
  renderRightSidebar();
  renderDashboard();
}

/* ========== Start ========== */
init();

if (isFirebaseReady()) {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user && isOnlineMode) {
      currentUser = user;
      loadFromFirebase();
    }
  });
}
