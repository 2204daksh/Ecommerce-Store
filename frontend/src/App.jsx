import { Navigate, Route, Routes } from "react-router-dom"
import SignUpPage from "./pages/SignUpPage"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"

import Navbar from "./component/Navbar"
import { Toaster } from "react-hot-toast"
import { useUserStore } from "./stores/useUserStore"
import { useEffect } from "react"
import AdminPage from "./pages/AdminPage"
import LoadingSpinner from "./component/LoadingSpinner"
import CategoryPage from "./pages/CategoryPage"
import CartPage from "./pages/CartPage"
import { useCartStore } from "./stores/useCartStore"
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage"
import PurchaseFailedPage from "./pages/PurchaseFailedPage"

function App() {

  const {user, checkAuth, checkingAuth} = useUserStore();
  // so that when ever refresh or open the site it checks for the user
  useEffect(() => {
    checkAuth();
  },[checkAuth])

  const {getCartItems} = useCartStore();
  // so that cart items are loaded as soon as user logs in
  useEffect(() => {
    if(!user)  return ;
    getCartItems();
  }, [getCartItems, user] )

  // If authentication is still being checked, show a loading screen
  if (checkingAuth) {
    return (
      <LoadingSpinner/>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">   
      {/* Background gradient */}
			<div className='absolute inset-0 overflow-hidden'>
				<div className='absolute inset-0'>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full"
          style={{
            background: "radial-gradient(ellipse at top, rgba(16, 185, 129, 0.3) 0%, rgba(10, 80, 60, 0.2) 45%, rgba(0, 0, 0, 0.1) 100%)"
          }}
        />
				</div>
			</div>

      <div className="relative z-50 pt-20">
        <Navbar/>
        <Routes>
          <Route path="/" element={<HomePage/>}/>
          <Route path="/signup" element={!user ? <SignUpPage/> : <Navigate to="/"/>}/>
          <Route path="/login" element={!user ? <LoginPage/> : <Navigate to="/"/>}/>
          <Route path="/secret-dashboard" element={user?.role === 'admin' ? <AdminPage/> : <Navigate to="/login"/>}/>
          <Route path="/category/:category" element={<CategoryPage/>}/>
          <Route path="/cart" element={ user ? <CartPage/> : <Navigate to="/login"/> }/>
          <Route path="/purchase-success" element={ user ? <PurchaseSuccessPage/> : <Navigate to="/login"/> }/>
          <Route path="/purchase-failed" element={ user ? <PurchaseFailedPage/> : <Navigate to="/login"/> }/>

        </Routes>
      </div>

      <Toaster/>
    </div>
  )
}

export default App
