import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { useOrderStore } from "../stores/useOrderStore";
import { Link, useNavigate } from "react-router-dom";
import { MoveRight } from "lucide-react";
import { useEffect } from "react";

const OrderSummary = () => {
    const { cart, total, subtotal, coupon } = useCartStore();
    const { createOrderAndPay, loadRazorpay, razorpayLoaded } = useOrderStore();
    const navigate = useNavigate();

	const formattedSubtotal = subtotal.toFixed(2);
    const formattedTotal = total.toFixed(2);

    useEffect(() => {
        loadRazorpay();
    }, [loadRazorpay]);

    return (
        <motion.div
            className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <p className="text-xl font-semibold text-emerald-400">Order summary</p>

            <div className="space-y-4">
                <div className="space-y-2">
                    <dl className="flex items-center justify-between gap-4">
                        <dt className="text-base font-normal text-gray-300">Original price</dt>
                        <dd className="text-base font-medium text-white">₹{formattedSubtotal}</dd>
                    </dl>

					{subtotal > total && (
						<dl className="flex items-center justify-between gap-4">
							<dt className="text-base font-normal text-gray-300">Savings</dt>
							<dd className="text-base font-medium text-emerald-400">-₹{(subtotal - total).toFixed(2)}</dd>
						</dl>
					)}

                    <dl className="flex items-center justify-between gap-4 border-t border-gray-600 pt-2">
                        <dt className="text-base font-bold text-white">Total</dt>
                        <dd className="text-base font-bold text-emerald-400">₹{formattedTotal}</dd>
                    </dl>
                </div>

                <motion.button
                    className={`flex w-full items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-4 ${
                        razorpayLoaded ? "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-300" : "bg-gray-500 cursor-not-allowed"
                    }`}
                    whileHover={razorpayLoaded ? { scale: 1.05 } : {}}
                    whileTap={razorpayLoaded ? { scale: 0.95 } : {}}
                    onClick={() => createOrderAndPay(cart, coupon, navigate)}
                    disabled={!razorpayLoaded}
                >
                    {razorpayLoaded ? "Proceed to Checkout" : "Loading Payment..."}
                </motion.button>

                <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-normal text-gray-400">or</span>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 underline hover:text-emerald-300 hover:no-underline"
                    >
                        Continue Shopping
                        <MoveRight size={16} />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default OrderSummary;
