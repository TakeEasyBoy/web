var PIAO = {};

/**
 * 初始化图片地址
 */
PIAO.initImgSrc = function(img) {
    if (!img) {
        return false;
    }
    var src = img.getAttribute('src');
    if (src) {
        return src;
    }
    var init_src = img.getAttribute('init_src');
    if (!init_src) {
        return false;
    }
    img.setAttribute('src', init_src);
    return init_src;
}

/**
 * 表单发送
 */
PIAO.FormSender = function(url, o, cbk, type, charset) {
    if (!url) {
        return false;
    }
    document.domain = "qq.com";
    type = type || "POST";
    charset = charset || "utf-8";
    var callback = function(ret, data) {
        if (cbk && QQVIP.object.getType(cbk) == "function") {
            cbk(ret, data);
        }
    }
    o = o || {};
    o['g_tk'] = QQVIP.security.getAntiCSRFToken();
    o['_'] = Math.random();
    var sender = new QZFL.FormSender(url, type, o, charset);
    sender.onSuccess = function(data) {
        if (!data) {
            callback(false, {
                'ret': -1
            });
        } else {
            callback(true, data);
        }
    };
    sender.onError = function() {
        callback(false, {
            'ret': -2
        });
    };
    sender.onTimeout = function() {
        callback(false, {
            'ret': -3
        });
    };
    sender.send();
}

/**
 * JSON 加载
 */
PIAO.JsonLoader = function(url, cbk, charset) {
    if (!url) {
        return false;
    }
    charset = charset || 'utf-8';
    url += url.indexOf('?') == -1 ? '?': '&';
    url += ('g_tk=' + QQVIP.security.getAntiCSRFToken() + '&_=' + Math.random());
    var jsonLoader = new QQVIP.JSONGetter(url, null, null, charset, true);
    var callback = function(ret, data) {
        if (cbk && QQVIP.object.getType(cbk) == "function") {
            cbk(ret, data);
        }
    }
    jsonLoader.onSuccess = function(data) {
        if (!data) {
            callback(false, {
                'ret': -1
            });
        } else {
            callback(true, data);
        }
    };
    jsonLoader.onError = function() {
        callback(false, {
            'ret': -2
        });
    };
    jsonLoader.onTimeout = function() {
        callback(false, {
            'ret': -3
        });
    };
    jsonLoader.send();
}

/**
 * JS加载
 */
PIAO.JsLoader = function(url, callback, charset, g_tk) {
    g_tk = g_tk === false ? false: true;
    var jsl = new QZFL.JsLoader();
    jsl.onload = function() {
        if (callback && QQVIP.object.getType(callback) == "function") {
            callback();
        }
    }
    charset = charset || 'utf-8';
    if (g_tk) {
        url += url.indexOf('?') == -1 ? '?': '&';
        url += ('g_tk=' + QQVIP.security.getAntiCSRFToken() + "&_=" + Math.random());
    }
    jsl.load(url, null, charset);
}

/**
 * XML 加载
 */
PIAO.XHRLoader = function(url, callback, o, type, charset) {
    charset = charset || 'utf-8';
    var xhr = new QZONE.XHR(url, null, type, o, true, true);
    xhr.charset = charset;
    o = o || {};
    o['g_tk'] = QQVIP.security.getAntiCSRFToken();
    o['t'] = Math.random();
    function xhrOnSuccess(res) {
        try {
            for (var p in res) {
                if (p == 'text') {
                    if (QQVIP.object.getType(callback) == 'function') {
                        callback(res[p]);
                    } else {
                        eval(res[p]);
                    }
                }
            }
        } catch(e) {}
    }
    xhr.onSuccess = xhrOnSuccess;
    xhr.send();
}

/**
 * Cookie管理
 */
PIAO.cookie = {
    set: function(name, value, exp) {
        exp = exp || '';
        if (name == "piao_city") {
            exp = 4220;
            QZFL.cookie.set(name, value, "qq.com", '/', exp);
        } else {
            QQVIP.cookie.set(name, encodeURIComponent(value), location.host, '/', exp);
        }
    },
    get: function(name) {
        return decodeURIComponent(QQVIP.cookie.get(name));
    },
    del: function(name) {
        QQVIP.cookie.del(name, location.host, '/');
    }
}

PIAO.pvReport = function() {
    if (pgvMain && QQVIP.object.getType(pgvMain) == "function") {
        pgvMain("", {
            "senseParam": PIAO.curCity
        });
    }
}

/**
 * 加载窗体
 */
PIAO.openWindow = function(url, o, charset) {
    var f = document.createElement("form");
    document.getElementsByTagName("body")[0].appendChild(f);
    f.action = url;
    f.target = "_blank";
    f.method = "POST";
    f.charset = charset || 'utf-8';
    var html = [];
    if (o) {
        for (var key in o) {
            html.push('<input type="hidden" value="' + o[key] + '" name="' + key + '" />');
        }
    }
    f.innerHTML = html.join('');
    f.submit();
    document.getElementsByTagName("body")[0].removeChild(f);
}


/**
 * 获取模板
 */
PIAO.getTemplate = function(id) {
    var dom = document.getElementById(id);
    if (!dom) return false;
    var listtemp = dom.innerHTML;
    listtemp = listtemp.toString().replace(/[\n\r]/g, '');
    listtemp = listtemp.replace(/.*<!--template_begin>(.*)<template_end-->.*/g, "$1");
    return listtemp;
}

/**
 * 获取 Href 参数
 */
PIAO.getHrefArgs = function() {
    return location.search.substring(1).toJson('&', '=', 
    function(v) {
        try {
            return decodeURIComponent(v)
        } catch(e) {}
    });
}


/**
 * 初始化 Ipt
 */
PIAO.initIpt = function(ipt) {
    if (!ipt) {
        return false;
    }
    var initVal = ipt.getAttribute('init_val');
    ipt.value = initVal;
    var _on = function() {
        var val = ipt.value.trim();
        if (val == initVal) {
            ipt.value = "";
        }
    }
    var _off = function() {
        if (ipt.value == '') {
            ipt.value = initVal;
        }
    }
    QZFL.event.addEvent(ipt, 'focus', _on);
    QZFL.event.addEvent(ipt, 'blur', _off);
    this.getVal = function() {
        var val = ipt.value.trim();
        if (val == '' || val == initVal) {
            return '';
        } else {
            return val;
        }
    }
}

/**
 * 复制文本
 */
PIAO.copyText = function(txt, cbf) {
    var clip = "";
    var trans = "";
    if (window.clipboardData && window.clipboardData.setData) {
        if (!window.clipboardData.setData("Text", txt)) {
            PIAO.PopMsg.msg("复制文本内容失败!");
            return false;
        }
    } else if (QQVIP.userAgent.opera && navigator.mimeTypes["application/x-shockwave-flash"]) {
        var d = document.createElement("div");
        document.getElementsByTagName("body")[0].appendChild(d);
        d.innerHTML = "<embed src='/flash/clipboard.swf' FlashVars='clipboard=" + escape(txt) + "' width='0' height='0' type='application/x-shockwave-flash'></embed>";
    } else if (window.netscape) {
        try {
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect")
        } catch(e) {
            PIAO.PopMsg.msg('您的FireFox限制剪贴板操作!请打开 about:config 页面开启此功能!');
            return false;
        }
        try {
            clip = Components.classes["@mozilla.org/widget/clipboard;1"].createInstance(Components.interfaces.nsIClipboard);
            trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable)
        } catch(e) {
            return false;
        }
        trans.addDataFlavor("text/unicode");
        var oStr = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
        oStr.data = txt;
        trans.setTransferData("text/unicode", oStr, txt.length * 2);
        var clipid = "";
        try {
            clipid = Components.interfaces.nsIClipboard
        } catch(e) {
            return false;
        }
        clip.setData(trans, null, clipid.kGlobalClipboard);
    } else {
        PIAO.PopMsg.msg("对不起，该功能只支持IE，firefox和opera浏览器！");
        return false;
    }
    if (cbf instanceof Function) cbf();
}


PIAO.MASK = {
    has: false,
    show: function() {
        var oMask = document.getElementById('bg_dark');
        var dom = QQVIP.dom;
        var height = dom.getClientHeight() > QQVIP.dom.getScrollHeight() ? dom.getClientHeight() : QQVIP.dom.getScrollHeight()
        if (!oMask) {
            var oMask = document.createElement("div");
            oMask.id = "bg_dark";
            oMask.className = "mod_pop_mask";
            oMask.style.height = height + "px";
            var oBody = document.getElementsByTagName('body')[0];
            oBody.appendChild(oMask);
        }
        else {
            oMask.style.width = QQVIP.dom.getScrollWidth() + "px";
            oMask.style.height = height + "px";
            oMask.style.display = "block";
        }
        if (QQVIP.userAgent.ie < 7) {
            var oSels = document.getElementsByTagName("select");
            for (var i = 0, l = oSels.length; i < l; i++) {
                oSels[i].style.visibility = 'hidden';
            }
        }
        QQVIP.event.addEvent(window, 'resize', set);
        function set() {
            if (PIAO.MASK.has) {
                var oMask = document.getElementById('bg_dark');
                oMask.style.width = QQVIP.dom.getScrollWidth() + "px";
                oMask.style.height = height + "px";
                oMask.style.display = "block";
            }
        };
        this.has = true;
    },
    hide: function() {
        var oMask = document.getElementById('bg_dark');
        oMask.style.display = "none";
        if (QQVIP.userAgent.ie < 7) {
            var oSels = document.getElementsByTagName("select");
            for (var i = 0, l = oSels.length; i < l; i++) {
                oSels[i].style.visibility = 'visible';
            }
        }
        PIAO.MASK.has = false;
    }
}


PIAO.POP = {
    restoreCSS: function(el, o) {
        if (!el) {
            return false;
        }
        for (var key in o) {
            el.style[key] = o[key];
        }
    },
    show: function(objid, mask_show, evt, left_ex, top_ex) {
        left_ex = left_ex || 0;
        top_ex = top_ex || 0;
        var dom = QQVIP.dom;
        var left,
        top;
        var el = document.getElementById(objid);
        el.style.display = "block";
        var size = dom.getSize(el);
        mask_show = typeof(mask_show) == 'undefined' ? true: false;
        if (mask_show) {
            PIAO.MASK.show();
        }
        if (size[1] > dom.getClientHeight() * 0.6) {
            if (QQVIP.userAgent.ie < 7) {
                top = (dom.getClientHeight() - size[1]) / 2 + dom.getScrollTop();
                el.style.top = top;
            } else {
                el.style.top = "150px";
            }
            el.style["marginTop"] = '0px';
            el.style.position = 'absolute'
            el.style.left = '50%';
            el.style["marginLeft"] = parseInt(( - 1) * size[0] / 2, 10) + 'px';
        } else {
            if (!evt) {
                if (QQVIP.userAgent.ie < 7) {
                    setTimeout(function() {
                        top = (dom.getClientHeight() - size[1]) / 2 + dom.getScrollTop();
                        el.style.position = 'absolute';
                        el.style.top = top;
                        var sels = el.getElementsByTagName('select');
                        for (var i = 0, l = sels.length; i < l; i++) {
                            sels[i].style.visibility = 'visible';
                        }
                        if (el.id == 'msg_div_div') {
                            var div = el.getElementsByTagName('div');
                            var arr = dom.getSize(div[0]);
                        }
                        el.style["marginLeft"] = parseInt(( - 1) * size[0] / 2, 10) + 'px';
                    },
                    0)
                } else {
                    el.style.top = "50%";
                    if (el.id == 'msg_div_div') {
                        el.style["marginTop"] = (parseInt(( - 1) * size[1] / 2, 10) || -50) + 'px';
                        var div = el.getElementsByTagName('div');
                        var arr = dom.getSize(div[0]);
                        el.style["marginLeft"] = parseInt(( - 1) * arr[0] / 2, 10) + 'px';
                    } else {
                        el.style["marginLeft"] = parseInt(( - 1) * size[0] / 2, 10) + 'px';
                        el.style["marginTop"] = (parseInt(( - 1) * size[1] / 2, 10) || -150) + 'px';
                    }
                }
                el.style.left = '50%';
                el.style["marginLeft"] = parseInt(( - 1) * size[0] / 2, 10) + 'px';
            } else {
                el.style["marginTop"] = top_ex + 'px';
                var toph = QZFL.dom.getScrollTop();
                el.style.top = (evt.screenY + toph) + "px";
                el.style.position = 'absolute'
                var div = el.getElementsByTagName('div');
                var topw = QZFL.dom.getScrollLeft();
                el.style.left = (evt.screenX + topw + left_ex) + "px";
            }
        }
        if (QQVIP.userAgent.ie < 7) {
            var sels = el.getElementsByTagName('select');
            for (var i = 0, l = sels.length; i < l; i++) {
                sels[i].style.visibility = 'visible';
            }
            el.style.left = '50%';
            el.style["marginLeft"] = parseInt(( - 1) * size[0] / 2, 10) + 'px';
        }
    },
    hide: function(objid) {
        $e("#" + objid).hide();
        $e("#bg_dark").hide();
        PIAO.MASK.hide();
    }
}


PIAO.isGreenVip = function(cbk) {
    var uin = PIAO.login.is();
    if (!uin) {
        cbk(false);
        return false;
    }
    var vip = PIAO.cookie.get('piao_green_' + uin);
    var checkGreen = function(data) {
        if (!data) {
            cbk(false);
        }
        if (typeof(data['is_music']) != 'undefined') {
            if (data['is_music'] == 1) {
                PIAO.cookie.set('piao_green_' + uin, '1');
                cbk(true);
            } else {
                PIAO.cookie.set('piao_green_' + uin, '-1');
                cbk(false);
            }
        } else {
            cbk(false);
        }
    }
    if (vip) {
        if (vip === '1') {
            cbk(true);
        } else if (vip === '-1') {
            cbk(false)
        }
    } else {
        PIAO.getUserInfo(checkGreen, ['music']);
    }
    return;
}


PIAO.PopMsg = {
    interval: null,
    _tpl: '<div class="wrapper"><div id="{div_id}"  class="mod_pop_gd_v3"><div   style="{style}" class="mod_pop_wrap"><div class="mod_pop_gd_hd"><h3>{title}</h3><button type="button" title="关闭弹出层" onclick="PIAO.PopMsg.hide(\'tips_div\');">关闭</button></div><div class="mod_pop_gd_bd"><div class="{icon_type}"><h3>{info}</h3>{detail}</div></div><div class="mod_pop_gd_ft"><a href="{link}" id="com_ok_btn" style="display:{ok_btn_block}" class="btn_fit_pop"><span>{ok_btn_txt}</span></a><a href="javascript:PIAO.PopMsg.hide(\'tips_div\');" style="display:{no_btn_block}" id="com_no_btn" class="btn_fit_pop"><span>{no_btn_txt}</span></a></div></div></div>',
    hide: function(id) {
        var me = this;
        id = id || 'tips_div';
        $e("#" + id).hide();
        if (id != me._msg_id) {
            PIAO.MASK.hide();
        }
    },
    showComm: function(o) {
        o['style'] = o['style'] || 'width:425px';
        o['ok_btn_txt'] = o['ok_btn_txt'] || "确定";
        o['no_btn_txt'] = o['no_btn_txt'] || '关闭';
        var str = PIAO.PopMsg._tpl.format(o);
        var me = this;
        me._init('tips_div', o.div_id, str, 101);
    },
    show: function(tpl, o) {
        var str = tpl.format(o);
        var me = this;
        me._init('tips_div', o.div_id, str, 101);
    },
    _init: function(div_id, id, html, index, evt, left_ex, top_ex) {
        var me = this;
        div_id = div_id || 'tips_div';
        index = index || 1000;
        var div = document.getElementById(div_id);
        if (!div) {
            div = document.createElement("div");
            div.id = div_id;
            div.style['z-index'] = index;
            document.getElementsByTagName("body")[0].appendChild(div);
        }
        div.innerHTML = html;
        div.style.display = 'block';
        if (div_id == me._msg_id) {
            PIAO.POP.show(id, false, evt, left_ex, top_ex);
        } else {
            PIAO.POP.show(id);
        }
    },
    _msg_id: 'msg_tips_div',
    msg: function(msg, type, evt, left_ex, top_ex) {
        var me = this;
        type = type || 'info_alert';
        top_ex = top_ex || '-50';
        var tpl = '<div class="mod_pop_gd_v3" id="msg_div_div" style="width:320px;"><div class="mod_pop_wrap"  style="width:320px;position:absolute" ><div class="mod_pop_gd_bd"><div class="' + type + '"><p class="single_row">' + msg.html() + '</p></div></div></div></div>';
        me._init(me._msg_id, 'msg_div_div', tpl, 1100, evt, left_ex, top_ex);
        if (me.interval) {
            clearInterval(me.interval);
        }
        me.interval = setInterval(function() {
            PIAO.PopMsg.hide(me._msg_id);
            clearInterval(me.interval)
        },
        1500);
    },
    txtBlur: function(id, color, oldcs) {
        oldcs = oldcs || '';
        color = color || 'orange';
        var map = {
            'black': 'c_tx1',
            'orange': 'c_tx2',
            'gray': 'c_tx3',
            'green': 'c_tx4'
        };
        var cls = typeof(map[color]) != "undefined" ? map[color] : 'c_tx2';
        var el = document.getElementById(id);
        if (!el) {
            return false;
        }
        var max = 6;
        var i = 1;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
            el.className = oldcs;
        }
        this.timer = setInterval(function() {
            if (i++>max) {
                clearInterval(this.timer);
                el.className = oldcs;
                this.timer = null;
                return;
            }
            if (i % 2 == 1) {
                el.className = oldcs;
            } else {
                el.className = cls;
            }
        },
        500);
    }
}


PIAO.Checker = (function() {
    function isQQUin(uin) {
        if (isDigit(String(uin))) {
            uin = parseInt(uin, 10);
            if (uin > 10000 && uin < 4247483647) {
                return true;
            }
        }
        return false;
    }
    function isDigit(s) {
        var patrn = /^\d+$/;
        if (patrn.test(s)) {
            return true;
        } else {
            return false;
        }
        return false;
    }
    function mobile(strNum) {
        var partrn = /^1\d{10}$/;
        if (!partrn.test(strNum))
        return false;
        return true;
    }
    function phone(strNum) {
        var partrn = /^(0\d{2,3}-)?\d{5,8}(-\d{1,8})?$/;
        if (!partrn.test(strNum))
        return false;
        return true;
    }
    function name(strName) {
        var partrn = /^[\u4e00-\u9fa5a-z]{2,15}$|^[a-z]{2,15}$/i;
        if (partrn.test(strName)) {
            return true;
        } else {
            return false;
        }
    }
    function email(strEmail) {
        var patrn = /^([a-z0-9])+(([a-z0-9])+[\.]?[_]?)*@(([a-z0-9])+[\.]){1,2}[a-z]{2,3}$/i;
        if (patrn.test(strEmail)) {
            return true;
        } else {
            return false;
        }
        return false;
    }
    function postcode(strZip) {
        if (isDigit(strZip) && strZip.length == 6)
        return true;
        else
        return false;
    }
    function string(str) {
        var special_string = /[&|\'|\"|<|>|#|%|@|*|~|\$|\\|=]+/;
        return ! special_string.test(str)
    }
    return {
        name: name,
        email: email,
        phone: phone,
        mobile: mobile,
        string: string,
        qquin: isQQUin,
        num: isDigit,
        postcode: postcode
    };
})()


PIAO.getSelTxt = function(sel_id) {
    var sel = document.getElementById(sel_id);
    if (!sel) {
        return false;
    }
    var index = sel.selectedIndex;
    if (index > 0) {
        return sel.options[index].innerHTML;
    } else {
        return false;
    }
}


PIAO.getStringTime = function(str) {
    str = String(str);
    if (str.length != 14) {
        return ''
    }
    return str.replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/g, "$1-$2-$3 $4:$5:$6");
}


PIAO.getObjectTime = function(str, o) {
    str = String(str);
    o = o || {};
    if (str.length != 14) {
        return false;
    }
    var yy = parseInt(str.substr(0, 4), 10);
    var mm = parseInt(str.substr(4, 2), 10);
    var dd = parseInt(str.substr(6, 2), 10);
    var date = new Date();
    date.setFullYear(yy);
    date.setMonth(mm - 1);
    date.setDate(dd);
    var ww_arr = ['日', '一', '二', '三', '四', '五', '六'];
    var w = date.getDay();
    o['date'] = yy + '-' + mm + '-' + dd;
    o['week'] = ww_arr[w];
    o['time'] = str.substr(8, 2) + ":" + str.substr(10, 2);
    return o['date'] + '  周' + o['week'] + " " + o['time'];
}


PIAO.GoTop = function(el_id) {
    function go() {
        if (QQVIP.userAgent.chrome) {
            document.body.scrollTop = 0;
        } else {
            QZFL.dom.setScrollTop(0);
        }
    }
    var el = document.getElementById(el_id);
    if (el) {
        QQVIP.event.addEvent(window, 'scroll', 
        function() {
            var s_top = QZFL.dom.getScrollTop();
            if (s_top > 0) {
                var top = QZFL.dom.getClientHeight() + s_top;
                el.style.top = (parseInt(top, 10) - 50) + 'px';
                el.style.display = "block";
            } else {
                el.style.display = "none";
            }
        });
        QQVIP.event.addEvent(el, 'click', 
        function() {
            go();
        })
    }
}


PIAO.checkIpt = function(map, o) {
    o = o || {};
    map = map || {};
    for (var key in map) {
        var arr = [];
        var els = null;
        if (map[key]['name']) {
            els = document.getElementsByName(map[key]['name']);
            if (els) {
                var val = '';
                for (var i = 0, l = els.length; i < l; i++) {
                    val = els[i].value.trim();
                    if (val != '') {
                        arr.push(val);
                    }
                }
            }
        } else {
            arr.push(map[key]['val']);
        }
        o[key] = arr.join(map[key]['join']);
        if ((o[key] == '' && map[key]['null'] == 0) || o[key] != '' && (!PIAO.Checker[map[key]['reg']](o[key]) || o[key].length > map[key]['maxlen'])) {
            if (els) {
                els[0].focus();
            }
            return map[key]['info'];
        }
    }
    return true;
}


PIAO.getInc = function(base) {
    var i = base;
    return function() {
        return i++;
    }
}


PIAO.UserAddr = function() {
    var get_url = "http://cgi.go.qq.com/cgi-bin/comm/pcenter.fcg?callback=callback&method=3&time=" + Math.random();
    this.getAddr = function(cbk) {
        var callback = function(ret, data) {
            if (ret == true) {
                if (data && typeof(data.ret) != "undefined") {
                    switch (parseInt(data.ret, 10)) {
                    case 0:
                        if (typeof(data.msg) != "undefined" && typeof(data.msg.receiverAddressList) != "undefined") {
                            var arr = data.msg.receiverAddressList || [];
                            cbk(arr);
                            return;
                        }
                        break;
                    case - 20: PIAO.login.open();
                        break;
                    default:
                        break;
                    }
                }
            }
            cbk(false);
        }
        PIAO.JsonLoader(get_url, callback);
    }
    var region_js = 'http://imgcache.qq.com/piao/js/comm/region_info.js';
    this.initRegion = function(region_id, pro_sel, city_sel, area_sel) {
        if (!pro_sel || !city_sel || !area_sel) {
            return false;
        }
        region_id = region_id || null;
        function init() {
            var sels = new CRegionSelectBox(pro_sel, city_sel, area_sel);
            sels.init(region_id);
            sels.BindDefaultEvent();
        }
        if (typeof(REGION_ROOT_ID) == 'undefined') {
            PIAO.JsLoader(region_js, init, 'gb2312', false);
        } else {
            init();
        }
    }
    var url = "http://cgi.go.qq.com/cgi-bin/comm/pcenter.fcg";
    this.submit = function(type, o, cbk) {
        type = type || 'mod';
        o['method'] = type == 'mod' ? 16: 15;
        var callback = function(ret, data) {
            if (ret == true) {
                if (data && typeof(data.ret) != "undefined" && data.ret == 0) {
                    if (typeof(data.msg) != "undefined" && typeof(data.msg.receiverAddressList) != "undefined") {
                        var arr = data.msg.receiverAddressList || [];
                        cbk(ret, arr);
                        return;
                    }
                }
            }
            cbk(false, []);
        }
        PIAO.FormSender(url, o, callback);
    }
}


PIAO.orderByField = function(list, filed) {
    var v1,
    v2;
    function compare(val1, val2) {
        v1 = parseInt(val1[filed]);
        v2 = parseInt(val2[filed]);
        if (v1 < v2) {
            return 1;
        } else if (v1 > v2) {
            return - 1;
        } else {
            return 0;
        }
    }
    list.sort(compare);
}

/**
 * 字符串空格处理
 */
String.prototype.trim = function(r) {
    r = r || /(^\s+)|(\s+$)/g;
    return this.replace(r, "");
}


/**
 * 格式化
 */
String.prototype.format = function() {
    var a = arguments;
    var data = (a.length == 1 && typeof(a[0]) == 'object') ? a[0] : a;
    return this.replace(/\{([\d\w]+)\}/g, 
    function(m, n) {
        return data[n] != undefined ? data[n].toString() : m;
    });
}

/**
 * 转换成Json
 */
String.prototype.toJson = function(lvl_1, lvl_2, fn) {
    fn = QQVIP.object.getType(fn) == "function" ? fn: (function(v) {
        return v
    });
    var newar = this.split(lvl_1);
    var ar = [];
    for (var i = 0, l = newar.length; i < l; i++) {
        if (newar[i].trim() != '');
        ar.push(newar[i])
    }
    var r = {};
    QQVIP.object.each(ar, 
    function(i) {
        var a = i.split(lvl_2);
        if (a[1] != undefined) r[a[0]] = fn(a[1]);
    });
    return r;
}

/**
 * HTML文本处理
 */
String.prototype.html = function(isdecode) {
    var ar = ['&', '&amp;', '<', '&lt;', '>', '&gt;', ' ', '&nbsp;', '"', '&quot;', "'", '&#39;', '\\r', '<br>', '\\n', '<br>'];
    if (isdecode) ar.reverse();
    for (var i = 0, r = this; i < ar.length; i += 2) r = r.replace(new RegExp(ar[i], 'g'), ar[1 + i]);
    return r;
}

/**
 * 长度
 */
String.prototype.realLength = function(t) {
    t = t || 'utf8';
    var inc = (t == "utf8") ? 3: 2
    var len = 0;
    for (var i = 0; i < this.length; i++) {
        if (this.charCodeAt(i) > 127)
        len += inc;
        else
        len++;
    }
    return len;
}


Date.prototype.format = function() {
    var arg = arguments;
    if (arg.length == 1 && typeof arg[0] == 'string') {
        var str = arg[0];
        var reg = /(yyyy|yy|mm|m|dd|d|hh|h|MM|M|ss|s)/gi;
        var d = {
            yyyy: this.getFullYear(),
            yy: this.getFullYear().toString().match(/\d{2}$/),
            mm: (this.getMonth() + 1) < 10 ? ('0' + (this.getMonth() + 1)) : (this.getMonth() + 1),
            m: (this.getMonth() + 1),
            dd: this.getDate() < 10 ? ('0' + this.getDate()) : this.getDate(),
            d: this.getDate(),
            hh: this.getHours() < 10 ? ('0' + this.getHours()) : this.getHours(),
            h: this.getHours(),
            MM: this.getMinutes() < 10 ? ('0' + this.getMinutes()) : this.getMinutes(),
            M: this.getMinutes(),
            ss: this.getSeconds() < 10 ? ('0' + this.getSeconds()) : this.getSeconds(),
            s: this.getSeconds()
        };
        str = str.replace(reg, 
        function() {
            return d[arguments[1]];
        });
        return str;
    }
}

document.domain = '';
PIAO.curCity = null;
PIAO.curCityName = '贵阳';
PIAO.CurCityPY = 'Guiyang';


PIAO.getAllCity = function(id, name, cbk) {
    var func = function() {
        var data = all_city_map ? all_city_map: {};
        if (name || id) {
            for (var key in data) {
                if (name == data[key]['name'] || id == key) {
                    PIAO.curCity = key;
                    PIAO.curCityName = data[key]['name'];
                    PIAO.CurCityPY = data[key]['pinyin'];
                    break;
                }
            }
        }
        cbk(data);
    }
    if (typeof(all_city_map) == 'undefined') {
        var jsl = new QZFL.JsLoader();
        jsl.onload = function() {
            func();
        }
        jsl.onerror = function() {
            func();
        }
        jsl.load('http://piao.qq.com/yanchu/data/type/all_cities.json', null, 'utf-8');
    } else {
        func();
    }
    return;
}


PIAO.changePiaoCity = function(city_id) {
    var url = location.href;
    var tag = url.replace(/[\w:]+\/\/[\w\.]+\/(\w+)\/.*/g, "$1");
    var n_url = 'http://piao.qq.com/';
    var html = url.replace(/.*\/(.*)\.html.*/g, "$1");
    if (tag == 'movie') {
        tag = 'dianying';
    }
    if (tag == "yanchu" || tag == 'dianying') {
        location.href = n_url + tag + "/?city=" + city_id;
    } else if (tag == url) {
        if (html == url) {
            html = 'index';
        }
        location.href = n_url + html + ".html?city=" + city_id;
    } else {
        location.href = n_url + tag + "/" + html + ".html?city=" + city_id;
    }
}


PIAO.getUserInfo = function(cbk, arr) {
    var url = "/dianying/json.php";
    var o = {
        'mod': 'info',
        'func': 'getuser',
        'jsontype': 'json',
        'nick_name': '1'
    };
    if (arr) {
        for (var i = 0, l = arr.length; i < l; i++) {
            o[arr[i]] = 1;
        }
    }
    var callback = function(str) {
        if (!str) {
            return false
        };
        str = 'var data=' + str;
        eval(str);
        if (data && typeof(data.ret) != 'undefined' && data.ret == 0 && cbk && QQVIP.object.getType(cbk) == "function") {
            cbk(data);
        }
    }
    PIAO.XHRLoader(url, callback, o, 'POST');
}


PIAO.initMYInfo = function() {
    var el = document.getElementById('user_info_div');
    if (!el) {
        return false;
    }
    var tpl = '<div class="photo"><img src="{face_url}" /></div><div class="usr_level"><p class="usr_name" id=>您好，{nick}</p><p><a style="display:{vip}" href="http://vip.qq.com/myvip/" target="_blank"><img src="http://imgcache.qq.com/vipstyle/piao_v1/img/icon_vip.png" /></a><a href="http://vip.music.qq.com/" style="display:{music}"  target="_blank"><img src="http://imgcache.qq.com/vipstyle/piao_v1/img/icon_music.png" /></a></p></div>';
    var init = function(data) {
        if (!data) {
            return false;
        }
        var o = {};
        o['nick'] = data.nick_name;
        o['face_url'] = data.face_url.html(true);
        o['vip'] = data['is_club'] == 1 ? '': 'none';
        o['music'] = data['is_music'] == 1 ? '': 'none';
        el.innerHTML = tpl.format(o);
    }
    el.innerHTML = '<div class="photo">欢迎您，请您先<a href="#" onClick="PIAO.login.open()">登录</a></div>';
    PIAO.getUserInfo(init, ['club', 'music', 'nick_name', 'face_url']);
}


function getUserCity(cbk) {
    if (PIAO.curCity < 10) {
        document.write("<scri" + "pt type='text/javascript' charset='gb2312' src='http://piao.qq.com/dianying/ip2geo.php' onerror='getUserLocation()'></scr" + "ipt>");
        setTimeout(function() {
            if (PIAO.curCity < 10) {
                getUserLocation()
            }
        },
        1000);
        return;
    } else {
        initNavCity();
    }
}


function getUserLocation(data) {
    if (data && typeof(data['errno']) != "undefined" && data['errno'] != "321") {
        var city_province = {
            '北京市': '',
            '上海市': '',
            '天津市': '',
            '重庆市': ''
        };
        if (data['errno'] == "0" && data['country'] == "中国") {
            var province = data['province'] || '';
            var city = data['city'] || '';
            if (typeof(city_province[province]) != 'undefined') {
                PIAO.curCityName = province.replace("市", '');
            } else {
                PIAO.curCityName = city.replace("市", '');
            }
        } else {
            PIAO.curCityName = '深圳';
        }
    } else {
        PIAO.curCityName = '深圳';
        PIAO.curCity = 221;
    }
    initNavCity();
}


function initNavCity() {
    PIAO.getAllCity(PIAO.curCity, PIAO.curCityName, 
    function(data) {
        initNavCityDiv(data, 100);
    });
}


function initNavCityDiv(data, type) {
    var now_city = PIAO.curCity;
    type = type || 100;
    var now_name = PIAO.curCityName;
    var temp = '';
    var arr = {};
    var json = {};
    var find = false;
    var chars = [];
    var hots = [];
    var tpl = '<a href="#" s="{id}" class="{class}">{name}</a>';
    var cur = "";
    var flag = "";
    var hot_citys = {
        '10': {
            'name': '北京',
            'pinyin': 'beijing',
            'hot': '1'
        },
        '82': {
            'name': '上海',
            'pinyin': 'shanghai',
            'hot': '1'
        },
        '221': {
            'name': '深圳',
            'pinyin': 'shenzhen',
            'hot': '1'
        },
        '210': {
            'name': '广州',
            'pinyin': 'guangzhou',
            'hot': '1'
        },
        '267': {
            'name': '成都',
            'pinyin': 'chengdu',
            'hot': '1'
        },
        '266': {
            'name': '重庆',
            'pinyin': 'chongqing',
            'hot': '1'
        },
        '179': {
            'name': '武汉',
            'pinyin': 'wuhan',
            'hot': '1'
        },
        '11': {
            'name': '天津',
            'pinyin': 'tianjin',
            'hot': '1'
        },
        '320': {
            'name': '西安',
            'pinyin': 'xian',
            'hot': '1'
        },
        '96': {
            'name': '杭州',
            'pinyin': 'hangzhou',
            'hot': '1'
        },
        '83': {
            'name': '南京',
            'pinyin': 'nanjing',
            'hot': '1'
        }
    }
    for (var id in data) {
        json = data[id];
        json.id = id;
        temp = json['pinyin'];
        cur = '';
        if (id == now_city || now_name == json['name']) {
            PIAO.curCityName = json['name'];
            PIAO.CurCityPY = json['pinyin'];
            PIAO.curCity = id;
            now_city = id;
            find = true;
            cur = 'current';
        }
        if (typeof(hot_citys[id]) != 'undefined') {
            data[id]['id'] = id;
            data[id]['class'] = cur;
            hots.push(tpl.format(data[id]));
        }
        if (! (parseInt(json['flag'], 2) & type)) {
            continue;
        }
        temp = temp.charAt(0).toUpperCase();
        if (typeof(arr[temp]) == "undefined") {
            arr[temp] = [];
            chars.push(temp);
        }
        arr[temp].push(json);
    }
    var html = [];
    var initCharCity = function(code) {
        if (typeof(arr[code]) == 'undefined') {
            return;
        }
        html.push('<li><strong>' + code + '</strong><p>');
        for (var j = 0, l = arr[code].length; j < l; j++) {
            if (now_city == arr[code][j]['id']) {
                arr[code][j]['class'] = 'current';
            } else {
                arr[code][j]['class'] = '';
            }
            html.push(tpl.format(arr[code][j]));
        }
        html.push('</p></li>');
    }
    chars.sort();
    var len = chars.length;
    var mid = Math.ceil(len / 2);
    for (var i = 0; i < mid; i++) {
        initCharCity(chars[i]);
        if (i + mid < len) {
            initCharCity(chars[i + mid]);
        }
    }
    $e("#hot_city_span").setHtml(hots.join(''));
    $e("#all_city_ul").setHtml(html.join(''));
    $e('#piao_city_map_div').onClick(function(evt) {
        var t = evt.srcElement || evt.target;
        QZFL.event.preventDefault(evt);
        var city_id = t.getAttribute('s');
        if (city_id) {
            PIAO.changePiaoCity(city_id);
        }
        if (t.id != 'piao_city_search_txt') {
            document.getElementById('piao_city_search_list').style.display = 'none';
        }
    });
    function func() {
        if (!find) {
            PIAO.curCityName = '深圳';
            PIAO.curCity = 221;
        }
        PIAO.cookie.set("piao_city", PIAO.curCity);
        $e("#piao_now_city_span2").setHtml(PIAO.curCityName);
        $e("span._city_name").setHtml(PIAO.curCityName);
    }
    func();
    var sel_div = document.getElementById('piao_now_city_span');
    var is_show = false;
    function show() {
        if (is_show) {
            $e("#piao_city_map_div").show();
        }
    }
    function hide() {
        if (!is_show) {
            $e("#piao_city_map_div").hide();
        }
    }
    addEvent(sel_div, 'mouseover', 
    function() {
        is_show = true;
        setTimeout(function() {
            show()
        },
        100);
    })
    addEvent(sel_div, 'mousemove', 
    function() {
        is_show = true;
        setTimeout(function() {
            show()
        },
        100);
    })
    addEvent(sel_div, 'mouseout', 
    function() {
        is_show = false;
        setTimeout(function() {
            hide();
        },
        100);
    })
    var map_div = document.getElementById('piao_city_map_div');
    addEvent(map_div, 'mouseover', 
    function() {
        is_show = true;
        hide();
        setTimeout(function() {
            show()
        },
        100);
    })
    addEvent(map_div, 'mouseout', 
    function() {
        is_show = false;
        hide();
    })
    addEvent(map_div, 'mousemove', 
    function() {
        is_show = true;
        show();
    })
}


function initUserLoginInfo() {
    if (PIAO.login.is()) {
        var nick = PIAO.cookie.get("actnick");
        var load = false
        if (nick) {
            var uin = PIAO.login.is();
            nick = nick || uin;
            if (!isFromPaipai()) {
                $e("#user_login").setHtml('欢迎您，' + nick + '[' + uin + ']');
            } else {
                $e("#user_login").setHtml('欢迎您，' + (nick || uin));
            }
            $e("#logined_tpl").show();
            $e("#not_logined_tpl").hide();
            load = true;
        }
        if (!load) {
            function check_login_h(data) {
                if (!data) {
                    return false
                };
                $e("#logined_tpl").show();
                $e("#not_logined_tpl").hide();
                PIAO.cookie.set('actnick', data.nick_name || PIAO.login.is());
                var nick = (data.nick_name) || PIAO.login.is();
                $e("#user_login").setHtml('欢迎您，' + nick + '[' + PIAO.login.is() + ']');
            }
            PIAO.getUserInfo(check_login_h);
        }
    } else {
        $e("#logined_tpl").hide();
        $e("#not_logined_tpl").show();
    }
}