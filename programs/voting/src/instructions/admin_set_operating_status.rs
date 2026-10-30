// admin_set_operating_status
// Kill switch. Moves GlobalConfig between Active and Halted.
// Signer: authority.
// Writes: global_config.
// Halted blocks poll creation and new votes. It does not erase existing tallies.
