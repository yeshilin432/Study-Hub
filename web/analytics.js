/* ==================== Analytics — 用户行为追踪 ==================== */

var Analytics = {
  _isAvailable: function() {
    return window.fb && window.fb.analytics && window.fb.logEvent;
  },

  _track: function(eventName, params) {
    if (!this._isAvailable()) return;
    try {
      window.fb.logEvent(window.fb.analytics, eventName, params || {});
    } catch(e) {}
  },

  /* === 功能使用频率 === */
  featureUsed: function(featureName, detail) {
    this._track('feature_used', {
      feature: featureName,
      detail: detail || '',
      timestamp: Date.now()
    });
  },

  /* === 用户留存 === */
  appOpen: function() {
    this._track('app_open', {
      date: todayStr(),
      hour: new Date().getHours()
    });
  },

  /* === 用户路径 === */
  pageView: function(pageName) {
    this._track('page_view', { page: pageName });
  },

  tabSwitch: function(fromTab, toTab) {
    this._track('tab_switch', { from: fromTab, to: toTab });
  },

  /* === 具体事件埋点 === */
  todoCreated: function() { this.featureUsed('todo', 'create'); },
  todoCompleted: function() { this.featureUsed('todo', 'complete'); },
  ddlCreated: function() { this.featureUsed('ddl', 'create'); },
  pomoCreated: function() { this.featureUsed('pomodoro', 'create'); },
  pomoStarted: function(name) { this.featureUsed('pomodoro', 'start_' + name); },
  pomoCompleted: function(duration) { this.featureUsed('pomodoro', 'complete_' + duration + 'min'); },
  roomCreated: function() { this.featureUsed('study_room', 'create'); },
  roomJoined: function() { this.featureUsed('study_room', 'join'); },
  chatSent: function() { this.featureUsed('chat', 'send'); },
  musicSynced: function() { this.featureUsed('music_sync', 'play'); },
  notionExported: function() { this.featureUsed('notion_export', 'export'); },
  quoteModeChanged: function(mode) { this.featureUsed('quote', 'mode_' + mode); },
  scheduleImported: function() { this.featureUsed('ocr_import', 'import'); },
  stickyNote: function() { this.featureUsed('sticky_note', 'edit'); },
  semesterGoals: function() { this.featureUsed('semester_goals', 'edit'); },
  monthlyReportViewed: function() { this.featureUsed('monthly_report', 'view'); },
  semesterSummaryViewed: function() { this.featureUsed('semester_summary', 'view'); },
  themeChanged: function(theme) { this.featureUsed('theme', 'change_' + theme); },
  quoteNoteAdded: function() { this.featureUsed('quote_notebook', 'add'); }
};
