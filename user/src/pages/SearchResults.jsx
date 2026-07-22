import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PRODUCTS } from '../data/mockData';
import ProductCard from '../components/common/ProductCard/ProductCard';
import EmptyState from '../components/common/EmptyState/EmptyState';
import Breadcrumb from '../components/common/Breadcrumb/Breadcrumb';
import styles from './SearchResults.module.css';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const matchedProducts = query.trim()
    ? PRODUCTS.filter(
        (prod) =>
          prod.name.toLowerCase().includes(query.toLowerCase()) ||
          prod.fabric.toLowerCase().includes(query.toLowerCase()) ||
          prod.color.toLowerCase().includes(query.toLowerCase())
      )
    : PRODUCTS;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <Breadcrumb
          items={[
            { label: 'Home', path: '/' },
            { label: 'Search Results' }
          ]}
        />

        <div className={styles.headerBlock}>
          <h1 className={styles.title}>
            {query ? `Search Results for "${query}"` : 'All Curations'}
          </h1>
          <span className={styles.countBadge}>
            {matchedProducts.length} Sarees Found
          </span>
        </div>

        {matchedProducts.length > 0 ? (
          <div className={styles.productGrid}>
            {matchedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            type="search"
            title={`No Sarees Found for "${query}"`}
            description="Try searching with terms like Kanchipuram, Silk, Organza, Banarasi, or Georgette."
            actionLabel="Explore All Sarees"
            actionPath="/shop"
          />
        )}
      </div>
    </div>
  );
}

export default SearchResults;
