/**
 * shippingService.js
 * 
 * Pre-coded placeholder for future Shiprocket integration.
 * In the final phase, Shiprocket authentication and API endpoints will be added here.
 */

/**
 * Request shipment order registration on Shiprocket.
 * @param {object} order - Mongoose order object
 * @param {object} customer - Mongoose user object
 * @returns {Promise<object>} - Mock Shiprocket shipment registry response
 */
export const registerShipmentOrder = async (order, customer) => {
  // In the future:
  // const payload = formatShiprocketOrderPayload(order, customer);
  // const response = await shiprocketClient.post("/orders/create/adhoc", payload);
  // return response.data;

  console.log(`[SHIPPING SERVICE - MOCK]: Registering Shiprocket Shipment for Order: ${order._id}`);
  
  return {
    order_id: Math.floor(10000000 + Math.random() * 90000000),
    shipment_id: Math.floor(100000000 + Math.random() * 900000000),
    status: "NEW",
    status_code: 1,
    onboarding_completed_now: 0,
    awb_code: `SRKW_${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    courier_name: "Delhivery"
  };
};

/**
 * Retrieve tracking timeline status updates from Shiprocket.
 * @param {string} awbCode - Air Waybill tracking number
 * @returns {Promise<object>} - Mock tracking status timeline
 */
export const trackShipment = async (awbCode) => {
  console.log(`[SHIPPING SERVICE - MOCK]: Checking tracking for AWB: ${awbCode}`);
  
  return {
    awb: awbCode,
    status: "Shipped",
    courier: "Delhivery",
    etd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toDateString(), // 3 days from now
    tracking_history: [
      { activity: "Shipment Picked Up", location: "Noida Warehouse", date: new Date().toISOString() },
      { activity: "In Transit", location: "New Delhi Hub", date: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() }
    ]
  };
};
