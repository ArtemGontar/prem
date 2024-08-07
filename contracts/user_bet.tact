import "@stdlib/deploy";
import "./messages.tact";

contract UserBet with Deployable {
    const MinTonForStorage: Int = ton("0.01");
    owner: Address;
    parent: Address;
    betAmount: Int as uint64;
    outcome: Int as int8;
    isClaimed: Bool;

    init(owner: Address, parent: Address) {
        self.owner = owner;
        self.parent = parent;
        self.betAmount = 0;
        self.outcome = -1;
        self.isClaimed = false;
    }

    receive(msg: PlaceBetInternal) {
        require(sender() == self.parent, "Only the market can place a bet");
        require(self.outcome == -1 || self.outcome == msg.outcome, "Should be first bet or same outcome bet");
        self.outcome = msg.outcome;
        self.betAmount += msg.betAmount;

        // Transfer the bet amount to the contract
        send(SendParameters{
            to: self.owner,
            value: context().value - self.MinTonForStorage,
            mode: SendIgnoreErrors,
            body: "refund".asComment()
        });
    }

    receive("claimWinnings") {
        require(sender() == self.owner, "Only the owner can claim winnings");
        require(self.isClaimed == false, "Winnings already claimed");

        send(SendParameters{
            to: self.parent,
            value: 0,
            mode: SendRemainingValue + SendIgnoreErrors,
            body: ClaimWinningsInfo{
                outcome: self.outcome,
                betAmount: self.betAmount,
                walletAddress: sender()}.toCell()
        });
    }

    receive("claimWinningsInternal") {
        require(sender() == self.parent, "Only the market can call this function");
        require(self.isClaimed == false, "Winnings already claimed");

        self.isClaimed = true;
        send(SendParameters{
            to: self.owner,
            value: 0,
            mode: SendRemainingBalance + SendIgnoreErrors,
            body: "winning".asComment()
        });
    }

    bounced(src: Slice) {
        // ...
    }

    get fun userBet(): UserBetInfo {
        return UserBetInfo{
            betAmount: self.betAmount,
            outcome: self.outcome,
            isClaimed: self.isClaimed
        };
    }
}
