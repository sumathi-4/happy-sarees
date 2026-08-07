const db = require('../../db');
const bcrypt = require('bcryptjs');

/**
 * Register a new seller and their documents in a transaction
 */
async function registerSeller(data) {
  const {
    businessName,
    ownerName,
    email,
    phone,
    password,
    businessCategory,
    businessDescription,
    gstin,
    panNumber,
    storeLogoUrl,
    storeBannerUrl,
    streetAddress,
    city,
    state,
    pincode,
    bankAccountName,
    bankAccountNo,
    bankIfsc,
    bankName,
    documents // Array of { doc_type, file_url }
  } = data;

  const passwordHash = await bcrypt.hash(password, 10);
  const storeName = businessName; // Default store name to business name
  const storeSlug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Check if email already registered
    const checkEmail = await client.query('SELECT id FROM sellers WHERE email = $1', [email]);
    if (checkEmail.rows.length > 0) {
      throw new Error('Email is already registered.');
    }

    // Insert seller
    const sellerQuery = `
      INSERT INTO sellers (
        business_name, store_name, store_slug, owner_name, email, password_hash, phone,
        business_category, business_description, gstin, pan_number, store_logo_url, store_banner_url,
        street_address, city, state, pincode, bank_account_name, bank_account_no, bank_ifsc, bank_name,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, 'pending')
      RETURNING id, business_name, store_name, owner_name, email, phone, status, created_at
    `;
    const sellerValues = [
      businessName, storeName, storeSlug, ownerName, email, passwordHash, phone,
      businessCategory, businessDescription, gstin, panNumber, storeLogoUrl, storeBannerUrl,
      streetAddress, city, state, pincode, bankAccountName, bankAccountNo, bankIfsc, bankName
    ];
    const sellerRes = await client.query(sellerQuery, sellerValues);
    const sellerId = sellerRes.rows[0].id;

    // Insert documents
    if (documents && Array.isArray(documents)) {
      for (const doc of documents) {
        if (doc.file_url) {
          await client.query(
            `INSERT INTO seller_documents (seller_id, doc_type, file_url) VALUES ($1, $2, $3)`,
            [sellerId, doc.doc_type, doc.file_url]
          );
        }
      }
    }

    // Create a notification for the seller
    await client.query(
      `INSERT INTO seller_notifications (seller_id, type, title, message)
       VALUES ($1, 'registration_status', $2, $3)`,
      [
        sellerId,
        'Application Submitted',
        'Your registration is currently under review by our administration. We will notify you once approved.'
      ]
    );

    // Create a notification for admins
    await client.query(
      `INSERT INTO admin_notifications (type, title, message, entity_type, entity_id)
       VALUES ('seller_request', 'New Seller Registration', $1, 'seller', $2)`,
      [`New seller request from "${businessName}"`, sellerId]
    );

    await client.query('COMMIT');
    return sellerRes.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Validate login credentials and fetch status details
 */
async function authenticateSeller(email, password) {
  const result = await db.query(
    `SELECT id, business_name, store_name, owner_name, email, password_hash, phone, status, rejection_reason 
     FROM sellers WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid email or password.');
  }

  const seller = result.rows[0];
  const isMatch = await bcrypt.compare(password, seller.password_hash);
  if (!isMatch) {
    throw new Error('Invalid email or password.');
  }

  // Remove password_hash from return payload
  delete seller.password_hash;
  return seller;
}

/**
 * Get full seller profile (including documents)
 */
async function getSellerProfile(sellerId) {
  const sellerRes = await db.query(
    `SELECT id, business_name, store_name, store_slug, owner_name, email, phone,
            business_category, business_description, gstin, pan_number, store_logo_url, store_banner_url,
            street_address, city, state, pincode, bank_account_name, bank_account_no, bank_ifsc, bank_name,
            commission_rate, status, rejection_reason, created_at
     FROM sellers WHERE id = $1`,
    [sellerId]
  );

  if (sellerRes.rows.length === 0) {
    throw new Error('Seller profile not found.');
  }

  const docsRes = await db.query(
    `SELECT doc_type, file_url, uploaded_at FROM seller_documents WHERE seller_id = $1`,
    [sellerId]
  );

  return {
    ...sellerRes.rows[0],
    documents: docsRes.rows
  };
}

/**
 * Update seller profile info (docs and fields)
 */
async function updateSellerProfile(sellerId, data) {
  const {
    businessName,
    storeName,
    ownerName,
    phone,
    businessCategory,
    businessDescription,
    gstin,
    panNumber,
    storeLogoUrl,
    storeBannerUrl,
    streetAddress,
    city,
    state,
    pincode,
    bankAccountName,
    bankAccountNo,
    bankIfsc,
    bankName,
    documents // Array of { doc_type, file_url } to insert/replace
  } = data;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const updateQuery = `
      UPDATE sellers SET
        business_name = COALESCE($2, business_name),
        store_name = COALESCE($3, store_name),
        owner_name = COALESCE($4, owner_name),
        phone = COALESCE($5, phone),
        business_category = COALESCE($6, business_category),
        business_description = COALESCE($7, business_description),
        gstin = COALESCE($8, gstin),
        pan_number = COALESCE($9, pan_number),
        store_logo_url = COALESCE($10, store_logo_url),
        store_banner_url = COALESCE($11, store_banner_url),
        street_address = COALESCE($12, street_address),
        city = COALESCE($13, city),
        state = COALESCE($14, state),
        pincode = COALESCE($15, pincode),
        bank_account_name = COALESCE($16, bank_account_name),
        bank_account_no = COALESCE($17, bank_account_no),
        bank_ifsc = COALESCE($18, bank_ifsc),
        bank_name = COALESCE($19, bank_name),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    const updateValues = [
      sellerId, businessName, storeName, ownerName, phone,
      businessCategory, businessDescription, gstin, panNumber, storeLogoUrl, storeBannerUrl,
      streetAddress, city, state, pincode, bankAccountName, bankAccountNo, bankIfsc, bankName
    ];
    await client.query(updateQuery, updateValues);

    if (documents && Array.isArray(documents)) {
      for (const doc of documents) {
        if (doc.file_url) {
          // Delete old doc of same type
          await client.query(
            `DELETE FROM seller_documents WHERE seller_id = $1 AND doc_type = $2`,
            [sellerId, doc.doc_type]
          );
          // Insert new doc
          await client.query(
            `INSERT INTO seller_documents (seller_id, doc_type, file_url) VALUES ($1, $2, $3)`,
            [sellerId, doc.doc_type, doc.file_url]
          );
        }
      }
    }

    await client.query('COMMIT');
    return await getSellerProfile(sellerId);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Update seller password
 */
async function updateSellerPassword(sellerId, currentPassword, newPassword) {
  const resSeller = await db.query('SELECT password_hash FROM sellers WHERE id = $1', [sellerId]);
  if (resSeller.rows.length === 0) {
    throw new Error('Seller not found.');
  }

  const isMatch = await bcrypt.compare(currentPassword, resSeller.rows[0].password_hash);
  if (!isMatch) {
    throw new Error('Current password is incorrect.');
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await db.query('UPDATE sellers SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newHash, sellerId]);
  return true;
}

module.exports = {
  registerSeller,
  authenticateSeller,
  getSellerProfile,
  updateSellerProfile,
  updateSellerPassword
};
