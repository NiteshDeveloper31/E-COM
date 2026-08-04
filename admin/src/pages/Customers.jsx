import React, { useState } from "react";
import { Eye, UserCheck, ShieldAlert, Award, Calendar, Phone, MapPin, ClipboardList, Download, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import { useData } from "../context/DataContext";
import { DataTable } from "../components/DataTable";
import { Drawer } from "../components/Drawer";

export const Customers = () => {
  const { customers, orders, updateCustomerStatus } = useData();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const formatINR = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  };

  const exportToExcel = () => {
    if (!customers || customers.length === 0) return;

    // Prepare data format for SheetJS
    const sheetData = customers.map((cust) => ({
      "Customer ID": cust.id || cust._id,
      "Name": cust.name,
      "Email": cust.email,
      "Phone": cust.phone || "N/A",
      "Registration Date": cust.registrationDate,
      "Total Orders": cust.totalOrders,
      "Total Spending (₹)": cust.totalSpending,
      "Status": cust.status
    }));

    // Create a new worksheet
    const worksheet = XLSX.utils.json_to_sheet(sheetData);

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

    // Auto-adjust column width for better visual presentation
    const maxColumnWidths = [];
    sheetData.forEach(row => {
      Object.keys(row).forEach((key, colIndex) => {
        const valueLength = String(row[key] || "").length;
        const keyLength = key.length;
        const width = Math.max(valueLength, keyLength) + 3;
        maxColumnWidths[colIndex] = Math.max(maxColumnWidths[colIndex] || 0, width);
      });
    });
    worksheet["!cols"] = maxColumnWidths.map(w => ({ wch: w }));

    // Write file as xlsx
    XLSX.writeFile(workbook, `Customers_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportToPDF = () => {
    if (!customers || customers.length === 0) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download PDF reports.");
      return;
    }
    const tableRows = customers.map((cust) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${cust.id || cust._id}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; color: #1e293b;">${cust.name}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${cust.email}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${cust.phone || "N/A"}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${cust.registrationDate}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">${cust.totalOrders}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0f172a;">₹${cust.totalSpending}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
          <span style="padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold; border: 1px solid ${cust.status === 'Active' ? '#bbf7d0' : '#fecdd3'};
            background-color: ${cust.status === 'Active' ? '#f0fdf4' : '#fff1f2'}; 
            color: ${cust.status === 'Active' ? '#15803d' : '#be123c'};">
            ${cust.status}
          </span>
        </td>
      </tr>
    `).join("");

    const htmlContent = `
      <html>
        <head>
          <title>Customer Report - ${new Date().toLocaleDateString("en-IN")}</title>
          <style>
            body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #334155; margin: 30px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 25px; }
            .header h1 { margin: 0; font-size: 24px; color: #0f172a; font-weight: 800; }
            .header p { margin: 5px 0 0 0; font-size: 12px; color: #64748b; font-weight: 500; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th { background-color: #0f172a; color: white; padding: 10px; text-align: left; border: 1px solid #e2e8f0; font-weight: bold; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; }
            .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 10px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>Customer Accounts Report</h1>
              <p>Generated on: ${new Date().toLocaleString("en-IN")}</p>
            </div>
            <div style="text-align: right;">
              <p style="font-weight: bold; color: #0f172a; margin: 0; font-size: 14px;">ReetSutra Admin</p>
              <p style="margin: 3px 0 0 0; font-size: 12px; color: #64748b;">Total Subscribers: ${customers.length}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined Date</th>
                <th style="text-align: center;">Orders</th>
                <th style="text-align: right;">Total Spend</th>
                <th style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div class="footer">
            <p>Confidential • ReetSutra Admin System Internal Report</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleOpenDrawer = async (cust) => {
    setSelectedCustomer({
      ...cust,
      addresses: cust.addresses || []
    });
    setIsDrawerOpen(true);

    try {
      const activeToken = localStorage.getItem("rs_admin_token");
      if (!activeToken) return;

      const response = await fetch(`http://localhost:5000/api/customers/${cust.id || cust._id}/addresses`, {
        headers: {
          "Authorization": `Bearer ${activeToken}`
        }
      });
      const resJson = await response.json();

      if (response.ok && resJson.success) {
        setSelectedCustomer((prev) => {
          if (prev && (prev.id === cust.id || prev._id === cust._id)) {
            return {
              ...prev,
              addresses: resJson.data || []
            };
          }
          return prev;
        });
      }
    } catch (err) {
      console.error("Failed to fetch customer addresses:", err);
    }
  };

  const handleStatusToggle = () => {
    if (selectedCustomer) {
      const nextStatus = selectedCustomer.status === "Active" ? "Inactive" : "Active";
      updateCustomerStatus(selectedCustomer.id, nextStatus);
      setSelectedCustomer((prev) => ({ ...prev, status: nextStatus }));
    }
  };

  // Find orders belonging to the selected customer
  const customerOrders = selectedCustomer
    ? orders.filter((o) => o.customerId === selectedCustomer.id)
    : [];

  const filterOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" }
  ];

  // Table Columns
  const columns = [
    {
      key: "name",
      header: "Customer Details",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/5 text-primary flex items-center justify-center font-display font-bold text-sm uppercase">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-charcoal text-sm">{row.name}</p>
            <span className="text-[10px] text-charcoal-light font-medium">{row.email}</span>
          </div>
        </div>
      )
    },
    {
      key: "registrationDate",
      header: "Joined Date",
      render: (row) => (
        <span className="text-xs text-charcoal-light font-semibold">
          {row.registrationDate}
        </span>
      )
    },
    {
      key: "totalOrders",
      header: "Orders count",
      render: (row) => (
        <span className="text-xs text-primary font-bold">
          {row.totalOrders} orders
        </span>
      )
    },
    {
      key: "totalSpending",
      header: "Total Spend",
      render: (row) => (
        <span className="text-sm text-primary font-bold">
          {formatINR(row.totalSpending)}
        </span>
      )
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span
          className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
            row.status === "Active"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {row.status}
        </span>
      )
    }
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-primary leading-tight">
            Customer Management
          </h1>
          <p className="text-sm text-charcoal-light font-medium">
            Monitor subscriber lists, audit customer profiles, address books, and order logs.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-all cursor-pointer shadow-sm"
          >
            <Download size={14} /> Export Excel
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-all cursor-pointer shadow-sm"
          >
            <FileText size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* Customers Data Table */}
      <DataTable
        columns={columns}
        data={customers}
        searchKey="name"
        searchPlaceholder="Search customer by name..."
        filterKey="status"
        filterPlaceholder="All Account Statuses"
        filterOptions={filterOptions}
        renderActions={(row) => (
          <button
            onClick={() => handleOpenDrawer(row)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary/10 text-xs font-bold text-primary hover:bg-primary/5 hover:border-primary transition-all cursor-pointer"
          >
            <Eye size={12} /> View Profile
          </button>
        )}
      />

      {/* Customer Profile slide-out Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Customer Profile View"
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="bg-primary text-white rounded-xl p-5 border border-primary-light flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-secondary text-primary flex items-center justify-center font-display font-bold text-xl shadow-md uppercase">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-xs text-white/70 font-semibold">{selectedCustomer.email}</p>
                </div>
              </div>

              {/* Status Action Switch */}
              <button
                onClick={handleStatusToggle}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCustomer.status === "Active"
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-rose-600 text-white hover:bg-rose-700"
                }`}
              >
                {selectedCustomer.status === "Active" ? (
                  <>
                    <UserCheck size={14} /> Active Account
                  </>
                ) : (
                  <>
                    <ShieldAlert size={14} /> Suspended Account
                  </>
                )}
              </button>
            </div>

            {/* Profile Overview Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-primary/5 p-4 rounded-xl space-y-1 text-center">
                <span className="text-[10px] font-bold text-charcoal-light uppercase tracking-wider block">Total Spent</span>
                <p className="text-lg font-bold text-primary">{formatINR(selectedCustomer.totalSpending)}</p>
                <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-sm inline-block">
                  <Award size={10} className="inline mr-0.5 -mt-0.5" /> High tier
                </span>
              </div>
              <div className="bg-white border border-primary/5 p-4 rounded-xl space-y-1 text-center">
                <span className="text-[10px] font-bold text-charcoal-light uppercase tracking-wider block">Total Orders</span>
                <p className="text-lg font-bold text-primary">{selectedCustomer.totalOrders} times</p>
                <span className="text-[10px] text-charcoal-light font-semibold">Average: ₹{selectedCustomer.totalOrders > 0 ? Math.round(selectedCustomer.totalSpending / selectedCustomer.totalOrders) : 0}/order</span>
              </div>
              <div className="bg-white border border-primary/5 p-4 rounded-xl space-y-1 text-center">
                <span className="text-[10px] font-bold text-charcoal-light uppercase tracking-wider block">Date Registered</span>
                <p className="text-base font-bold text-primary flex items-center justify-center gap-1 mt-1">
                  <Calendar size={14} className="text-secondary" />
                  {selectedCustomer.registrationDate}
                </p>
              </div>
            </div>

            {/* Contact Details & Address Book */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Contact Card */}
              <div className="bg-white border border-primary/5 p-4.5 rounded-xl space-y-3 flex flex-col justify-center">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Contact Information</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-charcoal-light">
                    <Phone size={14} className="text-secondary" />
                    <span className="font-semibold text-charcoal">{selectedCustomer.phone || "Not Provided"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-charcoal-light">
                    <ClipboardList size={14} className="text-secondary" />
                    <span className="font-medium">Registered Member</span>
                  </div>
                </div>
              </div>

              {/* Address Card */}
              <div className="bg-white border border-primary/5 p-4.5 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                  <MapPin size={14} className="text-secondary" />
                  <span>Addresses Log</span>
                </h4>
                <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                  {(selectedCustomer.addresses || []).map((addr) => (
                    <div key={addr.id || addr._id} className="p-2 border border-primary/5 bg-background/50 rounded-lg text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-primary uppercase text-[9px] bg-secondary/15 px-1.5 py-0.5 rounded-sm">
                          {addr.tag}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1 rounded-sm">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-charcoal leading-relaxed">
                        {addr.line}, {addr.city}, {addr.state} - {addr.zip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Past Orders Log */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Past Orders Log</h4>
              {customerOrders.length > 0 ? (
                <div className="bg-white border border-primary/5 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-primary/5 border-b border-primary/10">
                        <th className="px-4 py-2 text-xs font-bold uppercase text-primary">Order ID</th>
                        <th className="px-4 py-2 text-xs font-bold uppercase text-primary">Date</th>
                        <th className="px-4 py-2 text-xs font-bold uppercase text-primary">Total</th>
                        <th className="px-4 py-2 text-xs font-bold uppercase text-primary">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5 text-xs">
                      {customerOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-background/20 transition-colors">
                          <td className="px-4 py-2.5 font-bold text-primary">{ord.id}</td>
                          <td className="px-4 py-2.5 font-semibold text-charcoal-light">{ord.date}</td>
                          <td className="px-4 py-2.5 font-bold text-primary">{formatINR(ord.total)}</td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                                ord.orderStatus === "Delivered"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : ord.orderStatus === "Cancelled"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {ord.orderStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white border border-primary/5 p-8 text-center rounded-xl text-xs text-charcoal-light">
                  No orders registered for this customer.
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
};
export default Customers;
