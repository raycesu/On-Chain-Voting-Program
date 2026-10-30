// voter_cast_vote
// Casts one vote while the poll is Open and inside its window.
// Signer: voter (rent payer for the receipt).
// Reads: global_config (Active), poll.
// Writes: poll_option.vote_count, vote_receipt (init).
// Seeds: ["vote-receipt", poll_id, voter].
// The receipt account is the double-vote lock. The poll account itself is not
// a vote counter, so ballots for different options do not share a write lock.
