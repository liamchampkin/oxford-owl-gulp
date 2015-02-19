$(function() {

    $('body').keypress(function(event) {
        var target = $(event.target).prop("tagName").toLowerCase();
        if (target == 'textarea' || target == 'input') return;
        if (event.which == 43) {
            $('.tip-toggle.closed').click();
        } else if (event.which == 45) {
            $('.tip-toggle.opened').click();
        }
    });
    // hidable tip elements
    //if ($('meta[name=render_as_pdf]').attr("value") != 'true') {
        $('section.tip p, section.tip div, section.tip ul, section.tip ol, section.tip br').hide();
    //}
    $('section.tip p, section.tip div, section.tip ul, section.tip ol, section.tip br').hide();
    var clickElement = $('<a></a>', {
        "class": "tip-toggle closed",
        href: '#'
    });
    clickElement.click(function(evt) {
        var that = $(this);
        evt.preventDefault();
        if (that.hasClass('closed')) {
            setMetaTipsData(that.parent()[0]);
            that.removeClass('closed').addClass('opened');
            $('p, div, ul, ol, br', that.parent()).show();
        } else {
            removeMetaTipsData(that.parent()[0]);
            that.removeClass('opened').addClass('closed');
            $('p, div, ul, ol, br', that.parent()).hide();
        }
    });
    $('section.hideable-content div.hideable-content').hide();
    $('a.hideable-content').click(function(evt) {
        var that = $(this);
        if (that.hasClass('opened')) {
            that.removeClass('opened');
            $('div', that.parent()).hide();
        } else {
            that.addClass('opened');
            $('div', that.parent()).show();
        }
    });
    $('section.tip').prepend(clickElement);
    openTips();
    sniffBrowser();


    //add callback function to popover
    var tmp = $.fn.popover.Constructor.prototype.show;
    $.fn.popover.Constructor.prototype.show = function() {
        tmp.call(this);
        if (this.options.callback) {
            this.options.callback();
        }
    };


    if ($('#top-links')) {
        $('#top-links').html($('#top-links-div').detach().html());
        $('#create-your-class-login').html($('#top-links .class-button-container').detach().html());
    }

    $('.ajaxpopover').on('click', function(evt) {
        var tgt = $(evt.target);
        if (tgt.hasClass('is-ebook')) {
            tgt = tgt.parent();
        }
        if (tgt.hasClass('popopen')) {
            tgt.popover('destroy').removeClass('popopen');
            return false;
        }
        $('.popopen').popover('destroy').removeClass('popopen');
        var url = tgt.data('url');
        $.get(url, function(data, status) {
            var match = data.match(/<p class="title">(.*)<\/p>/);
            data = data.replace(match[0], '');
            var placement = tgt.is('.pos-3, .pos-4, .pos-5') ? 'left' : 'right';
            tgt.popover({
                html: true,
                placement: placement,
                content: data,
                trigger: 'manual',
                title: match[1],
                callback: function() {
                    $('.popover-close').click(function() {
                        $('.popopen').popover('destroy').removeClass('popopen');
                    });
                }
            });
            tgt.addClass('popopen').popover('show');

        });
    });

    $('.has-popover').popover({
        html: true
    }).click(function(evt) {
        var tgt = $(evt.target);
        if (tgt.hasClass('popopen')) {
            tgt.popover('destroy');
            tgt.removeClass('popopen');
            return;
        }
        $('.popopen').popover('destroy').removeClass('popopen');
        tgt.popover('show').addClass('popopen');
    });

    $('[data-update]').on('click', function(evt) {
        var target = $(this).data('update');
        $('#' + target).html('<img src="/images/loader.gif" class="ajax-loader"/>')
    });

    $('body').on('ajax:complete', '[data-update]', function(evt, data) {
        var target = $(this).data('update');
        $('#' + target).html(data.responseText);
    });

    var pods = $('.pod-container')
    for (var n = 0; n < pods.length; n++) {
        var lb = pods[n];

        var pdf_link = null;
        var pdf_img = $('img.icon', lb)[0];
        if (typeof(pdf_img) != 'undefined') pdf_link = $(pdf_img).closest('a').attr('href');

        var src = $('img', lb).attr('src');
        var delim = src.lastIndexOf('/')
        var largeSrc = src.substring(0, delim) + '-large' + src.substring(delim, src.length)
        var links = $('a.open-in-lightbox', lb).attr('href');
        var link = "/popup-image.html?img=" + encodeURIComponent(largeSrc) + "&pdf=" + encodeURIComponent(pdf_link)
        if (typeof(links) == 'undefined' || links.length < 2) {
            $('a.open-in-lightbox', lb).attr('href', link).colorbox({
                iframe: true,
                width: '650px',
                height: '800px'
            }).removeClass('open-in-lightbox');
        } else {
            $('a.open-in-lightbox', lb).colorbox({
                iframe: true,
                width: '650px',
                height: '800px'
            });
        }

    }
    $('a.open-in-lightbox').colorbox();
    $('a.open-in-lightbox-iframe').each(function(index) {
        var isGame = (typeof($(this).attr('id')) != 'undefined' && $(this).attr('id').indexOf('game') > -1);
        var isMathActivity = (typeof($(this).attr('id')) != 'undefined' && $(this).attr('id').indexOf('math-activity') > -1);
        var isAndroidTablet = (/android|android 3.0/i.test(navigator.userAgent.toLowerCase()));
        if (isMathActivity && isAndroidTablet) {
            $(this).click(function(event) {
                event.preventDefault();
                var win = window.open($(this).attr('href'), '_blank');
                win.focus();
            });
        } else if ((isGame && Modernizr.touch) || ($(this).hasClass('register') && Modernizr.touch)) {
            $(this).click(function(event) {
                event.preventDefault();
                var win = window.open($(this).attr('href'), '_blank');
                win.focus();
            });
        } else {
            width = $(this).data('width');
            if (typeof(width) == 'undefined') width = '650px';
            height = $(this).data('height');
            if (typeof(height) == 'undefined') height = '440px';
            $(this).colorbox({
                iframe: true,
                transition: 'fade',
                scrolling: false,
                initialWidth: width,
                initialHeight: height,
                width: width,
                height: height,
                onComplete: function() {
                    if (isGame) {
                        var h = $('.cboxIframe').parent().css('height');
                        var w = $('.cboxIframe').parent().css('width');
                        $('.cboxIframe').addClass('game');
                        $('.cboxIframe').css('height', (parseInt(h) - 20).toString() + 'px');
                        $('.cboxIframe').css('width', (parseInt(w) - 20).toString() + 'px');
                    }
                }
            })
        }
    });
    //$('a.open-in-lightbox-iframe').colorbox({iframe:true, width: '650px', height: '440px'})


    $('.carousel-header').text($('.carousel-header-text').detach().text());

    $('select.wallpaper').on('change', function() {
        var val = $(this).val();
        if (val.indexOf('http') == 0) {
            document.location.href = val;
        } else {
            document.location.href = $(this).data('src') + '/' + val + '.zip';
        }
    });

    // make background in popups white
    $('section.popup').each(function() {
        $('body').css('background', 'white');
    });

    // load a video into the video player from video playlist
    $('#video-side-body a').on('click', function() {
        var self = $(this);
        var href = self.attr('href');
        var video = _V_("video");
        var flv = href + ".orig.flv";
        var mp4 = href + ".mp4";
        var webm = href + ".webm";

        if (typeof(self.data('flv')) != 'undefined') flv = self.data('flv');
        if (typeof(self.data('mp4')) != 'undefined') mp4 = self.data('mp4');
        if (typeof(self.data('webm')) != 'undefined') webm = self.data('webm');

        video.src([{
            type: "video/mp4",
            src: mp4
        }, {
            type: "video/webm",
            src: webm
        }, {
            type: "video/flv",
            src: flv
        }]);

        video.ready(function() {
            this.play();
        });
        return false;
    });

    var vars = getUrlVars();
    if (vars['class-login-error'] == 'true') {
        var cb = function() {
            if (vars['class-login-concurrency'] == 'true') {
                loginError('<span class="error">Oops!<br/><br/>Each class login allows up to 50 pupils to login. 50 pupils are already logged in using this class login. Please speak to your teacher.<br/><br/>Teachers â€“ you can set-up a total of 5 separate classes. To set-up another class log in using you own details and click on \'Create class login\' button.</span>');
            } else {
                loginError('<span class="error">Your login details donâ€™t seem to be working. Please try again or ask your teacher.</span>');
            }
        }
        showLoginWidget({
            text: 'Oops!',
            callback: cb,
            username: vars['username'],
            form: 'class'
        });
    } else if (vars['login-error'] == 'true') {
        var cb = function() {
            loginError('<span class="error">Your login details donâ€™t match our records or you are logged in on too many devices.<br/>Please make sure you are not logged in on more than 5 devices and re-enter your details.</span><br/><br/>If you need help with your password, please click on the link below.');
        }
        showLoginWidget({
            text: 'Oops!',
            callback: cb,
            form: 'eac'
        });
    }

    var params = window.location.search.replace("?", "");
    if (params.length > 0) {
        var url = "/pages/render_top_links/?" + params;
    } else {
        var url = "/pages/render_top_links";
    }

    $('.login-link').click(function() {
        showLoginWidget({});
        return false;
    });

    $('.class-login-link').click(function() {
        showLoginWidget({
            form: 'class'
        });
        return false;
    });

    $('.login-close').click(function() {
        hideLoginWidget();
        return false;
    });

    $('.search-website .label').on('click', function() {
        if (!($(this).hasClass('active'))) {
            $(this).addClass('active');
            $('.search-book .label').removeClass('active');
        }
    });
    $('.search-book .label').on('click', function() {
        if (!($(this).hasClass('active'))) {
            $(this).addClass('active');
            $('.search-website .label').removeClass('active');
        }
    });
    if ($('#search').length > 0) {
        if ((getURLParameter('type') == 'book')) {
            $('#search .search-website .label').removeClass('active');
            $('#search .search-book .label').addClass('active');
        } else {
            $('#search .search-website .label').addClass('active');
            $('#search .search-book .label').removeClass('active');
        }
    }
    window.EmailSignUp = function(email) {
        var pattern = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
        if (pattern.test(email)) {
            $.ajax({
                type: "POST",
                url: "/subscriptions",
                data: {
                    'email': email
                },
                success: function(response) {
                    if (response.success) {
                        $('a#subscription-button').parent().html('<p>' + response.msg + '</p>');
                    } else {
                        $('a#subscription-button').parent().find('p').text(response.msg);
                    }
                },
                failure: function(response) {
                    $('a#subscription-button').parent().find('p').text('Error occured, please try again later.');
                }
            });
        } else {
            $('a#subscription-button').parent().find('p').text('Please check your email address and try again.');
            return false;
        }
    }

    $('#subscription-button').click(function(evnt) {
        evnt.preventDefault();
        var email = $(this).parent().find('input:eq(0)').val();
        EmailSignUp(email);
        return false;
    });
    $('input#subscription-email').keydown(function(evnt) {
        if (evnt.keyCode == 13) {
            evnt.preventDefault();
            EmailSignUp($(this).val());
            return false;
        }
    });
    $('.activity-container a').click(function(e) {
        if (($(this).attr('href').search(/\/api\/courses\/\d+\/digital_books\/\d+.html/) == 0) && ($('.top-links-inner a.login').length > 0)) {
            e.preventDefault();
            window.scrollTo(0, null);
            showLoginWidget();
            void(0);
        }
    });
    $('.pdf-logo').css('margin-left', screen.width + 'px');
    if ($('body').hasClass('ie9')) {
        $('input.search').on('keydown', function(event) {
            if (event.which == 13) {
                $(this).parent('form').submit();
            }
        });
    }
    setPlaceholder();
    try {
        _V_("video").ready(function() {
            $('.vjs-default-skin .vjs-big-play-button').css('top', $('#video').height() / 2 - 40);
        });
    } catch (e) {}

    $('a.open-in-modal-iframe').click(function(event) {
        event.preventDefault();
        modal_iframe($(this).attr('href'), $(this).data('width'), $(this).data('height'));
    });

    $.fn.center = function() {
        this.css("position", "absolute");
        this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + $(window).scrollTop()) + "px");
        this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + "px");
        return this;
    }
});

function modal_iframe(url, width, height) {
    $('<div id="cboxOverlay" style="display: block; opacity: 0.5; visibility: visible;"></div>').appendTo('body');
    var lo = $('<section id="modal_iframe"><iframe src="' + url + '" width="' + width + '" height="' + height + '"></iframe></section>');
    lo.appendTo('body').center();
}

function close_modal_iframe() {
    $('#cboxOverlay').remove();
    $('#cboxOverlay').remove();
    setTimeout(function() {
        $('#modal_iframe').remove().remove();
    }, 500);
}



// reloads the page if user is logged in per osp sso
function determineIfLoggedIn() {
    if (typeof(EAC_LOGIN_WIDGET) == 'undefined') window.setTimeout(determineIfLoggedIn, 300);
    if (EAC_LOGIN_WIDGET.isLoggedIn) {
        loc = window.location.href;
        if (loc.indexOf('&eacSessionId') > 0) return;
        if (loc.indexOf('?') == -1)
            loc = loc + '?'
        else
            loc = loc + '&'

            window.location.href = loc + 'eacUserId=' + EAC_LOGIN_WIDGET.eacUserId + '&eacSessionId=' + EAC_LOGIN_WIDGET.eacSessionId
    }
}

loginOpen = false;

function showLoginWidget(options) {
    $("html, body").animate({
        scrollTop: 0
    }, "slow");
    var text = options['text'];
    var cllbck = options['callback'];
    $('.login-content').height('auto');
    $('.loginErrorOuter').remove();
    if (typeof(text) == 'undefined') text = 'Welcome to Oxford Owl';
    loginOpen = true;
    $('.login-title h1').text(text);
    if (options['form'] == 'class') {
        $('#login-content-inner').load('/class_user/sign_in.html?username=' + options['username']);
    } else {
        try {
            EAC_LOGIN_WIDGET.showLoginWidget('login-content-inner');
        } catch (e) {}
    }
    $('#top-links .top-links-inner a.register').fadeOut(400);
    $('#top-links .top-links-inner a.login').fadeOut(400, function() {
        $(".login-content").hide();
        if ($('body.ie9').length == 0) $('#top-links').css('border-bottom-left-radius', 0);
        $("#login-form").fadeIn(1000, function() {
            if (options['form'] == 'class') {
                $(".login-content").css('top', '70px')
                $('.login-content').slideDown(600);
                setPlaceholder();
                if (typeof(cllbck) == 'function') cllbck();
            } else {
                replaceLoginProblemLinks(function(formHeight) {
                    $(".login-content").css('top', '70px')
                    $('.login-content').slideDown(600);
                    setPlaceholder();
                    if (typeof(cllbck) == 'function') cllbck();
                });
            }
        });
    });
}

function loginError(html) {
    $('.login-content').height('auto');
    if ($('.loginError').length == 0) $('.login-content').prepend('<div class="loginErrorOuter"><p class="loginError" style="display: block;"></p></div>');
    var height = $(".loginError").height();
    $('.loginError').html(html);
    var newHeight = $(".loginError").height();
    $(".loginError").animate({
        height: newHeight,
        opacity: 1
    }, function() {
        $('.loginErrorOuter').height(newHeight + 10);
        $('.login-content').height($('.login-content').height());
    });
}

function loginSuccess() {
    $('#top-links').load('/eac_logins/top_links.html', function() {
        hideLoginWidget();
    });
}

function removeLoginError(callback) {
    $('.login-content').height('auto');
    if ($('.loginError').length == 0) {
        if (typeof(callback) == 'function') callback();
    }
    $(".loginErrorOuter").animate({
        height: 0
    }, function() {
        $('.loginErrorOuter').remove();
        if (typeof(callback) == 'function') callback();
    });
}

function showPasswordHelp() {
    removeLoginError(function() {
        if (loginOpen) {
            $('.login-title h1').fadeOut();
            var height = $(".login-content").height();
            $(".login-content").height(height);
            $('#login-content-inner').fadeOut().load('/user/password/new.html?height=' + height, function() {
                $('#login-content-inner').fadeIn();
                $('.login-title h1').text('Password help').fadeIn();
                setPlaceholder();
            });
        } else {
            $('.login-content').height('auto');
            loginOpen = true;
            loginHelp = true;
            $('.login-title h1').text('Password help');
            $(".login-content").hide();
            $('#login-content-inner').load('/user/password/new.html', function() {
                $('#top-links .top-links-inner').fadeOut(400, function() {
                    $("#login-form").fadeIn(800, function() {
                        $(".login-content").css('top', '70px')
                        $('.login-content').slideDown(600);
                    });
                });
            });
        }
    });

    $('#login-form').show();
    try {
        $.colorbox.close();
    } catch (e) {}
}

function hideLoginWidget(callback) {
    loginOpen = false;
    var height = $(".login-content").height();
    $(".login-content").slideUp(600, function() {
        $("#login-form").fadeOut(400, function() {
            if ($('body.ie9').length == 0) $('#top-links').css('border-bottom-left-radius', '35px');
            $("#top-links .top-links-inner a.register").fadeIn(1000);
            $("#top-links .top-links-inner a.login").fadeIn(1000, function() {
                if (typeof(callback) != 'undefined') {
                    callback();
                }
            });
        });
    });
}

function replaceLoginProblemLinks(callback) {
    if ($('#eacLoginProblems').length == 0) {
        window.setTimeout(replaceLoginProblemLinks, 300);
    } else {
        //$('#eacBasicLoginForm').attr('target', 'login-frame');
        $('#eacLoginMessage').hide();

        $('#eacUsernameLabel').hide();
        $('#eacUsername').attr('placeholder', 'Email address');

        $('#eacPasswordLabel').hide();
        $('#eacPassword').attr('placeholder', 'Password').addClass('password');
        //$('#eacLoginProblemsLink').attr('href', 'https://access.oup.com/eac/passwordReset.htm?url=http%3A%2F%2Fwww.oxfordowl.co.uk%2F');
        $('#eacLoginProblemsLink').attr('href', '/problems-logging-in');
        $('#eacPasswordResetLink').replaceWith('<a href="javascript:hideLoginWidget(function(){$(\'#top-links a.register\').click()});void(0)">Not registered yet? Join us!</a>');
        /*
    $('#eacLoginProblems').html('<p>Forgotten your password?<br/><a href="#" class="password-link">Password help</a></p>');
    $('.password-link').on('click', function(){
      showPasswordHelp();
      return false;
    });
    */
        if (typeof(callback) != 'undefined') {
            callback($(".login-content").height());
        }
    }
}

function showEacLoginForm() {
    try {
        EAC_LOGIN_WIDGET.showLoginWidget('login-content-inner');
        replaceLoginProblemLinks();
    } catch (e) {}
}

function setDropDownValue(a) {
    a = $(a);
    var div = a.closest('div');
    div.children('input').val(a.data('value'));
    div.children('a').text(a.text());
    $('#library-form-submit').click();
}

function setLibraryView(value) {
    $('#view-field').val(value);
    $('#library-form-submit').click();
}

function resizeCbox(newHeight) {
    var outerHeight = newHeight + 20;
    $('#cboxWrapper, #colorbox').height(outerHeight);
    $('#cboxMiddleLeft, #cboxContent, #cboxLoadedContent, #cboxMiddleRight').height(newHeight);
}

function printPage() {
  var url = document.location.href;
  var anchor = url.indexOf('#');
  if (anchor > -1) url = url.substring(0, anchor);
  var op = (url.indexOf('?') > -1) ? '&' : '?';
  url += op + "print=true";
  var tips = $('meta[name=tips]').attr('value');
  if ((tips != '') && (tips != undefined) && (tips != 'null')) url += "&tips=" + tips;
  document.location.href = url;
}

function getURLParameter(name) {
    return decodeURI((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, null])[1]);
}

// ie9 does not know about placeholders
// therefore they are added here
function setPlaceholder() {
    if (!Modernizr.input.placeholder) {
        $("input").each(function() {
            var that = $(this);
            if (that.hasClass('password')) {
                var id = that.attr('id');
                //that.attr('type', 'text');
                var ne = that.wrap('<span></span>').parent().html();
                ne = ne.replace('type="password"', 'type="text"');
                //alert(ne);
                that.replaceWith(ne);
                that.val(that.attr("placeholder"));
                that = $('#' + id);
            }
            if (that.val() == "" && that.attr("placeholder") != "") {
                that.val(that.attr("placeholder"));
                that.css('color', 'grey');
                that.focus(focusFunction);
                if (!that.hasClass('password')) that.blur(blurFunction);
            }
        });
    }
}

function focusFunction() {
    var that = $(this);
    if (that.val() == that.attr("placeholder")) {
        that.val("");
        that.css('color', 'black');
        if (that.hasClass('password')) {
            var id = that.attr('id');
            var ne = that.wrap('<span></span>').parent().html();
            that.unwrap();
            ne = ne.replace('type="text"', 'type="password"');
            that.replaceWith(ne);
            that.blur();
            setTimeout(function() {
                var that = $('#' + id);
                that.focus();
                that.css('color', 'black');
                that.blur(blurFunction);
            }, 0.5);
        }
    }
}

function blurFunction() {
    var that = $(this);
    if (that.val() == "") {
        that.val(that.attr("placeholder"));
        that.css('color', 'grey');
        if (that.hasClass('password')) {
            var id = that.attr('id');
            var ne = that.wrap('<span></span>').parent().html();
            that.unwrap();
            ne = ne.replace('type="password"', 'type="text"');
            that.replaceWith(ne);
            setTimeout(function() {
                var that = $('#' + id);
                that.val(that.attr('placeholder'));
                that.focus(focusFunction);
                that.css('color', 'grey');
            }, 0.5);
        }
    }
}

function openTips() {
    var tips = $('meta[name=tips]').attr('value');

    if ((tips != '') && (tips != undefined) && (tips != 'null')) {
        var tips_chunk = tips.split(',');
        for (i = 0; i < tips_chunk.length; i++) {
            $('.tip').eq(parseInt(tips_chunk[i])).children('a:first').removeClass('closed');
            $('.tip').eq(parseInt(tips_chunk[i])).find('section.tip p, section.tip div, section.tip ul, section.tip ol, section.tip br').show();
            $('.tip').eq(parseInt(tips_chunk[i])).children('section.tip p, section.tip div, section.tip ul, section.tip ol, section.tip br').show();
            $('.tip').eq(parseInt(tips_chunk[i])).find('a,p,div').show();
        }
    }
    if ($('meta[name=render_as_pdf]').attr("value") == 'true') {
        $('.hideable-content').show();
        $('#body ul a').show();
        $('#body p a').show();
      $('.tip').find('a:first').show();
    }
}

function setMetaTipsData(tip) {
    var tip_index = $.inArray(tip, $('.tip'));
    var tips = $('meta[name=tips]').attr('value');
    if ((tips != undefined) && (tips != '')) {
        var tips_array = tips.split(',');
    } else {
        tips_array = new Array();
    }
    tips_array.push(tip_index.toString());
    tips_array = $.unique(tips_array);
    $('meta[name=tips]').attr('value', tips_array.join(','));
}

function removeMetaTipsData(tip) {
    var tip_index = $.inArray(tip, $('.tip'));
    var tips = $('meta[name=tips]').attr('value');
    if ((tips != undefined) && (tips != '')) {
        var tips_array = tips.split(',');
        tips_array.splice($.inArray(tip_index.toString(), tips_array), 1);
        $('meta[name=tips]').attr('value', tips_array.join(','));
    }
}

function getUrlVars() {
    var vars = [],
        hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function getUrlVar(name) {
    return getUrlVars()[name];
}