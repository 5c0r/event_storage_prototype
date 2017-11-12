import { EventModel } from "./../infrastructure/db_schema/EventModel";
import { IRepository } from './../infrastructure/interface/storage/IRepository';
import { IAggregateEventDbSchema, IAggregateEvent, IEvent } from './../infrastructure/interface/IEvent';
import { IAggreateStreamState } from './../infrastructure/interface/IAggregate';
import { IMongooseInstance } from './../infrastructure/interface/storage/IMongoInstance';

import { AggregateBase } from './../infrastructure/interface/AggregateBase';
import { StreamStateBase } from './../infrastructure/interface/StreamStateBase';

import * as Mongoose from 'mongoose';

import { Observable as Observer } from 'rxjs';
import { Observable } from 'rxjs/Observable';

declare const emit: Function;

export class EventStorage<T1 extends AggregateBase> implements IRepository<T1> {

    constructor(private readonly mongoose: IMongooseInstance, private typeConstructor: { new(): T1 }) {

    }

    public startMongo(connString: string): void {

    }

    public startMongoUsingInstance(mongoInstance: IMongooseInstance) {

    }

    StartStream(aggregate: T1, withEvents?: any[]): void {
        try {
            const actionId = Math.random();
            aggregate._id = new Mongoose.Types.ObjectId();
            this.mongooseGuard();
            console.log('Creating new stream', aggregate._id);
            this.AppendStream(aggregate._id, aggregate.UncommittedEvents, true, aggregate.Version);
        } catch (error) {
            throw error;
        }
    }

    private fromEvents(events: IEvent[], streamId: any, actionId: number, start?: number): IAggregateEventDbSchema[] {
        return events.map((ev: IEvent, index) => this.fromEvent(streamId, ev, (start || 1) + index, actionId));
    }

    private fromEvent(streamId: any, ev: IEvent, version: number, actionId: number): IAggregateEventDbSchema {

        const eventModel: IAggregateEvent = {
            ActionId: actionId,
            Data: ev,
            AppendDate: new Date(),
            StreamId: streamId,
            Type: ev.constructor.name,
            Version: version
        }
        return new EventModel(eventModel);
    }

    private persistEvents(events: IAggregateEventDbSchema[]): Promise<IAggregateEventDbSchema[]> {
        return EventModel.insertMany(events).then(res => { console.log('persisted', res); return res; });
    }

    AppendStream(streamId: string, events: any[], newStream: boolean = false, version?: number): void {
        try {

            const actionId = Math.random();
            const streamState$ = newStream ? Observable.of(new StreamStateBase()) : this.GetStreamState(streamId).map((state: any) => {
                const innerExpectedVersion: number = version || (state.CurrentVersion + events.length);
                const outerExpectedVersion: number = state.CurrentVersion + events.length;

                console.log('outerExpected', state, state.CurrentVersion, events.length);

                if (innerExpectedVersion != outerExpectedVersion) {
                    throw new Error('Version mismatch !');
                }
                return state;
            });

            streamState$.subscribe((res: StreamStateBase) => {
                console.log('map streamstate', res);
                this.persistEvents(this.fromEvents(events, streamId, actionId, res.CurrentVersion));

            }, err => {
                throw new Error(err);
            })
        } catch (err) {
            throw new Error(`Error while appending stream ${streamId} ${err}`);
        }
    }

    SaveStream(aggregate: T1, version?: number): void {
        try {
            const actionId = Math.random();

            this.mongooseGuard();
            this.AppendStream(aggregate._id, aggregate.UncommittedEvents, false, aggregate.Version);
        } catch (err) {
            throw new Error(`Error while saving stream ${aggregate._id}`);
        }
    }

    GetStream(streamId: string, version?: number): Observable<T1> {
        // 1st approach , WORKING
        return this.GetEvents(streamId, version).map((res: IAggregateEventDbSchema[]): T1 => {
            const aggregate = new this.typeConstructor();
            console.log('building aggregate', streamId, aggregate);
            aggregate.create(streamId);
            res.forEach(event => aggregate.RaiseEvent(event.Data, event.Type, true))

            return aggregate;
        })
    }

    // What we call 'Aggregators'
    private buildAggregateFromEvents(events: IEvent[]): T1 {
        const aggregate = new this.typeConstructor();
        events.forEach((ev: any): void => aggregate.RaiseEvent(ev.Data, ev.Type, true));

        return aggregate;
    }

    GetStreamState(streamId: string): Observable<IAggreateStreamState> {
        try {
            // return this.GetEvents(streamId)
            //     .map((events: IEvent[]): IAggreateStreamState => new StreamStateBase(streamId, events.length));
            return Observer.fromPromise(
                EventModel.count({ StreamId: streamId })
                    .then((count: number) => {
                        if (count > 0) {
                            return new StreamStateBase(streamId, count);
                        } else {
                            throw new Error(`Invalid streamId ${streamId}`);
                        }
                    })
            );
        } catch (err) {
            return Observer.throw(err);
        }
    }

    GetEvents(streamId: string, version?: number): Observable<IEvent[]> {
        let query = EventModel.find({ StreamId: streamId });

        query = version ? query.where('Version').lte(version) : query;

        return Observer.fromPromise(query.sort({ Version: 1 }).then(res => {
            if (version && res.length != version) {
                throw new Error(`Invalid stream, Looking for version ${version} but only found ${res.length} events`);
            }
            return res;
        }));
    }

    private mongooseGuard(): void {
        if (!this.mongoose || this.mongoose == null) 
            throw new Error('No mongoose instance instantiated !');
    }

    public GetStreamWithMapReduce(streamId: any, version?: number): Observable<T1> {
        let query: { [key: string]: any } = {
            'StreamId': streamId,
        }

        if (version) {
            query['Version'] = {
                '$lt': version
            }
        }

        const mrOptions: Mongoose.ModelMapReduceOption<IAggregateEventDbSchema, Mongoose.Types.ObjectId, any> = {
            query: query,
            map: function map() {
                emit(this._id, { item: this })
            },
            reduce: function reduce(key, values) {
                var ret = { item: [] };
                var item = {};

                values.forEach(function (value: any) {
                    if (!item[value.item._id]) {
                        ret.item.push(value.item);
                        item[value._id] = true;
                    }
                })
                return ret;
            }
        }

        return Observable.fromPromise(EventModel.mapReduce(mrOptions).then(res => {
            if (res.length == 0) return null;

            //https://stackoverflow.com/questions/28149213/mongodb-mapreduce-method-unexpected-results#28161632
            const aggregate = new this.typeConstructor();
            res.map((item: any): IEvent => item.value.item).forEach((ev: any) => {
                aggregate.RaiseEvent(ev.Data, ev.Type, true);
            });

            return aggregate;
        }))
    }
}