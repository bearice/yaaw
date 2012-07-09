class BackgroundTasks
    init: ()->
        chrome.contextMenus.create
            title    : "Download link with Aria2",
            contexts : ["link"],
            onclick  : (info,tab)=> @downloadLink(info,tab)
            
    downloadLink: (info,tab)->
        jobOptions =
            headers:[
                'Referer: ' + tab.url,
                'User-Agent: ' + window.navigator.userAgent
            ]
        chrome.cookies.getAll
            url: info.linkUrl,
            (cookies)=>
                if cookies.length
                    header = (cookie.name+"="+cookie.value for cookie in cookies)
                    jobOptions.headers.push "Cookie: " + header.join("; ")
                
                console.info jobOptions
                @findOrCreateAppTab (tab)=>
                    #console.info(tab)
                    chrome.tabs.sendMessage tab.id,
                        event: 'task.add'
                        uri  : info.linkUrl
                        options: jobOptions

    findOrCreateAppTab: (callback) ->
        url = chrome.extension.getURL 'index.html'
        chrome.tabs.query {url: url},(tabs)=>
            if tabs.length
                chrome.tabs.update tabs[0].id, {active: true}
                callback tabs[0]
            else
                chrome.tabs.create {url: url},callback

bk = new BackgroundTasks()
bk.init()
