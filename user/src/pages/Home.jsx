import React from 'react';
import Hero from '../home/Hero/Hero';
import SignatureCollections from '../home/SignatureCollections/SignatureCollections';
import NewArrivals from '../home/NewArrivals/NewArrivals';
import ShopByPrice from '../home/ShopByPrice/ShopByPrice';
import BestSellers from '../home/BestSellers/BestSellers';
import ShopByFabric from '../home/ShopByFabric/ShopByFabric';
import WhyChooseUs from '../home/WhyChooseUs/WhyChooseUs';
import Testimonials from '../home/Testimonials/Testimonials';
import WatchAndBuy from '../home/WatchAndBuy/WatchAndBuy';
import Newsletter from '../home/Newsletter/Newsletter';

function Home() {
  return (
    <div>
      <Hero />
      <SignatureCollections />
      <NewArrivals />
      <ShopByPrice />
      <BestSellers />
      <ShopByFabric />
      <WhyChooseUs />
      <Testimonials />
      <WatchAndBuy />
      <Newsletter />
    </div>
  );
}

export default Home;
