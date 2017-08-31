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
        try {
            this.mongooseGuard();
            const toSave = this.fromUncommittedEvents(aggregate);
            return Observer.fromPromise(this.persistEvents(toSave));
        } catch (error) {
            return Observable.throw(error);
        }

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

    // TODO
    AppendStream(streamId: string, events: any[], expectedVersion?: number): void {
        // Get state -> state => AppendVersion
        const state: any = {};

        let result = EventModel.count({ StreamId: streamId }).then(res => console.log('event count', res));

        const xpVersion: Number = expectedVersion || state.Version;
    }

    GetStream(streamId: string, version?: number): Observable<T1> {

        // TODO : Sort- Already sorted IIRC

        let query: { [key: string]: any } = {
            'StreamId': streamId,
        }

        if (version) {
            query['Version'] = {
                '$lt': version
            }
        }

        let mrOptions: Mongoose.ModelMapReduceOption<IAggregateEventDbSchema, Mongoose.Types.ObjectId, any> = {
            query: query,
            map: function map() {
                emit(this.StreamId, { item: this })
            },
            reduce: function reduce(key, values) {
                var ret = { item: [] };
                var item = {};
                values.forEach(function (value: any) {
                    if (!item[value.item.StreamId]) {
                        ret.item.push(value.item);
                        item[value.StreamId] = true;
                    }
                })
                return ret;
            }
        }

        return Observable.fromPromise(EventModel.mapReduce(mrOptions).then(res => {
            if (res.length == 0) return null;

            //https://stackoverflow.com/questions/28149213/mongodb-mapreduce-method-unexpected-results#28161632
            console.log('res', res);
            console.log('resevets', res[0].value);
            const aggregate = new this.typeConstructor();
            res[0].value.values.forEach((item: any) => {
                if (item.values) {
                    item.values.forEach((ev: any) => {
                        console.log('perItem', ev);
                        aggregate.RaiseEvent(ev.Data, ev.Type, true);
                    })
                } else {
                    let ev = item;
                    console.log('perEv', ev);
                    aggregate.RaiseEvent(ev.Data, ev.Type, true);
                }

            });

            return aggregate;
        }))

        // 1st approach , WORKING
        // return this.GetEvents(streamId, version).map((res: IAggregateEventDbSchema[]) => {
        //     const aggregate = new this.typeConstructor();

        //     res.forEach(event => aggregate.RaiseEvent(event.Data, event.Type, true))

        //     return aggregate;
        // })
    }

    // What we call 'Aggregators'
    private buildAggregateFromEvents(events: IEvent[]): T1 {
        const aggregate = new this.typeConstructor();
        events.forEach((ev: any): void => aggregate.RaiseEvent(ev.Data, ev.Type, true));

        return aggregate;
    }

    GetStreamState(streamId: string): Observable<IAggreateStreamState> {
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

        try {
            return Observable.fromPromise(EventModel.mapReduce(mrOptions));
        } catch (err) {
            return Observable.throw(err);
        }


    }

    GetEvents(streamId: string, version?: number): Observable<IEvent[]> {
        let query = EventModel.find({ StreamId: streamId });

        query = version ? query.where('Version').lte(version) : query;

        return Observer.fromPromise(query.sort({ Version: 1 }).then(res => res));
    }

    private mongooseGuard(): void {
        if (!this.mongoose) throw new Error('No mongoose instance instantiated !');
    }
}