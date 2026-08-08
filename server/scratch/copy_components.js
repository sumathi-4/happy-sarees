const fs = require('fs');
const path = require('path');

const adminStylesDir = path.join(__dirname, '../../admin/src/styles');
const sellerStylesDir = path.join(__dirname, '../../seller/src/styles');

const tasks = [
  {
    from: 'ProductForm.module.css',
    to: 'ProductForm.module.css',
    append: ''
  },
  {
    from: 'ProductManagement.module.css',
    to: 'ProductList.module.css',
    append: `
/* ============================================================
   SELLER PORTAL COMPATIBILITY ALIASES
   ============================================================ */
.container {
  padding: 24px;
  position: relative;
  min-height: calc(100vh - 120px);
}
.filterCard {
  background: var(--bg-white);
  border-radius: var(--radius-premium);
  border: 1px solid rgba(43, 18, 32, 0.05);
  box-shadow: var(--shadow-premium);
  padding: 20px;
  margin-bottom: 24px;
}
.productImg {
  width: 40px;
  height: 48px;
  object-fit: cover;
  border-radius: var(--radius-small);
  border: 1px solid rgba(43, 18, 32, 0.06);
}
.actionsCell {
  display: flex;
  gap: 6px;
}
.editBtn {
  border: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--motion-premium);
  font-size: 14px;
  background-color: rgba(197, 160, 89, 0.15) !important;
  color: #B38628 !important;
}
.editBtn:hover {
  background-color: rgba(197, 160, 89, 0.28) !important;
  transform: translateY(-1px);
}
.deleteBtn {
  border: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--motion-premium);
  font-size: 14px;
  background-color: rgba(229, 57, 53, 0.1) !important;
  color: #e53935 !important;
}
.deleteBtn:hover {
  background-color: rgba(229, 57, 53, 0.22) !important;
  transform: translateY(-1px);
}
.badgePending {
  background-color: var(--warning-bg);
  color: var(--warning-color);
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-premium);
  border: 1px solid var(--gold-color);
}
.badgeApproved {
  background-color: var(--success-bg);
  color: var(--success-color);
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-premium);
  border: 1px solid var(--success-bg);
}
.badgeRejected {
  background-color: var(--error-bg);
  color: var(--error-color);
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-premium);
  border: 1px solid var(--error-bg);
}
`
  },
  {
    from: 'OrdersManagement.module.css',
    to: 'Orders.module.css',
    append: `
/* ============================================================
   SELLER PORTAL COMPATIBILITY ALIASES
   ============================================================ */
.container {
  padding: 24px;
  position: relative;
  min-height: calc(100vh - 120px);
}
.titleBlock {
  margin-bottom: 24px;
}
.subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
}
.tabsCard {
  background-color: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-premium);
  box-shadow: var(--shadow-premium);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 0 16px;
  margin-bottom: 24px;
}
.tabsList {
  display: flex;
  list-style: none;
  overflow-x: auto;
  scrollbar-width: none;
  flex: 1;
  padding: 0;
  margin: 0;
}
.tabsList::-webkit-scrollbar {
  display: none;
}
.tabBtn {
  padding: 16px 20px;
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: var(--transition-smooth);
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.tabBtnActive {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}
.countBadge {
  background-color: var(--bg-soft-pink-darker);
  color: var(--text-color);
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
}
.tabBtnActive .countBadge {
  background-color: var(--primary-color);
  color: #fff;
}
.ordersCard {
  background-color: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-premium);
  box-shadow: var(--shadow-premium);
  overflow: hidden;
  margin-bottom: 24px;
}
.orderNumLink {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--secondary-color);
  text-decoration: none;
  letter-spacing: 0.5px;
}
.orderNumLink:hover {
  text-decoration: underline;
}
.orderProductCell {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 320px;
}
.productImg {
  width: 38px;
  height: 48px;
  object-fit: cover;
  border-radius: var(--radius-small);
  border: 1px solid var(--border-color);
}
.qtyPrice {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}
.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: var(--radius-small);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.badgePending { color: var(--warning-color); background-color: var(--warning-bg); }
.badgeProcessing { color: var(--info-color); background-color: var(--info-bg); }
.badgeShipped { color: var(--success-color); background-color: var(--success-bg); }
.badgeDelivered { color: var(--success-color); background-color: var(--success-bg); }
.badgeCancelled { color: var(--error-color); background-color: var(--error-bg); }

/* Details Page styles */
.detailGrid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 28px;
}
.detailCard {
  background-color: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-premium);
  padding: 32px;
  box-shadow: var(--shadow-premium);
  margin-bottom: 24px;
}
.sectionTitle {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 20px;
  border-bottom: 1.5px solid var(--bg-soft-pink-darker);
  padding-bottom: 10px;
}
.infoRow {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 13px;
}
.infoVal {
  font-weight: 600;
  color: var(--text-color);
}
.addressBlock {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-muted);
}
.statusCard {
  background-color: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-premium);
  padding: 24px;
  box-shadow: var(--shadow-premium);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.statusSelect {
  padding: 10px;
  border-radius: var(--radius-input);
  font-size: 13px;
  width: 100%;
}
@media (max-width: 991px) {
  .detailGrid {
    grid-template-columns: 1fr;
  }
}
`
  },
  {
    from: 'AdminDashboard.module.css',
    to: 'Dashboard.module.css',
    append: `
/* ============================================================
   SELLER PORTAL COMPATIBILITY ALIASES
   ============================================================ */
.dashboardWrapper {
  padding: 24px;
  min-height: calc(100vh - 120px);
}
.welcomeSection {
  margin-bottom: 28px;
}
.kpiValueGold {
  color: var(--gold-color) !important;
}
.bestProductDetails {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
}
.bestProductDetails img {
  width: 60px;
  height: 76px;
  object-fit: cover;
  border-radius: var(--radius-small);
  border: 1px solid var(--border-color);
}
.productSales {
  display: flex;
  gap: 20px;
  margin-top: 12px;
}
.salesStat {
  display: flex;
  flex-direction: column;
}
.salesStatVal {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-color);
}
.payoutsCard {
  background: var(--bg-white);
  border-radius: var(--radius-premium);
  border: 1px solid rgba(43, 18, 32, 0.05);
  box-shadow: var(--shadow-premium);
  padding: 24px;
  margin-top: 24px;
}
`
  },
  {
    from: 'Components.module.css',
    to: 'Components.module.css',
    append: ''
  },
  {
    from: 'MasterDataManagement.module.css',
    to: 'MasterDataManagement.module.css',
    append: ''
  }
];

tasks.forEach(t => {
  const src = path.join(adminStylesDir, t.from);
  const dest = path.join(sellerStylesDir, t.to);
  if (fs.existsSync(src)) {
    let content = fs.readFileSync(src, 'utf8');
    if (t.append) {
      content += '\n' + t.append;
    }
    fs.writeFileSync(dest, content, 'utf8');
    console.log(`Successfully synced and updated: ${t.to}`);
  } else {
    console.error(`Source not found: ${src}`);
  }
});
