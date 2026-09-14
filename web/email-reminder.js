/* ==================== DDL 邮件提醒 ==================== */

var EmailReminder = {
  /* 需要在 Firebase Cloud Functions 部署一个云函数来发送邮件
     这里是前端的配置和触发逻辑 */

  checkAndRemind: function(ddls, userEmail) {
    if (!ddls || !userEmail) return;
    var now = new Date();
    var nowMonth = now.getMonth() + 1;
    var nowDay = now.getDate();
    var nowNum = nowMonth * 100 + nowDay;

    ddls.forEach(function(ddl) {
      var parts = ddl.date.split('/');
      if (parts.length !== 2) return;
      var ddlNum = parseInt(parts[0]) * 100 + parseInt(parts[1]);
      var daysLeft = ddlNum - nowNum;

      // 提前7天和提前1天提醒
      if (daysLeft === 7 || daysLeft === 1) {
        var key = 'remind_' + ddl.id + '_' + daysLeft;
        if (localStorage.getItem(key)) return; // 已提醒过
        localStorage.setItem(key, '1');
        this._sendReminder(ddl, daysLeft, userEmail);
      }
    }.bind(this));
  },

  _sendReminder: function(ddl, daysLeft, userEmail) {
    // 通过 Firestore 写入 reminders 集合
    // Firebase Cloud Functions 监听该集合并发邮件
    if (typeof firebase === 'undefined' || !firebase.firestore) {
      this._browserNotify(ddl, daysLeft);
      return;
    }

    firebase.firestore().collection('reminders').add({
      email: userEmail,
      ddlName: ddl.name,
      ddlDate: ddl.date,
      daysLeft: daysLeft,
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function() {
      console.log('Reminder scheduled for', ddl.name);
    }).catch(function(err) {
      console.warn('Reminder failed:', err);
      this._browserNotify(ddl, daysLeft);
    });
  },

  _browserNotify: function(ddl, daysLeft) {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification('DDL提醒', {
        body: ddl.name + ' 还有 ' + daysLeft + ' 天截止！',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📋</text></svg>'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  },

  requestPermission: function() {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }
};
