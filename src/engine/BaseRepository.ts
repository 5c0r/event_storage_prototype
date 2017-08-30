// import { AggregateModel } from './../infrastructure/db_schema/AggregateModel';
import { EventModel } from "./../infrastructure/db_schema/EventModel";
import { AggregateBase } from './../infrastructure/interface/AggregateBase';
import { IRepository } from './../infrastructure/interface/storage/IRepository';
import { IAggregateEventDbSchema, IAggregateEvent, IEvent } from './../infrastructure/interface/IEvent';
import { IAggreateStreamState } from './../infrastructure/interface/IAggregate';
import { IMongooseInstance } from './../infrastructure/interface/storage/IMongoInstance';

import * as Mongoose from 'mongoose';

import { Observable as Observer } from 'rxjs';
import { Observable } from 'rxjs/Observable';

declare const emit: Function;

export class BaseRepository<T1 extends AggregateBase> implements IRepository<T1> {
    constructor(private readonly mongoose: IMongooseInstance, private typeConstructor: { new(): T1 }) {

    }

    StartStream(aggregate: T1, withEvents?: any[]): Observable<any> {
        this.mongooseGuard();
        const toSave = this.fromUncommittedEvents(aggregate);
        return Observer.fromPromise(this.persistEvents(toSave));
    }

    private fromUncommittedEvents(aggregate: T1): IAggregateEventDbSchema[] {
        return aggregate.UncommittedEvents.map((ev, index) => {
            const eventModel: IAggregateEvent = {
                Data: ev,
                AppendDate: new Date(),
                StreamId: aggregate._id,
                Type: ev.constructor.name,
                Version: index + 1
            }
            return new EventModel(eventModel);
        });
    }

    private persistEvents(toSave: IAggregateEventDbSchema[]): Promise<IAggregateEventDbSchema[]> {
        return EventModel.insertMany(toSave);
    }

    AppendStream(streamId: string, events: any[], expectedVersion?: number): void {
        // Get state -> state => AppendVersion


        const state: any = {};
        const xpVersion: Number = expectedVersion || state.Version;
        // Observable.fromP
    }

    GetStream(streamId: string, version?: Number): Observable<T1> {

        // TODO : Sort
        let mrOptions: Mongoose.ModelMapReduceOption<IAggregateEventDbSchema, any, any> = {
            map: function map() {
                emit(this.StreamId, { Type: this.Type, Data: this.Data, Version: this.Version })
            },
            query: {
                'StreamId': streamId
            },
            reduce: function reduce(key: any, values: any[]): any {
                return { StreamId: key, Events: values };
            }
        }

        return Observable.fromPromise(EventModel.mapReduce(mrOptions).then(res => {
            if (res.length == 0) return null;

            const aggregate = new this.typeConstructor();

            res[0].value.Events.forEach((ev: any) => {
                // console.log('perEvent', ev.Type, ev.Data);
                aggregate.RaiseEvent(ev.Data, ev.Type, true);
            });

            return aggregate;
        }))
    }

    GetStreamV1(streamId: string, version?: Number): Observable<T1> {
        return Observable.of(null);
    }

    private buildAggregateFromEvents(events: IEvent[]): T1 {
        const aggregate = new this.typeConstructor();

        events.forEach((ev: any): void => aggregate.RaiseEvent(ev.Data, ev.Type, true));

        return aggregate;
    }

    GetStreamState(streamId: string): Observable<IAggreateStreamState> {

        // TODO : Sort
        let mrOptions: Mongoose.ModelMapReduceOption<IAggregateEventDbSchema, any, IAggreateStreamState> = {
            map: function map() {
                emit(this.StreamId, { Type: this.Type, Data: this.Data, Version: this.Version })
            },
            query: {
                'StreamId': streamId
            },
            reduce: function reduce(key: any, values: any[]): IAggreateStreamState {
                return {
                    CurrentVersion: values.length,
                    StreamId: key
                };
            }
        }

        return Observable.fromPromise(EventModel.mapReduce(mrOptions).then(res => {
            if (res.length == 0) return null;

            return res;
        }))
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

    private readonly commandBuilder = (): any => {
        return {
            mapreduce: null
        }
    }
}