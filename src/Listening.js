"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Events_1 = require("./Events");
var Listening = /** @class */ (function (_super) {
    __extends(Listening, _super);
    function Listening(listener, obj) {
        var _this = this;
        _this.listener = listener;
        _this.obj = obj;
        _this.interop = true;
        _this.count = 0;
        _this.events = void 0;
        return _this;
    }
    Object.defineProperty(Listening.prototype, "id", {
        get: function () {
            return this.listener._listenId;
        },
        enumerable: true,
        configurable: true
    });
    ;
    return Listening;
}(Events_1.Events));
exports.Listening = Listening;
