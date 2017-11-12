import * as Mongoose from 'mongoose';

export interface IEvent {
}

export interface IApplyEvent<T extends IEvent> {
    (ev: T): void;
}

export interface IAggregateEvent {
    ActionId: any;
    StreamId: AAGUID;
    Data: IEvent;
    Type: string;
    Version: Number;
    AppendDate: Date;
}

export type IAggregateEventDbSchema = IAggregateEvent & Mongoose.Document;