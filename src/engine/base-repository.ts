import { EventModel } from './../infrastructure/db_schema/event-model';
import { Repository } from './../infrastructure/interface/storage/repository';
import { AggregateEvent, Event, AggregateEventDbSchema } from './../infrastructure/interface/event';
import { AggreateStreamState } from './../infrastructure/interface/aggregate';
import { MongooseInstance } from './../infrastructure/interface/storage/mongo-instance';

import { AggregateBase } from './../infrastructure/interface/aggregate-base';
import { StreamStateBase } from './../infrastructure/interface/stream-state-base';

import * as Mongoose from 'mongoose';

import { Observable as Observer } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { ObjectId } from 'bson';

// MongoDB javscript specific function
declare const emit: Function;

export class EventStorage<T1 extends AggregateBase> implements Repository<T1> {

    constructor(private readonly mongoose: MongooseInstance, private readonly typeConstructor: { new(): T1 }) {

    }

    public startMongo(connString: string): void {

    }

    public startMongoUsingInstance(mongoInstance: MongooseInstance) {

    }

    public startStream(aggregate: T1, withEvents?: any[]): ObjectId {
        try {
            const actionId = Math.random();
            aggregate._id = new Mongoose.Types.ObjectId();
            this.mongooseGuard();
            console.log('Creating new stream', aggregate._id);
            this.appendStream(aggregate._id, aggregate.UncommittedEvents, true, aggregate.Version);

            return aggregate._id;
        } catch (error) {
            throw error;
        }
    }

    private fromEvents(events: Event[], streamId: any, actionId: number, start?: number): AggregateEventDbSchema[] {
        return events.map((ev: Event, index) => this.fromEvent(streamId, ev, (start || 1) + index, actionId));
    }

    private fromEvent(streamId: any, ev: Event, version: number, actionId: number): AggregateEventDbSchema {

        const eventModel: AggregateEvent = {
            ActionId: actionId,
            Data: ev,
            AppendDate: new Date(),
            StreamId: streamId,
            Type: ev.constructor.name,
            Version: version
        }
        return new EventModel(eventModel);
    }

    private persistEvents(events: AggregateEventDbSchema[]): Promise<AggregateEventDbSchema[]> {
        return EventModel.insertMany(events).then(res => { console.log('persisted', res); return res; });
    }

    public appendStream(streamId: string, events: any[], newStream: boolean = false, version?: number): void {
        try {

            const actionId = Math.random();
            const streamState$ = newStream ? Observable.of(new StreamStateBase()) : this.getStreamState(streamId).map((state: any) => {
                const innerExpectedVersion: number = version || (state.CurrentVersion + events.length);
                const outerExpectedVersion: number = state.CurrentVersion + events.length;

                console.log('outerExpected', state, state.CurrentVersion, events.length);

                if (innerExpectedVersion != outerExpectedVersion) {
                    throw new Error('Stream version mismatch !');
                }
                return state;
            });

            streamState$.subscribe((res: StreamStateBase) => {
                this.persistEvents(this.fromEvents(events, streamId, actionId, res.CurrentVersion));

            }, err => {
                throw new Error(err);
            })
        } catch (err) {
            throw new Error(`Error while appending stream ${streamId} ${err}`);
        }
    }

    public saveStream(aggregate: T1, version?: number): void {
        try {
            const actionId = Math.random();

            this.mongooseGuard();
            this.appendStream(aggregate._id, aggregate.UncommittedEvents, false, aggregate.Version);
        } catch (err) {
            throw new Error(`Error while saving stream ${aggregate._id}`);
        }
    }

    public getStream(streamId: string, version?: number): Observable<T1> {
        // 1st approach , WORKING
        return this.getEvents(streamId, version).map((res: AggregateEventDbSchema[]): T1 => {
            const aggregate = new this.typeConstructor();
            console.log('building aggregate', streamId, aggregate);
            aggregate.create(streamId);
            res.forEach(event => aggregate.RaiseEvent(event.Data, event.Type, true))

            return aggregate;
        })
    }

    // What we call 'Aggregators'
    private buildAggregateFromEvents(events: Event[]): T1 {
        const aggregate = new this.typeConstructor();
        events.forEach((ev: any): void => aggregate.RaiseEvent(ev.Data, ev.Type, true));

        return aggregate;
    }

    public getStreamState(streamId: string): Observable<AggreateStreamState> {
        try {
            // return this.GetEvents(streamId)
            //     .map((events: Event[]): IAggreateStreamState => new StreamStateBase(streamId, events.length));
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

    public getEvents(streamId: string, version?: number): Observable<Event[]> {
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

    public getStreamWithMapReduce(streamId: any, version?: number): Observable<T1> {
        let query: { [key: string]: any } = {
            'StreamId': streamId,
        }

        if (version) {
            query['Version'] = {
                '$lt': version
            }
        }

        const mrOptions: Mongoose.ModelMapReduceOption<AggregateEventDbSchema, Mongoose.Types.ObjectId, any> = {
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
            res.map((item: any): Event => item.value.item).forEach((ev: any) => {
                aggregate.RaiseEvent(ev.Data, ev.Type, true);
            });

            return aggregate;
        }))
    }
}