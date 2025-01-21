import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, Save } from 'lucide-react';

const CompanySettings = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState({
    company_name: '',
    industry: '',
    description: '',
    website: '',
    support_email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    logo_url: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('admin_id', user.id)
        .single();

      if (error) throw error;
      setCompany(data);
    } catch (err) {
      console.error('Error loading company data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompany(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${company.id}-logo.${fileExt}`;
      
      // Upload logo
      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Update company record with new logo URL
      const { error: updateError } = await supabase
        .from('companies')
        .update({ logo_url: fileName })
        .eq('id', company.id);

      if (updateError) throw updateError;

      setCompany(prev => ({
        ...prev,
        logo_url: fileName
      }));

      setSuccessMessage('Logo updated successfully');
    } catch (err) {
      console.error('Error updating logo:', err);
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage('');

      const { error } = await supabase
        .from('companies')
        .update({
          company_name: company.company_name,
          industry: company.industry,
          description: company.description,
          website: company.website,
          support_email: company.support_email,
          phone: company.phone,
          address: company.address,
          city: company.city,
          state: company.state,
          country: company.country,
          postal_code: company.postal_code
        })
        .eq('id', company.id);

      if (error) throw error;
      setSuccessMessage('Settings saved successfully');
    } catch (err) {
      console.error('Error saving company settings:', err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading company settings...</div>;
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Company Settings</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-500 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Logo */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Company Logo</h2>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                {company.logo_url ? (
                  <img
                    src={`${supabase.storage.from('company-logos').getPublicUrl(company.logo_url).data.publicUrl}`}
                    alt={company.company_name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-gray-400">No logo</div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="button button-secondary cursor-pointer"
                >
                  Upload New Logo
                </label>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Company Name</label>
                <input
                  type="text"
                  name="company_name"
                  value={company.company_name}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="label">Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={company.industry}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Description</label>
                <textarea
                  name="description"
                  value={company.description}
                  onChange={handleChange}
                  className="input w-full h-24"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Website</label>
                <input
                  type="url"
                  name="website"
                  value={company.website}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">Support Email</label>
                <input
                  type="email"
                  name="support_email"
                  value={company.support_email}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={company.phone}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="label">Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={company.address}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">City</label>
                <input
                  type="text"
                  name="city"
                  value={company.city}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">State/Province</label>
                <input
                  type="text"
                  name="state"
                  value={company.state}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">Country</label>
                <input
                  type="text"
                  name="country"
                  value={company.country}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">Postal Code</label>
                <input
                  type="text"
                  name="postal_code"
                  value={company.postal_code}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="button button-primary"
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanySettings; 