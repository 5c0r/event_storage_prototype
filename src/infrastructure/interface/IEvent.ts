import * as Mongoose from 'mongoose';

export interface IEvent {

}

export interface IAggregateEvent {
    StreamId: AAGUID;
    Data: IEvent;
    Type: string;
    AppendDate: Date;
}

export type IAggregateEventDbSchema = IAggregateEvent & Mongoose.Document;