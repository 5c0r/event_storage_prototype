import * as Mongoose from 'mongoose';

export interface IEvent {
}

export interface IAggregateEvent {
    StreamId: AAGUID;
    Data: IEvent;
    Type: string;
    Version: Number;
    AppendDate: Date;
}

export type IAggregateEventDbSchema = IAggregateEvent & Mongoose.Document;