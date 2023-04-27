var EshiminjsSDK = function () {
    "use strict";

    function i(e) {
        return "function" == typeof e || void console.log("调用eshimin方法缺少回调函数!")
    }

    function a(e, n, t) {
        var o = null;
        void 0 !== (o = "string" == typeof n ? JSON.parse(n) : n).errorCode && void 0 === o.code && (0 == o.errorCode ? (o.msg = "success", o.code = "200") : o.code = o.errorCode), "200" == o.code || console.log("调用eshimin方法" + e + "失败：" + o.msg), i(t) && t(o)
    }

    function o(e, n, t) {
        var o = null;
        (o = "string" == typeof n ? JSON.parse(n) : n).errorMessage ? o.msg = o.errorMessage : o.msg = o.msg ? o.msg : null, void 0 !== o.errorCode && (o.code = o.errorCode, 0 == o.errorCode ? (o.msg = "success", o.code = "200") : -1 == o.errorCode ? o.msg = "此接口不存在" : -2 == o.errorCode ? o.msg = "无权限使用此接口" : -3 == o.errorCode ? o.msg = "其它错误" : -4 == o.errorCode ? o.msg = "参数不符合要求" : -5 == o.errorCode && (o.msg = "用户取消")), "200" == o.code || console.log("调用eshimin方法" + e + "失败：" + o.msg), i(t) && t(o)
    }

    function r(e, n) {
        var t = {code: 404, msg: "无此侨联方法"};
        console.log("调用eshimin方法" + e + "失败：无此侨联方法"), i(n) && n(t)
    }

    function t(e, n, t) {
        for (var o = null, o = "string" == typeof e ? JSON.parse(e) : e, i = 0; i < t.length; i++) {
            var s = t[i];
            void 0 !== o[s] && (o[n] = o[s])
        }
        return o
    }

    function f(e, n) {
        console.log("eshimin is undefined");
        var t = {code: 405, msg: "请确保侨联JS引入以后调用此方法"};
        console.log("调用eshimin方法" + e + "失败：请确保侨联JS引入以后调用此方法"), i(n) && n(t)
    }

    function s(e, n) {
        console.log("wx is undefined");
        var t = {code: 405, msg: "请确保WXSDk引入以后调用此方法"};
        console.log("调用eshimin方法" + e + "失败：确保WXSDk引入以后调用此方法"), i(n) && n(t)
    }

    var e = {
        getDeviceId: function (e, n) {
            "undefined" != typeof eshimin ? eshimin.getDeviceId ? eshimin.getDeviceId({
                onResponse: function (e) {
                    a("getDeviceId", t(e, "deviceId", ["data"]), n)
                }
            }) : r("getDeviceId", n) : f("getDeviceId", n)
        }, getUserInfo: function (e, n) {
            "undefined" != typeof eshimin ? eshimin.getUserInfo ? eshimin.getUserInfo({
                onResponse: function (e) {
                    a("getUserInfo", t(e, "userName", ["data"]), n)
                }
            }) : r("getUserInfo", n) : f("getUserInfo", n)
        }, getCityCode: function (e, n) {
            "undefined" != typeof eshimin ? eshimin.getCityCode ? eshimin.getCityCode({
                onResponse: function (e) {
                    a("getCityCode", e, n)
                }
            }) : r("getCityCode", n) : f("getCityCode", n)
        }, getLocation: function (e, n) {
            "undefined" != typeof eshimin ? eshimin.getLocation ? eshimin.getLocation({
                onResponse: function (e) {
                    a("getLocation", e, n)
                }
            }) : r("getLocation", n) : f("getLocation", n)
        }, getBarcode: function (e, n) {
            "undefined" != typeof eshimin ? eshimin.getBarcode ? eshimin.getBarcode({
                onResponse: function (e) {
                    a("getBarcode", t(e, "barcode", ["value", "img"]), n)
                }
            }) : r("getBarcode", n) : f("getBarcode", n)
        }, setTitle: function (e, n) {
            var t;
            "undefined" != typeof eshimin ? eshimin.setTitle ? (t = e.title, eshimin.setTitle({
                title: t,
                onResponse: function (e) {
                    a("setTitle", e, n)
                }
            })) : r("setTitle", n) : f("setTitle", n)
        }, savePhoto: function (e, n) {
            var t, o;
            "undefined" != typeof eshimin ? eshimin.savePhoto ? (t = e.name, o = e.imgData, eshimin.savePhoto({
                name: t,
                url: "",
                imgData: o,
                onResponse: function (e) {
                    a("savePhoto", e, n)
                }
            })) : r("savePhoto", n) : f("savePhoto", n)
        }, getAddress: function (e, n) {
            "undefined" != typeof eshimin ? eshimin.getAddress ? eshimin.getAddress({
                onResponse: function (e) {
                    a("getAddress", e, n)
                }
            }) : r("getAddress", n) : f("getAddress", n)
        }, share: function (e, n) {
            var t, o, i, s, c, d;
            "undefined" != typeof eshimin ? eshimin.share ? (t = e.title, o = e.content, i = e.imgUrl, s = e.link, c = e.login ? e.login : "", d = e.platformType ? e.platformType : "", eshimin.share({
                title: t,
                content: o,
                imgUrl: i,
                link: s,
                login: c,
                platformType: d,
                onResponse: function (e) {
                    a("share", e, n)
                }
            })) : r("share", n) : f("share", n)
        }, chooseImage: function (e, n) {
            "undefined" != typeof eshimin ? eshimin.chooseImage ? eshimin.chooseImage({
                onResponse: function (e) {
                    a("chooseImage", e, n)
                }
            }) : r("chooseImage", n) : f("chooseImage", n)
        }, openWebUrl: function (e, n) {
            var t, o;
            "undefined" != typeof eshimin ? eshimin.openWindow ? (t = e.webUrl, o = e.title, eshimin.openWindow({
                url: t,
                title: o,
                onResponse: function (e) {
                    a("openWebUrl", e, n)
                }
            })) : r("openWebUrl", n) : f("openWebUrl", n)
        }, closeWindow: function (e, n) {
            "undefined" != typeof eshimin ? eshimin.closeWindow ? eshimin.closeWindow({
                onResponse: function (e) {
                    a("closeWindow", e, n)
                }
            }) : r("closeWindow", n) : f("closeWindow", n)
        }, phoneCall: function (e, n) {
            var t;
            "undefined" != typeof eshimin ? eshimin.phoneCall ? (t = e.num, eshimin.phoneCall({
                num: t,
                onResponse: function (e) {
                    a("phoneCall", e, n)
                }
            })) : r("phoneCall", n) : f("phoneCall", n)
        }, facialIdentification: function (e, n) {
            var t, o;
            "undefined" != typeof eshimin ? eshimin.facialIdentification ? (t = e.token ? e.token : "", o = e.clientId ? e.clientId : "", eshimin.facialIdentification({
                token: t,
                clientId: o,
                onResponse: function (e) {
                    a("facialIdentification", e, n)
                }
            })) : r("facialIdentification", n) : f("facialIdentification", n)
        }
    }, c = {
        getDeviceId: e.getDeviceId,
        getUserInfo: e.getUserInfo,
        getCityCode: function (e, n) {
            if ("undefined" == typeof eshimin) return console.log("eshimin is undefined"), void a("getCityCode", {
                code: "200",
                cityCode: "430100"
            }, n);
            eshimin.getCity ? eshimin.getCity({
                onResponse: function (e) {
                    a("getCityCode", e, n)
                }
            }) : a("getCityCode", {code: "200", cityCode: "430100"}, n)
        },
        getLocation: e.getLocation,
        getBarcode: e.getBarcode,
        setTitle: e.setTitle,
        savePhoto: e.savePhoto,
        getAddress: e.getAddress,
        share: e.share,
        chooseImage: e.chooseImage,
        openWebUrl: e.openWebUrl,
        closeWindow: e.closeWindow,
        phoneCall: e.phoneCall,
        facialIdentification: function (e, n) {
            var t = e.token ? e.token : "", o = e.clientId ? e.clientId : "";
            eshimin.realPersonAuth({
                token: t, clientId: o, onResponse: function (e) {
                    a("facialIdentification", e, n)
                }
            })
        }
    }, d = {
        getDeviceId: e.getDeviceId,
        getUserInfo: e.getUserInfo,
        getCityCode: function (e, n) {
            if ("undefined" == typeof eshimin) return console.log("eshimin is undefined"), void a("getCityCode", {
                code: "200",
                cityCode: "310100"
            }, n);
            eshimin.getCity ? eshimin.getCity({
                onResponse: function (e) {
                    a("getCityCode", e, n)
                }
            }) : a("getCityCode", {code: "200", cityCode: "310100"}, n)
        },
        getLocation: e.getLocation,
        getBarcode: e.getBarcode,
        setTitle: e.setTitle,
        savePhoto: function (e, n) {
            e.name;
            var t = e.imgData;
            eshimin.downloadImageWithBase({
                url: t, onResponse: function (e) {
                    a("savePhoto", e, n)
                }
            })
        },
        getAddress: e.getAddress,
        share: e.share,
        chooseImage: e.chooseImage,
        openWebUrl: e.openWebUrl,
        closeWindow: e.closeWindow,
        phoneCall: e.phoneCall,
        facialIdentification: function (e, n) {
            var t = e.token ? e.token : "", o = e.clientId ? e.clientId : "", i = e.text ? e.text : "",
                s = e.uniqueId ? e.uniqueId : "";
            eshimin.realPersonAuth({
                token: t, clientId: o, text: i, uniqueId: s, onResponse: function (e) {
                    a("facialIdentification", e, n)
                }
            })
        }
    }, l = {
        getDeviceId: e.getDeviceId, getUserInfo: e.getUserInfo, getCityCode: function (e, n) {
            "undefined" != typeof eshimin ? eshimin.getCityCode({
                onResponse: function (e) {
                    a("getCityCode", e, n)
                }
            }) : (console.log("eshimin is undefined"), a("getCityCode", {code: "200", cityCode: "510100"}, n))
        }, getLocation: e.getLocation, getBarcode: e.getBarcode, setTitle: e.setTitle, savePhoto: function (e, n) {
            var t = e.imgData;
            eshimin.saveImage({
                imgStr: t, onResponse: function (e) {
                    a("saveImage", e, n)
                }
            })
        }, getAddress: e.getAddress, share: e.share, chooseImage: e.chooseImage, openWebUrl: function (e, n) {
            var t = e.webUrl, o = e.title;
            eshimin.openWebUrl({
                webUrl: t, title: o, onResponse: function (e) {
                    a("openWebUrl", e, n)
                }
            })
        }, closeWindow: e.closeWindow, phoneCall: e.phoneCall, facialIdentification: e.facialIdentification
    }, g = {
        getDeviceId: e.getDeviceId,
        getUserInfo: e.getUserInfo,
        getCityCode: function (e, n) {
            if ("undefined" == typeof eshimin) return console.log("eshimin is undefined"), void a("getCityCode", {
                code: "200",
                cityCode: "321000"
            }, n);
            eshimin.getCity ? eshimin.getCity({
                onResponse: function (e) {
                    a("getCityCode", e, n)
                }
            }) : a("getCityCode", {code: "200", cityCode: "321000"}, n)
        },
        getLocation: e.getLocation,
        getBarcode: e.getBarcode,
        setTitle: e.setTitle,
        savePhoto: e.savePhoto,
        getAddress: e.getAddress,
        share: e.share,
        chooseImage: e.chooseImage,
        openWebUrl: e.openWebUrl,
        closeWindow: e.closeWindow,
        phoneCall: e.phoneCall,
        facialIdentification: function (e, n) {
            eshimin.facialIdentification({
                type: e.type ? e.type : "self",
                certifyUrl: e.certifyUrl ? e.certifyUrl : "",
                certifyId: e.certifyId ? e.certifyId : "",
                onResponse: function (e) {
                    a("facialIdentification", e, n)
                }
            })
        }
    }, u = {
        getDeviceId: e.getDeviceId,
        getUserInfo: e.getUserInfo,
        getCityCode: function (e, n) {
            if ("undefined" == typeof eshimin) return console.log("eshimin is undefined"), void a("getCityCode", {
                code: "200",
                cityCode: "450200"
            }, n);
            eshimin.getCity ? eshimin.getCity({
                onResponse: function (e) {
                    a("getCityCode", e, n)
                }
            }) : a("getCityCode", {code: "200", cityCode: "450200"}, n)
        },
        getLocation: e.getLocation,
        getBarcode: e.getBarcode,
        setTitle: e.setTitle,
        savePhoto: e.savePhoto,
        getAddress: e.getAddress,
        share: e.share,
        chooseImage: e.chooseImage,
        openWebUrl: e.openWebUrl,
        closeWindow: e.closeWindow,
        phoneCall: e.phoneCall,
        facialIdentification: function (e, n) {
            var t = e.token ? e.token : "", o = e.clientId ? e.clientId : "";
            eshimin.realPersonAuth({
                token: t, clientId: o, onResponse: function (e) {
                    a("facialIdentification", e, n)
                }
            })
        }
    }, h = {
        getDeviceId: function (e, n) {
            "undefined" != typeof eshimin ? eshimin.invoke("getDeviceId", null, function (e) {
                o("getDeviceId", e, n)
            }) : f("getDeviceId", n)
        }, getUserInfo: function (e, n) {
            "undefined" != typeof eshimin ? eshimin.invoke("getUserStatus", null, function (e) {
                o("getUserInfo", t(e, "isUserLogined", ["value"]), n)
            }) : f("getUserInfo", n)
        }, getCityCode: function (e, n) {
            "undefined" != typeof eshimin ? eshimin.invoke("getCity", null, function (e) {
                o("getCityCode", e, n)
            }) : f("getCityCode", n)
        }, getLocation: function (e, n) {
            "undefined" != typeof eshimin ? eshimin.invoke("getLocation", {
                timeout: 8,
                accuracy: 100,
                requireAddress: !1,
                allowLastKnown: 30
            }, function (e) {
                o("getLocation", e, n)
            }) : f("getLocation", n)
        }, getBarcode: function (e, n) {
            "undefined" != typeof eshimin ? eshimin.invoke("scanCode", null, function (e) {
                o("getBarcode", t(e, "barcode", ["value"]), n)
            }) : f("getBarcode", n)
        }, setTitle: function (e, n) {
            "undefined" != typeof eshimin ? eshimin.invoke("setTitle", {title: e.title}, function (e) {
                o("setTitle", e, n)
            }) : f("setTitle", n)
        }, savePhoto: function (e, n) {
            var t;
            "undefined" != typeof eshimin ? (t = e.type ? e.type : "base64", eshimin.invoke("saveImage", {
                type: t,
                data: e.imgData,
                name: e.name
            }, function (e) {
                o("savePhoto", e, n)
            })) : f("savePhoto", n)
        }, getAddress: function (e, n) {
            "undefined" != typeof eshimin ? eshimin.invoke("getLocation", {
                timeout: 8,
                accuracy: 100,
                requireAddress: !0,
                allowLastKnown: 30
            }, function (e) {
                o("getAddress", t(e, "address", ["description"]), n)
            }) : f("getAddress", n)
        }, share: function (e, n) {
            "undefined" != typeof eshimin ? eshimin.invoke("share", {
                title: e.title,
                content: e.content,
                imgUrl: e.imgUrl,
                link: e.link
            }, function (e) {
                o("share", e, n)
            }) : f("share", n)
        }, chooseImage: function (e, n) {
            "undefined" != typeof eshimin ? eshimin.invoke("chooseImage", {sourceTypes: ["camera", "album"]}, function (e) {
                t(e, "img", ["imageData"]);
                o("chooseImage", e, n)
            }) : f("chooseImage", n)
        }, openWebUrl: function (e, n) {
            "undefined" != typeof eshimin ? eshimin.invoke("openWindow", {title: e.title, url: e.webUrl}, function (e) {
                o("openWebUrl", e, n)
            }) : f("openWebUrl", n)
        }, closeWindow: function (e, n) {
            "undefined" != typeof eshimin ? eshimin.invoke("closeWindow", null, function (e) {
                o("closeWindow", e, n)
            }) : f("closeWindow", n)
        }, phoneCall: function (e, n) {
            "undefined" != typeof eshimin ? (window.location.href = "tel://" + e.num, n({
                code: "200",
                msg: "success"
            })) : f("phoneCall", n)
        }, facialIdentification: function (e, n) {
            var t;
            "undefined" != typeof eshimin ? ("alipay" == (t = {type: e.type ? e.type : "self"}).type && (t.certifyUrl = e.certifyUrl, t.certifyId = e.certifyId), eshimin.invoke("facialIdentification", t, function (e) {
                o("facialIdentification", e, n)
            })) : f("facialIdentification", n)
        }
    }, m = {
        getDeviceId: function (e, n) {
            ("undefined" != typeof wx ? r : s)("getDeviceId", n)
        }, getUserInfo: function (e, n) {
            ("undefined" != typeof wx ? r : s)("getUserInfo", n)
        }, getCityCode: function (e, n) {
            ("undefined" != typeof wx ? r : s)("getCityCode", n)
        }, getLocation: function (e, n) {
            "undefined" != typeof wx ? wx.getLocation({
                type: "wgs84", success: function (e) {
                    e.code = "200", o("getLocation", e, n)
                }
            }) : s("getLocation", n)
        }, getBarcode: function (e, n) {
            "undefined" != typeof wx ? wx.scanQRCode({
                needResult: 1,
                scanType: ["qrCode", "barCode"],
                success: function (e) {
                    setTimeout(function () {
                        e.code = "200", o("getBarcode", t(e, "barcode", ["resultStr"]), n)
                    }, 1e3)
                }
            }) : s("getBarcode", n)
        }, setTitle: function (e, n) {
            "undefined" != typeof wx ? (document.title = e.title, n({code: "200", msg: "success"})) : s("setTitle", n)
        }, savePhoto: function (e, n) {
            ("undefined" != typeof wx ? r : s)("savePhoto", n)
        }, getAddress: function (e, n) {
            ("undefined" != typeof wx ? r : s)("getAddress", n)
        }, share: function (e, n) {
            "undefined" != typeof wx ? wx.updateAppMessageShareData({
                title: e.title,
                desc: e.content,
                link: e.link,
                imgUrl: e.imgUrl,
                success: function () {
                    o("share", {code: "200", msg: "success"}, n)
                }
            }) : s("share", n)
        }, chooseImage: function (e, n) {
            ("undefined" != typeof wx ? r : s)("chooseImage", n)
        }, openWebUrl: function (e, n) {
            "undefined" != typeof wx ? window.location.href = e.webUrl : s("openWebUrl", n)
        }, closeWindow: function (e, n) {
            ("undefined" != typeof wx ? r : s)("closeWindow", n)
        }, phoneCall: function (e, n) {
            "undefined" != typeof wx ? (window.location.href = "tel://" + e.num, n({
                code: "200",
                msg: "success"
            })) : s("phoneCall", n)
        }, facialIdentification: function (e, n) {
            ("undefined" != typeof wx ? r : s)("facialIdentification", n)
        }
    }, p = [{city_ua: "cssmy", url: "https://mycs.csbtv.com/web/common/eshiminJS.js"}, {
        city_ua: "eshiminapp",
        url: "https://api.eshimin.com/api/js/eshiminJS-1.0.0.js"
    }, {city_ua: "tfsmy", url: "https://cdpre.tfsmy.com/api/js/eshiminJS-1.0.0.js"}, {
        city_ua: "yzsmy",
        url: "https://myyztest.yzsmk.net/api/js/eshiminJS-1.0.0.js"
    }, {
        city_ua: "lcsmy",
        url: "https://wonders.yun.liuzhou.gov.cn/api/js/eshiminJS-1.0.0.js"
    }, {city_ua: "other_city_ua", url: "https://testapps.eshiyun.info/jsapi/2.0.0/eshiminjs.min.js"}];

    function n() {
        this.ua = "other_city_ua", this.url = "https://testapps.eshiyun.info/jsapi/2.0.0/eshiminjs.min.js"
    }

    return n.prototype.init = function (t) {
        if (a = !0, r = navigator.userAgent.toLowerCase(), window.navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i) ? "micromessenger" != r.match(/MicroMessenger/i) && (a = !1) : a = -1 < r.indexOf("windowswechat"), a) {
            this.ua = "wx_ua", (s = document.createElement("script")).type = "text/javascript", s.src = "https://res2.wx.qq.com/open/js/jweixin-1.6.0.js", (c = document.getElementsByTagName("script")[0]).parentNode.insertBefore(s, c);
            var o = new XMLHttpRequest,
                e = "https://testlife.eshimin.com/cbase/bud-cloud-governance-biz/openApi/open/getSign?url=" + encodeURIComponent(decodeURIComponent(location.href.split("#")[0]));
            o.open("get", e), o.send();
            var i = setTimeout(function () {
                console.log("获取微信签名超时"), t()
            }, 1e4);
            o.onreadystatechange = function () {
                var e, n;
                4 == o.readyState && 200 == o.status && (200 == (e = "string" == typeof o.responseText ? JSON.parse(o.responseText) : e.data).code ? (clearTimeout(i), n = setInterval(function () {
                    wx && wx.config && (clearInterval(n), wx.config({
                        debug: !1,
                        appId: e.result.sign.appId,
                        timestamp: e.result.sign.timestamp,
                        nonceStr: e.result.sign.nonce,
                        signature: e.result.sign.sign,
                        jsApiList: ["getLocation", "scanQRCode", "updateAppMessageShareData"]
                    }), wx.ready(function () {
                        console.log("微信sdk初始化成功"), t()
                    }), wx.error(function (e) {
                        console.log(e), console.log("微信sdk初始化失败")
                    }))
                }, 500)) : console.log(e.msg))
            }
        } else {
            var n = window.navigator.userAgent.toLowerCase();
            console.log("eshimin_uagent: ", n);
            for (var s, c, d = 0; d < p.length; d++) -1 < n.indexOf(p[d].city_ua) && (this.url = p[d].url, this.ua = p[d].city_ua);
            (s = document.createElement("script")).type = "text/javascript", s.id = "EshiminjsSDK", s.src = this.url, s.addEventListener("load", function () {
                t()
            }, !1), (c = document.getElementsByTagName("script")[0]).parentNode.insertBefore(s, c)
        }
        var a, r
    }, n.prototype.getMethod = function (e, n, t) {
        console.log(this.ua, e), "cssmy" == this.ua ? c[e](n, t) : "eshiminapp" == this.ua ? d[e](n, t) : "tfsmy" == this.ua ? l[e](n, t) : "yzsmy" == this.ua ? g[e](n, t) : "lcsmy" == this.ua ? u[e](n, t) : "other_city_ua" == this.ua ? h[e](n, t) : "wx_ua" == this.ua && m[e](n, t)
    }, n.prototype.getDeviceId = function (e, n) {
        this.getMethod("getDeviceId", e, n)
    }, n.prototype.getUserInfo = function (e, n) {
        this.getMethod("getUserInfo", e, n)
    }, n.prototype.getCityCode = function (e, n) {
        this.getMethod("getCityCode", e, n)
    }, n.prototype.getLocation = function (e, n) {
        this.getMethod("getLocation", e, n)
    }, n.prototype.getBarcode = function (e, n) {
        this.getMethod("getBarcode", e, n)
    }, n.prototype.setTitle = function (e, n) {
        this.getMethod("setTitle", e, n)
    }, n.prototype.savePhoto = function (e, n) {
        e.name = e.name ? e.name : "saveImg.jpg", this.getMethod("savePhoto", e, n)
    }, n.prototype.getAddress = function (e, n) {
        this.getMethod("getAddress", e, n)
    }, n.prototype.share = function (e, n) {
        this.getMethod("share", e, n)
    }, n.prototype.chooseImage = function (e, n) {
        this.getMethod("chooseImage", e, n)
    }, n.prototype.openWebUrl = function (e, n) {
        this.getMethod("openWebUrl", e, n)
    }, n.prototype.closeWindow = function (e, n) {
        this.getMethod("closeWindow", e, n)
    }, n.prototype.phoneCall = function (e, n) {
        this.getMethod("phoneCall", e, n)
    }, n.prototype.facialIdentification = function (e, n) {
        this.getMethod("facialIdentification", e, n)
    }, new n
}();