var result = chrome.extension.getBackgroundPage().result;
var target = chrome.extension.getBackgroundPage().target;

init();

/* 頁面初始化，載入 parser 圖片 */
function init(){
	var list = "";	// 用來暫存取到的圖片網址
	var temp = "";	// 用來暫存預覽圖

	if(target == -1){
		$("#info").hide();
		$("#warning").show();
	}else{
		var array = result.split(',');
		var count = array.length;

		for(var i = 0, j = 0; i < count; i=i+2){
			j = i + 1;
			if(array[i]){
				temp += "<tr><td><img width=200 src='" + array[i] + "'></td>";
				list += "<tr><td>" + array[i] +"</td></tr>";
			}
			if(array[j]){
				temp += "<td><img width=200 src='" + array[j] + "'></td></tr>";
				list += "<tr><td>" + array[j] +"</td></tr>";
			}else{
				temp += "<td>　</td></tr>";
			}
		}

		$("#photo table").html(temp);
		$("#list table tbody").html(list);
		$("#info").show();
		$("#warning").hide();
	}
}

function getFolderName(){
	return dateFormat(new Date(), 'yyyymmdd');
}

function getFileName(index){
	var d = new Date();
	var ms = d.getMilliseconds().toString();
	if(index.toString().length == 2){
		index = "0" + index;
	}else if(index.toString().length == 1){
		index = "00" + index;
	}
	return dateFormat(d, 'yyyymmddHHMMss') + ms + index;
}

/* 將圖片儲存 */
function savePhoto(){
	var array = result.split(',');
	var count = array.length;

	var json = '[';
	for(var i = 0; i < count; i++){
		json = json + '{"img":"' + array[i].split('&')[0] + '"}';
		if(i != count - 1) json += ",";

		chrome.downloads.download({
			"url": array[i].split('&')[0], "filename": getFolderName() + "/" + getFileName(i) + ".jpg"
		}, function(){ console.log("Complete"); });
	}
	json += ']';

	console.log(json);
}

// 選擇全部圖檔路徑
function selectAllPath(){
	document.getElementById("tab_path").focus();
	document.execCommand('SelectAll');
	document.execCommand("Copy", false, null);
}

// 設定下載按鈕功能
document.getElementById("btn_save").addEventListener("click", savePhoto);

// 設定全選按鈕功能
document.getElementById("btn_select").addEventListener("click", selectAllPath);