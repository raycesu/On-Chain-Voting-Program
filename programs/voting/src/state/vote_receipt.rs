// VoteReceipt account.
// PDA seeds: ["vote-receipt", poll_id, voter].
// Fields: poll, voter, option_index, voted_at_unix_timestamp, bump, reserved padding.
// Creating this account is the one-vote-per-wallet check. A second cast fails
// because the PDA already exists.
