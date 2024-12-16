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

export function Costumer() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [nik, setNik] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState(null); // New state for alerts
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const API_URL = 'https://api-pharmacy.silendas.my.id/api';
  const token = localStorage.getItem('authToken') || '';
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/customers`, { headers });
      setCustomers(response.data || []);
      setFilteredCustomers(response.data || []);
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to fetch customers' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(value) ||
      customer.nik.toLowerCase().includes(value)
    );
    setFilteredCustomers(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const customerData = {
      nik,
      name,
      phone,
      address,
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/customers/${editingId}`, customerData, { headers });
        setAlert({ type: 'success', message: 'Customer updated successfully!' });
      } else {
        await axios.post(`${API_URL}/customers`, customerData, { headers });
        setAlert({ type: 'success', message: 'Customer added successfully!' });
      }
      await fetchCustomers();
      resetForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save customer';
      setAlert({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNik('');
    setName('');
    setPhone('');
    setAddress('');
    setEditingId(null);
  };

  const handleEdit = (customer) => {
    setEditingId(customer.id);
    setNik(customer.nik);
    setName(customer.name);
    setPhone(customer.phone);
    setAddress(customer.address);
  };

  const openModal = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setDeleteId(null);
    setShowModal(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/customers/${deleteId}`, { headers });
      setAlert({ type: 'success', message: 'Customer deleted successfully!' });
      await fetchCustomers();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete customer';
      setAlert({ type: 'error', message: errorMessage });
    } finally {
      closeModal();
    }
  };

  return (
    <>
      {/* Alert Message */}
      {alert && (
        <div
          className={`p-4 mb-4 text-sm rounded-md ${alert.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
        >
          <div className="flex justify-between items-center">
            <span>{alert.message}</span>
            <Button
              size="sm"
              className="bg-transparent text-white"
              onClick={() => setAlert(null)} // Close alert manually
            >
              X
            </Button>
          </div>
        </div>
      )}

      <Card className="mt-20">
        <CardHeader variant="gradient" color="gray" className="mb-8 p-8">
          <Typography variant="h6" color="white">
            Information Customer
          </Typography>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">NIK</label>
                <input
                  type="text"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-300 rounded"
                  placeholder="Masukan NIK"
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
                <label className="block text-sm font-medium">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-300 rounded"
                  placeholder="Masukan No Telepon"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-300 rounded"
                  placeholder="Masukan Alamat"
                  required
                />
              </div>
            </div>
            <div className="mt-4 text-center">
              <Button type="submit" className="bg-lime-400 text-white">
                {editingId ? 'Update' : 'Save'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Customer Table */}
      <Card className="mt-20">
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <div className="flex justify-between items-center">
            <Typography variant="h6" color="white">
              Customer Table
            </Typography>
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              className="p-2 border border-gray-300 rounded text-black"
              placeholder="Search by NIK or Name"
            />
          </div>
        </CardHeader>
        <CardBody>
          {loading && (
            <div className="flex justify-center items-center">
              <div className="spinner-border text-blue-500" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-left">
              <thead>
                <tr>
                  <th className="p-2">No</th>
                  <th className="p-2">NIK</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Phone</th>
                  <th className="p-2">Address</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer, index) => (
                    <tr key={customer.id} className="border-b">
                      <td className="p-2">{index + 1}</td>
                      <td className="p-2">{customer.nik}</td>
                      <td className="p-2">{customer.name}</td>
                      <td className="p-2">{customer.phone}</td>
                      <td className="p-2">{customer.address}</td>
                      <td className="p-2">
                        <Button
                          className="bg-lime-400 text-white mr-2"
                          onClick={() => handleEdit(customer)}
                        >
                          <PencilIcon className="h-4 w-4 inline mr-1" /> Edit
                        </Button>
                        <Button
                          color="red"
                          onClick={() => openModal(customer.id)}
                        >
                          <TrashIcon className="h-4 w-4 inline mr-1" /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Modal Konfirmasi Hapus */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <Typography variant="h5" color="gray" className="mb-4">
              Konfirmasi Hapus
            </Typography>
            <Typography variant="body1" color="gray" className="mb-6">
              Apakah Anda yakin ingin menghapus customer ini?
            </Typography>
            <div className="flex justify-end">
              <Button
                color="gray"
                onClick={closeModal}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                color="red"
                onClick={handleDelete}
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}


      buatkan next page yang ditampilkan hanya 8 jika lebih dari 8 makan bisa dinextpage
    </>
  );
}

export default Costumer;
