# Room service

Author: Jiri Kadlec

## Pseudokód
```
enum AvailableStates {
  FREE,
  OCCUPIED,
  CLEANING,
  OUT_OF_ORDER,
}

class RoomService {
  db; //přístup do databáze

  addRoom(int hotelId, int number, string type, int price, string desc, int capacity) {
    //zápis do databáze, vrácení id
    id = db.insertRoom(hotelId, number, type, price, desc, capacity, AvailableStates.FREE);

    room = new Room(id, number, type, price, desc, capacity, FreeState.instance);
    return room;
  }

  loadRoom(int id) {
    data = db.selectRoom(id);
    room = new Room(data.id, data.number, data.type, data.price, data.desc, data.capacity, stateFromName(data.state));

    return room;
  }

  stateFromName(AvailableStates state) {
    switch(state) {
    FREE => FreeState.instance,
    OCCUPIED => OccupiedState.instance,
    CLEANING => CleaningState.instance,
    OUT_OF_ORDER => OutOfOrderState.instance
    };
  }

  editRoom(int id, changes) {
    room = loadRoom(id);
    if (!room.canModify()) {
      throw InvalidOperationException("Pokoj nelze upravit – není volný");
    }
    room.applyChanges(changes);   // mění atributy, ne stav
    db.saveRoom(id, room.number, room.type, room.price, room.desc, room.capacity, room.getState());
  }

  deleteRoom(int id) {
    room = loadRoom(id);
    if (!room.canModify()) {
      throw InvalidOperationException("Pokoj nelze odstranit – není volný");
    }
    db.deleteRoom(id);
  }

  changeState(int id, AvailableStates state) {
    room = loadRoom(id);
    switch(state) {
      OCCUPIED => room.occupy(),
      CLEANING => room.startCleaning(),
      FREE => room.makeFree(),
      OUT_OF_ORDER => room.markOutOfOrder()
    };
    db.saveRoom(id, room.number, room.type, room.price, room.desc, room.capacity, room.getState());
  }

  listRoomsByHotel(int hotelId) {
    return db.getRoomsByHotel(hotelId);
  }
}

class Room() {
  int id;
  int number { get; private set; }
  string type { get; private set; }
  int price { get; private set; }
  string desc { get; private set; }
  int capacity { get; private set; }
  IRoomState state;

  Room(int id, int number, string type, int price, string desc, int capacity, IRoomState state) {
    this.id = id;
    this.number = number;
    this.type = type;
    this.price = price;
    this.desc = desc;
    this.capacity = capacity;
    this.state = state;
  }

  //delegace
  occupy()         { state.occupy(this); }
  startCleaning()  { state.startCleaning(this); }
  makeFree()       { state.makeFree(this); }
  markOutOfOrder() { state.markOutOfOrder(this); }

  bool canModify() => state.canModify();

  setState(IRoomState state) {
    this.state = state;
  }

  AvailableStates getState() => state.name(); //vrátí název stavu (enum AvailableStates)

  applyChanges(changes) { /* number, type, price, desc, capacity */ }
}

interface IRoomState {
  occupy(Room room) {}
  startCleaning(Room room) {}
  makeFree(Room room) {}
  markOutOfOrder(Room room) {}
  AvailableStates name();
  bool canModify(); //rozhoduje zda se smí pokoj mazat/upravovat
}

class FreeState: IRoomState {
  public static readonly FreeState instance = new FreeState();
  private FreeState() {}

  AvailableStates name() => AvailableStates.FREE;
  bool canModify() => true;

  occupy(Room room) {
    room.setState(OccupiedState.instance); //volný -> obsazený
  }

  startCleaning(Room room) {
    throw InvalidOperationException("Volný pokoj netřeba uklízet");
  }

  makeFree(Room room) {
    throw InvalidOperationException("Pokoj je již volný");
  }

  markOutOfOrder(Room room) {
    room.setState(OutOfOrderState.instance); //volný -> mimo provoz
  }
}

class OccupiedState: IRoomState {
  public static readonly OccupiedState instance = new OccupiedState();
  private OccupiedState() {}

  AvailableStates name() => AvailableStates.OCCUPIED;
  bool canModify() => false;

  occupy(Room room) {
    throw InvalidOperationException("Pokoj je už obsazený");
  }

  startCleaning(Room room) {
    room.setState(CleaningState.instance); //obsazený -> uklízený
  }

  makeFree(Room room) {
    throw InvalidOperationException("Pokoj je obsazený, nejprve ukliďte");
  }

  markOutOfOrder(Room room) {
    room.setState(OutOfOrderState.instance); //obsazený -> mimo provoz
  }
}

class CleaningState: IRoomState {
  public static readonly CleaningState instance = new CleaningState();
  private CleaningState() {}

  AvailableStates name() => AvailableStates.CLEANING;
  bool canModify() => false;

  occupy(Room room) {
    throw InvalidOperationException("Pokoj se uklízí, nelze obsadit");
  }

  startCleaning(Room room) {
    throw InvalidOperationException("Pokoj se již uklízí");
  }

  makeFree(Room room) {
    room.setState(FreeState.instance); //uklízený -> volný
  }

  markOutOfOrder(Room room) {
    room.setState(OutOfOrderState.instance); //uklízený -> mimo provoz
  }
}

class OutOfOrderState: IRoomState {
  public static readonly OutOfOrderState instance = new OutOfOrderState();
  private OutOfOrderState() {}

  AvailableStates name() => AvailableStates.OUT_OF_ORDER;
  bool canModify() => true;

  occupy(Room room) {
    throw InvalidOperationException("Pokoj je mimo provoz, nelze obsadit");
  }

  startCleaning(Room room) {
    room.setState(CleaningState.instance); //mimo provoz -> uklízený
  }

  makeFree(Room room) {
    room.setState(FreeState.instance); //mimo provoz -> volný
  }

  markOutOfOrder(Room room) {
    throw InvalidOperationException("Pokoj je již mimo provoz");
  }
}

```
