var json = "";
var result = "";
var target = -1;
var targetUrl = "";
var targetArray = [
	"https://www.facebook.com/",					// Facebook
	"https://www.flickr.com/photos/",				// Flickr
	"https://plus.google.com/photos/",				// Google Plus 相簿
	"http://photo.xuite.net/",						// 隨意窩（Xuite）
	"tian.yam.com/album/",							// 蕃薯藤．天空部落（Yam）
	"http://gallery.dcview.com/showGallery.php",	// DCView
	"https://www.theatlantic.com/photo/",			// In Focus
	"https://dq.yam.com/post.php",					// 地球圖輯隊
	"https://ck101.com/",							// 卡提諾論壇
	"https://www.jkforum.net/"						// 捷克論壇
];

// 初始執行，判斷是否為預設要下載的圖片網站
function getTarget(url){

	target = jQuery.inArray(url.split("?")[0], targetArray);

	if(target == -1){
		var newUrl = "";
		var urlBlock = url.split("?")[0].split("/");

		if(urlBlock[2] == "www.theatlantic.com"){
			for(var i = 0; i < 4; i++){
				newUrl += urlBlock[i] + "/";
			}
		}else if(urlBlock[2] == "ck101.com" || urlBlock[2] == "photo.xuite.net" || urlBlock[2] == "www.jkforum.net"){
			for(var i = 0; i < 3; i++){
				newUrl += urlBlock[i] + "/";
			}
		}else if((urlBlock[2] == "www.facebook.com" && urlBlock[4] == "media_set") || (urlBlock[2] == "www.facebook.com" && urlBlock[3] == "media" && urlBlock[4] == "set")){
			for(var i = 0; i < 3; i++){
				newUrl += urlBlock[i] + "/";
			}
		}else if(urlBlock[2] == "www.flickr.com" && urlBlock[3] == "photos" && urlBlock[5] == "sets"){
			for(var i = 0; i < 4; i++){
				newUrl += urlBlock[i] + "/";
			}
		}else if(urlBlock[2] == "plus.google.com" && urlBlock[3] == "photos" && urlBlock[5] == "album"){
			for(var i = 0; i < 4; i++){
				newUrl += urlBlock[i] + "/";
			}
		}else if(urlBlock[2].indexOf("tian.yam.com") != -1 && urlBlock[3] == "album"){
			for(var i = 2; i < 4; i++){
				newUrl += urlBlock[i] + "/";
			}
			var account = newUrl.split(".")[0];
			newUrl = newUrl.replace(account + ".", "");
		}

		target = jQuery.inArray(newUrl, targetArray);
		targetUrl = url;
	}

	return target;
}

// 取得圖片連結網址
function getPhoto(target, data){
	var link = "";
	var temp = "";
	var count = 0;
	var photo = [];
	result = "";

	if(target == 0){			// Facebook（目前無法下載粉絲專業相簿照片）
		// 針對 _o 的高解析圖檔做處理
		var key = [];
		temp = $(data).find("div.mtm a");
		count = $(temp).length;
		for(var i = 0; i < count; i++){
			link = $(temp).eq(i).attr("data-ploi");
			if(link != undefined){
				key.push(link.split("/")[5].split("_o")[0].split("_n")[0]);
				photo.push(link);
			}
		}

		// 針對 _n 的小尺寸圖檔做處理
		temp = $(data).find("div.fbPhotosRedesignBorderOverlay a img");
		count = $(temp).length;
		for(var i = 0; i < count; i++){
			link = $(temp).eq(i).attr("style");
			if(link != undefined){
				link = link.split("url(")[1].split(");")[0];
				link = link.split("\\3d ").join("=").replace("\\26 ", "&").replace("\\3a ", ":");
				if($.inArray(link.split("/")[6].split("_o")[0].split("_n")[0], key) == -1){
					photo.push(link);
				}
			}
		}
	}else if(target == 1){		// Flickr
		// 先取得 JSON 格式內容
		temp = $(data).text().split("modelExport: ")[1].split("auth: auth")[0];
		temp = temp.substring(0, temp.lastIndexOf(","));

		// 再處理 JSON 內容取得圖片路徑
		var obj = jQuery.parseJSON(temp);
		obj = obj["set-models"][0]["photoPageList"]["_data"];
		count = $(obj).length;
		for(var i = 0; i < count; i++){
			link = obj[i]["sizes"];
			if(link["k"] != undefined){
				link = link["k"]["displayUrl"];
			}else if(link["k"] == undefined && link["l"] != undefined){
				link = link["l"]["displayUrl"];
			}
			photo.push("http:" + link);
		}
	}else if(target == 2){		// Google Plus 相簿
		$.ajax({
		   	type: "GET",
		   	url: "https://picasaweb.google.com/data/feed/api/user/" + targetUrl.split("/")[4] + "/albumid/" + targetUrl.split("/")[6].split("?")[0],
		   	data: "imgmax=2048",
		   	dataType: "xml",
		   	success: function(xml){
		   		$(xml).find('entry').each(function(){
		   			$($(this).children().last()).each(function(){
		   				$($(this).children()).each(function(){
		   					if($(this).attr("url") != undefined && $(this).attr("url").indexOf("s2048") != -1){
		   						photo.push($(this).attr("url"));
		   						result = photo.join();
		   					}
		   				});
		   			});
	            });
		   	}
		});
	}else if(target == 3){		// 隨意窩（Xuite）
		temp = $(data).find(".blogbody .list_area .photo_item a img");
		count = $(temp).length;

		for(var i = 0; i < count; i++){
			photo.push($(temp).eq(i).attr("src").split("_c.").join("_x."));
		}
	}else if(target == 4){		// 蕃薯藤．天空部落（Yam）
		temp = $(data).find("div.photos div.inner-wrap img");
		count = $(temp).length;

		for(var i = 0; i < count; i++){
			photo.push($(temp).eq(i).attr("src"));
		}
	}else if(target == 5){		// DCView
		temp = $(data).find(".photomain img");
		count = $(temp).length;

		for(var i = 0; i < count; i++){
			photo.push($(temp).eq(i).attr("src"));
		}
	}else if(target == 6){		// In Focus
		temp = $(data).find("picture source");
		count = $(temp).length;

		for(var i = 0; i < count; i++){
			link = $(temp).eq(i).attr("data-srcset");
			if(link.indexOf("1500") != -1){
				photo.push(link);
			}
		}
	}else if(target == 7){		// 地球圖輯隊
		temp = $(data).find(".imgWrap img.lazyImg");
		count = $(temp).length;

		for(var i = 0; i < count; i++){
			photo.push($(temp).eq(i).attr("src"));
		}
	}else if(target == 8){		// 卡提諾論壇
		temp = $(data).find("ignore_js_op img");
		count = $(temp).length;

		if(count == 0){
			temp = $(data).find("img.zoom");
			count = $(temp).length;
		}

		for(var i = 0; i < count; i++){
			if($(temp).eq(i).attr("src") != undefined){
				photo.push($(temp).eq(i).attr("src"));
			}
		}
	}else if(target == 9){		// 捷克論壇
		temp = $(data).find("ignore_js_op img");
		count = $(temp).length;

		for(var i = 0; i < count; i++){
			link = $(temp).eq(i).attr("src");
			if(link.indexOf("mymypic.net") == -1){
				link = "https://www.jkforum.net" + link;
			}
			photo.push(link);
		}
	}

	result = photo.join();
}

// 載入網頁時取得 BODY 內容
chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse){
    	getPhoto(request.target, request.content)
	}
);

// 網頁重新整理時
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	if (changeInfo.status == "complete"){
		target = getTarget(tab.url);
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
		target = getTarget(tab.url);
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