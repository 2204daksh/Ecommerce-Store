import Product from "../models/product.model.js";

export const getCartProducts = async (req,res) => {
    try{
        const products = await Product.find( {_id : {$in : req.user.cartItems} });

        const cartItems = products.map( product => {
            const item = req.user.cartItems.find(cartItem => cartItem.id === product.id);
            return {...product.toJSON(), quantity: item.quantity };
        }) 

        res.json({cartItems});

    } catch(err){
        console.error("Error in getting cart products:",err);
        res.status(500).json({message: "Server Error", error: err.message});
    }
}

export const addToCart = async (req,res)=>{
    try{
        const {productId} = req.body;
        const user = req.user;

        // CHECK IF ITS WORKING
        const existingItem = user?.cartItems.find(item => item.id === productId);
        // const existingItem = user.cartItems.find(item => item.product.toString() === productId.toString());

        if(existingItem){
            existingItem.quantity =  existingItem.quantity+1;
        }
        else{
            user?.cartItems.push(productId);
        }

        await user.save();
        res.json(user?.cartItems);

    }  catch(err){
        console.error("Error in adding to cart:",err);
        res.status(500).json({message: "Server Error", error: err.message});
    }
}

export const removeAllFromCart = async (req,res) => {
    try{
        const {productId} = req.body;
        const user = req.user;

        if(!productId){
            user.cartItems = [];
        }
        else{
            user.cartItems = user.cartItems.filter ( item => item.id !== productId );
        }

        await user.save();
        res.json(user.cartItems);

    } catch(err){
        console.error("Error in removing all from cart:",err);
        res.status(500).json({message: "Server Error", error: err.message});
    }
}

// DIFFRENT FROM THE VIDEO CHECK ONCE
export const updateQuantity = async (req,res) => {
    try{
        const {id:productId} = req.params;
        const {quantity} = req.body;
        const user = req.user;

        // Validating quantity
        if (quantity === undefined || quantity < 0) {
            return res.status(400).json({ message: "Invalid quantity" });
        }

        const existingItem = user.cartItems.find(item => item.id === productId);

        if(!existingItem){
            return res.status(404).json({message: "Product not found in cart"});
        }

        existingItem.quantity = quantity;

        if(quantity === 0){
            user.cartItems = user.cartItems.filter( item => item.id !== productId);
        }

        await user.save();

        return res.json(user.cartItems);

    } catch(err){
        console.error("Error in updating quantity:",err);
        res.status(500).json({message: "Server Error", error: err.message});
    }

}

export const clearCart = async (req,res) => {
    try{
        const user = req.user;

        user.cartItems = [];
        await user.save();

        res.json(user.cartItems);
    } 
    catch(err){
        console.error("Error in clearing cart:",err);
        res.status(500).json({message: "Server Error", error: err.message});
    }
}