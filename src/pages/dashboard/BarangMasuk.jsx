import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
} from "@material-tailwind/react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

export function BarangMasuk() {
  const [inventory, setInventory] = useState([]);
  const [kode, setKode] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState(null);

  const API_URL = 'https://api-pharmacy.silendas.my.id/api';
  const token = localStorage.getItem('authToken');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  useEffect(() => {
    fetchInventory();
    fetchEmployee();
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
      console.log('API Response:', response.data);
      setInventory(response.data || []);
    } catch (error) {
      console.error('Error details:', error.response || error);
      setError(error.response?.data?.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const inventoryData = {
      kode,
      name,
      price: parseInt(price),
      stock: parseInt(stock),
      employee_id: employee?.id
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/inventories/${editingId}`, inventoryData, { headers });
        alert('Item updated successfully!');
      } else {
        await axios.post(`${API_URL}/inventories`, inventoryData, { headers });
        alert('Item added successfully!');
      }
      await fetchInventory();
      resetForm();
    } catch (error) {
      setError('Failed to save inventory item');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setKode('');
    setName('');
    setPrice('');
    setStock('');
    setEditingId(null);
  };

  const handleEdit = async (item) => {
    setEditingId(item.id);
    setKode(item.kode);
    setName(item.name);
    setPrice(item.price);
    setStock(item.stock);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`${API_URL}/inventories/${id}`, { headers });
        alert('Item deleted successfully!');
        await fetchInventory();
      } catch (error) {
        setError('Failed to delete item');
      }
    }
  };

  return (
    <>
      <Card className="mt-20">
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Information Inventory
          </Typography>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Kode</label>
                <input
                  type="text"
                  value={kode}
                  onChange={(e) => setKode(e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-300 rounded"
                  placeholder="Masukan Kode"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Nama</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-300 rounded"
                  placeholder="Masukan Nama"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Price</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-300 rounded"
                  placeholder="Masukan Harga"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Stock</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-300 rounded"
                  placeholder="Masukan Stock"
                  required
                />
              </div>
            </div>
            <div className="mt-4 text-center">
              <Button type="submit" className="bg-blue-600 text-white">
                {editingId ? 'Update' : 'Save'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

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
                  <th className="p-2">Price</th>
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
                      <Button
                        color="blue"
                        size="sm"
                        className="mr-2"
                        onClick={() => handleEdit(item)}
                      >
                        <PencilIcon className="h-4 w-4 inline mr-1" /> Edit
                      </Button>
                      <Button
                        color="red"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <TrashIcon className="h-4 w-4 inline mr-1" /> Delete
                      </Button>
                    </td>
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

export default BarangMasuk;
