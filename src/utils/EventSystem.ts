export class EventSystem {
    private listeners: Map<string, ((data: any) => Promise<void>)[]> = new Map();

    async emit(eventName: string, data: any): Promise<void> {
        const listeners = this.listeners.get(eventName) || [];
        await Promise.all(listeners.map(listener => listener(data)));
    }

    on(eventName: string, callback: (data: any) => Promise<void>): void {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName)!.push(callback);
    }
} 