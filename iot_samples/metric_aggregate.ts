import { AggregateBase } from './../src/infrastructure/interface/AggregateBase';
import { EventBase } from './../src/infrastructure/interface/EventBase';

export class MetricAggregate extends AggregateBase {

    public Temperature: number;
    public Humidity: number;
    
    constructor() {
        super();
        // this.WireUpEvents();
    }

    WireUpEvents(): void {
        throw new Error("Method not implemented.");
    }

    // Setters


    //Appliers

}