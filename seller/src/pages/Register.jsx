import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiUpload, FiArrowLeft, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { sellerApi } from '../api/sellerApi';
import styles from '../styles/Register.module.css';

const LOGO_URL = '/logo.png';

function Register() {
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    mode: 'onTouched'
  });

  const watchPassword = watch('password');
  
  // Watch base64 document values for UI display
  const watchStoreLogo = watch('storeLogoUrl');
  const watchPanDoc = watch('panDocument');
  const watchChequeDoc = watch('cancelledCheque');

  const [logoName, setLogoName] = useState('');
  const [panDocName, setPanDocName] = useState('');
  const [chequeDocName, setChequeDocName] = useState('');

  const navigate = useNavigate();

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoName(file.name);
      const b64 = await convertToBase64(file);
      setValue('storeLogoUrl', b64);
    }
  };

  const handlePanChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPanDocName(file.name);
      const b64 = await convertToBase64(file);
      setValue('panDocument', b64);
    }
  };

  const handleChequeChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setChequeDocName(file.name);
      const b64 = await convertToBase64(file);
      setValue('cancelledCheque', b64);
    }
  };

  const onSubmit = async (data) => {
    if (step === 1) {
      setStep(2);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await sellerApi.register(data);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMsg(res.message || 'Registration failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during registration.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.successScreen}>
            <FiCheckCircle className={styles.successIcon} />
            <h2 className={styles.successTitle}>Application Submitted Successfully</h2>
            <p className={styles.successDesc}>
              Thank you for registering your business with Happy Sarees! Your application is currently under administrative review. We will verify your credentials and email you within 2-3 business days with your approval status.
            </p>
            <button className={styles.btnPrimary} onClick={() => navigate('/login')} style={{ marginTop: '16px' }}>
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Left side panel: Branded value proposition */}
      <div className={styles.sidePanel}>
        <div className={styles.sideHeader}>
          <img src={LOGO_URL} alt="Happy Sarees" className={styles.sideLogo} />
        </div>
        <div className={styles.sideContent}>
          <h1 className={styles.sideTitle}>Happy Sarees <br />Seller Portal</h1>
          <p className={styles.sideSubtitle}>
            Join India's premium destination for heritage handlooms. Connect directly with millions of saree shoppers, manage orders, and receive seamless settlements.
          </p>
          <div className={styles.sideFeatures}>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✨</span>
              <span>List catalog with dynamic Master Data options</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>📊</span>
              <span>Track sales, pending and delivered orders in real-time</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>💳</span>
              <span>Automatic payout engine with TCS tax compliance</span>
            </div>
          </div>
        </div>
        <div className={styles.sideFooter}>
          © 2026 Happy Sarees. All rights reserved.
        </div>
      </div>

      {/* Right side panel: Registration Forms */}
      <div className={styles.formPanel}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h2 className={styles.title}>Seller Studio Application</h2>
            <p className={styles.subtitle}>Register your business and showcase your weaves to millions.</p>
          </div>

          <div className={styles.stepIndicator}>
            <div className={`${styles.stepDot} ${step === 1 ? styles.stepDotActive : ''} ${step > 1 ? styles.stepDotCompleted : ''}`}>
              <span className={`${styles.stepNum} ${step === 1 ? styles.stepNumActive : ''} ${step > 1 ? styles.stepNumCompleted : ''}`}>
                {step > 1 ? <FiCheck /> : '1'}
              </span>
              <span>Business Details</span>
            </div>
            <div className={`${styles.stepLine} ${step > 1 ? styles.stepLineActive : ''}`} />
            <div className={`${styles.stepDot} ${step === 2 ? styles.stepDotActive : ''}`}>
              <span className={`${styles.stepNum} ${step === 2 ? styles.stepNumActive : ''}`}>2</span>
              <span>Documents & Bank Info</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.formBody}>
            {errorMsg && (
              <div className={styles.errorText} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--error-bg)', borderRadius: '8px', color: 'var(--error-color)', marginBottom: '20px' }}>
                <FiAlertCircle /> {errorMsg}
              </div>
            )}

            {step === 1 && (
              <div className={styles.grid}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Business / Company Name <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Silk Handlooms"
                    className={errors.businessName ? styles.inputError : ''}
                    {...register('businessName', { required: 'Business name is required' })}
                  />
                  {errors.businessName && <span className={styles.errorText}>{errors.businessName.message}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Owner Full Name <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Kumar"
                    className={errors.ownerName ? styles.inputError : ''}
                    {...register('ownerName', { required: 'Owner name is required' })}
                  />
                  {errors.ownerName && <span className={styles.errorText}>{errors.ownerName.message}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address <span className={styles.required}>*</span></label>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    className={errors.email ? styles.inputError : ''}
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                    })}
                  />
                  {errors.email && <span className={styles.errorText}>{errors.email.message}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Phone Number <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    placeholder="10-digit mobile number"
                    className={errors.phone ? styles.inputError : ''}
                    {...register('phone', { 
                      required: 'Phone is required',
                      pattern: { value: /^[0-9]{10}$/, message: 'Phone must be exactly 10 digits' }
                    })}
                  />
                  {errors.phone && <span className={styles.errorText}>{errors.phone.message}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Password <span className={styles.required}>*</span></label>
                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    className={errors.password ? styles.inputError : ''}
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                  />
                  {errors.password && <span className={styles.errorText}>{errors.password.message}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Confirm Password <span className={styles.required}>*</span></label>
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    className={errors.confirmPassword ? styles.inputError : ''}
                    {...register('confirmPassword', { 
                      required: 'Please confirm password',
                      validate: val => val === watchPassword || 'Passwords do not match'
                    })}
                  />
                  {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword.message}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Business Category / Seller Type</label>
                  <select {...register('businessCategory')}>
                    <option value="Handloom Atelier">Handloom Atelier (Master Seller)</option>
                    <option value="Cooperative Society">Seller Cooperative Society</option>
                    <option value="Boutique Brand">Designer Saree Boutique</option>
                    <option value="Artisan Weaver">Independent Artisan Seller</option>
                  </select>
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Business / Workshop Description</label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your weaving heritage, looms, and specialty sarees..."
                    {...register('businessDescription')}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className={styles.grid}>
                {/* GSTIN and PAN details */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>GSTIN (GST Number) <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    placeholder="15-character GSTIN"
                    className={errors.gstin ? styles.inputError : ''}
                    {...register('gstin', { 
                      required: 'GSTIN is required',
                      pattern: { value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Invalid GSTIN format' }
                    })}
                  />
                  {errors.gstin && <span className={styles.errorText}>{errors.gstin.message}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>PAN Number <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    placeholder="10-character PAN"
                    style={{ textTransform: 'uppercase' }}
                    className={errors.panNumber ? styles.inputError : ''}
                    {...register('panNumber', { 
                      required: 'PAN is required',
                      pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i, message: 'Invalid PAN format' }
                    })}
                  />
                  {errors.panNumber && <span className={styles.errorText}>{errors.panNumber.message}</span>}
                </div>

                {/* Document Uploads */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>GST Certificate (PDF/Image) <span className={styles.required}>*</span></label>
                  <div className={styles.fileUploadBox} onClick={() => document.getElementById('gst-upload').click()}>
                    <FiUpload />
                    <span className={styles.fileName}>
                      {watch('gst_file')?.[0] ? watch('gst_file')[0].name : 'Choose file...'}
                    </span>
                  </div>
                  <input
                    id="gst-upload"
                    type="file"
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    {...register('gst_file', { required: 'GST document is required' })}
                  />
                  {errors.gst_file && <span className={styles.errorText}>{errors.gst_file.message}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>PAN Document (PDF/Image) <span className={styles.required}>*</span></label>
                  <div className={styles.fileUploadBox} onClick={() => document.getElementById('pan-upload').click()}>
                    <FiUpload />
                    <span className={styles.fileName}>
                      {watch('pan_file')?.[0] ? watch('pan_file')[0].name : 'Choose file...'}
                    </span>
                  </div>
                  <input
                    id="pan-upload"
                    type="file"
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    {...register('pan_file', { required: 'PAN document is required' })}
                  />
                  {errors.pan_file && <span className={styles.errorText}>{errors.pan_file.message}</span>}
                </div>

                {/* Address block */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Street Address <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    placeholder="Seller society street, workshop lane..."
                    className={errors.streetAddress ? styles.inputError : ''}
                    {...register('streetAddress', { required: 'Street address is required' })}
                  />
                  {errors.streetAddress && <span className={styles.errorText}>{errors.streetAddress.message}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>City <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Kanchipuram"
                    className={errors.city ? styles.inputError : ''}
                    {...register('city', { required: 'City is required' })}
                  />
                  {errors.city && <span className={styles.errorText}>{errors.city.message}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>State <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Tamil Nadu"
                    className={styles.state ? styles.inputError : ''}
                    {...register('state', { required: 'State is required' })}
                  />
                  {errors.state && <span className={styles.errorText}>{errors.state.message}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Pincode <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    placeholder="6-digit pincode"
                    className={errors.pincode ? styles.inputError : ''}
                    {...register('pincode', { 
                      required: 'Pincode is required',
                      pattern: { value: /^[0-9]{6}$/, message: 'Pincode must be exactly 6 digits' }
                    })}
                  />
                  {errors.pincode && <span className={styles.errorText}>{errors.pincode.message}</span>}
                </div>

                {/* Bank details */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <h3 style={{ margin: '12px 0 4px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Settlement Bank Details</h3>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Account Holder Name <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    placeholder="Name in bank passbook"
                    className={errors.bankAccountName ? styles.inputError : ''}
                    {...register('bankAccountName', { required: 'Account name is required' })}
                  />
                  {errors.bankAccountName && <span className={styles.errorText}>{errors.bankAccountName.message}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Bank Account Number <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    placeholder="Savings/Current Account no."
                    className={errors.bankAccountNo ? styles.inputError : ''}
                    {...register('bankAccountNo', { required: 'Account number is required' })}
                  />
                  {errors.bankAccountNo && <span className={styles.errorText}>{errors.bankAccountNo.message}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Bank IFSC Code <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    placeholder="11-character IFSC"
                    style={{ textTransform: 'uppercase' }}
                    className={errors.bankIfsc ? styles.inputError : ''}
                    {...register('bankIfsc', { 
                      required: 'IFSC is required',
                      pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/i, message: 'Invalid IFSC code format' }
                    })}
                  />
                  {errors.bankIfsc && <span className={styles.errorText}>{errors.bankIfsc.message}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Bank Name <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. State Bank of India"
                    className={errors.bankName ? styles.inputError : ''}
                    {...register('bankName', { required: 'Bank name is required' })}
                  />
                  {errors.bankName && <span className={styles.errorText}>{errors.bankName.message}</span>}
                </div>
              </div>
            )}

            <div className={styles.formActions}>
              {step === 2 ? (
                <button type="button" className={styles.btnSecondary} onClick={() => setStep(1)} disabled={submitting}>
                  <FiArrowLeft style={{ marginRight: '6px' }} /> Back
                </button>
              ) : (
                <div />
              )}

              <button type="submit" className={styles.btnPrimary} disabled={submitting}>
                {step === 1 ? 'Continue' : (submitting ? 'Submitting...' : 'Submit Application')}
              </button>
            </div>

            <div className={styles.loginPrompt}>
              Already have a seller account? <Link to="/login" className={styles.link}>Login here</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
