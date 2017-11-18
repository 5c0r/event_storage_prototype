import * as Mongoose from 'mongoose';

export interface Event {
}

export interface ApplyEvent<T extends Event> {
    (ev: T): void;
}

export interface AggregateEvent {
    ActionId: any;
    StreamId: AAGUID;
    Data: Event;
    Type: string;
    Version: Number;
    AppendDate: Date;
}

export type AggregateEventDbSchema = AggregateEvent & Mongoose.Document;