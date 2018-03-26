import { Subject } from "rxjs/Subject";
import { Observable } from 'rxjs/Observable';
import { Message } from "../message/message.interface";
import { IHandle } from "../command/handle.interface";
import { Subscription } from "rxjs";
import { map } from "rxjs/operators";

export class MessageQueue {
    private readonly messagePipe = new Subject<Message>();
    public readonly GetInstance: Observable<Message> = this.messagePipe;

    private router: { [key: string]: Subscription } = {};
    public Router: { [key: string]: Subscription } = this.router;


    public Send<Message>(message: Message): void {
        this.messagePipe.next(message);
    }

    public Register(handler: IHandle<Message>): void {
        const msgSubscription = this.messagePipe
            .subscribe(message => handler.handle(message));

        if (this.router[`${handler.name}`]) throw new Error(`Already taken`);
        this.router[`${handler.name}`] = msgSubscription;
    }

    public UnRegister<T>(handler: IHandle<T>): void {
        delete this.router[`${handler.name}`];
    }
}