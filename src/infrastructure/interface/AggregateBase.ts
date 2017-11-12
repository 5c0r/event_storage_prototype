import * as Mongoose from 'mongoose';
import { IEvent, IApplyEvent } from "./IEvent";

import { IAggregateRoot } from './IAggregate';

export interface EventRouter {
    [type: string]: IApplyEvent<IEvent>;
}

export abstract class AggregateBase implements IAggregateRoot {
    _id: any;
    Version: number = 1;
    LastModified: Date;

    private _eventRouter: EventRouter = {};

    private _uncommittedEvents: IEvent[] = [];
    private _committedEvents: IEvent[] = [];

    constructor() {

    }

    public create(id: any, version?: number, lastModified?: Date) {
        this._id = id || new Mongoose.Types.ObjectId();
        this.Version = version || 1;
        // Not worked
        this.LastModified = lastModified;
    }

    public RaiseEvent(ev: IEvent, evType?: string, isFetching?: boolean) {
        // console.log('Raising Events', ev, evType);
        const className = evType || ev.constructor.name;
        if (!this._eventRouter[className]) {
            throw new Error(`No event router found for ${className}`);
        }
        this.InvokeEvent(ev, evType, isFetching || false);
    }

    public RegisterEvent<T extends IEvent>(className: any, eventFunc: IApplyEvent<T>) {
        if (!eventFunc) throw new Error(`Event applier for ${className} is undefined !`);

        if (!this._eventRouter[className.name]) {
            this._eventRouter[className] = eventFunc;
        } else {
            throw new Error(`Event ${className} is registered already`);
        }
    }

    public readonly UncommittedEvents = this._uncommittedEvents;
    public readonly CommittedEvents = this._committedEvents;

    private InvokeEvent(event: IEvent, evType?: string, isFetching?: boolean) {
        this._eventRouter[evType || event.constructor.name](event);

        if (!isFetching) this._uncommittedEvents.push(event);
        else this._committedEvents.push(event);

        this.Version++;
        // this.LastModified = event.
    }
}

