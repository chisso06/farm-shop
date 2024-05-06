import { React, useState } from 'react';
import { AdminOrderDetails, AdminOrdersIndex } from '../../components';

const AdminOrders = () => {
	const [orderId, setOrderId] = useState('');
	const orderStatusList = [
		{
			name: 'pending-payment',
			title: '支払待ち'
		},
		{
			name: 'pending-shipping',
			title: '発送待ち'
		},
		{
			name: 'shipping',
			title: '発送済み'
		},
		{
			name: 'completed',
			title: '完了'
		},
		{
			name: 'pending',
			title: '保留'
		},
	];

	return (
		orderId ? 
		<AdminOrderDetails orderId={orderId} setOrderId={setOrderId} orderStatusList={orderStatusList} />
		:
		<AdminOrdersIndex setOrderId={setOrderId} orderStatusList={orderStatusList} />
	);
};

export default AdminOrders;
