var result = chrome.extension.getBackgroundPage().result;
var target = chrome.extension.getBackgroundPage().target;

init();

/* 頁面初始化，載入 parser 圖片 */
function init(){
	var tmp = "";
	var list = "";
	var idx = 0;

	if(target == -1){
		$("#info").hide();
		$("#warning").show();
	}else{
		var arr = result.split(',');
		var cnt = arr.length;

		for(var i = 0; i < cnt; i=i+2){
			idx = i + 1;
			tmp = tmp + "<tr>";
			if(arr[i]){
				tmp = tmp + "<td><img width=200 src='" + arr[i].split("%2C").join(",") + "'></td>";
				list = list + "<tr><td>" + arr[i].split("%2C").join(",") +"</td></tr>";
			}
			if(arr[idx]){
				tmp = tmp + "<td><img width=200 src='" + arr[idx].split("%2C").join(",") + "'></td>";
				list = list + "<tr><td>" + arr[idx].split("%2C").join(",") +"</td></tr>";
			}else{
				tmp = tmp + "<td>　</td>";
			}
			tmp = tmp + "</tr>";
		}

		$("#photo table").html(tmp);
		$("#list table").html(list);
		$("#info").show();
		$("#warning").hide();
	}
}

function get_date(index){
	var d = new Date();
	var year = d.getFullYear().toString();
	var month = d.getMonth() + 1;
	if(month.toString().length == 1){
		month = "0" + month;
	}
	month = month.toString();
	var day = d.getDate().toString();
	if(day.toString().length == 1){
		day = "0" + day;
	}
	var hour = d.getHours().toString();
	if(hour.toString().length == 1){
		hour = "0" + hour;
	}
	var minute = d.getMinutes().toString();
	if(minute.toString().length == 1){
		minute = "0" + minute;
	}
	var second = d.getSeconds().toString();
	if(second.toString().length == 1){
		second = "0" + second;
	}
	if(index.toString().length == 2){
		index = "0" + index;
	}else if(index.toString().length == 1){
		index = "00" + index;
	}
	var ms = d.getMilliseconds().toString();
	return year + month + day + hour + minute + second + ms + index;
}

function get_directory(){
	var d = new Date();
	var year = d.getFullYear().toString();
	var month = d.getMonth() + 1;
	if(month.toString().length == 1){
		month = "0" + month;
	}
	month = month.toString();
	var day = d.getDate().toString();
	if(day.toString().length == 1){
		day = "0" + day;
	}
	return year + month + day;
}

/* 將圖片儲存 */
function save_photo(){
	var arr = result.split(',');
	var cnt = arr.length;
	var dir = get_directory();

	var json = '[';
	for(var i = 0; i < cnt; i++){
		json = json + '{"img":"' + arr[i].split('&')[0] + '"}';
		if(i != cnt - 1) json += ",";

		chrome.downloads.download({
			"url": arr[i].split('&')[0], "filename": dir + "/" + get_date(i) + ".jpg"
		}, function(){ console.log("downloaded Complete"); });
	}
	json += ']';

	console.log(json);
}

// 選擇全部圖檔路徑
function select_all_path(){
	document.getElementById("tab_path").focus();
	document.execCommand('SelectAll');
	document.execCommand("Copy", false, null);
}

// 設定下載按鈕功能
document.getElementById("btn_save").addEventListener("click", save_photo);

// 設定全選按鈕功能
document.getElementById("btn_select").addEventListener("click", select_all_path);