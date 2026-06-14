import { create } from 'zustand';

export const MOCK_USERS = [
  {
    id: "CUST_007",
    name: "John Doe",
    email: "john@demo.com",
    phone: "111-111-1111",
    email_hash: "hash_john",
    phone_hash: "hash_phone_john",
    city: "New York",
    devices: [
      { id: "d1", name: "iPhone (Personal)", type: "mobile", identifiers: { device_id: "DEV_IPH_J", cookie_id: "CK_IPH_J", browser_id: "BRW_IPH_J" } },
      { id: "d2", name: "Android (Work)", type: "mobile", identifiers: { device_id: "DEV_AND_J", cookie_id: "CK_AND_J", browser_id: "BRW_AND_J" } },
      { id: "d3", name: "MacBook (Home)", type: "desktop", identifiers: { device_id: "DEV_MAC_J", cookie_id: "CK_MAC_J", browser_id: "BRW_MAC_J" } }
    ]
  },
  {
    id: "CUST_DEMO_002",
    name: "Jane Smith",
    email: "jane@demo.com",
    phone: "222-222-2222",
    email_hash: "hash_jane",
    phone_hash: "hash_phone_jane",
    city: "London",
    devices: [
      { id: "d1", name: "Pixel 8 (Personal)", type: "mobile", identifiers: { device_id: "DEV_PIX_S", cookie_id: "CK_PIX_S", browser_id: "BRW_PIX_S" } },
      { id: "d2", name: "iPad (Home)", type: "tablet", identifiers: { device_id: "DEV_IPAD_S", cookie_id: "CK_IPAD_S", browser_id: "BRW_IPAD_S" } },
      { id: "d3", name: "ThinkPad (Work)", type: "desktop", identifiers: { device_id: "DEV_TP_S", cookie_id: "CK_TP_S", browser_id: "BRW_TP_S" } }
    ]
  },
  {
    id: "CUST_DEMO_003",
    name: "Bob Wilson",
    email: "bob@demo.com",
    phone: "333-333-3333",
    email_hash: "hash_bob",
    phone_hash: "hash_phone_bob",
    city: "Sydney",
    devices: [
      { id: "d1", name: "Galaxy S23 (Personal)", type: "mobile", identifiers: { device_id: "DEV_GAL_B", cookie_id: "CK_GAL_B", browser_id: "BRW_GAL_B" } },
      { id: "d2", name: "iPhone (Work)", type: "mobile", identifiers: { device_id: "DEV_IPH_B", cookie_id: "CK_IPH_B", browser_id: "BRW_IPH_B" } },
      { id: "d3", name: "iMac (Home)", type: "desktop", identifiers: { device_id: "DEV_IMAC_B", cookie_id: "CK_IMAC_B", browser_id: "BRW_IMAC_B" } }
    ]
  }
];

export const useDemoStore = create((set, get) => ({
  demoEnabled: true,
  selectedUserId: MOCK_USERS[0].id,
  selectedDeviceId: MOCK_USERS[0].devices[0].id,
  
  setDemoEnabled: (enabled) => set({ demoEnabled: enabled }),
  setSelectedUser: (userId) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    set({ selectedUserId: userId, selectedDeviceId: user.devices[0].id });
  },
  setSelectedDevice: (deviceId) => set({ selectedDeviceId: deviceId }),

  getActiveUser: () => MOCK_USERS.find(u => u.id === get().selectedUserId),
  getActiveDevice: () => {
    const user = get().getActiveUser();
    return user.devices.find(d => d.id === get().selectedDeviceId);
  },
  getActiveIdentifiers: () => {
    if (!get().demoEnabled) return { device_id: "D88" };
    const device = get().getActiveDevice();
    return device ? device.identifiers : { device_id: "D88" };
  }
}));
