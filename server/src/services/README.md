folder: /src/service

# Services
The server side Services operates trough two different channels.
1. Syncronous Actions and Queries, managed by the 'ServiceHub'.
2. Reactive Event operations, managed by the 'bus'.


## Interfaces
Each Service has 4 interfaces defining respectively the Actions/Queries' Payloads/Returns.

## Event Listeners
Each Service defines his event listeners in the constructor. Each event will trigger a single method call that will execute the corresponding operation.

The event interfaces are found in the /service/bus.ts file.

### Shortcuts
To more directly respond to events the Services that requires it can attach an event listener directly to the socket during the 'player:login' event.
TBD how to keep it clean