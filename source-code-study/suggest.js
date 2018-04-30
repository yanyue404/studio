define(function() {
    var a = {
        create: function() {
            return function() {
                this.initialize.apply(this, arguments)
            }
        }
    }
      , c = a.create();
    return c.prototype = {
        initialize: function(a) {
            var c = this.getDom(a);
            this.container = a,
            this.searchBtn = c.searchBtn,
            this.suggestTrigger = c.suggestTrigger,
            this.suggestPanel = c.suggestPanel,
            this.clearTextBtn = c.clearTextBtn,
            this.timer = null,
            this.currIndex = -1,
            this.addListener()
        },
        createSuggest: function(a) {
            var c = this;
            this.timer && clearTimeout(this.timer),
            this.timer = setTimeout(function() {
                if (a.length > 0)
                    c.getTargetSuggest(a);
                else {
                    if (!isLogin)
                        return void c.clearSuggest();
                    c.getLatestSuggest()
                }
            }, 200)
        },
        getTargetSuggest: function(a) {
            var c = this;
            $.ajax({
                type: "get",
                url: "/search/history?words=" + a,
                dataType: "json",
                success: function(a) {
                    var g = a && a.data;
                    g && c.autoComplete(g)
                }
            })
        },
        getLatestSuggest: function() {
            var a = this;
            $.ajax({
                type: "GET",
                url: "/index/searchhistory",
                dataType: "json",
                success: function(c) {
                    c.data.length && a.autoComplete(c.data)
                }
            })
        },
        addListener: function() {
            var a = this;
            this.suggestTrigger.on({
                keyup: function(c) {
                    switch (a.timer && clearTimeout(a.timer),
                    c.keyCode) {
                    case 38:
                        a.setCurrIndex("up"),
                        a.itemSwitch();
                        break;
                    case 40:
                        a.setCurrIndex("down"),
                        a.itemSwitch();
                        break;
                    case 13:
                        return a.triggerSearch($(this)),
                        !1;
                    default:
                        var g = a.getTriggerValue($(this));
                        a.createSuggest(g),
                        a.setClearTextBtnState(g)
                    }
                },
                focus: function() {
                    var c = a.getTriggerValue($(this));
                    a.container.addClass("suggest-active"),
                    a.container.parent().addClass("search-active"),
                    a.createSuggest(c)
                },
                blur: function() {
                    a.container.removeClass("suggest-active"),
                    a.container.parent().removeClass("search-active"),
                    setTimeout(function() {
                        a.clearSuggest()
                    }, 200)
                }
            }),
            this.searchBtn.on("click", function() {
                var c = a.getTriggerEl($(this));
                a.triggerSearch(c)
            }),
            this.suggestPanel.on({
                click: function() {
                    a.searchBtn.trigger("click")
                },
                mouseover: function() {
                    a.currIndex = $(this).index()
                },
                mouseout: function() {
                    a.currIndex = -1
                }
            }, "li"),
            this.clearTextBtn.on("click", function() {
                a.clearSearchText()
            })
        },
        itemSwitch: function(a) {
            var c = this.suggestPanel.find("li")
              , g = null
              , h = "";
            c.removeClass("light"),
            this.currIndex > -1 && (g = c.eq(this.currIndex),
            g.addClass("light"),
            h = g.data("key"),
            this.setTriggerValue(h),
            this.setClearTextBtnState(h),
            a && a())
        },
        search: function(a) {
            switch (OP_CONFIG.module) {
            case "wenda":
                location.href = "/search/wenda?words=" + encodeURIComponent(a);
                break;
            case "article":
                location.href = "/search/article?words=" + encodeURIComponent(a);
                break;
            case "course":
                location.href = "/search/course?words=" + encodeURIComponent(a);
                break;
            default:
                location.href = "/search/?words=" + encodeURIComponent(a)
            }
        },
        autoComplete: function(a) {
            var c = []
              , g = "";
            if (this.currIndex = -1,
            a.length) {
                for (var i = 0, h = a.length; h > i; i++) {
                    var T = this.tpl(a[i]);
                    c.push(T)
                }
                g = c.join(""),
                this.suggestPanel.html(g).slideDown(100)
            } else
                this.clearSuggest()
        },
        triggerSearch: function(a) {
            if (this.currIndex > -1) {
                var c = this.suggestPanel.find("li");
                this.search(c.eq(this.currIndex).data("key"))
            } else {
                var g = this.getTriggerValue(a);
                if (!g)
                    return this.search(""),
                    !1;
                this.search(g)
            }
        },
        setTriggerValue: function(a) {
            this.suggestTrigger.val(a)
        },
        getTriggerValue: function(a) {
            return $.trim(a.val())
        },
        getTriggerEl: function(a) {
            return a.closest("[data-search]").find("[data-suggest-trigger]")
        },
        setCurrIndex: function(a) {
            var c = this.suggestPanel.find("li")
              , g = c.length;
            this.currIndex = "up" === a ? this.currIndex > -1 ? this.currIndex - 1 : g - 1 : this.currIndex < g - 1 ? this.currIndex + 1 : -1
        },
        setClearTextBtnState: function(a) {
            a ? this.clearTextBtn.removeClass("hide") : this.clearTextBtn.addClass("hide")
        },
        clearSearchText: function() {
            this.setTriggerValue(""),
            this.clearTextBtn.addClass("hide")
        },
        clearSuggest: function() {
            this.suggestPanel.slideUp(100).delay(100).html("")
        },
        tpl: function(a) {
            return '<li data-key="' + a.word + '">' + a.word + "</li>"
        },
        getDom: function(a) {
            return {
                searchBtn: a.find("[data-search-btn]"),
                suggestTrigger: a.find("[data-suggest-trigger]"),
                suggestPanel: a.find("[data-suggest-result]"),
                clearTextBtn: a.find("[data-clear-btn]")
            }
        }
    },
    c
});
