import * as Mongoose from 'mongoose';
import { IAmEvent } from './event';

// TODO: other field as ObjectId
export interface AggregateRoot {
    _id: any;
    Version: number;
    LastModified: Date;

    UncommittedEvents: IAmEvent[];
    CommittedEvents: IAmEvent[];
}

export interface AggreateStreamState {
    StreamId: any;
    CurrentVersion: Number;
}


export type AggregateRootDbSchema = Mongoose.Document & AggregateRoot;
