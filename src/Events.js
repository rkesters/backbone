"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("underscore");
var Listening_1 = require("./Listening");
// An try-catch guarded #on function, to prevent poisoning the global
// `_listening` variable.
var tryCatchOn = function (obj, name, callback, context) {
    try {
        obj.on(name, callback, context);
    }
    catch (e) {
        return e;
    }
};
var Events = /** @class */ (function () {
    function Events() {
        this.eventSplitter = /\s+/;
    }
    Events.prototype.eventsApi = function (iteratee, events, name, callback, opts) {
        var i = 0, names;
        if (name && typeof name === 'object') {
            // Handle event maps.
            if (callback !== void 0 && 'context' in opts && opts.context === void 0)
                opts.context = callback;
            for (names = _.keys(name); i < names.length; i++) {
                events = this.eventsApi(iteratee, events, names[i], name[names[i]], opts);
            }
        }
        else if (name && this.eventSplitter.test(name)) {
            // Handle space-separated event names by delegating them individually.
            for (names = name.split(this.eventSplitter); i < names.length; i++) {
                events = iteratee(events, names[i], callback, opts);
            }
        }
        else {
            // Finally, standard events.
            events = iteratee(events, name, callback, opts);
        }
        return events;
    };
    ;
    Events.prototype.on = function (name, callback, context) {
        this._events = this.eventsApi(Events.onApi, this._events || {}, name, callback, {
            context: context,
            ctx: this,
            listening: Events._listening
        });
        if (Events._listening) {
            var listeners = this._listeners || (this._listeners = {});
            listeners[Events._listening.id] = Events._listening;
            // Allow the listening to use a counter, instead of tracking
            // callbacks for library interop
            Events._listening.interop = false;
        }
        return this;
    };
    ;
    Events.prototype.listenTo = function (obj, name, callback) {
        if (!obj)
            return this;
        var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
        var listeningTo = this._listeningTo || (this._listeningTo = {});
        var listening = Events._listening = listeningTo[id];
        // This object is not listening to any other events on `obj` yet.
        // Setup the necessary references to track the listening callbacks.
        if (!listening) {
            this._listenId || (this._listenId = _.uniqueId('l'));
            listening = Events._listening = listeningTo[id] = new Listening_1.Listening(this, obj);
        }
        // Bind callbacks on obj.
        var error = tryCatchOn(obj, name, callback, this);
        Events._listening = void 0;
        if (error)
            throw error;
        // If the target obj is not Backbone.Events, track events manually.
        if (listening.interop)
            listening.on(name, callback);
        return this;
    };
    ;
    Events.onApi = function (events, name, callback, options) {
        if (callback) {
            var handlers = events[name] || (events[name] = []);
            var context = options.context, ctx = options.ctx, listening = options.listening;
            if (listening)
                listening.count++;
            handlers.push({ callback: callback, context: context, ctx: context || ctx, listening: listening });
        }
        return events;
    };
    ;
    return Events;
}());
exports.Events = Events;
