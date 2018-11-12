import * as Mongoose from 'mongoose';
import { AggregateEventDbSchema } from './../interface/event';

const EventSchema = new Mongoose.Schema({
    ActionId: { type: Number, required: true },
    StreamId: { type: String, required: true, index: true },
    Data: { type: Object, required: true },
    Type: { type: String, required: true },
    AppendDate: { type: Date, required: true },
    Version: { type: Number, required: true }
})

const EventModel = Mongoose.model<AggregateEventDbSchema>('aggregate_events', EventSchema);

export { EventSchema, EventModel };
