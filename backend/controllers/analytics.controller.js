import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";

// total user, products, sales, and amount
export const getAnalyticsData = async () => {
    try{
        const totalUser = await User.countDocuments();
        const totalProduct = await Product.countDocuments();

        const salesData = await Order.aggregate([
            {
                $group : {
                    _id: null,   // groups all the data together
                    totalSales: {$sum: 1},
                    totalRevenue: {$sum: "$totalAmount"}
                }
            }
        ])

        const {totalSales, totalRevenue} = salesData[0] || {totalSales:0 , totalRevenue:0};

        return {
            user: totalUser,
            products: totalProduct,
            totalSales,
            totalRevenue
        }
    } catch(err){
        console.error("Error in getting analytics data:",err);
        throw new Error(err.message);   
    }
}

// getting data for 7 day period for the graph
export const getDailySalesData = async (startDate, endDate) => {
    try {
        const dailySalesData = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Generate date array
        const dateArray = getDatesInRange(startDate, endDate);

        return dateArray.map(date => {
            const foundData = dailySalesData.find(item => item._id === date);

            return {
                date,
                sales: foundData ? foundData.sales : 0,
                revenue: foundData ? foundData.revenue : 0
            };
        });
    } catch (err) {
        console.error("Error in getting daily sales data:", err);
        throw new Error(err.message); 
    }
};


function getDatesInRange(startDate, endDate){
    const dates = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        dates.push( currentDate.toISOString().split("T")[0] );
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}