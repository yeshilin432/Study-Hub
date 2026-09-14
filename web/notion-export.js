/* ==================== Notion 导出 ==================== */

var NotionExport = {
  /* 用户需要在 https://www.notion.so/my-integrations 创建一个 Internal Integration，
     获得 API Token，然后输入到这里 */

  exportTodos: function(token, databaseId, todos, ddls, callback) {
    if (!token || !databaseId) {
      callback('error', '请输入 Notion API Token 和 Database ID');
      return;
    }

    var totalItems = todos.length + ddls.length;
    var exported = 0;
    var errors = 0;

    var allItems = [];
    todos.forEach(function(t) {
      allItems.push({
        title: t.content,
        type: 'Todo',
        status: t.completed ? 'Done' : 'Todo',
        date: t.date || ''
      });
    });
    ddls.forEach(function(d) {
      allItems.push({
        title: d.name,
        type: 'DDL',
        status: d.completed ? 'Done' : 'Todo',
        date: d.date || ''
      });
    });

    if (allItems.length === 0) {
      callback('error', '没有可导出的待办和DDL');
      return;
    }

    function exportOne(idx) {
      if (idx >= allItems.length) {
        if (errors === 0) {
          callback('success', '成功导出 ' + exported + ' 条到 Notion');
        } else {
          callback('partial', '导出 ' + exported + ' 条成功，' + errors + ' 条失败');
        }
        return;
      }
      var item = allItems[idx];
      var body = {
        parent: { database_id: databaseId },
        properties: {
          Name: { title: [{ text: { content: item.title } }] },
          Type: { select: { name: item.type } },
          Status: { select: { name: item.status } }
        }
      };
      if (item.date) {
        try {
          var dateParts = item.date.split('/');
          if (dateParts.length === 2) {
            var year = new Date().getFullYear();
            var isoDate = year + '-' + dateParts[0].padStart(2,'0') + '-' + dateParts[1].padStart(2,'0');
            body.properties.Date = { date: { start: isoDate } };
          }
        } catch(e) {}
      }

      fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      .then(function(res) {
        if (res.ok) {
          exported++;
          Analytics.notionExported();
        } else {
          errors++;
        }
        exportOne(idx + 1);
      })
      .catch(function() {
        errors++;
        exportOne(idx + 1);
      });
    }

    exportOne(0);
  },

  /* 打开 Notion 创建 Integration 页面 */
  openNotionSetup: function() {
    window.open('https://www.notion.so/my-integrations', '_blank');
  }
};
