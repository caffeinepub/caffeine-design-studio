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

  // ========== CUSTOMER ACCOUNT SYSTEM ==========

  type CustomerOrder = {
    orderId : Text;
    items : Text;
    total : Nat;
    paymentMethod : Text;
    timestamp : Time.Time;
  };

  type CustomerProfile = {
    sessionKey : Text;
    name : Text;
    email : Text;
    loyaltyPoints : Nat;
    totalOrders : Nat;
    referralCode : Text;
    joinedAt : Time.Time;
  };

  let customers = Map.empty<Text, CustomerProfile>();
  let customerOrders = Map.empty<Text, [CustomerOrder]>();

  public func registerCustomer(sessionKey : Text, name : Text, email : Text, referralCode : Text) : async CustomerProfile {
    if (sessionKey.isEmpty() or name.isEmpty()) {
      Runtime.trap("Session key and name are required");
    };
    switch (customers.get(sessionKey)) {
      case (?existing) { existing };
      case (null) {
        let profile : CustomerProfile = {
          sessionKey;
          name;
          email;
          loyaltyPoints = 0;
          totalOrders = 0;
          referralCode;
          joinedAt = Time.now();
        };
        customers.add(sessionKey, profile);
        customerOrders.add(sessionKey, []);
        profile;
      };
    };
  };

  public query func getCustomerProfile(sessionKey : Text) : async ?CustomerProfile {
    customers.get(sessionKey);
  };

  // Award bonus loyalty points to a customer who referred a new sign-up
  // referrerCode: the referral code of the person who referred the new customer
  // bonusPoints: points to award (typically 50)
  public func awardReferralBonus(referrerCode : Text, bonusPoints : Nat) : async Bool {
    // Find customer with matching referral code
    var found = false;
    for ((key, profile) in customers.entries()) {
      if (profile.referralCode == referrerCode and not found) {
        let updated : CustomerProfile = {
          sessionKey = profile.sessionKey;
          name = profile.name;
          email = profile.email;
          loyaltyPoints = profile.loyaltyPoints + bonusPoints;
          totalOrders = profile.totalOrders;
          referralCode = profile.referralCode;
          joinedAt = profile.joinedAt;
        };
        customers.add(key, updated);
        found := true;
      };
    };
    found;
  };

  public func addOrderToHistory(sessionKey : Text, orderId : Text, items : Text, total : Nat, paymentMethod : Text) : async CustomerProfile {
    switch (customers.get(sessionKey)) {
      case (null) { Runtime.trap("Customer not found") };
      case (?profile) {
        let newOrder : CustomerOrder = {
          orderId;
          items;
          total;
          paymentMethod;
          timestamp = Time.now();
        };
        let existing = switch (customerOrders.get(sessionKey)) {
          case (null) { [] };
          case (?arr) { arr };
        };
        let combined = existing.concat([newOrder]);
        customerOrders.add(sessionKey, combined);
        let pointsEarned = 10;
        let updated : CustomerProfile = {
          sessionKey = profile.sessionKey;
          name = profile.name;
          email = profile.email;
          loyaltyPoints = profile.loyaltyPoints + pointsEarned;
          totalOrders = profile.totalOrders + 1;
          referralCode = profile.referralCode;
          joinedAt = profile.joinedAt;
        };
        customers.add(sessionKey, updated);
        updated;
      };
    };
  };

  public func redeemLoyaltyPoints(sessionKey : Text, pointsToRedeem : Nat) : async CustomerProfile {
    switch (customers.get(sessionKey)) {
      case (null) { Runtime.trap("Customer not found") };
      case (?profile) {
        if (profile.loyaltyPoints < pointsToRedeem) {
          Runtime.trap("Insufficient loyalty points");
        };
        let updated : CustomerProfile = {
          sessionKey = profile.sessionKey;
          name = profile.name;
          email = profile.email;
          loyaltyPoints = profile.loyaltyPoints - pointsToRedeem;
          totalOrders = profile.totalOrders;
          referralCode = profile.referralCode;
          joinedAt = profile.joinedAt;
        };
        customers.add(sessionKey, updated);
        updated;
      };
    };
  };

  public query func getOrderHistory(sessionKey : Text) : async [CustomerOrder] {
    switch (customerOrders.get(sessionKey)) {
      case (null) { [] };
      case (?orders) { orders };
    };
  };

  public query func getLeaderboard() : async [CustomerProfile] {
    let all = customers.values().toArray();
    all.sort(func(a : CustomerProfile, b : CustomerProfile) : Order.Order {
      if (b.loyaltyPoints > a.loyaltyPoints) { #greater }
      else if (b.loyaltyPoints < a.loyaltyPoints) { #less }
      else { #equal };
    });
  };
};
