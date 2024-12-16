import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardBody, CardHeader, Typography, Button } from "@material-tailwind/react";
import { PencilIcon, TrashIcon, PrinterIcon } from "@heroicons/react/24/solid";
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';

const DaftarGaji = () => {
  const [gaji, setGaji] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [gajiAmount, setGajiAmount] = useState('');
  const [periode, setPeriode] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_URL = 'https://api-pharmacy.silendas.my.id/api';
  const token = localStorage.getItem('authToken');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetchEmployees();
    fetchGaji();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/employees`, { headers });
      setEmployees(response.data || []);
    } catch (error) {
      toast.error('Failed to load employees');
    }
  };

  const fetchGaji = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/salaries`, { headers });
      setGaji(response.data || []);
    } catch (error) {
      toast.error('Failed to load salaries');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const salaryData = { amount: gajiAmount, period: periode, payment_date: paymentDate, employee_id: selectedEmployeeId };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/salaries/${editingId}`, salaryData, { headers });
        toast.success('Salary updated successfully');
      } else {
        await axios.post(`${API_URL}/salaries`, salaryData, { headers });
        toast.success('Salary added successfully');
      }
      await fetchGaji();
      resetForm();
    } catch (error) {
      toast.error('Failed to save salary');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setGajiAmount('');
    setPeriode('');
    setPaymentDate('');
    setSelectedEmployeeId('');
    setEditingId(null);
  };

  const handleEdit = (salary) => {
    setEditingId(salary.id);
    setGajiAmount(salary.amount);
    setPeriode(salary.period);
    setPaymentDate(salary.payment_date);
    setSelectedEmployeeId(salary.employee_id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this salary?')) {
      try {
        await axios.delete(`${API_URL}/salaries/${id}`, { headers });
        toast.success('Salary deleted successfully');
        await fetchGaji();
      } catch (error) {
        toast.error('Failed to delete salary');
      }
    }
  };

  const generatePDF = (salary) => {
    const doc = new jsPDF();

    // Header Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PT Apoteker', 105, 20, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text('Laporan Gaji Karyawan', 105, 30, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(15, 35, 195, 35); // Garis horizontal di bawah header

    // Body Section: Tabel dengan Garis
    let startY = 50; // Posisi awal tabel
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');

    // Header tabel
    doc.text('Informasi Gaji', 15, startY - 10);
    doc.setDrawColor(0); // Hitam
    doc.setFillColor(220, 220, 220); // Abu-abu terang
    doc.rect(15, startY - 5, 180, 10, 'F'); // Header tabel dengan latar abu-abu
    doc.text('Field', 20, startY);
    doc.text('Detail', 120, startY);
    startY += 10;

    // Isi tabel
    doc.setFont('helvetica', 'normal');
    const fields = [
        { label: 'Nama Karyawan', value: salary.Employee?.name || '-' },
        { label: 'Gaji', value: `Rp ${salary.amount.toLocaleString('id-ID')}` },
        { label: 'Periode', value: salary.period },
        { label: 'Tanggal Pembayaran', value: salary.payment_date || '-' },
        { label: 'Metode Pembayaran', value: 'Transfer' },
    ];

    fields.forEach((field, index) => {
        doc.text(field.label, 20, startY);
        doc.text(field.value, 120, startY);
        doc.line(15, startY + 2, 195, startY + 2); // Garis horizontal antar baris
        startY += 10;
    });

    // Footer Section: Tanda Tangan
    doc.setFontSize(10);
    startY += 20;
    doc.text('Mengetahui,', 20, startY); // Mengetahui bagian HRD
    doc.text('Pihak Karyawan,', 140, startY); // Pihak karyawan di sisi kanan
    startY += 30;

    // Kotak tanda tangan
    doc.rect(20, startY, 50, 20); // Kotak untuk tanda tangan HRD
    doc.rect(140, startY, 50, 20); // Kotak untuk tanda tangan karyawan

    // Teks di dalam kotak
    doc.text('HRD', 45, startY + 15, { align: 'center' }); // Label untuk HRD
    doc.text(salary.Employee?.name || 'Nama Karyawan', 165, startY + 15, { align: 'center' }); // Nama Karyawan

    // Save PDF
    doc.save(`Gaji_${salary.Employee?.name || salary.employee_id}.pdf`);
};




    
  return (
    <>
      <Card className="mt-20">
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">Salary Data</Typography>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium">Employee</label>
              <select value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)} className="w-full p-2 mt-1 border border-gray-300 rounded" required>
                <option value="">Select Employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>{employee.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
              <div>
                <label className="block text-sm font-medium">Salary</label>
                <input type="number" value={gajiAmount} onChange={(e) => setGajiAmount(e.target.value)} className="w-full p-2 mt-1 border border-gray-300 rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium">Period</label>
                <input 
                  type="month" 
                  value={periode} 
                  onChange={(e) => setPeriode(e.target.value)} 
                  className="w-full p-2 mt-1 border border-gray-300 rounded" 
                  placeholder="e.g., January 2024" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Payment Date</label>
                <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full p-2 mt-1 border border-gray-300 rounded" required />
              </div>
            </div>

            <div className="mt-4 text-center">
              <Button type="submit" className="bg-blue-600 text-white">{editingId ? 'Update' : 'Save'}</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card className="mt-20">
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">Salary Data List</Typography>
        </CardHeader>
        <CardBody>
          {loading ? <div className="text-center">Loading...</div> : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Employee ID</th>
                    <th className="px-4 py-2 text-left">Nama</th>
                    <th className="px-4 py-2 text-left">Salary</th>
                    <th className="px-4 py-2 text-left">Period</th>
                    <th className="px-4 py-2 text-left">Payment Date</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {gaji.length > 0 ? gaji.map((salary) => (
                    <tr key={salary.id}>
                      <td className="px-4 py-2">{salary.employee_id}</td>
                      <td className="px-4 py-2">{salary.Employee.name}</td>
                      <td className="px-4 py-2">{salary.amount}</td>
                      <td className="px-4 py-2">{salary.period}</td>
                      <td className="px-4 py-2">{salary.payment_date}</td>
                      <td className="px-4 py-2">
                        <Button onClick={() => handleEdit(salary)} className="bg-yellow-500 text-white p-2">
                          <PencilIcon className="h-5 w-5" />
                        </Button>
                        <Button onClick={() => handleDelete(salary.id)} className="bg-red-600 text-white p-2 ml-2">
                          <TrashIcon className="h-5 w-5" />
                        </Button>
                        <Button onClick={() => generatePDF(salary)} className="bg-green-500 text-white p-2 ml-2">
                          <PrinterIcon className="h-5 w-5" />
                        </Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="text-center px-4 py-2">No salary data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
};

export default DaftarGaji;
