import React, { useState } from 'react';
import { createComplaint } from '../api/api';

const CreateComplaint = () => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    address: '',
    district: '',
    state: '',
    pincode: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { user_id: 'your_user_id' }; // Replace with actual user_id
      const response = await createComplaint(formData, headers);
      alert('Complaint created successfully!');
    } catch (err) {
      alert(err.response.data.error_message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Complaint</h2>
      <input name="subject" placeholder="Subject" onChange={handleChange} required />
      <textarea name="description" placeholder="Description" onChange={handleChange} required />
      <input name="address" placeholder="Address" onChange={handleChange} required />
      <input name="district" placeholder="District" onChange={handleChange} required />
      <input name="state" placeholder="State" onChange={handleChange} required />
      <input name="pincode" placeholder="Pincode" onChange={handleChange} required />
      <button type="submit">Submit</button>
    </form>
  );
};

export default CreateComplaint;