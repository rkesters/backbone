import * as _ from 'underscore';
import  {Listening} from "./Listening";

// An try-catch guarded #on function, to prevent poisoning the global
// `_listening` variable.
const tryCatchOn = function(obj, name, callback, context) {
    try {
        obj.on(name, callback, context);
    } catch (e) {
        return e;
    }
};
export class Events {

    private eventSplitter = /\s+/;
    private static  _listening:Listening;
    private _listeners;
    private _listenId: string;
    private _events;
    private _listeningTo;

    private eventsApi(iteratee, events, name, callback, opts) {
        var i = 0, names;
        if (name && typeof name === 'object') {
            // Handle event maps.
            if (callback !== void 0 && 'context' in opts && opts.context === void 0) opts.context = callback;
            for (names = _.keys(name); i < names.length ; i++) {
                events = this.eventsApi(iteratee, events, names[i], name[names[i]], opts);
            }
        } else if (name && this.eventSplitter.test(name)) {
            // Handle space-separated event names by delegating them individually.
            for (names = name.split(this.eventSplitter); i < names.length; i++) {
                events = iteratee(events, names[i], callback, opts);
            }
        } else {
            // Finally, standard events.
            events = iteratee(events, name, callback, opts);
        }
        return events;
    };

    public on(name, callback, context) {
        this._events = this.eventsApi(Events.onApi, this._events || {}, name, callback, {
            context: context,
            ctx: this,
            listening: Events._listening
        });

        if (Events._listening) {
            const listeners = this._listeners || (this._listeners = {});
            listeners[Events._listening.id] = Events._listening;
            // Allow the listening to use a counter, instead of tracking
            // callbacks for library interop
            Events._listening.interop = false;
        }

        return this;
    };

    public listenTo(obj, name, callback) {
        if (!obj) return this;
        const id:string = obj._listenId || (obj._listenId = _.uniqueId('l'));
        const listeningTo:({[id:string]: Listening}) = this._listeningTo || (this._listeningTo = {});
        let listening:Listening = Events._listening = listeningTo[id];

        // This object is not listening to any other events on `obj` yet.
        // Setup the necessary references to track the listening callbacks.
        if (!listening) {
            this._listenId || (this._listenId = _.uniqueId('l'));
            listening = Events._listening = listeningTo[id] = new Listening(this, obj);
        }

        // Bind callbacks on obj.
        const error = tryCatchOn(obj, name, callback, this);
        Events._listening = void 0;

        if (error) throw error;
        // If the target obj is not Backbone.Events, track events manually.
        if (listening.interop) listening.on(name, callback);

        return this;
    };

    private static onApi(events, name, callback, options) {
        if (callback) {
            const handlers = events[name] || (events[name] = []);
            const context = options.context, ctx = options.ctx, listening = options.listening;
            if (listening) listening.count++;

            handlers.push({callback: callback, context: context, ctx: context || ctx, listening: listening});
        }
        return events;
    };
}