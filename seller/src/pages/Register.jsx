import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiUpload, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
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
      <div className={styles.card}>
        <div className={styles.header}>
          <img src={LOGO_URL} alt="Happy Sarees" className={styles.logo} />
          <h2 className={styles.title}>Seller Studio</h2>
          <p className={styles.subtitle}>Register your business and showcase your weaves to millions.</p>
        </div>

        <div className={styles.stepIndicator}>
          <div className={`${styles.stepDot} ${step >= 1 ? styles.stepDotActive : ''}`}>
            <span className={`${styles.stepNum} ${step >= 1 ? styles.stepNumActive : ''}`}>1</span>
            <span>Business Credentials</span>
          </div>
          <div className={`${styles.stepDot} ${step >= 2 ? styles.stepDotActive : ''}`}>
            <span className={`${styles.stepNum} ${step >= 2 ? styles.stepNumActive : ''}`}>2</span>
            <span>Store Configuration</span>
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
                <label className={styles.label}>Contact Phone <span className={styles.required}>*</span></label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  className={errors.phone ? styles.inputError : ''}
                  {...register('phone', { 
                    required: 'Phone number is required',
                    pattern: { value: /^[0-9]{10}$/, message: 'Phone number must be exactly 10 digits' }
                  })}
                />
                {errors.phone && <span className={styles.errorText}>{errors.phone.message}</span>}
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Business Email Address <span className={styles.required}>*</span></label>
                <input
                  type="email"
                  placeholder="e.g. contact@royalsilks.com"
                  className={errors.email ? styles.inputError : ''}
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
                  })}
                />
                {errors.email && <span className={styles.errorText}>{errors.email.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Password <span className={styles.required}>*</span></label>
                <input
                  type="password"
                  placeholder="••••••••"
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
                  placeholder="••••••••"
                  className={errors.confirmPassword ? styles.inputError : ''}
                  {...register('confirmPassword', { 
                    required: 'Confirm password is required',
                    validate: value => value === watchPassword || 'Passwords do not match'
                  })}
                />
                {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword.message}</span>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.grid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>GSTIN (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 22AAAAA0000A1Z5"
                  {...register('gstin', {
                    pattern: { value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Invalid GSTIN format' }
                  })}
                />
                {errors.gstin && <span className={styles.errorText}>{errors.gstin.message}</span>}
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Brand Story / Description <span className={styles.required}>*</span></label>
                <textarea
                  placeholder="Tell customers about your brand legacy and weaving expertise..."
                  rows={3}
                  className={errors.businessDescription ? styles.inputError : ''}
                  {...register('businessDescription', { required: 'Business description is required' })}
                />
                {errors.businessDescription && <span className={styles.errorText}>{errors.businessDescription.message}</span>}
              </div>

              {/* Document upload fields */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Business Logo <span className={styles.required}>*</span></label>
                <label className={styles.fileUploadBox}>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
                  <FiUpload style={{ fontSize: '18px', color: 'var(--primary-color)' }} />
                  <span className={styles.fileName}>{logoName || 'Upload Store Logo'}</span>
                </label>
                {watchStoreLogo && <img src={watchStoreLogo} alt="Preview" className={styles.filePreview} style={{ maxHeight: '60px', width: 'auto', marginTop: '6px' }} />}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>PAN Document (Image/PDF) <span className={styles.required}>*</span></label>
                <label className={styles.fileUploadBox}>
                  <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={handlePanChange} />
                  <FiUpload style={{ fontSize: '18px', color: 'var(--primary-color)' }} />
                  <span className={styles.fileName}>{panDocName || 'Upload PAN Document'}</span>
                </label>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>PAN Card Number <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  placeholder="e.g. ABCDE1234F"
                  className={errors.panNumber ? styles.inputError : ''}
                  {...register('panNumber', { 
                    required: 'PAN number is required',
                    pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Invalid PAN number format' }
                  })}
                />
                {errors.panNumber && <span className={styles.errorText}>{errors.panNumber.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Cancelled Cheque Copy <span className={styles.required}>*</span></label>
                <label className={styles.fileUploadBox}>
                  <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={handleChequeChange} />
                  <FiUpload style={{ fontSize: '18px', color: 'var(--primary-color)' }} />
                  <span className={styles.fileName}>{chequeDocName || 'Upload Cheque Copy'}</span>
                </label>
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Pickup Street Address <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  placeholder="e.g. 12, Handloom Street, Weaver Colony"
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
                  className={errors.state ? styles.inputError : ''}
                  {...register('state', { required: 'State is required' })}
                />
                {errors.state && <span className={styles.errorText}>{errors.state.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Pincode <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  placeholder="e.g. 631501"
                  className={errors.pincode ? styles.inputError : ''}
                  {...register('pincode', { 
                    required: 'Pincode is required',
                    pattern: { value: /^[0-9]{6}$/, message: 'Pincode must be exactly 6 digits' }
                  })}
                />
                {errors.pincode && <span className={styles.errorText}>{errors.pincode.message}</span>}
              </div>

              {/* Bank Account */}
              <div className={`${styles.formGroup} ${styles.fullWidth}`} style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <span className={styles.label} style={{ fontSize: '13px', color: 'var(--primary-color)' }}>Bank Settlement Details</span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Account Holder Name <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Royal Silk Handlooms"
                  className={errors.bankAccountName ? styles.inputError : ''}
                  {...register('bankAccountName', { required: 'Account holder name is required' })}
                />
                {errors.bankAccountName && <span className={styles.errorText}>{errors.bankAccountName.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Bank Account Number <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  placeholder="e.g. 123456789012"
                  className={errors.bankAccountNo ? styles.inputError : ''}
                  {...register('bankAccountNo', { required: 'Account number is required' })}
                />
                {errors.bankAccountNo && <span className={styles.errorText}>{errors.bankAccountNo.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>IFSC Code <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  placeholder="e.g. SBIN0001234"
                  className={errors.bankIfsc ? styles.inputError : ''}
                  {...register('bankIfsc', { 
                    required: 'IFSC is required',
                    pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: 'Invalid IFSC format' }
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
  );
}

export default Register;
