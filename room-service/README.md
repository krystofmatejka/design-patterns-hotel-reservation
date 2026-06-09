# Room service

Author: Jiri Kadlec

## Pseudokód
```
enum AvailableStates {
  FREE,
  OCCUPIED,
  CLEANING
}

class RoomService {
  db; //přístup do databáze

  addRoom(int hotelId, int number, string type, string desc, int capacity) {
    //zápis do databáze, vrácení id
    id = db.insertRoom(hotelId, number, type, desc, capacity, AvailableStates.FREE);

    room = new Room(id, number, type, desc, capacity, FreeState.instance);
    return room;
  }

  loadRoom(int id) {
    data = db.selectRoom(id);
    room = new Room(data.id, data.number, data.type, data.desc, data.capacity, stateFromName(data.state));

    return room;
  }

  stateFromName(AvailableStates state) {
    switch(state) {
    FREE => FreeState.instance,
    OCCUPIED => OccupiedState.instance,
    CLEANING => CleaningState.instance
    };
  }

  editRoom(int id, changes) {
    room = loadRoom(id);
    if (!room.canModify()) {
      throw InvalidOperationException("Pokoj nelze upravit – není volný");
    }
    room.applyChanges(changes);   // mění atributy, ne stav
    db.saveRoom(id, room.number, room.type, room.desc, room.capacity, room.getState());
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
      FREE => room.finishCleaning()
    };
    db.saveRoom(id, room.number, room.type, room.desc, room.capacity, room.getState());
  }

  listRoomsByHotel(int hotelId) {
    return db.getRoomsByHotel(hotelId);
  }
}

class Room() {
  int id;
  int number;
  string type;
  string desc;
  int capacity;
  IRoomState state;

  Room(int id, int number, string type, string desc, int capacity, IRoomState state) {
    this.id = id;
    this.number = number;
    this.type = type;
    this.desc = desc;
    this.capacity = capacity;
    this.state = state;
  }

  //delegace
  occupy()         { state.occupy(this); }
  startCleaning()  { state.startCleaning(this); }
  finishCleaning() { state.finishCleaning(this); }

  bool canModify() => state.canModify();

  setState(IRoomState state) {
    this.state = state;
  }

  AvailableStates getState() => state.name(); //vrátí název stavu (enum AvailableStates)

  applyChanges(changes) { /* number, type, desc, capacity */ }
}

interface IRoomState {
  occupy(Room room) {}
  startCleaning(Room room) {}
  finishCleaning(Room room) {}
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

  finishCleaning(Room room) {
    throw InvalidOperationException("Pokoj se neuklízí");
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

  finishCleaning(Room room) {
    throw InvalidOperationException("Pokoj se neuklízí");
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

  finishCleaning(Room room) {
    room.setState(FreeState.instance); //uklízený -> volný
  }
}

```
