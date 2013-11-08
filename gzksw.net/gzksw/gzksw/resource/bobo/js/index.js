var b_initSel = false;
var g_ticketType = {};
var isclub = -1;
var ismusic = 0;
var paipailv = 0;
var isSpecial = 1;
var g_paipaiKey = '';

function initPage() {	
    MovieData.loadMovieOnShowByCity(221, initHotMovie);  
}

var arrMovieHot = {};
var arrHotMovie = [];
var arrWillMovie = [];
var moviePhoto = null;
var showOld = 0;
var changeInterval = null;

function changeHot(evt) {
    var btn = evt.srcElement || evt.target;
    var type = btn ? btn.getAttribute('c') : evt;
    if (type == showOld) {
        return;
    }
    showOld = type;
    var btns = document.getElementById("hot_con_btn").getElementsByTagName("button");
    var status = {
        0: {
            'on': 'btn_hot_sel',
            'off': 'btn_hot'
        },
        1: {
            'on': 'btn_zuijin_sel',
            'off': 'btn_zuijin'
        }
    };
    btns[type].className = status[type]['on'];
    var type1 = (parseInt(type) + 1) % 2;
    btns[type1].className = status[type1]['off'];
    var arr = [];
    var sub_id = 'hot';
    if (type == '0') {
        arr = arrHotMovie;
    } else {
        arr = arrWillMovie;
        sub_id = 'will';
    }
    if (moviePhoto) {
        moviePhoto.reset();
        moviePhoto = null;
    }
    if (arr.length < 1) {
        $e("#ul_movie_list").setHtml("");
    } else {
        moviePhoto = new PhotoSlider(arr, null, null, null, null, null, sub_id);
    }
}
function changeBook(evt) {
    var btn = evt.srcElement || evt.target;
    var type = btn ? btn.getAttribute('c') : evt;
    if (type != 0 && type != 1) {
        return;
    }
    var btns = document.getElementById("book_con_btn").getElementsByTagName("button");
    var status = {
        0: {
            'on': 'btn_ele_sel',
            'off': 'btn_ele'
        },
        1: {
            'on': 'btn_paper_sel',
            'off': 'btn_paper'
        }
    };
    btns[type].className = status[type]['on'];
    var type1 = (parseInt(type) + 1) % 2;
    btns[type1].className = status[type1]['off'];
    var arr = [];
    if (type == 0) {
        $e("#booking_div_2").show();
        $e("#booking_div_1").hide();
        showCinemas(cinema_json, 2);
    } else {
        $e("#booking_div_2").hide();
        $e("#booking_div_1").show();
        showCinemas(cinema_json, 1);
    }
}

/**
 * 初始电影信息页面
 */
function initHotMovie(data) {
    var arr = [];
    function init() {
        var tpl = '<a href="movie_detail.html?movie_name={name_en}" title="{name}" target="_blank"><img height="234" width="167" src="{pic}" onerror="this.src=\'http://imgcache.qq.com/club/movie_channel/pic/zq.gif\'" /></a><div class="item_name"><a href="movie_detail.html?movie_name={name_en}" target="_blank"  class="hot" title="{name}">{name_2}</a></div><div class="item_intro">{info}</div><div class="star_bg star_{comment}"><div class="bg" style="display:{block}"></div></div>  ';
        var j = 0;
        PIAO.orderByField(data, 'date')
        for (var i = 0; i < data.length; i++) {
            if (typeof(arrMovieHot[data[i]['name']]) == "undefined") {
                arrMovieHot[data[i]['name']] = {};
                data[i]['src'] = data[i]['pic'];
                data[i]['comment'] = data[i]['level'];
                data[i]['name_2'] = data[i]['name'].length > 12 ? data[i]['name'].substr(0, 12) + '...': data[i]['name'];
                if (data[i]['comment'] < 1 || data[i]['comment'] > 5) {
                    data[i]['block'] = 'none';
                    data[i]['title'] = data[i]['name'];
                } else {
                    data[i]['block'] = '';
                    data[i]['title'] = data[i]['name'] + "：推荐指数" + data[i]['comment'] + "颗星";
                    if (data[i]['comment'] == '5') {
                        data[i]['title'] += "！";
                    }
                }
                data[i]['pic'] = data[i]['pic'] || 'http://imgcache.qq.com/club/movie_channel/pic/zq.gif';
                data[i]['name_en'] = encodeURIComponent(data[i]['name']);
                data[i]['link'] = '';
                data[i]['info'] = (data[i]['remark'].length > 14) ? String(data[i]['remark']).substr(0, 14) + '...': data[i]['remark'];
                var o = {
                    'j': j
                };
                QQVIP.object.extend(o, data[i]);
                arr.push(tpl.format(o));
                j++;
            }
        }
        arrHotMovie = arr;
        if (arr.length > 0) {
            showOld = 0;
            moviePhoto = new PhotoSlider(arr, null, null, null, null, null, 'hot');
        }
        $e("#hot_page_div button").setAttr('c', 0);
        var btn = document.getElementById("hot_con_btn");
        var btns = btn.getElementsByTagName('button');
        QZFL.event.addEvent(btns[0], 'mouseover', 
        function(event) {
            changeHot(event)
        });
        QZFL.event.addEvent(btns[1], 'mouseover', 
        function(event) {
            changeHot(event)
        });;
        MovieData.loadWillMovie(function(data2) {
            getWillMovieDetail(data2);
        })
    }
    init();
}

function getWillMovieDetail(data) {
    var tpl = ' <a href="movie_detail.html?movie_name={name_en}" target="_blank" title="{name}"><img height="234" width="167" src="{pic}" onerror="this.src=\'http://imgcache.qq.com/club/movie_channel/pic/zq.gif\'" /></a><div class="item_name"><a href="movie_detail.html?movie_name={name_en}" class="hot" title="{name}" target="_blank">{name2}</a></div><div class="item_intro">{info}</div><div class="star_bg star_{comment}" style="display:{block};"><div class="bg"></div></div>  ';
    var arr = [];
    var maxLen = 7;
    var i = 0;
    for (var key in data) {
        if (key == "null") {
            continue;
        }
        if (typeof(arrMovieHot[key]) != "undefined") {
            continue;
        }
        var date = String(data[key]['date']);
        date = date.substr(4, 2) + "." + date.substr(6, 2);
        data[key]['name'] = key;
        data[key]['name_en'] = encodeURIComponent(data[key]['name']);
        data[key]['name2'] = (key.length > 8 ? key.substr(0, 8) + '...': key) + "(" + date + ")";
        data[key]['src'] = data[key]['pic'];
        data[key]['comment'] = data[key]['level'];
        if (data[key]['comment'] < 1 || data[key]['comment'] > 5) {
            data[key]['block'] = 'none';
            data[key]['title'] = data[key]['name'];
        } else {
            data[key]['block'] = '';
            data[key]['title'] = data[key]['name'] + "：推荐指数" + data[key]['comment'] + "颗星";
            if (data[key]['comment'] == '5') {
                data[key]['title'] += "！";
            }
        }
        data[key]['pic'] = data[key]['pic'] || 'http://imgcache.qq.com/club/movie_channel/pic/zq.gif';
        data[key]['info'] = data[key]['remark'].length > 14 ? String(data[key]['remark']).substr(0, 14) + '...': data[key]['remark'];
        i++;
        arr.push(tpl.format(data[key]));
    }
    arrWillMovie = arr;
    if (arrHotMovie.length < 1) {
        changeHot(1);
        showOld = 1;
    }
}

var PhotoSlider = function(strdata, emId, pagePId, pageNId, pageNum, tpl, subId) {
    var me = this;
    tpl = tpl || '<div id="show_photo_{id}" class="movie_pic {first_last}"><div id="con_div_' + subId + '_{id}" >{ctx}</div></div>';
    pageNum = pageNum || 5;
    emId = emId || 'ul_movie_list';
    pagePId = pagePId || 'page_pre_btn';
    pageNId = pageNId || 'page_next_btn';
    var data = strdata;
    var len = data.length;
    var haveImg = {};
    var loopinterval = null;
    var curS = 0;
    var opaci = null;
    function init(s) {
        var arr = [];
        haveImg = {};
        if (document.getElementById('show_photo_0')) {
            for (var i = 0, j = curS; i < pageNum; i++, j = j + 1) {
                if (j < len) {
                    $e("#show_photo_" + i).show();
                    $e("#con_div_" + subId + "_" + i).show();
                    showImg(i, j);
                } else {
                    $e("#show_photo_" + i).hide();
                }
            }
        } else {
            if (pageNum <= len) {
                for (var i = 0, j = curS; i < pageNum; i++, j = (j + 1) % len) {
                    var first_div = '';
                    if (j + 5 % 5 == 0) {
                        first_div = "movie_pic_frist"
                    } else if ((j + 5 % 5) == 4) {
                        first_div = "movie_pic_last"
                    } else {
                        first_div = ""
                    }
                    arr.push(tpl.format({
                        'id': i,
                        'ctx': data[j],
                        'block': 'block',
                        'first_last': first_div
                    }));
                }
            } else {
                for (var i = 0; i < pageNum; i++) {
                    var block = i < len ? 'block': 'none';
                    var first_div = '',
                    ctx = "";
                    if (i + 5 % 5 == 0) {
                        first_div = "movie_pic_frist"
                    } else if ((i + 5 % 5) == 4) {
                        first_div = "movie_pic_last"
                    } else {
                        first_div = ""
                    }
                    ctx = i < len ? data[i] : '';
                    arr.push(tpl.format({
                        'id': i,
                        'ctx': ctx,
                        'block': block,
                        'first_last': first_div
                    }));
                }
            }
            $e("#" + emId).setHtml(arr.join(""));
        }
        for (var i = 0; i < pageNum; i++) {
            handleEvent('show_photo_' + i);
        }
        setTimeout(function() {
            me.start()
        },
        0);
        handleEvent(pagePId);
        handleEvent(pageNId);
        if (len) {
            $e("#" + pagePId).onClick(function() {
                me.change( - 1);
            });
            $e("#" + pageNId).onClick(function() {
                me.change(1);
            });
        }
        function handleEvent(id) {
            var el = document.getElementById(id);
            QZFL.event.purgeEvent(el, 'mouseout');
            QZFL.event.purgeEvent(el, 'mouseover');
            QZFL.event.purgeEvent(el, 'click');
            QZFL.event.addEvent(el, 'mouseover', 
            function() {
                me.stop()
            });
            QZFL.event.addEvent(el, 'mouseout', 
            function() {
                me.start()
            });
        }
    }
    init();
    function showPhoto(d) {
        var i = 0;
        var dataj = d > 0 ? (curS + pageNum) % len: (curS + len - 1) % len;
        var j = d > 0 ? 0: pageNum - 1;
        curS = (curS + d * (pageNum) + len) % len;
        if (opaci) clearInterval(opaci);
        if (len <= pageNum) {
            return;
        }
        while (i < pageNum) {
            if (i < pageNum) {
                showImg(j, dataj);
                i++;
                j = j + d;
                dataj = (dataj + d + len) % len;
            } else {}
        }
    }
    function showImg(j, dataj) {
        if (data.length < dataj) {
            return false;
        }
        var con = document.getElementById("show_photo_" + j);
        var condiv = "#show_photo_" + j + " div";
        $e(condiv).hide();
        var sub = document.getElementById("con_div_" + subId + "_" + dataj);
        if (sub) {
            sub.parentNode.removeChild(sub);
            con.appendChild(sub);
            var spans = sub.getElementsByTagName('div');
            for (var i = 0, l = spans.length; i < l; i++) {
                spans[i].style.display = "block";
            }
        } else {
            var frag = document.createElement("div");
            frag.id = 'con_div_' + subId + "_" + dataj;
            if (con) {
                con.appendChild(frag);
                frag.innerHTML = data[dataj];
                sub = frag;
            }
        }
        if (!con || !sub) {
            return
        }
        var imgs = sub.getElementsByTagName('img');
        function slowshow(img) {
            var i = 0;
            if (img.filters) img.style.filter = 'alpha(opacity=' + 20 + ')';
            else img.style.opacity = 0.2;
            var opaci = setInterval(function() {
                if (!img) {
                    return false;
                }
                i = i + 20;
                if (i > 100) {
                    if (opaci) {
                        clearInterval(opaci);
                    }
                };
                try {
                    if (img.filters) {
                        img.style.filter = 'alpha(opacity=' + i + ')';
                    } else {
                        img.style.opacity = i / 100;
                    }
                } catch(e) {}
            },
            150);
        }
        if (imgs && typeof(imgs[0]) != "undefined") {
            try {
                slowshow(imgs[0]);
            } catch(e) {}
        }
        sub.style.display = 'block';
    }
    this.start = function() {
        me.stop();
        if (len > pageNum)
        loopinterval = setInterval(function() {
            if (showPhoto) {
                showPhoto(1);
            }
        },
        4000);
    }
    this.stop = function() {
        if (loopinterval)
        clearInterval(loopinterval);
    }
    this.reset = function() {
        if (loopinterval)
        clearInterval(loopinterval);
        loopinterval = null;
        showPhoto = null;
        delete loopinterval;
        delete showPhoto;
    }
    this.change = function(d) {
        try {
            showPhoto(d);
        } catch(e) {};
    }
}
initPage();	