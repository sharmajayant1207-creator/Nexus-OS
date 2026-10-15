import { useState, useEffect } from 'react';

export interface BatteryState {
  batteryLevel: number | null;
  isCharging: boolean;
  isSupported: boolean;
}

export function useBattery(): BatteryState {
  const [batteryState, setBatteryState] = useState<BatteryState>({
    batteryLevel: 100,
    isCharging: false,
    isSupported: false,
  });

  useEffect(() => {
    let batteryObj: any = null;

    const handleBatteryChange = (b: any) => {
      setBatteryState({
        batteryLevel: Math.round(b.level * 100),
        isCharging: b.charging,
        isSupported: true,
      });
    };

    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any)
        .getBattery()
        .then((b: any) => {
          batteryObj = b;
          handleBatteryChange(b);

          b.addEventListener('levelchange', () => handleBatteryChange(b));
          b.addEventListener('chargingchange', () => handleBatteryChange(b));
        })
        .catch(() => {
          setBatteryState({
            batteryLevel: 98,
            isCharging: false,
            isSupported: false,
          });
        });
    } else {
      setBatteryState({
        batteryLevel: 98,
        isCharging: false,
        isSupported: false,
      });
    }

    return () => {
      if (batteryObj) {
        try {
          batteryObj.removeEventListener('levelchange', () => handleBatteryChange(batteryObj));
          batteryObj.removeEventListener('chargingchange', () => handleBatteryChange(batteryObj));
        } catch {
          // Safe ignore cleanup errors
        }
      }
    };
  }, []);

  return batteryState;
}
