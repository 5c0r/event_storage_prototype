import * as Mongoose from 'mongoose';
import { IEvent } from "./IEvent";

export interface IAggregateRoot {
    _id: any;
    Version: number;
    LastModified: Date;

    UncommittedEvents: IEvent[];
}

export interface IAggreateStreamState {
    StreamId: any;
    CurrentVersion: Number;
    LatestSnapshot: Number;
}

export class AggregateBase implements IAggregateRoot {
    _id: any;
    Version: number = 1;
    LastModified: Date;

    private _eventRouter: { [type: string]: Function } = {};
    private _uncommittedEvents: IEvent[] = [];

    constructor() {
        this.create(new Mongoose.Types.ObjectId(), 0, new Date());
    }

    create(id: any, version: number, lastModified: Date) {
        this._id = id || new Mongoose.Types.ObjectId();
        this.Version = version;
        this.LastModified = lastModified;
    }

    public RaiseEvent(ev: IEvent, isFetching: boolean = false) {
        const className = ev.constructor.name;
        if (!this._eventRouter[className]) {
            console.log(`No route found for event ${className}`);
            return;
        }
        this.InvokeEvent<typeof ev>(ev, isFetching);
    }

    public RegisterEvent<T extends IEvent>(className: any, eventFunc: Function) {

        if (!this._eventRouter[className.name]) {
            this._eventRouter[className] = eventFunc;
        } else {
            throw new Error(`Event ${className} is registered already`);
        }
    }

    public readonly UncommittedEvents = this._uncommittedEvents;

    private InvokeEvent<T extends IEvent>(event: T, isFetching: boolean) {
        console.log('Invoking event', event, isFetching);
        this._eventRouter[event.constructor.name](event);

        if (!isFetching) this._uncommittedEvents.push(event);

        this.Version++;
    }
}

export type IAggregateRootDbSchema = Mongoose.Document & IAggregateRoot;
