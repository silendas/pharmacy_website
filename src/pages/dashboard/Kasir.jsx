import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf"; // Import jsPDF
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
  Select,
  Option,
} from "@material-tailwind/react";

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
    doc.setFontSize(12);
    doc.setFontSize(18);
    doc.text("Toko Pharmacy", 20, 20);
    const transactionNumber = "TRX-" + new Date().getTime();
    doc.setFontSize(12);
    doc.text(`No. Transaksi: ${transactionNumber}`, 20, 30);
    const cashierName = employees.find((emp) => emp.id === selectedEmployee)?.name || 'Unknown';
    doc.text(`Kasir: ${cashierName}`, 20, 40);
    doc.text(`Customer: ${selectedCustomerName}`, 20, 50);
    doc.text(`Tanggal: ${new Date().toLocaleDateString()}`, 20, 60);

    let yPosition = 70;
    doc.text("Items Purchased:", 20, yPosition);
    yPosition += 10;

    carts.forEach((cart, index) => {
      doc.text(`${cart.name} - Qty: ${cart.qty} - Rp ${cart.price.toLocaleString()} - Total: Rp ${cart.total_price.toLocaleString()}`, 20, yPosition);
      yPosition += 10;
    });

    doc.text(`Total: Rp ${totalPrice.toLocaleString()}`, 20, yPosition);
    yPosition += 10;
    doc.text("Terimakasih sudah berbelanja!", 20, yPosition);
    doc.save("invoice.pdf");
  };

  return (
    <Card className="mt-8">
      <CardHeader variant="gradient" color="gray" className="mb-4 p-4">
        <Typography variant="h6" color="white">
          Kasir - Input Transaksi
        </Typography>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Customer</label>
              <Select
                value={selectedCustomer}
                onChange={(value) => {
                  const customer = customers.find((cust) => cust.id === value);
                  handleCustomerSelect(value, customer.name);
                }}
                disabled={selectedCustomer}
                required
              >
                <Option value="">Pilih Customer</Option>
                {customers.map((customer) => (
                  <Option key={customer.id} value={customer.id}>
                    {customer.name}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium">Employee</label>
              <Select
                value={selectedEmployee}
                onChange={handleEmployeeSelect}
                required
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
              <label className="block text-sm font-medium">Inventory</label>
              <Select
                value={selectedInventory}
                onChange={(value) => setSelectedInventory(value)}
              >
                <Option value="">Pilih Barang</Option>
                {inventory.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.name} (Stok: {item.stock}) - Rp {item.price}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div className="mt-4">
              <Button type="button" onClick={handleAddToCart}>
                Tambah ke Keranjang
              </Button>
            </div>
          </div>

          <div className="mt-6">
            {selectedCustomerName && (
              <Typography variant="h6">Customer: {selectedCustomerName}</Typography>
            )}
            <Typography variant="h6">Keranjang (Struk)</Typography>
            {carts.length > 0 ? (
              <div className="space-y-4 p-4 border border-dashed">
                <div className="flex justify-between font-bold">
                  <div className="w-2/5">Nama</div>
                  <div className="w-1/5 text-center">Qty</div>
                  <div className="w-1/5 text-right">Harga</div>
                  <div className="w-1/5"></div>
                </div>
                {carts.map((cart) => (
                  <div key={cart.id} className="flex justify-between items-center">
                    <div className="w-2/5">{cart.name}</div>
                    <div className="w-1/5 text-center">{cart.qty}</div>
                    <div className="w-1/5 text-right">
                      Rp {cart.total_price.toLocaleString()}
                    </div>
                    <div className="w-1/5 flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleDeleteItem(cart.id)}
                        color="red"
                      >
                        Hapus
                      </Button>
                      <input
                        type="number"
                        value={cart.qty}
                        onChange={(e) =>
                          handleUpdateQuantity(cart.id, parseInt(e.target.value))
                        }
                        className="w-16 ml-2 p-1 text-center"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Typography variant="body2">Keranjang kosong</Typography>
            )}
            <div className="mt-4">
              <Typography variant="h6">Total: Rp {totalPrice.toLocaleString()}</Typography>
            </div>
            <div className="flex justify-between mt-4">
              <Button type="submit" disabled={loading || carts.length === 0}>
                {loading ? "Loading..." : "Bayar"}
              </Button>
              <Button type="button" onClick={generatePDF}>
                Download PDF
              </Button>
            </div>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

export default Kasir;
