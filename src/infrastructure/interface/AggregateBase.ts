import * as Mongoose from 'mongoose';
import { IEvent } from "./IEvent";

import { IAggregateRoot } from './IAggregate';

export abstract class AggregateBase implements IAggregateRoot {
    _id: any;
    Version: number = 1;
    LastModified: Date;

    private _eventRouter: { [type: string]: Function } = {};

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
        console.log('Raising Events', ev, evType);
        const className = evType || ev.constructor.name;
        if (!this._eventRouter[className]) {
            throw new Error(`No event router found for ${className}`);
        }
        this.InvokeEvent<typeof ev>(ev, evType, isFetching || false);
    }

    public RegisterEvent<T extends IEvent>(className: any, eventFunc: Function) {

        if (!this._eventRouter[className.name]) {
            this._eventRouter[className] = eventFunc;
        } else {
            throw new Error(`Event ${className} is registered already`);
        }
    }

    abstract WireUpEvents(): void;

    public readonly UncommittedEvents = this._uncommittedEvents;
    public readonly CommittedEvents = this._committedEvents;

    private InvokeEvent<T extends IEvent>(event: T, evType?: string, isFetching?: boolean) {
        // console.log('Invoking event', event, typeof event, isFetching, this._eventRouter);
        this._eventRouter[evType || event.constructor.name](event);

        if (!isFetching) this._uncommittedEvents.push(event);
        else this._committedEvents.push(event);

        this.Version++;
        // this.LastModified = event.
    }
}