// 寿司相性マッチング — グループ機能バックエンド
// Google Apps Script (clasp でデプロイ)

// スプレッドシートID（シート共有URLの /d/〇〇〇/ 部分）
var SPREADSHEET_ID = '1OwRNM_WIPbUp_8c1owbXjxw8Y1ZzRPUyqaY1b12EeLw';
var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

// ── エントリーポイント ──
// CORS 対応のため全アクションを doGet で処理
// data パラメータに JSON を encodeURIComponent して渡す
function doGet(e) {
  var data = {};
  try {
    data = JSON.parse(e.parameter.data || '{}');
  } catch (err) {
    return jsonOut({ error: 'リクエストの形式が正しくありません' });
  }

  var result;
  try {
    if      (data.action === 'createGroup')    result = createGroup(data);
    else if (data.action === 'submitRanking')  result = submitRanking(data);
    else if (data.action === 'getGroupStatus')    result = getGroupStatus(data);
    else if (data.action === 'getGlobalRankings') result = getGlobalRankings(data);
    else result = { error: '不明なアクションです' };
  } catch (err) {
    result = { error: err.message };
  }

  return jsonOut(result);
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── グループ作成 ──
function createGroup(data) {
  var sheet = getOrCreateSheet('groups', ['groupCode', 'groupName', 'mode', 'createdAt']);
  var code = generateCode();
  sheet.appendRow([code, data.groupName || '', data.mode || 10, new Date().toISOString()]);
  return { success: true, groupCode: code };
}

// ── 順位登録 ──
function submitRanking(data) {
  var gSheet = getOrCreateSheet('groups',   ['groupCode', 'groupName', 'mode', 'createdAt']);
  var rSheet = getOrCreateSheet('rankings', ['groupCode', 'userName', 'mode', 'ranking', 'submittedAt']);

  // グループ存在確認
  var groups = gSheet.getDataRange().getValues();
  var groupExists = false;
  for (var i = 1; i < groups.length; i++) {
    if (groups[i][0] === data.groupCode) { groupExists = true; break; }
  }
  if (!groupExists) return { error: 'グループが見つかりません。合言葉を確認してください。' };

  // 名前重複確認
  var rankings = rSheet.getDataRange().getValues();
  for (var j = 1; j < rankings.length; j++) {
    if (rankings[j][0] === data.groupCode && rankings[j][1] === data.userName) {
      return { error: 'この名前はすでに登録されています。別の名前を使ってください。' };
    }
  }

  rSheet.appendRow([
    data.groupCode,
    data.userName,
    data.mode,
    JSON.stringify(data.ranking),
    new Date().toISOString()
  ]);
  return { success: true };
}

// ── グループ状態取得 ──
function getGroupStatus(data) {
  // グループ存在確認
  var gSheet = getOrCreateSheet('groups', ['groupCode', 'groupName', 'mode', 'createdAt']);
  var groups = gSheet.getDataRange().getValues();
  var groupMode = null;
  var groupName = '';
  // ヘッダーで新旧フォーマット判定（旧: groupCode/mode/createdAt, 新: groupCode/groupName/mode/createdAt）
  var headers = groups[0] || [];
  var hasNameCol = headers[1] === 'groupName';
  for (var i = 1; i < groups.length; i++) {
    if (groups[i][0] === data.groupCode) {
      if (hasNameCol) {
        groupName = groups[i][1] || '';
        groupMode = parseInt(groups[i][2]);
      } else {
        groupMode = parseInt(groups[i][1]);
      }
      break;
    }
  }
  if (groupMode === null) return { error: 'グループが見つかりません。合言葉を確認してください。' };

  var rSheet = getOrCreateSheet('rankings', ['groupCode', 'userName', 'mode', 'ranking', 'submittedAt']);
  var rows = rSheet.getDataRange().getValues();

  var members = [];
  for (var j = 1; j < rows.length; j++) {
    if (rows[j][0] === data.groupCode) {
      members.push({
        name:    rows[j][1],
        mode:    parseInt(rows[j][2]),
        ranking: JSON.parse(rows[j][3])
      });
    }
  }
  return { success: true, groupMode: groupMode, groupName: groupName, members: members };
}

// ── 全体ランキング取得（世界平均用） ──
function getGlobalRankings(data) {
  var rSheet = getOrCreateSheet('rankings', ['groupCode', 'userName', 'mode', 'ranking', 'submittedAt']);
  var rows = rSheet.getDataRange().getValues();
  var rankings = [];
  var modeFilter = data.mode ? parseInt(data.mode) : null;
  for (var j = 1; j < rows.length; j++) {
    var rowMode = parseInt(rows[j][2]);
    if (modeFilter === null || rowMode === modeFilter) {
      rankings.push({
        name:    rows[j][1],
        mode:    rowMode,
        ranking: JSON.parse(rows[j][3])
      });
    }
  }
  return { success: true, rankings: rankings };
}

// ── ユーティリティ ──
function getOrCreateSheet(name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

// 読み間違いを避ける文字セット（0/O, 1/I/L を除外）
function generateCode() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var code = '';
  for (var i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
