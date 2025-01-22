import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import styles from './Companies.module.css';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [industries, setIndustries] = useState([]);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('is_verified', true);

      if (error) throw error;
      setCompanies(data || []);
      setIndustries([...new Set(data.map(company => company.industry))].filter(Boolean));
    } catch (err) {
      console.error('Error loading companies:', err);
      setError('Failed to load companies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = !selectedIndustry || company.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Find Support for Your Product</h1>
        <p className={styles.subtitle}>Connect with companies and get the support you need</p>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <div className={styles.searchInputWrapper}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className={styles.industrySelect}
          >
            <option value="">All Industries</option>
            {industries.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading companies...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No companies found</div>
        ) : (
          <div className={styles.companiesGrid}>
            {filteredCompanies.map((company) => (
              <div key={company.id} className={styles.companyCard}>
                <div className={styles.companyLogo}>
                  {company.logo_url ? (
                    <img
                      src={`${supabase.storage.from('company-logos').getPublicUrl(company.logo_url).data.publicUrl}`}
                      alt={company.name}
                    />
                  ) : (
                    <Building2 size={24} className="text-gray-400" />
                  )}
                </div>
                <h3 className={styles.companyName}>{company.name}</h3>
                <p className={styles.companyIndustry}>{company.industry}</p>
                <p className={styles.companyDescription}>{company.description}</p>
                <Link
                  to={`/support/${company.id}`}
                  className={styles.viewSupportButton}
                >
                  View Support
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Are you a company?</h2>
        <p className={styles.ctaDescription}>
          Register your company on AutoCRM to provide better support to your customers
        </p>
        <Link to="/company/register" className={styles.ctaButton}>
          Register Your Company
        </Link>
      </div>
    </div>
  );
};

export default Companies; 