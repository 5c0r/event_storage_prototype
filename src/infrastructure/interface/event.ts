import * as Mongoose from 'mongoose';

export interface IAmEvent {
}

export type ApplyEvent<T extends IAmEvent> = (ev: T) => void;

export interface AggregateEvent {
    ActionId: any;
    StreamId: any;
    Data: IAmEvent;
    Type: string;
    Version: Number;
    AppendDate: Date;
}

export type AggregateEventDbSchema = AggregateEvent & Mongoose.Document;
