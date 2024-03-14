import React, { useState, useEffect } from 'react';
import styles from '../styles/myOrders.module.css';


const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('jwt');

            if (!token) {
                console.error("No token found");
                setLoading(false);
                return;
            }

            try {
                //const response = await fetch(`${process.env.REACT_APP_ORDER_SERVICE_URL}/orders/myorders`, {
                const response = await fetch(`https://cna-order-service.azurewebsites.net/orders/myorders`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    setOrders(data);

                } else {
                    throw new Error('Failed to fetch orders');
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);



    if (loading) return <div>Loading orders...</div>;
    if (error) return <div>Error: {error}</div>;


    return (
            <div className={styles.myOrders}>
                <h2>My Orders</h2>
                {orders.length > 0 ? (
                    <table className={styles.ordersTable}>
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Quantity</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.flatMap(order => order.rows.map((row, rowIndex) => (
                                <tr key={`${order.id}-${rowIndex}`}>
                                    <td>{row.product}</td>
                                    <td>{row.quantity}</td>
                                    <td>{row.price.toFixed(2)}</td>
                                </tr>
                            )))}
                        </tbody>
                    </table>
                ) : <div className={styles.noOrders}>No orders found.</div>}
            </div>
    );
};

export default MyOrders;
