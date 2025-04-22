import React, { useState } from 'react';
import { userSignup } from '../api/api';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await userSignup(formData);
      alert('Signup successful!');
      console.log(response.data); // Log the response data
    } catch (err) {
      console.error(err); // Log the error for debugging
      alert(err.response?.data?.error_message || 'An error occurred during signup.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Signup</h2>
      <input name="name" placeholder="Name" onChange={handleChange} required />
      <input name="contact" placeholder="Contact" onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit">Signup</button>
    </form>
  );
};

export default Signup;