import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import { Card, CardBody, CardHeader, Typography, Button, Select, Option } from "@material-tailwind/react";

import 'jspdf-autotable';  // Import the plugin

export function Kasir() {
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [carts, setCarts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  const [selectedInventory, setSelectedInventory] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);
  const [changeAmount, setChangeAmount] = useState(0);

  const API_URL = "https://api-pharmacy.silendas.my.id/api";
  const token = localStorage.getItem("authToken");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    fetchCustomers();
    fetchInventory();
    fetchEmployees();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/customers`, { headers });
      setCustomers(response.data || []);
    } catch (error) {
      setError("Failed to fetch customers");
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await axios.get(`${API_URL}/inventories`, { headers });
      setInventory(response.data.filter((item) => item.stock > 0));
    } catch (error) {
      setError("Failed to fetch inventory");
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/employees`, { headers });
      setEmployees(response.data || []);
    } catch (error) {
      setError("Failed to fetch employees");
    }
  };

  const calculateTotalPrice = (updatedCarts) => {
    const total = updatedCarts.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
    setTotalPrice(total);
  };

  const handleAddToCart = () => {
    if (!selectedInventory || quantity <= 0) {
      alert("Please select an inventory and a valid quantity");
      return;
    }

    const inventoryItem = inventory.find((item) => item.id === selectedInventory);
    if (!inventoryItem) return;

    if (quantity > inventoryItem.stock) {
      alert("Stok tidak cukup!");
      return;
    }

    const newItem = {
      ...inventoryItem,
      qty: quantity,
      total_price: inventoryItem.price * quantity,
    };

    const updatedCarts = [...carts, newItem];
    setCarts(updatedCarts);
    calculateTotalPrice(updatedCarts);

    setSelectedInventory("");
    setQuantity(1);
  };

  const handleDeleteItem = (itemId) => {
    const updatedCarts = carts.filter((cart) => cart.id !== itemId);
    setCarts(updatedCarts);
    calculateTotalPrice(updatedCarts);
  };

  const handleUpdateQuantity = (itemId, newQty) => {
    if (newQty <= 0) return;

    const inventoryItem = inventory.find((item) => item.id === itemId);
    if (inventoryItem && newQty <= inventoryItem.stock) {
      const updatedCarts = carts.map((cart) =>
        cart.id === itemId ? { ...cart, qty: newQty, total_price: cart.price * newQty } : cart
      );
      setCarts(updatedCarts);
      calculateTotalPrice(updatedCarts);
    } else {
      alert("Stok tidak cukup!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const currentDate = new Date().toISOString().split('T')[0];

    const paymentData = {
      customer_id: selectedCustomer,
      employee_id: selectedEmployee,
      total_price: totalPrice,
      date: currentDate,
      carts: carts.map((item) => ({
        kode: item.kode,
        qty: item.qty,
        total_price: item.total_price,
      })),
    };

    try {
      const response = await axios.post(`${API_URL}/payments`, paymentData, { headers });
      alert("Payment added successfully!");
      setPayments([...payments, response.data]);
      resetForm();
    } catch (error) {
      if (error.response) {
        console.error("API Error:", error.response.data);
        setError(`Failed to save payment: ${error.response.data.message || "Unknown error"}`);
      } else {
        console.error("Network Error:", error);
        setError("Network error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCustomer("");
    setSelectedCustomerName("");
    setSelectedEmployee("");
    setCarts([]);
    setTotalPrice(0);
  };

  const handleCustomerSelect = (value, name) => {
    setSelectedCustomer(value);
    setSelectedCustomerName(name);
  };

  const handleEmployeeSelect = (value) => {
    setSelectedEmployee(value);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Set up font for receipt header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("Life Care Pharmacy", 20, 20);  // Pharmacy name in bold
  
    // Set the transaction number
    const transactionNumber = "TRX-" + new Date().getTime();
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`No. Transaksi: ${transactionNumber}`, 20, 30);
    
    // Cashier name
    const cashierName = employees.find((emp) => emp.id === selectedEmployee)?.name || 'Unknown';
    doc.text(`Kasir: ${cashierName}`, 20, 40);
    
    // Customer name
    doc.text(`Customer: ${selectedCustomerName}`, 20, 50);
  
    // Date of transaction
    doc.text(`Tanggal: ${new Date().toLocaleDateString()}`, 20, 60);
    
    // Draw a line after the header for separation
    doc.setLineWidth(0.5);
    doc.line(20, 65, 180, 65); 
  
    let yPosition = 70;
    doc.setFontSize(12);
    doc.text("Items Purchased:", 20, yPosition);
    yPosition += 10;
  
    // Create table for items with blue color scheme
    doc.autoTable({
      startY: yPosition,
      head: [['Nama', 'Qty', 'Harga', 'Total']],
      body: carts.map(cart => [
        cart.name, 
        cart.qty, 
        `Rp ${cart.price.toLocaleString()}`, 
        `Rp ${cart.total_price.toLocaleString()}`
      ]),
      theme: 'striped',  // Give a striped effect for better readability
      headStyles: {
        fillColor: [0, 0, 255],  // Blue header color
        fontSize: 10
      },
      bodyStyles: {
        fillColor: [240, 240, 255],  // Light blue body rows
        fontSize: 10,
      },
      margin: { left: 20, right: 20 },
    });
  
    yPosition = doc.lastAutoTable.finalY + 10;
    
    // Total price
    doc.setFontSize(12);
    doc.text(`Total: Rp ${totalPrice.toLocaleString()}`, 20, yPosition);
    
    // Uang yang dibayar (Amount Paid)
    const amountPaid = 500000;  // Replace with your actual value
    yPosition += 10;
    doc.text(`Uang yang dibayar: Rp ${amountPaid.toLocaleString()}`, 20, yPosition);
  
    // Kembalian (Change)
    const change = amountPaid - totalPrice;
    yPosition += 10;
    doc.text(`Kembalian: Rp ${change.toLocaleString()}`, 20, yPosition);
  
    // Add a message at the bottom
    yPosition += 10;
    doc.text("Terimakasih sudah berbelanja!", 20, yPosition);
  
    // Draw a line at the bottom to close the receipt
    yPosition += 10;
    doc.line(20, yPosition, 180, yPosition);
  
    // Save the file as PDF
    doc.save("invoice.pdf");
  };
  

  const handlePaidAmountChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setPaidAmount(value);
    setChangeAmount(value - totalPrice);
  };

  return (
    <>
    
   
    <Card className="mt-8">
      <CardHeader variant="gradient" color="gray" className="mb-4 p-4">
        <Typography variant="h6" color="white">
          Kasir - Input Transaksi
        </Typography>
      </CardHeader>
      <CardBody>
        {error && <div className="text-red-500">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 ">
            <div>
              <label className="block text-sm font-medium">Nama Customer</label>
              <Select
                value={selectedCustomer}
                onChange={(value) => {
                  const customer = customers.find((cust) => cust.id === value);
                  handleCustomerSelect(value, customer.name);
                }}
                disabled={selectedCustomer}
                required
                className="text-black"
              >
                <Option value="">Pilih Customer</Option>
                {customers.map((customer) => (
                  <Option key={customer.id} value={customer.id} className="text-black">
                    {customer.name}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium">Nama Karyawan</label>
              <Select
                value={selectedEmployee}
                onChange={handleEmployeeSelect}
                disabled={selectedEmployee}
                required
                className="text-black"
              >
                <Option value="">Pilih Pegawai</Option>
                {employees.map((employee) => (
                  <Option key={employee.id} value={employee.id}>
                    {employee.name}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium">Nama Barang</label>
              <Select
                value={selectedInventory}
                onChange={(value) => setSelectedInventory(value)} 
                className="text-black"
              >
                <Option>Pilih Barang</Option>
                {inventory.map((item) => (
                  <Option key={item.id} value={item.id} className="text-black">
                    {item.name} (Stok: {item.stock}) - Rp {item.price}
                  </Option>
                  
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium">Jumlah</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <Button
            type="button"
            variant="filled"
            className="mt-4 bg-black text-white"
            onClick={handleAddToCart}
          >
            Tambah Keranjang
          </Button>
        </form>

        {carts.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold ">Table Keranjang</h3>
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full text-sm border">
                <thead className="bg-black text-white ">
                  <tr>
                    <th className="border p-2">Nama</th>
                    <th className="border p-2">Qty</th>
                    <th className="border p-2">Harga</th>
                    <th className="border p-2">Total</th>
                    <th className="border p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {carts.map((item) => (
                    <tr key={item.id} className="text-center">
                      <td className="border p-2">{item.name}</td>
                      <td className="border p-2"> {item.qty}
                      </td>
                      <td className="border p-2">Rp {item.price}</td>
                      <td className="border p-2">Rp {item.total_price}</td>
                      <td className="border p-2">
                        <Button
                          variant="filled"
                          color="red"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          Hapus
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold text-xl">Total: Rp {totalPrice.toLocaleString()}</h3>
              <label className="block text-sm">Dibayar</label>
              <input
                type="number"
                value={paidAmount}
                onChange={handlePaidAmountChange}
                className="p-5 border rounded text-xl "
              />
              <div className="mt-2">
                <h4 className="text-sm font-semibold text-red-500">Kembalian: Rp {changeAmount.toLocaleString()}</h4>
              </div>
            </div>

            <div className="mt-4 flex">
              <Button onClick={generatePDF} color="lime">
                Cetak Struk
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="ml-4"
                color="black"
              >
                {loading ? "Processing..." : "Submit"}
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
    </>
  );
}

export default Kasir;
