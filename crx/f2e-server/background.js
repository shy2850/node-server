(function(){
    var tabs = {};
    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        if( sender.tab && request.href ){
            tabs[sender.tab.id] = request;
            sendResponse( sender );
        }else{
            sendResponse( tabs );
        }
    });


    /*增加右键按钮*/
    /*

    window.copyAndConvertToMarkdownContextMenuId = 
        chrome.contextMenus.create({
            title: "show qrcode",
            type: "normal",
            contexts: ["page", "selection", "link", "image"],
            onclick: function(info, tab){
                render("http://news.cn")
            }
        });

    
    chrome.contextMenus.create({
        parentId: copyAndConvertToMarkdownContextMenuId,
        title: "page [title] (url) ",
        type: "normal",
        contexts: ["page"],
        onclick: function(info, tab){
            //TODO
        }
    });
    */
})();