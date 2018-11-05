import * as Mongoose from 'mongoose';
import { Event, ApplyEvent } from './event';

import { AggregateRoot } from './aggregate';

export interface EventRouter {
    [type: string]: ApplyEvent<Event>;

    register?(): void;
}

export class SimpleRouter implements EventRouter {
    [type: string]: ApplyEvent<Event>;

    constructor() {

    }

    register(): void {
        throw new Error('Method not implemented.');
    }
}

export abstract class AggregateBase implements AggregateRoot {
    _id: any;
    Version: number = 1;
    LastModified: Date;

    private _eventRouter: EventRouter = {};

    private _uncommittedEvents: Event[] = [];
    private _committedEvents: Event[] = [];

    public readonly UncommittedEvents = this._uncommittedEvents;
    public readonly CommittedEvents = this._committedEvents;

    constructor() {

    }

    public create(id: any, version?: number, lastModified?: Date): void {
        this._id = id || new Mongoose.Types.ObjectId();
        this.Version = version || 1;
        // Not worked
        this.LastModified = lastModified;
    }

    public RaiseEvent(ev: Event, evType?: string, isFetching?: boolean): void {
        const className = evType || ev.constructor.name;
        if (!this._eventRouter[className]) {
            throw new Error(`No event router found for ${className}`);
        }
        this.InvokeEvent(ev, evType, isFetching || false);
    }

    public RegisterEvent(evType: any, eventFunc: ApplyEvent<Event>): void {
        const type = evType.name;

        if (!eventFunc) {
            throw new Error(`Event applier for ${type} is undefined !`);
        }

        if (!this._eventRouter[type]) {
            this._eventRouter[type] = eventFunc;
        } else {
            throw new Error(`Event ${type} is registered already`);
        }
    }



    private InvokeEvent(event: Event, evType?: string, isFetching?: boolean): void {
        this._eventRouter[evType || event.constructor.name](event);

        if (!isFetching) {
            this._uncommittedEvents.push(event);
        } else {
            this._committedEvents.push(event);
        }
        this.Version++;
    }
}

