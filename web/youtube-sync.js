/* ==================== YouTube 音乐同步播放 ==================== */

var YTPlayer = null;
var YTReady = false;
var currentVideoId = null;
var syncInterval = null;

function onYouTubeIframeAPIReady() {
  YTReady = true;
}

var MusicSync = {
  init: function(containerId) {
    if (!YTReady || !window.YT) {
      setTimeout(function() { MusicSync.init(containerId); }, 500);
      return;
    }
    YTPlayer = new YT.Player(containerId || 'ytPlayer', {
      height: '0',
      width: '0',
      playerVars: { autoplay: 0, controls: 0 },
      events: {
        onReady: function() { console.log('YT ready'); },
        onStateChange: function(e) {
          if (e.data === YT.PlayerState.PLAYING) {
            this._broadcastState('playing');
          } else if (e.data === YT.PlayerState.PAUSED) {
            this._broadcastState('paused');
          }
        }.bind(this)
      }
    });
  },

  playVideo: function(videoId, startTime) {
    if (!YTPlayer || !videoId) return;
    currentVideoId = videoId;
    if (startTime !== undefined) {
      YTPlayer.loadVideoById({ videoId: videoId, startSeconds: startTime });
    } else {
      YTPlayer.loadVideoById(videoId);
    }
    YTPlayer.playVideo();
    Analytics.musicSynced();
  },

  pause: function() {
    if (YTPlayer) YTPlayer.pauseVideo();
  },

  resume: function() {
    if (YTPlayer) YTPlayer.playVideo();
  },

  seekTo: function(seconds) {
    if (YTPlayer) YTPlayer.seekTo(seconds, true);
  },

  getCurrentTime: function() {
    if (!YTPlayer) return 0;
    return Math.floor(YTPlayer.getCurrentTime() || 0);
  },

  setVolume: function(vol) {
    if (YTPlayer) YTPlayer.setVolume(vol);
  },

  /* === 同步到 Firestore === */
  syncToRoom: function(roomId, videoId, action) {
    if (typeof firebase === 'undefined') return;
    var roomRef = firebase.firestore().collection('rooms').doc(roomId);
    roomRef.update({
      music: {
        videoId: videoId,
        action: action,
        timestamp: new Date().toISOString(),
        position: this.getCurrentTime()
      }
    });
  },

  /* === 监听房间音乐变化 === */
  listenRoomMusic: function(roomId, callback) {
    if (typeof firebase === 'undefined') return null;
    var roomRef = firebase.firestore().collection('rooms').doc(roomId);
    return roomRef.onSnapshot(function(doc) {
      var data = doc.data();
      if (data && data.music) {
        callback(data.music);
      }
    });
  },

  /* === 搜索YouTube（室主用）=== */
  searchYouTube: function(query, callback) {
    var searchUrl = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query);
    window.open(searchUrl, '_blank');
    callback && callback('请在打开的YouTube页面找到视频，复制视频ID或URL粘贴到下方输入框');
  },

  /* === 从URL提取Video ID === */
  extractVideoId: function(url) {
    if (!url) return null;
    if (url.length === 11) return url;
    var match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }
};

function serverTimestampSafe() {
  try { return window.fb.serverTimestamp(); } catch(e) { return new Date().toISOString(); }
}
