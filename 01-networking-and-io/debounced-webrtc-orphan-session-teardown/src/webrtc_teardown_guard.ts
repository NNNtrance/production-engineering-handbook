export function createWebRtcTeardownGuard(
  onDisconnect: () => void,
  debounceMs: number = 2000
) {
  let hasHadMultiple = false;
  let teardownTimer: ReturnType<typeof setTimeout> | null = null;

  return {
    updateParticipants(count: number) {
      // 1. Latch multi-participant session state
      if (count >= 2) {
        hasHadMultiple = true;
        if (teardownTimer) {
          clearTimeout(teardownTimer);
          teardownTimer = null;
        }
        return;
      }

      // 2. Debounced teardown: protects against network flaps
      if (hasHadMultiple && count === 1) {
        if (!teardownTimer) {
          teardownTimer = setTimeout(() => {
            onDisconnect();
            teardownTimer = null;
          }, debounceMs);
        }
      }
    },
    dispose() {
      if (teardownTimer) {
        clearTimeout(teardownTimer);
        teardownTimer = null;
      }
    }
  };
}