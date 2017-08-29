import { inject } from 'inversify';
import { IAggregateRoot, IAggreateStreamState, IAggregateRootDbSchema } from './../../interface/IAggregate';
import { IAggregateEvent, IAggregateEventDbSchema } from './../../interface/IEvent';
import { IMongooseInstance } from './../../interface/storage/IMongoInstance';
import { AggregateModel } from './../../db_schema/AggregateModel';
import { EventModel, } from "./../../db_schema/EventModel";
import * as Mongoose from 'mongoose';

import { Observable as Observer } from 'rxjs';
import { Observable } from 'rxjs/Observable';


declare const emit: Function;

export interface IRepository<T extends IAggregateRoot, T1 extends IAggregateEvent> {

    StartStream(aggregate: T, withEvents?: T1[]): Observable<any>;

    AppendStream(streamId: AAGUID, events: T1[], expectedVersion?: number): void;

    GetStream(streamId: AAGUID, version?: Number): T;
    GetStreamState(streamId: AAGUID): Observable<IAggreateStreamState>;

    GetEvents(streamId: AAGUID, version?: Number): T1[];
}

export class BaseRepository implements IRepository<IAggregateRoot, any> {

    constructor(private readonly mongoose: IMongooseInstance) {

    }

    StartStream(aggregate: IAggregateRoot, withEvents?: any[]): Observable<any> {
        this.mongooseGuard();

        const toSave = aggregate.UncommittedEvents.map((ev, index) => {
            const eventModel: IAggregateEvent = {
                Data: ev,
                AppendDate: new Date(),
                StreamId: aggregate._id,
                Type: ev.constructor.name,
                Version: index + 1
            }
            const eventsToSave = new EventModel(eventModel);
            return eventsToSave;
        });

        return Observer.fromPromise(EventModel.insertMany(toSave));
        // .then(res => this.onEntitySave, err => this.onEntitySaveErr);
    }

    AppendStream(streamId: string, events: any[], expectedVersion?: number): void {
        // Get state -> state => AppendVersion


        const state: any = {};
        const xpVersion: Number = expectedVersion || state.Version;
        // Observable.fromP
    }

    GetStream(streamId: string, version?: Number): IAggregateRoot {
        throw new Error("Method not implemented.");
    }

    GetStreamState(streamId: string): Observable<IAggreateStreamState> {
        const searchQuery = {
            StreamId: streamId
        }

        EventModel.find(searchQuery).sort({
            Version: 1
        });

        return null;
    }

    GetEvents(streamId: string, version?: Number): any[] {
        throw new Error("Method not implemented.");
    }

    private buildAggregateFromStream(streamId: string, version?: Number): void {
        // Get stream state
        // Get events from stream
        // Build
    }

    private mongooseGuard(): void {
        if (!this.mongoose) throw new Error('No mongoose instance instantiated !');
    }


    private readonly onEntitySave = (item: any): void => {
        console.log('Saved entity', item.length || item);
    }

    private readonly onEntitySaveErr = (err: Error): void => {
        console.error('onEntitySaveERR', err);
    }


    private readonly mapFunc = (): void => {

    }

    private readonly reduceFunc = (key: any, value: any): void => {
        console.log('reducerFunc', key, value);
    }

    private readonly commandBuilder = (): any => {
        return {
            mapreduce: null
        }
    }

}