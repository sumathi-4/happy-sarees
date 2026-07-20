import React, { useState } from 'react';
import { FiPackage, FiSearch, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import styles from './OrdersTab.module.css';

function OrdersTab({ orders = [] }) {
  const [filter, setFilter] = useState('All');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const filteredOrders = orders.filter((ord) => {
    if (filter === 'All') return true;
    return ord.status.toLowerCase() === filter.toLowerCase();
  });

  const toggleExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  return (
    <div className={styles.tabWrapper}>
      <div className={styles.headerRow}>
        <h2 className={styles.tabTitle}>My Orders</h2>
        <span className={styles.subCount}>{orders.length} Total Orders</span>
      </div>

      {/* Filter Pills */}
      <div className={styles.filterBar}>
        {['All', 'Processing', 'Shipped', 'Delivered'].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`${styles.filterBtn} ${filter === st ? styles.activeFilter : ''}`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className={styles.ordersList}>
        {filteredOrders.map((order) => {
          const isExpanded = expandedOrderId === order.id;

          return (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.cardHeader} onClick={() => toggleExpand(order.id)}>
                <div className={styles.headerLeft}>
                  <FiPackage className={styles.pkgIcon} />
                  <div>
                    <h4 className={styles.orderId}>Order #{order.id}</h4>
                    <span className={styles.orderDate}>Placed on {order.date}</span>
                  </div>
                </div>

                <div className={styles.headerRight}>
                  <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                    {order.status}
                  </span>
                  <strong className={styles.totalPrice}>₹{order.totalPrice.toLocaleString()}</strong>
                  <button className={styles.expandBtn}>
                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className={styles.itemsPreview}>
                {order.items.map((item) => (
                  <div key={item.id} className={styles.itemRow}>
                    <img src={item.image} alt={item.name} className={styles.itemThumb} />
                    <div className={styles.itemInfo}>
                      <h5 className={styles.itemName}>{item.name}</h5>
                      <span className={styles.itemMeta}>Fabric: {item.fabric} | Qty: {item.quantity}</span>
                    </div>
                    <span className={styles.itemPrice}>₹{item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Expanded Detailed Accordion */}
              {isExpanded && (
                <div className={styles.expandedPanel}>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailBox}>
                      <h6>Shipping Address</h6>
                      <p>123, Anna Nagar 2nd Street, Bodinayakanur, Theni - 625513, Tamil Nadu</p>
                    </div>
                    <div className={styles.detailBox}>
                      <h6>Payment Method</h6>
                      <p>UPI / Google Pay (Verified)</p>
                    </div>
                    <div className={styles.detailBox}>
                      <h6>Tracking</h6>
                      <p>Courier: BlueDart | AWB: 8492048920</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrdersTab;
