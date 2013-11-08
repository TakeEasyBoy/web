var MovieData = (function() {
    var _jsPath = "http://imgcache.qq.com/club/movie_channel/js/data/subs/dianying2/";
    var _postPath = "http://imgcache.qq.com/club/movie_channel/pic/";
    var _ticketPath = "http://dianying.qq.com/movie.html";
    var _cinameImgPath = "http://imgcache.qq.com/club/movie_channel/img/cinema_pic/";
    var _cacheTime = parseInt((new Date()).getTime() / 900000);
    var _reqStatus = [];
    var _dataPool = {};
    var _map = {
        cinema2City: [],
        area2City: []
    };
    var _merge = {
        'movie': 'schedule',
        'cinema': 'cinema',
        'schedule': 'schedule',
        'city': 'city',
        'seatsched': 'seat',
        'movie_on': 'allmovies',
        'movie_will': 'allmovies'
    }
	
	/**
	 * 加载数据
	 */
    var _loadData = function(aDataList, fCallback) {
        _reqStatus.push({
            dataSrc: aDataList,
            callback: fCallback
        });
        _scanReq();
    }
    var _movieImg = function(iMovie) {
        return _postPath + (iMovie % 100) + "/" + iMovie + ".jpg";
    };
    var _cinemaImg = function(iCinema) {
        return _postPath + 'cinema/' + iCinema + '.jpg';
    };
    var _cinemaPics = function(arrCinema) {
        var sPics = arrCinema['pic_url'];
        var arr = sPics.split("&");
        var pics = [];
        arrCinema['logo_img'] = _cinameImgPath + arr[0] + ".jpg"
        for (var i = 1, l = arr.length; i < l; i++) {
            pics.push(_cinameImgPath + arr[i] + ".jpg");
        }
        arrCinema['pic_imgs'] = pics.join('|');
        return true;
    }
    var _js = function(sSrc) {
        var len = sSrc.lastIndexOf('_');
        var src_suffix = len >= 0 ? sSrc.substr(len) : '';
        var src_name = len >= 0 ? sSrc.substr(0, len) : sSrc;
        var city_suffix = len >= 0 ? sSrc.replace(src_name, "") : "";
        if (!city_suffix.match(/^_[0-9]+$/)) {
            src_name = sSrc;
            city_suffix = '';
        }
        var real_src = _merge[src_name];
        for (var k in _merge) {
            if (_merge[k] == real_src) {
                if (!_dataPool[k + city_suffix]) {
                    _dataPool[k + city_suffix] = 1;
                }
            }
        }
        real_src = sSrc.replace(src_name, real_src);
        return _jsPath + real_src + ".js?" + _cacheTime;
    }
    var _loadJs = function(url, callback) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.charset = "gb2312";
        script.onreadystatechange = function() {
            if (this.readyState == 'loaded' || this.readyState == 'complete') {
                if (callback) callback();
            }
        }
        script.onload = callback;
        script.src = url;
        head.appendChild(script);
    };
    var _runTaskDone = function() {
        var _allDone = true;
        for (var key in _reqStatus) {
            if (_reqStatus[key]['dataSrc'] === "ABOVE_TASK_DONE" && _allDone === true && _reqStatus[key].done !== true && _reqStatus[key].called !== true) {
                _reqStatus[key].called = true;
                _reqStatus[key].callback();
                _reqStatus[key].done = true;
            }
            if (_reqStatus[key].done !== true) {
                _allDone = false;
                break;
            }
        }
    }
	
	/**
	 *  扫描请求
	 */
    var _scanReq = function() {
	
        for (var key in _reqStatus) {
            if (_reqStatus[key] === null || typeof _reqStatus[key]['dataSrc'] === "string") {
                continue;
            }
            try {
                var todo = true;
                for (var i = 0; i < _reqStatus[key].dataSrc.length; i++) {
                    var src = _reqStatus[key].dataSrc[i];
                    if (!_dataPool[src]) {
                        var nod = document.createElement("script");
                        nod.type = "text/javascript";
                        nod.charset = "gb2312";
                        nod.src = _js(src);
                        document.getElementsByTagName('head')[0].appendChild(nod);
                        todo = false;
                    } else if (_dataPool[src] === 1) {
                        todo = false
                    }
                }
                if (todo && typeof(_reqStatus[key]) != "undefined") {
                    if (!_reqStatus[key].called) {
                        _reqStatus[key].called = true;
                        _reqStatus[key].callback();
                        if (typeof(_reqStatus[key]) != "undefined") {
                            _reqStatus[key].done = true;
                            _runTaskDone();
                            delete _reqStatus[key];
                        }
                    } else {
                        delete _reqStatus[key];
                    }
                } else {
                    break;
                }
            } catch(e) {};
        }
    }
    var _buildMapCinema2City = function() {
        if (_map.cinema2City.length === 0) {
            for (var city_name in _dataPool['city']) {
                var cinemas = _dataPool['city'][city_name].cinemas;
                if (cinemas) {
                    for (var c_id in cinemas) {
                        _map.cinema2City[c_id] = city_name;
                    }
                }
            }
        }
    };
    var _buldMapArea2City = function() {
        if (_map.area2City.length === 0) {
            for (var city_name in _dataPool['city']) {
                var areas = _dataPool['city'][city_name].areas;
                if (areas) {
                    for (var a_id in areas) {
                        _map.area2City[a_id] = city_name;
                    }
                }
            }
        }
    }
    var _isValidCity = function(iCity) {
        if (!iCity) {
            return false;
        }
        return _dataPool['city'][iCity] ? true: false;
    }
    var _isValidCinema = function(iCinema) {
        if (!iCinema) {
            return false;
        }
        _buildMapCinema2City();
        return _map.cinema2City[iCinema] ? _map.cinema2City[iCinema] : false;
    }
    var _isValidArea = function(iArea) {
        if (!iArea) {
            return false;
        }
        _buldMapArea2City();
        return _map.area2City[iArea] ? true: false;
    }
    var _getCityByArea = function(iArea) {
        _buldMapArea2City();
        return _map.area2City[iArea] ? _map.area2City[iArea] : false;
    }
    var _searchMovieId = function(iCity, oMoviePars) {
        if (oMoviePars.id) {
            for (var m_id in _dataPool['movie_' + iCity]) {
                var info = _dataPool['movie_' + iCity][m_id];
                if (oMoviePars.id == m_id) {
                    oMoviePars.name = info.name;
                    break;
                }
            }
        }
        if (oMoviePars.imdb || oMoviePars.name) {
            var ret = {
                imdb: [],
                name: []
            };
            var mids = {};
            for (var m_id in _dataPool['movie_' + iCity]) {
                var info = _dataPool['movie_' + iCity][m_id];
                if (oMoviePars.imdb && oMoviePars.imdb == info.imdbId) {
                    ret.imdb.push(m_id);
                }
                if (oMoviePars.name && oMoviePars.name == info.name) {
                    if (typeof(mids[m_id]) == "undefined") {
                        ret.name.push(m_id);
                        mids[m_id] = "";
                    }
                }
            }
            if (ret.imdb.length > 0) {
                return ret.imdb[0];
            } else if (ret.name.length > 0) {
                return ret.name;
            } else {
                return false;
            }
        }
    }
    var _getCinemaName = function(iCinema) {
        if (!_isValidCinema(iCinema)) {
            return false;
        }
        _buildMapCinema2City();
        var iCity = _map.cinema2City[iCinema];
        return _dataPool['city'][iCity]['cinemas'][iCinema];
    }
    _loadJs(_js('city'));
    var pub = {};
	
    pub.set = function(sSrc, data) {
        _dataPool[sSrc] = data;
        _scanReq();
    };
	
    pub.url = function(sType, oPars) {
        var ret = "";
        switch (sType) {
        case 'order':
            oPars.cityId = oPars.cityId || "";
            oPars.cinemaId = oPars.cinemaId || "";
            oPars.ticketId = oPars.ticketId || "";
            oPars.num = oPars.num || "";
            oPars.from = oPars.from || "";
            ret = _ticketPath + "?city=" + oPars.cityId + "&cinema=" + oPars.cinemaId + "&time=" + oPars.ticketId + "&num=" + oPars.num + "&pvsrc=" + oPars.from;
            break;
        }
        return ret;
    }
    pub.loadCities = function(fCallback) {
        var ret = [];
        _loadData(['city'], 
        function() {
            for (var k in _dataPool['city']) {
                ret[k] = _dataPool['city'][k].name
            }
            fCallback(ret);
        });
    };
    pub.loadCitiesDetail = function(fCallback) {
        var ret = [];
        _loadData(['city'], 
        function() {
            for (var k in _dataPool['city']) {
                var o = {};
                o['id'] = k;
                o['name'] = _dataPool['city'][k].name;
                o['pinyin'] = _dataPool['city'][k].pinyin;
                ret.push(o);
            }
            fCallback(ret);
        });
    };
    pub.loadAreas = function(iCity, fCallback) {
        var areas = {},
        aid = '';
        _loadData(['city', 'cinema_' + iCity], 
        function() {
            if (_isValidCity(iCity)) {
                var cinemas = _dataPool['cinema_' + iCity];
                for (var i in cinemas) {
                    aid = cinemas[i]['area'];
                    if (typeof(areas[aid]) == 'undefined') {
                        areas[aid] = cinemas[i]['area_name']
                    }
                }
            }
            fCallback(areas);
        })
    };
    pub.loadCinemaSimpleListForMovie = function(iCity, oMoviePars, iDate, fCallback) {
        _loadData(['city'], 
        function() {
            if (!_isValidCity(iCity)) {
                fCallback(false)
            } else if (oMoviePars == null && iDate == null) {
                _loadData(['city'], 
                function() {
                    fCallback(_dataPool['city'][iCity]['cinemas']);
                });
            } else {
                iDate = parseInt(iDate) == 0 ? 0: 1;
                _loadData(['schedule_' + iCity, 'movie_' + iCity], 
                function() {
                    var ret = [];
                    var m_ids = _searchMovieId(iCity, oMoviePars);
                    for (var i in m_ids) {
                        for (var c_id in _dataPool['schedule_' + iCity]) {
                            var movies = _dataPool['schedule_' + iCity][c_id];
                            if (movies && movies[m_ids[i]] && movies[m_ids[i]][iDate]) {
                                ret[c_id] = _getCinemaName(c_id);
                            }
                        }
                    }
                    fCallback(ret);
                })
            }
        });
    };
    pub.loadCinemaDetailListForMovie = function(iCity, oMoviePars, iDate, fCallback) {
        _loadData(['city'], 
        function() {
            if (_isValidCity(iCity) && oMoviePars) {
                iDate = parseInt(iDate) == 0 ? 0: 1;
                _loadData(['schedule_' + iCity, 'movie_' + iCity, 'cinema_' + iCity], 
                function() {
                    var ret = [];
                    var m_ids = _searchMovieId(iCity, oMoviePars);
                    var cids = {};
                    var cinema_arr = _dataPool['cinema_' + iCity]
                    for (var i in m_ids) {
                        for (var c_id in _dataPool['schedule_' + iCity]) {
                            var movies = _dataPool['schedule_' + iCity][c_id];
                            if (movies && movies[m_ids[i]] && movies[m_ids[i]][iDate] && typeof(cinema_arr[c_id]) != 'undefined' && typeof(m_ids[c_id]) == "undefined") {
                                ret.push({
                                    id: c_id,
                                    name: _getCinemaName(c_id),
                                    schedule: movies[m_ids[i]][iDate],
                                    tickets: _dataPool['cinema_' + iCity][c_id]['tickets'],
                                    area: _dataPool['cinema_' + iCity][c_id]['area'],
                                    area_name: _dataPool['cinema_' + iCity][c_id]['area_name'],
                                    com_price: _dataPool['cinema_' + iCity][c_id]['com_price']
                                });
                                m_ids[c_id] = "";
                            }
                        }
                    }
                    fCallback(ret);
                })
            } else {
                fCallback(false)
            }
        });
    };
    pub.loadCinemaDetailList = function(iCity, iArea, fCallback) {
        _loadData(['city'], 
        function() {
            if (_isValidCity(iCity) || _isValidArea(iArea)) {
                if (iArea) {
                    iCity = _getCityByArea(iArea);
                }
                _loadData(['cinema_' + iCity], 
                function() {
                    var ret = [];
                    for (var c_id in _dataPool['cinema_' + iCity]) {
                        if (!iArea || _dataPool['cinema_' + iCity][c_id].area == iArea) {
                            var tmp = _dataPool['cinema_' + iCity][c_id];
                            tmp.id = c_id;
                            var tickets = _dataPool['cinema_' + iCity][c_id]['tickets'];
                            var types = {};
                            var num = 0;
                            for (var i = 0, l = tickets.length; i < l; i++) {
                                if (typeof(types[tickets[i]['type']]) == 'undefined') {
                                    num += parseInt(tickets[i]['type'], 10);
                                    types[tickets[i]['type']] = 0;
                                }
                            }
                            tmp['type'] = num;
                            _cinemaPics(tmp);
                            ret.push(tmp);
                        }
                    }
                    fCallback(ret);
                })
            } else {
                fCallback(false);
            }
        });
    };
    pub.loadCinemaDetail = function(iCinema, fCallback) {
        _loadData(['city'], 
        function() {
            _buildMapCinema2City();
            var iCity = _isValidCinema(iCinema);
            if (!iCity) {
                fCallback(false);
            } else {
                if (!iCity) {
                    fCallback(false);
                } else {
                    _loadData(['cinema_' + iCity], 
                    function() {
                        var ret = _dataPool['cinema_' + iCity][iCinema];
                        ret.img = _cinemaImg(iCinema);
                        fCallback(ret);
                    })
                }
            }
        });
    };
    pub.loadCinemaSchedule = function(iCinema, iDate, fCallback) {
        _loadData(['city'], 
        function() {
            _buildMapCinema2City();
            var iCity = _isValidCinema(iCinema);
            if (!iCity) {
                fCallback(false);
            } else {
                iDate = parseInt(iDate) == 0 ? 0: 1;
                _loadData(['schedule_' + iCity, 'movie_' + iCity, 'movie_on'], 
                function() {
                    var s_data = _dataPool['schedule_' + iCity][iCinema];
                    var m_data = _dataPool['movie_' + iCity];
                    var m_show_data = _dataPool['movie_on'];
                    if (!s_data) {
                        fCallback(false);
                    } else {
                        var ret = [];
                        var sm_data = {};
                        var moviename = '';
                        for (var m_id in s_data) {
                            moviename = typeof(m_data[m_id]) != "undefined" ? m_data[m_id]['name'] : '';
                            if (moviename && s_data[m_id][iDate] && typeof(sm_data[moviename]) == "undefined" && typeof(m_show_data[moviename]) != 'undefined') {
                                sm_data[moviename] = ' ';
                                m_show_data[moviename]['name'] = moviename;
                                m_show_data[moviename]['schedule'] = s_data[m_id][iDate];
                                ret.push(m_show_data[moviename]);
                            }
                        }
                        fCallback(ret);
                    }
                })
            }
        });
    };
	
	/* 加载电影显示城市 */
    pub.loadMovieOnShowByCity = function(iCity, fCallback) {
	
        _loadData(  ['city'], 		
				    function() {
						if (!_isValidCity(iCity)) {
							fCallback(false);
						} else {
							_loadData(['schedule_' + iCity, 'movie_on'], 
							function() {
								var ret = [];
								var reg = [];
								var m_names = {};
								
								var movies = _dataPool['movie_' + iCity];
								var allmovies = _dataPool['movie_on'];
								var movie_name = '';
								
								for (var m_id in movies) {
									movie_name = movies[m_id].name;
									if (typeof(m_names[movie_name]) == "undefined" && typeof(allmovies[movie_name]) != 'undefined') {
										m_names[movie_name] = "";
										ret.push(allmovies[movie_name]);
									}
								}
								fCallback(ret);
							});
						}
					}
		);
    }
	
    pub.isMovieCity = function(iCity, fCallback) {
        _loadData(['city'], 
        function() {
            if (!_isValidCity(iCity)) {
                fCallback(false);
            } else {
                fCallback(true)
            }
        })
    };
    pub.loadShowMovie = function(fCallback) {
        _loadData(['movie_on'], 
        function() {
            var m_data = _dataPool['movie_on'];
            fCallback(m_data);
        });
    }
    pub.loadWillMovie = function(fCallback) {
        _loadData(['movie_will'], 
        function() {
            var m_data = _dataPool['movie_will'];
            fCallback(m_data);
        });
    }
    pub.onAboveTasksDone = function(fCallback) {
        _reqStatus.push({
            dataSrc: "ABOVE_TASK_DONE",
            callback: fCallback
        });
        _runTaskDone();
    }
    return pub;
})();
