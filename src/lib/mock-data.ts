export function getMockOperationalData() {
  return {
    shipment: [
      { id: "SHP-1001", route: "Makassar-Surabaya", status: "late", delayHours: 6 },
      { id: "SHP-1002", route: "Bitung-Jakarta", status: "ontime" },
      { id: "SHP-1003", route: "Ambon-Makassar", status: "late", delayHours: 3 },
    ],
    inventory: [
      { commodity: "Ikan Segar", stockTon: 82, reorderPoint: 60 },
      { commodity: "Udang Beku", stockTon: 45, reorderPoint: 50 },
    ],
    vendor: [
      { name: "CV Bahari Jaya", onTimeRate: 0.71 },
      { name: "PT Nusantara Fresh", onTimeRate: 0.94 },
    ],
    fuel: [
      { date: "2026-07-03", pricePerLiter: 11200 },
      { date: "2026-07-04", pricePerLiter: 11450 },
      { date: "2026-07-05", pricePerLiter: 11600 },
    ],
  };
}
