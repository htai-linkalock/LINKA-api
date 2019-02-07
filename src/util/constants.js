const TrackingMode = {
  MODE_OFF : 0,     // Modem is Off
  MODE_THEFT : 1,     // Mode when lock is being stolen
  MODE_PERIOD_A : 2,      // Period A mode
  MODE_PERIOD_B : 3,      // Period B mode
  MODE_MANUAL : 4,      // Manual mode. Send commands to the modem through BLE
  MODE_THEFT_PENDING : 5  //When theft mode is requested, but we have not yet successfully connected to the server and entered theft mode
}

const TrackingStatus = {
  STATUS_OFF : 0,
  STATUS_ON : 1,
}

module.exports = {
	TrackingMode,
	TrackingStatus
}