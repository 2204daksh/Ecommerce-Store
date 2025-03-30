import toast from "react-hot-toast";
import { create } from "zustand";
import axios from "../lib/axios";

export const useProductStore = create( ( set, get ) => ({
    products: [],
    loading: false,
    error: null,

    setProducts: (products) => set({products}),

    createProducts: async (productData) => {
        set({loading: true});

        try{
            const res = await axios.post("/products", productData);

            // adding the new product to existing products
            set((prev) => ({
                products: [...prev.products, res.data],
                loading: false
            }));

            toast.success("Product Created Successfully")
        }
        catch(err){
            toast.error("Error creating product:", err.message);
            set({loading: false});
        }
    },

    fetchAllProducts: async () => {
        set({loading: true});

        try{
            const res = await axios.get("/products");
            set({products: [...res.data.products], loading: false});
        }
        catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			toast.error(error.response.data.error || "Failed to fetch products");
		}
    },

    fetchProductsByCategory: async (category) => {
        set({loading: true});
        try{
            const res = await axios.get(`/products/category/${category}`);
            set({products: res.data.products, loading: false});
        }
        catch(err){
            toast.error("Error fetching products by category:", err.message);
            set({loading: false});
        }
    },

    deleteProduct: async (productId) => {
        set({loading: true});

        try{
            await axios.delete(`/products/${productId}`);
            set((prev) => ({
                products: prev.products.filter((product) => product._id !== productId),
                loading: false
            }))
        }
        catch(err){
            toast.error("Error toggling featured product:", err.message);
            set({loading: false});
        }
    },

    toggleFeaturedProduct: async (productId) => {
        set({loading: true});

        try{
            await axios.patch(`/products/${productId}`);
            set((prev) => ({
                products: prev.products.map((product) => 
                    product._id === productId? {...product, isFeatured:!product.isFeatured} : product
                ),
                loading: false
            }))
        }
        catch(err){
            toast.error("Error toggling featured product:", err.message);
            set({loading: false});
        }
    },

    fetchFeaturedProducts: async () => {
		set({ loading: true });
		try {
			const response = await axios.get("/products/featured");
			set({ products: response.data, loading: false });
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			console.log("Error fetching featured products:", error);
		}
	},
}))