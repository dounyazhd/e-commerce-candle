import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from './components/Authentication/SignUp';
import SignIn from './components/Authentication/SignIn';
import Home from './components/Home/Home';

import Shop from './components/Shop/Shop';
import Details from './components/Shop/Details';

import AboutUs from './components/AboutUs/AboutUs';
import Faqs from './components/FAQs/FAQs';
import Contact from './components/Contact/Contact';

import Cart from './components/Cart/Cart';
import CheckOut from './components/Cart/CheckOut';
import OrderCompleted from './components/Cart/OrderCompleted';

import Wishlist from './components/Wishlist/Wishlist';

import PerformanceOverview from './components/Profile/ProfileAdmin/PerformanceOverview';
import OrderManagement from './components/Profile/ProfileAdmin/OrderManagement';
import ProductManagement from './components/Profile/ProfileAdmin/ProductManagement';
import Marketing from './components/Profile/ProfileAdmin/Marketing';
import Customers from './components/Profile/ProfileAdmin/Customers';
import AccountSettings from './components/Profile/ProfileAdmin/AccountSettings';

import PersonalInformation from "./components/Profile/ProfileUser/PersonalInformation";
import OrderTracking from './components/Profile/ProfileUser/OrderTracking';
import Coupons from './components/Profile/ProfileUser/Coupons';


const App = () => {
  return (
    <Router>
        <Routes>
            <Route path="/sign_up" element={<SignUp />} />
            <Route path="/sign_in" element={<SignIn />} />
            <Route path="/" element={<Home />} />

            <Route path="/shop" element={<Shop />} />
            <Route path="/details/:productId" element={<Details />} />

            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/faqs" element={<Faqs />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/cart" element={<Cart />} />
            <Route path="/check_out" element={<CheckOut />} />
            <Route path="/order_completed" element={<OrderCompleted />} />

            <Route path="/wishlist" element={<Wishlist />} />

            <Route path="/admin/performance_overview" element={<PerformanceOverview />} />
            <Route path="/admin/order_management" element={<OrderManagement />} />
            <Route path="/admin/product_management" element={<ProductManagement />} />
            <Route path="/admin/marketing_and_promotion" element={<Marketing />} />
            <Route path="/admin/customers" element={<Customers />} />
            <Route path="/admin/account_settings" element={<AccountSettings />} />

            <Route path="/profile/personal_information" element={<PersonalInformation />} />
            <Route path="/profile/order_tracking" element={<OrderTracking />} />
            <Route path="/profile/coupons" element={<Coupons />} />

        </Routes>
    </Router>
  );
};

export default App;


