import * as Mongoose from 'mongoose';
import { IEvent } from "./IEvent";

// TODO: other field as ObjectId
export interface IAggregateRoot {
    _id: any;
    Version: number;
    LastModified: Date;

    UncommittedEvents: IEvent[];
}

export interface IAggreateStreamState {
    StreamId: any;
    CurrentVersion: Number;
    // LatestSnapshot: Number;
}

export abstract class AggregateBase implements IAggregateRoot {
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

    public RaiseEvent(ev: IEvent, evType?: string, isFetching?: boolean) {
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

    private InvokeEvent<T extends IEvent>(event: T, evType?: string, isFetching?: boolean) {
        // console.log('Invoking event', event, typeof event, isFetching, this._eventRouter);
        this._eventRouter[evType || event.constructor.name](event);

        if (!isFetching) this._uncommittedEvents.push(event);

        this.Version++;
    }


}

export type IAggregateRootDbSchema = Mongoose.Document & IAggregateRoot;
