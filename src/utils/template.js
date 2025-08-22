/*!
 * template.js v0.7.1 (https://github.com/yanhaijing/template.js)
 * API https://github.com/yanhaijing/template.js/blob/master/doc/api.md
 * Copyright 2015 yanhaijing. All Rights Reserved
 * Licensed under MIT (https://github.com/yanhaijing/template.js/blob/master/MIT-LICENSE.txt)
 */
/* eslint-disable */
; (function (root, factory) {
    var template = factory(root);
    if (typeof define === 'function' && define.amd) {
        // AMD
        define('template', function () {
            return template;
        });
    } else if (typeof exports === 'object') {
        // Node.js
        module.exports = template;
    } else {
        // Browser globals
        var _template = root.template;

        template.noConflict = function () {
            if (root.template === template) {
                root.template = _template;
            }

            return template;
        };
        root.template = template;
    }
}(this, function (root) {
    'use strict';
    // 本文件为轻量级模板引擎（template.js）的实现，提供字符串模板编译、渲染能力
    // 关键能力：自定义标签、转义输出、压缩 HTML、注册函数与修饰器、错误处理等
    var o = {
        sTag: '<%',//开始标签
        eTag: '%>',//结束标签
        compress: false,//是否压缩html
        escape: true, //默认输出是否进行HTML转义
        error: function (e) { }//错误回调
    };
    var functionMap = {}; //内部函数对象
    //修饰器前缀
    var modifierMap = {
        '': function (param) { return nothing(param) },
        'h': function (param) { return encodeHTML(param) },
        'u': function (param) { return encodeURI(param) }
    };

    var toString = {}.toString;
    var slice = [].slice;
    /**
     * 获取变量的类型标识
     * @param {*} x 任意值
     * @returns {string} 返回诸如 'null' | 'string' | 'number' | 'object' 等小写类型名
     */
    function type(x) {
        if (x === null) {
            return 'null';
        }

        var t = typeof x;

        if (t !== 'object') {
            return t;
        }

        var c = toString.call(x).slice(8, -1).toLowerCase();
        if (c !== 'object') {
            return c;
        }

        if (x.constructor == Object) {
            return c;
        }

        return 'unknown';
    }

    /** 是否为普通对象 */
    function isObject(obj) {
        return type(obj) === 'object';
    }
    /** 是否为函数 */
    function isFunction(fn) {
        return type(fn) === 'function';
    }
    /** 是否为字符串 */
    function isString(str) {
        return type(str) === 'string';
    }
    /**
     * 将后续对象的可枚举属性浅拷贝到目标对象
     * @returns {Object} 目标对象
     */
    function extend() {
        var target = arguments[0] || {};
        var arrs = slice.call(arguments, 1);
        var len = arrs.length;

        for (var i = 0; i < len; i++) {
            var arr = arrs[i];
            for (var name in arr) {
                target[name] = arr[name];
            }

        }
        return target;
    }
    /**
     * 浅拷贝多个对象，返回合并后的新对象
     */
    function clone() {
        var args = slice.call(arguments);
        return extend.apply(null, [{}].concat(args));
    }
    /** 原样返回（默认修饰器） */
    function nothing(param) {
        return param;
    }
    /**
     * 对字符串进行 HTML 转义
     * @param {string} source
     * @returns {string}
     */
    function encodeHTML(source) {
        return String(source)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\\/g, '&#92;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    /**
     * 压缩 HTML：合并空白、移除注释
     */
    function compress(html) {
        return html.replace(/\s+/g, ' ').replace(/<!--[\w\W]*?-->/g, '');
    }
    /** 统一控制台输出适配 */
    function consoleAdapter(cmd, msg) {
        typeof console !== 'undefined' && console[cmd] && console[cmd](msg);
    }
    /**
     * 错误处理：格式化错误信息并回调 o.error
     * 返回一个可执行的兜底渲染函数
     */
    function handelError(e) {
        var message = 'template.js error\n\n';

        for (var key in e) {
            message += '<' + key + '>\n' + e[key] + '\n\n';
        }
        message += '<message>\n' + e.message + '\n\n';
        consoleAdapter('error', message);

        o.error(e);
        function error() {
            return 'template.js error';
        }
        error.toString = function () {
            return '__code__ = "template.js error"';
        }
        return error;
    }
    /**
     * 解析模板为可执行代码片段字符串
     * @param {string} tpl 模板字符串
     * @param {Object} opt 编译选项
     * @returns {string} 可拼接的代码文本
     */
    function parse(tpl, opt) {
        var code = '';
        var sTag = opt.sTag;
        var eTag = opt.eTag;
        var escape = opt.escape;
        function parsehtml(line) {
            // 单双引号转义，换行符替换为空格
            line = line.replace(/('|")/g, '\\$1');
            var lineList = line.split('\n');
            var code = '';
            for (var i = 0; i < lineList.length; i++) {
                code += ';__code__ += ("' + lineList[i] + (i === lineList.length - 1 ? '")\n' : '\\n")\n');
            }
            return code;
        }
        function parsejs(line) {
            //var reg = /^(:?)(.*?)=(.*)$/;
            var reg = /^(?:=|(:.*?)=)(.*)$/
            var html;
            var arr;
            var modifier;

            // = := :*=
            // :h=123 [':h=123', 'h', '123']
            if (arr = reg.exec(line)) {
                html = arr[2]; // 输出
                if (Boolean(arr[1])) {
                    // :开头
                    modifier = arr[1].slice(1);
                } else {
                    // = 开头
                    modifier = escape ? 'h' : '';
                }

                return ';__code__ += __modifierMap__["' + modifier + '"](typeof (' + html + ') !== "undefined" ? (' + html + ') : "")\n';
            }

            //原生js
            return ';' + line + '\n';
        }

        var tokens = tpl.split(sTag);

        for (var i = 0, len = tokens.length; i < len; i++) {
            var token = tokens[i].split(eTag);

            if (token.length === 1) {
                code += parsehtml(token[0]);
            } else {
                code += parsejs(token[0], true);
                if (token[1]) {
                    code += parsehtml(token[1]);
                }
            }
        }
        return code;
    }
    /**
     * 将模板编译为可执行的渲染函数 Render(data, modifierMap)
     */
    function compiler(tpl, opt) {
        var mainCode = parse(tpl, opt);

        var headerCode = '\n' +
            '    var html = (function (__data__, __modifierMap__) {\n' +
            '        var __str__ = "", __code__ = "";\n' +
            '        for(var key in __data__) {\n' +
            '            __str__+=("var " + key + "=__data__[\'" + key + "\'];");\n' +
            '        }\n' +
            '        eval(__str__);\n\n';

        var footerCode = '\n' +
            '        ;return __code__;\n' +
            '    }(__data__, __modifierMap__));\n' +
            '    return html;\n';

        var code = headerCode + mainCode + footerCode;
        code = code.replace(/[\r]/g, ' '); // ie 7 8 会报错，不知道为什么
        try {
            var Render = new Function('__data__', '__modifierMap__', code);
            Render.toString = function () {
                return mainCode;
            }
            return Render;
        } catch (e) {
            e.temp = 'function anonymous(__data__, __modifierMap__) {' + code + '}';
            throw e;
        }
    }
    /**
     * 编译模板，返回渲染器（或错误兜底函数）
     * @param {string} tpl 模板字符串
     * @param {Object} opt 编译选项
     * @returns {Function} render(data)
     */
    function compile(tpl, opt) {
        opt = clone(o, opt);

        try {
            var Render = compiler(tpl, opt);
        } catch (e) {
            e.name = 'CompileError';
            e.tpl = tpl;
            e.render = e.temp;
            delete e.temp;
            return handelError(e);
        }

        function render(data) {
            data = clone(functionMap, data);
            try {
                var html = Render(data, modifierMap);
                html = opt.compress ? compress(html) : html;
                return html;
            } catch (e) {
                e.name = 'RenderError';
                e.tpl = tpl;
                e.render = Render.toString();
                return handelError(e)();
            }
        }

        render.toString = function () {
            return Render.toString();
        };
        return render;
    }
    /**
     * 入口方法：传入模板与数据，返回渲染结果或渲染函数
     * @param {string} tpl 模板字符串
     * @param {Object} [data] 数据对象；若未提供则返回编译后的函数
     */
    function template(tpl, data) {
        if (typeof tpl !== 'string') {
            return '';
        }

        var fn = compile(tpl);
        if (!isObject(data)) {
            return fn;
        }

        return fn(data);
    }

    /**
     * 配置模板引擎全局选项
     * @param {Object} option 可选项
     */
    template.config = function (option) {
        if (isObject(option)) {
            o = extend(o, option);
        }
        return clone(o);
    };

    /**
     * 注册可在模板中直接调用的函数
     * @param {string} name 函数名
     * @param {Function} fn 实现
     */
    template.registerFunction = function (name, fn) {
        if (!isString(name)) {
            return clone(functionMap);
        }
        if (!isFunction(fn)) {
            return functionMap[name];
        }

        return functionMap[name] = fn;
    }
    /** 取消注册模板函数 */
    template.unregisterFunction = function (name) {
        if (!isString(name)) {
            return false;
        }
        delete functionMap[name];
        return true;
    }

    /**
     * 注册输出修饰器（例如 :h、:u）
     */
    template.registerModifier = function (name, fn) {
        if (!isString(name)) {
            return clone(modifierMap);
        }
        if (!isFunction(fn)) {
            return modifierMap[name];
        }

        return modifierMap[name] = fn;
    }
    /** 取消注册修饰器 */
    template.unregisterModifier = function (name) {
        if (!isString(name)) {
            return false;
        }
        delete modifierMap[name];
        return true;
    }

    template.__encodeHTML = encodeHTML;
    template.__compress = compress;
    template.__handelError = handelError;
    template.__compile = compile;
    template.version = '0.7.1';
    return template;
}));