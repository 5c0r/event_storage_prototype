import * as Mongoose from 'mongoose';


export interface IAggregateEvent {
    StreamId: AAGUID;
    Data: any;
    Type: string;
    AppendDate: Date;
}

export type IAggregateEventDbSchema = IAggregateEvent & Mongoose.Document;