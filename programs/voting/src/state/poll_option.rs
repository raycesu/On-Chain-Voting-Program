// PollOption account.
// PDA seeds: ["poll-option", poll_id, option_index].
// Fields: poll, option_index, vote_count, label (fixed-size), bump, reserved padding.
// vote_count is the hot field. One option account per choice lets votes for
// different choices land in parallel.
