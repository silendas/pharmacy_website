import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardBody, CardHeader, Typography, Button } from '@material-tailwind/react';
import { PencilIcon } from '@heroicons/react/24/solid';
import * as XLSX from 'xlsx'; // Import for Excel Export

export function BarangKeluar() {
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]); // To track sales transactions
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState(null); // Current logged-in employee
  const API_URL = 'https://api-pharmacy.silendas.my.id/api';
  const token = localStorage.getItem('authToken');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  useEffect(() => {
    fetchInventory();
    fetchEmployee();
    fetchSales(); // Fetch sales transactions as well
  }, []);

  const fetchEmployee = async () => {
    try {
      const response = await axios.get(`${API_URL}/employee`, { headers });
      setEmployee(response.data);
    } catch (error) {
      console.error('Error fetching employee:', error);
    }
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/inventories`, { headers });
      setInventory(response.data || []);
    } catch (error) {
      setError('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await axios.get(`${API_URL}/sales`, { headers });
      setSales(response.data || []);
    } catch (error) {
      setError('Failed to fetch sales');
    }
  };

  // Handle sale, update stock, and record transaction
  const handleSale = async (itemId, quantitySold) => {
    const item = inventory.find(i => i.id === itemId);
    if (item && item.stock >= quantitySold) {
      try {
        // Update the stock in the inventory (reduce the stock by quantity sold)
        await axios.put(`${API_URL}/inventories/${itemId}`, {
          ...item,
          stock: item.stock - quantitySold
        }, { headers });

        // Record the sale transaction (barang keluar)
        await axios.post(`${API_URL}/sales`, {
          inventory_id: itemId,
          quantity: quantitySold,
          employee_id: employee?.id,
          date: new Date().toISOString(),
        }, { headers });

        alert('Sale recorded and stock updated!');
        fetchInventory();
        fetchSales(); // Refresh sales transactions
      } catch (error) {
        setError('Failed to record sale');
      }
    } else {
      setError('Insufficient stock');
    }
  };

  // Export data to Excel (Inventory and Sales data)
  const generateExcel = () => {
    const inventoryData = inventory.map(item => ({
      Kode: item.kode,
      Nama: item.name,
      Harga: item.price,
      Stock: item.stock,
    }));

    const salesData = sales.map(sale => ({
      Kode: sale.kode,
      Nama: sale.name,
      Quantity: sale.quantity,
      Employee: sale.employee_name,
      Date: sale.date,
    }));

    const wb = XLSX.utils.book_new();
    const wsInventory = XLSX.utils.json_to_sheet(inventoryData);
    const wsSales = XLSX.utils.json_to_sheet(salesData);

    XLSX.utils.book_append_sheet(wb, wsInventory, 'Inventory');
    XLSX.utils.book_append_sheet(wb, wsSales, 'Sales');

    XLSX.writeFile(wb, 'Inventory_and_Sales.xlsx');
  };

  return (
    <>
      <Card className="mt-20">
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Inventory Table
          </Typography>
        </CardHeader>
        <CardBody>
          {loading && <div className="text-center">Loading...</div>}
          {error && <div className="text-red-500 text-center">{error}</div>}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-left">
              <thead>
                <tr>
                  <th className="p-2">Kode</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Harga</th>
                  <th className="p-2">Stock</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2">{item.kode}</td>
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">{item.price}</td>
                    <td className="p-2">{item.stock}</td>
                    <td className="p-2">
                      {/* Add input for quantity sold (Barang Keluar) */}
                      <input
                        type="number"
                        className="w-20 p-2 border border-gray-300 rounded"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Qty"
                      />
                      <Button
                        color="green"
                        size="sm"
                        onClick={() => handleSale(item.id, parseInt(quantity))}
                      >
                        <PencilIcon className="h-4 w-4 inline mr-1" /> Record Sale
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button
            onClick={generateExcel}
            className="bg-green-600 text-white mt-4"
          >
            Export to Excel
          </Button>
        </CardBody>
      </Card>

      {/* Sales Table */}
      <Card className="mt-20">
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Sales Transactions
          </Typography>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-left">
              <thead>
                <tr>
                  <th className="p-2">Kode</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Quantity</th>
                  <th className="p-2">Employee</th>
                  <th className="p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="border-b">
                    <td className="p-2">{sale.kode}</td>
                    <td className="p-2">{sale.name}</td>
                    <td className="p-2">{sale.quantity}</td>
                    <td className="p-2">{sale.employee_name}</td>
                    <td className="p-2">{new Date(sale.date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </>
  );
}

export default BarangKeluar;
