var json = "";
var result = "";
var target = -1;
var target_url = "";
var json_photo = "";
var arr_photo = [];
var arr_target = new Array(1);
arr_target[0]  = "https://www.facebook.com/";					// Facebook
arr_target[1]  = "https://www.flickr.com/photos/";				// Flickr
arr_target[2]  = "https://plus.google.com/photos/";				// Google Picasa
arr_target[3]  = "http://photo.xuite.net/";						// 隨意窩（Xuite）
arr_target[4]  = "tian.yam.com/album/";							// 蕃薯藤．天空部落（Yam）
arr_target[5]  = "http://gallery.dcview.com/showGallery.php";	// DCView
arr_target[6]  = "https://www.theatlantic.com/photo/";			// In Focus
arr_target[7]  = "https://dq.yam.com/post.php";					// 地球圖輯隊
arr_target[8]  = "https://ck101.com/";							// 卡提諾論壇
arr_target[9]  = "https://www.jkforum.net/";					// 捷克論壇

// 初始執行，判斷是否為預設要下載的圖片網站
function get_target(url){

	target = jQuery.inArray(url.split("?")[0], arr_target);

	if(target == -1){
		var new_url = "";
		var arr_url = url.split("?")[0].split("/");

		if(arr_url[2] == "www.theatlantic.com"){
			for(var i = 0; i < 4; i++){
				new_url += arr_url[i] + "/";
			}
		}else if(arr_url[2] == "ck101.com" || arr_url[2] == "photo.xuite.net" || arr_url[2] == "www.jkforum.net"){
			for(var i = 0; i < 3; i++){
				new_url += arr_url[i] + "/";
			}
		}else if((arr_url[2] == "www.facebook.com" && arr_url[4] == "media_set") || (arr_url[2] == "www.facebook.com" && arr_url[3] == "media" && arr_url[4] == "set")){
			for(var i = 0; i < 3; i++){
				new_url += arr_url[i] + "/";
			}
		}else if(arr_url[2] == "www.flickr.com" && arr_url[3] == "photos" && arr_url[5] == "sets"){
			for(var i = 0; i < 4; i++){
				new_url += arr_url[i] + "/";
			}
		}else if(arr_url[2] == "plus.google.com" && arr_url[3] == "photos" && arr_url[5] == "albums"){
			for(var i = 0; i < 4; i++){
				new_url += arr_url[i] + "/";
			}
		}else if(arr_url[2].indexOf("tian.yam.com") != -1 && arr_url[3] == "album"){
			for(var i = 2; i < 4; i++){
				new_url += arr_url[i] + "/";
			}
			var account = new_url.split(".")[0];
			new_url = new_url.replace(account + ".", "");
		}

		target = jQuery.inArray(new_url, arr_target);
		target_url = url;
	}

	return target;
}

// 取得圖片連結網址
function get_photo(target, data){
	var u = "";
	var dom = "";
	var tmp = "";
	var cnt = 0;
	var link = "";
	result = "";

	if(target == 0){			// Facebook
		tmp = $(data).find(".fbPhotosRedesignBorderOverlay .fbStarGrid .fbPhotoCurationControlWrapper .uiMediaThumb");
		cnt = $(tmp).length;

		var directory = "";
		var temp_url = new Array();
		for(var i = 0; i < cnt; i++){
			u = $(tmp).eq(i).attr("ajaxify").split('src=')[1].split('&smallsrc=')[0];
			u = u.split("https").join("http").split("%26").join("&").split("%2F").join("/").split("%3A").join(":").split("%3D").join("=").split("%3F").join("?");
			u = u.split('&small')[0].split('&size')[0].split('&__gda__')[0];
			if(directory == "" && u.indexOf(".fbcdn.net/") != -1){
				directory = u.split('.fbcdn.net/')[0];
			}

			if(u.indexOf(".fbcdn.net/") != -1){
				temp_url.push(u.split('.fbcdn.net/')[1]);
			}else if(u.indexOf(".akamaihd.net/") != -1){
				temp_url.push(u.split('.akamaihd.net/')[1]);
			}
		}

		for(var i = 0; i < cnt; i++){
			result += directory + ".fbcdn.net/" + temp_url[i].split("-ak").join("");
			if(i != cnt - 1) result += ",";
		}

	}else if(target == 1){		// Flickr
		var obj = jQuery.parseJSON($(data).text().split("Y.listData = ")[1].split("try{")[0].split(" ").join("").split("};").join("}"));
		var cnt = 0, rows = obj.rows, row = null;
		var rowCount = rows.length;
		for(var i = 0; i < rowCount; i++){
			row = rows[i].row;
			cnt = row.length
			for(var j = 0; j < cnt; j++){
				result += row[j].sizes.o.url + ",";
			}
		}

		if(result.substr(result.length - 1, 1) == ","){
			result = result.substr(0, result.length - 1);
		}
	}else if(target == 2){		// Google Picasa
		$.ajax({
		   	type: "GET",
		   	url: "https://picasaweb.google.com/data/feed/api/user/" + target_url.split("/")[4] + "/albumid/" + target_url.split("/")[6].split("?")[0],
		   	data: "imgmax=2048",
		   	dataType: "xml",
		   	success: function(xml){
		   		$(xml).find('entry').each(function(){
		   			$($(this).children().last()).each(function(){
		   				$($(this).children()).each(function(){
		   					if($(this).attr("url") != undefined && $(this).attr("url").indexOf("s2048") != -1){
		   						result += $(this).attr("url") + ",";
		   					}
		   				});
		   			});
	            });
		   	}
		});

		if(result.substr(result.length - 1, 1) == ","){
			result = result.substr(0, result.length - 1);
		}
	}else if(target == 3){		// 隨意窩（Xuite）
		tmp = $(data).find(".blogbody .list_area .photo_item a img");
		cnt = $(tmp).length;

		for(var i = 0; i < cnt; i++){
			result += $(tmp).eq(i).attr("src").split("_c.").join("_x.");
			if(i != cnt - 1) result += ",";
		}
	}else if(target == 4){		// 蕃薯藤．天空部落（Yam）
		tmp = $(data).find("div.photos div.inner-wrap img");
		cnt = $(tmp).length;

		for(var i = 0; i < cnt; i++){
			result += $(tmp).eq(i).attr("src");
			if(i != cnt - 1) result += ",";
		}
	}else if(target == 5){		// DCView
		tmp = $(data).find(".photomain img");
		cnt = $(tmp).length;

		for(var i = 0; i < cnt; i++){
			result += $(tmp).eq(i).attr("src");
			if(i != cnt - 1) result += ",";
		}
	}else if(target == 6){		// In Focus
		tmp = $(data).find("picture source");
		cnt = $(tmp).length;

		for(var i = 0; i < cnt; i++){
			u = $(tmp).eq(i).attr("data-srcset");
			if(u.indexOf("1500") != -1){
				result += u;
				if(i != cnt - 1) result += ",";
			}
		}
	}else if(target == 7){		// 地球圖輯隊
		tmp = $(data).find(".imgWrap img.lazyImg");
		cnt = $(tmp).length;

		for(var i = 0; i < cnt; i++){
			result += $(tmp).eq(i).attr("src")
			if(i != cnt - 1) result += ",";
		}
	}else if(target == 8){		// 卡提諾論壇
		tmp = $(data).find("ignore_js_op img");
		cnt = $(tmp).length;

		if(cnt == 0){
			tmp = $(data).find("img.zoom");
			cnt = $(tmp).length;
		}

		for(var i = 0; i < cnt; i++){
			if($(tmp).eq(i).attr("src") != undefined){
				result += $(tmp).eq(i).attr("src");
				if(i != cnt - 1) result += ",";
			}
		}
	}else if(target == 9){		// 捷克論壇
		tmp = $(data).find("ignore_js_op img");
		cnt = $(tmp).length;

		for(var i = 0; i < cnt; i++){
			u = $(tmp).eq(i).attr("src");
			if(u.indexOf("mymypic.net") == -1){
				u = "https://www.jkforum.net" + u;
			}
			result += u;
			if(i != cnt - 1) result += ",";
		}
	}
}

// 載入網頁時取得 BODY 內容
chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse){
    	get_photo(request.target, request.content)
	}
);

// 網頁重新整理時
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	if (changeInfo.status == "complete"){
		target = get_target(tab.url);
    	if(target > -1){
    		chrome.tabs.executeScript(tab.id, {
       			code: "chrome.extension.sendRequest({target: " + target + ", content: document.body.innerHTML}, function(response) { console.log('success'); });"
			}, function() { console.log('done'); });
    	}
    }
});

// 切換 Tab 時觸發的事件
chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo){
	var winId = selectInfo.windowId;	// 目前用不到，結果都是 1
	// 取得目前選取 Tab 的網址
	chrome.tabs.getSelected(winId, function(tab){
		target = get_target(tab.url);
		if(target > -1){
			chrome.tabs.executeScript(tab.id, {
				code: "chrome.extension.sendRequest({target: " + target + ", content: document.body.innerHTML}, function(response) { console.log('success'); });"
			}, function() { console.log('done'); });
		}
	});
});

chrome.webRequest.onHeadersReceived.addListener(function(details){
	var headers = details.responseHeaders,blockingResponse = {};
    for( var i = 0, l = headers.length; i < l; ++i ){
		if((headers[i].name.toLowerCase() == 'content-disposition')){
			headers[i].value = 'attachment; filename=\"xxxx.xxxx\"';
            break;
		}
	}
    blockingResponse.responseHeaders = headers;
    return{ responseHeaders: headers }
},{urls: ["http://*/*"]},["responseHeaders","blocking"]);