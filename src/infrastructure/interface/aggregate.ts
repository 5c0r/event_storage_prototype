import * as Mongoose from 'mongoose';
import { Event } from './event';

// TODO: other field as ObjectId
export interface AggregateRoot {
    _id: any;
    Version: number;
    LastModified: Date;

    UncommittedEvents: Event[];
    CommittedEvents: Event[];
}

export interface AggreateStreamState {
    StreamId: any;
    CurrentVersion: Number;
}


export type AggregateRootDbSchema = Mongoose.Document & AggregateRoot;
