// MarketFactory Messages
message CreateMarketResponse {
    address: Address;
}

message CreateMarket {
    eventDescription: String;
    eventType: String;
    endTime: Int as uint64;
    // need to rewrite it to map, but luck of examples/tools
    outcomeName1: String;
    outcomeName2: String;
    numOutcomes: Int as uint8;
}

// PredictionMarket Messages
message MarketInitialize {
    owner: Address;
    eventDescription: String;
    eventType: String;
    endTime: Int as uint64;
    // need to rewrite it to map, but luck of examples/tools
    outcomeName1: String;
    outcomeName2: String;
    numOutcomes: Int as uint8;
}

message PlaceBet {
    outcome: Int as int8;
}

message ResolveMarket {
    outcome: Int as int8;
}

message ClaimWinningsInfo {
    betAmount: Int as uint64;
    walletAddress: Address;
    outcome: Int as int8;
}

message PredictionMarketDetails {
    owner: Address;
    eventDescription: String;
    eventType: String;
    endTime: Int as uint64;
    // need to rewrite it to map, but luck of examples/tools
    outcomeName1: String;
    outcomeName2: String;
    numOutcomes: Int as uint8;
    totalOutcomeBets: map<Int as uint8, Int as uint64>;
    totalPool: Int as uint64;
    outcome: Int as int8;
    resolved: Bool;
}

// UserBet Messages
message PlaceBetInternal {
    outcome: Int as int8;
    betAmount: Int as uint64;
}

message UserBetInfo{
    outcome: Int as int8;
    betAmount: Int as uint64;
}

message ClaimWinningsInternal {
    resolved: Bool;
    winningOutcome: Int as uint8;
    totalPool: Int as uint64;
    totalOutcomeBets: Int as uint64;
}

