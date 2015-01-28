(function ($) {
    $.fn.rotatabletext = function (f) {
        var g = {
            rotatorClass: 'ui-rotatable-handle',
            mtx: [1, 0, 0, 1]
        }, opts = $.extend(g, f),
            _this = this,
            url_site = $('#url_site').val(),
            _rotator;
        this.intialize = function () {
            this.createHandler();
            dims = {
                'w': _this.width(),
                'h': _this.height()
            }
        };
        this.createHandler = function () {
            _rotator = $('<div class="' + opts.rotatorClass + '"></div>');
            _this.append(_rotator);
            this.bindRotation()
        };
        this.bindRotation = function () {
            _rotator.draggable({
                revert: true,
                start: function (e) {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    tl_coords = {
                        'x': parseInt(_this.parent().css('left')),
                        'y': parseInt(_this.parent().css('top'))
                    };
                    dims = {
                        'w': _this.width(),
                        'h': _this.height()
                    };
                    center_coords = {
                        'x': _this.offset().left + _this.width() * 0.5,
                        'y': _this.offset().top + _this.height() * 0.5
                    };
                    begin_angle_pos = {
                        'x': _this.offset().left + _this.width(),
                        'y': _this.offset().top
                    };
                    begin_angle = _this.radToDeg(_this.getAngle(begin_angle_pos, center_coords));
                    old_angle = _this.attr("angle2");
                    begin_angle2 = parseFloat(begin_angle) + parseFloat(old_angle)
                },
                drag: function (e) {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    mouse_coords = {
                        'x': e.pageX,
                        'y': e.pageY
                    };
                    angle = _this.radToDeg(_this.getAngle(mouse_coords, center_coords)) - begin_angle;
                    _this.attr("angle", angle);
                    new_angle = parseFloat(old_angle) + angle;
                    _this.attr("angle2", new_angle % 360);
                    new_angle2 = new_angle % 360;
                    var a, new_h;
                    if (new_angle2 == 90) {
                        new_angle2 = 89.9999999999
                    }
                    var w = _this.attr('w'),
                        h = _this.attr('h'),
                        pos = _this.attr("pos").split(',');
                    var b = new_angle2 * Math.PI / 180;
                    var c = Math.cos(b);
                    var s = Math.sin(b);
                    if (c < 0) {
                        c = -c
                    }
                    if (s < 0) {
                        s = -s
                    }
                    a = h * s + w * c;
                    new_h = h * c + w * s;
                    var d = a - w,
                        h_l = new_h - h;
                    _this.css({
                        "left": pos[0] - d / 2 - w / 2,
                        "top": pos[1] - h_l / 2 - h / 2
                    });
                    _this.children("p").css({
                        "left": d / 2,
                        "top": h_l / 2,
                        "position": "absolute"
                    });
                    _this.width(a).height(new_h);
                    $('.overlay-btn').removeClass('send-back');
                    return _this.rotate(new_angle % 360)
                },
                stop: function (a, b) {}
            })
        };
        this.getAngle = function (a, b) {
            var x = a.x - b.x,
                y = -a.y + b.y,
                hyp = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)),
                angle = Math.acos(x / hyp);
            if (y < 0) {
                angle = 2 * Math.PI - angle
            }
            return angle
        };
        this.degToRad = function (d) {
            return (d * (Math.PI / 180))
        };
        this.radToDeg = function (r) {
            return (r * (180 / Math.PI))
        };
        this.rotate = function (a) {
            var b = Math.cos(_this.degToRad(-a)),
                sin = Math.sin(_this.degToRad(-a)),
                mtx = [b, sin, (-sin), b];
            this.updateRotationMatrix(mtx, a)
        };
        this.getRotationMatrix = function () {
            var a = _this.css('transform') ? _this.css('transform') : 'rotate(0deg)';
            _m = a.split(','), m = [];
            for (i = 0; i < 4; i++) {
                m[i] = parseFloat(_m[i].replace('matrix(', ''))
            }
            return m
        };
        this.updateRotationMatrix = function (m, a) {
            var b = a * (-1);
            var c = "progid:DXImageTransform.Microsoft.Matrix(M11='" + m[0] + "', M12='" + m[1] + "', M21='" + m[2] + "', M22='" + m[3] + "', sizingMethod='auto expand')",
                scx = _this.attr('scx'),
                scy = _this.attr('scy');
            _this.find("p").css({
                '-moz-transform': 'rotate(' + b + 'deg) scaleX(' + scx + ') scaleY(' + scy + ')',
                '-o-transform': 'rotate(' + b + 'deg) scaleX(' + scx + ') scaleY(' + scy + ')',
                '-webkit-transform': 'rotate(' + b + 'deg) scaleX(' + scx + ') scaleY(' + scy + ')',
                '-ms-transform': 'rotate(' + b + 'deg) scaleX(' + scx + ') scaleY(' + scy + ')',
                'transform': 'rotate(' + b + 'deg) scaleX(' + scx + ') scaleY(' + scy + ')',
                'filter': c,
                '-ms-filter': '"' + c + '"'
            })
        };
        return this.intialize()
    }
})(jQuery);