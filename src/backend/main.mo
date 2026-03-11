import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

actor {
  type Design = {
    title : Text;
    data : Text;
    thumbnailUrl : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  module Design {
    public func compare(d1 : Design, d2 : Design) : Order.Order {
      Text.compare(d1.title, d2.title);
    };
  };

  type Key = (Principal, Nat);

  module Key {
    public func compare(key1 : Key, key2 : Key) : Order.Order {
      switch (Principal.compare(key1.0, key2.0)) {
        case (#equal) { Nat.compare(key1.1, key2.1) };
        case (order) { order };
      };
    };
  };

  let designs = Map.empty<Key, Design>();
  var nextId = 0;

  public shared ({ caller }) func saveDesign(title : Text, data : Text, thumbnailUrl : Text) : async Nat {
    if (title.isEmpty() or data.isEmpty()) {
      Runtime.trap("Title and data cannot be empty");
    };

    let id = nextId;
    let now = Time.now();
    let design : Design = {
      title;
      data;
      thumbnailUrl;
      createdAt = now;
      updatedAt = now;
    };

    designs.add((caller, id), design);
    nextId += 1;
    id;
  };

  public query ({ caller }) func getDesign(id : Nat) : async Design {
    switch (designs.get((caller, id))) {
      case (null) { Runtime.trap("Design not found") };
      case (?design) { design };
    };
  };

  public shared ({ caller }) func deleteDesign(id : Nat) : async () {
    if (not designs.containsKey((caller, id))) {
      Runtime.trap("Design not found");
    };
    designs.remove((caller, id));
  };

  public query ({ caller }) func listDesigns() : async [Design] {
    let userDesigns = designs.filter(
      func((key, _)) { key.0 == caller }
    );
    userDesigns.values().toArray().sort();
  };
};
