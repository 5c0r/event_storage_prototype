import { Message } from "./message.interface";

export class CreateBankAccount implements Message {
    public AccountId: string;
    public StartBalance: number;
}