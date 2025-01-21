import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, Mail, Phone, Globe, MapPin, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const CompanySupport = () => {
  const { companyId } = useParams();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCompany();
  }, [companyId]);

  const loadCompany = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .eq('is_verified', true)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Company not found');

      setCompany(data);
    } catch (err) {
      console.error('Error loading company:', err);
      setError(err.message || 'Failed to load company details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading company details...</div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Company Not Found</h2>
          <p className="mb-4">{error || 'This company does not exist or has not been verified.'}</p>
          <Link to="/" className="text-primary hover:underline">
            Return to Companies List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Company Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-6">
            {company.logo_url ? (
              <img
                src={`${supabase.storage.from('company-logos').getPublicUrl(company.logo_url).data.publicUrl}`}
                alt={company.company_name}
                className="w-20 h-20 rounded-lg object-cover"
              />
            ) : (
              <Building2 className="w-20 h-20 text-gray-400" />
            )}
            <div className="ml-6">
              <h1 className="text-3xl font-bold mb-2">{company.company_name}</h1>
              <p className="text-gray-600">{company.industry}</p>
            </div>
          </div>

          <p className="text-gray-700 mb-6">{company.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center text-gray-600">
              <Mail className="w-5 h-5 mr-2" />
              <span>{company.support_email}</span>
            </div>
            {company.phone && (
              <div className="flex items-center text-gray-600">
                <Phone className="w-5 h-5 mr-2" />
                <span>{company.phone}</span>
              </div>
            )}
            {company.website && (
              <div className="flex items-center text-gray-600">
                <Globe className="w-5 h-5 mr-2" />
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {new URL(company.website).hostname}
                </a>
              </div>
            )}
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-2" />
              <span>
                {company.city}, {company.country}
              </span>
            </div>
          </div>
        </div>

        {/* Support Options */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Get Support</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create Ticket */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Submit a Ticket</h3>
              <p className="text-gray-600 mb-4">
                Create a support ticket and our team will help you resolve your issue.
              </p>
              {user ? (
                <Link
                  to={`/submit-ticket?company=${companyId}`}
                  className="button button-primary w-full"
                >
                  Create Ticket
                </Link>
              ) : (
                <div className="space-y-4">
                  <Link
                    to={`/auth/register?company=${companyId}`}
                    className="button button-primary w-full"
                  >
                    Register to Create Ticket
                  </Link>
                  <p className="text-sm text-center text-gray-500">
                    Already have an account?{' '}
                    <Link
                      to={`/auth/login?redirect=/submit-ticket?company=${companyId}`}
                      className="text-primary hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <p className="text-gray-600">
                  You can also reach us through:
                </p>
                <div className="flex items-center text-gray-600">
                  <Mail className="w-5 h-5 mr-2" />
                  <a
                    href={`mailto:${company.support_email}`}
                    className="hover:underline"
                  >
                    {company.support_email}
                  </a>
                </div>
                {company.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-5 h-5 mr-2" />
                    <a
                      href={`tel:${company.phone}`}
                      className="hover:underline"
                    >
                      {company.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySupport; 