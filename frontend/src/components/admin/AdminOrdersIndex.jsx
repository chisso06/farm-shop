import { React, useContext, useEffect, useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { getOrders } from '../../functions';
import { LoadingContext } from '../../functions/context/LoadingFunc';

const AdminOrdersIndex = ({setOrderId, orderStatusList}) => {
	const [orders, setOrders] = useState([]);
	const { showBoundary } = useErrorBoundary();
	const context = useContext(LoadingContext);

	const handleClick = (e, orderId) => {
		e.preventDefault();
		setOrderId(orderId);
	}

	useEffect(() => {
		console.log("[test]AdminOrdersIndex");
		const getData = async () => {
			var ordersData;
			try {
				// context.setLoading(true);
				ordersData = await getOrders();
				// context.setLoading(false);
			} catch (err) {
				showBoundary(err);
			}
			ordersData.map((o) => {
				const orderStatus = orderStatusList.find((orderStatus) =>
					orderStatus.name === o.status)
				return o.statusTitle = orderStatus.title;
			})
			setOrders(ordersData);
		};
		getData();
	}, []);

	return (
		<div>
			<p className='ml-4 pb-4 font-mono text-2xl font-bold'>注文管理</p>
			<table className='w-full'>
				<thead>
					<tr className='border-b font-mono'>
						<th className='pl-4 py-2 text-left'>注文ID</th>
						<th className='py-2 text-left'>注文日時</th>
						<th className='py-2 text-left'>顧客情報</th>
						<th className='py-2 text-left'>合計</th>
						<th className='py-2 text-left'>ステータス</th>
					</tr>
				</thead>
				<tbody>
					{orders.length ? orders.map((o, i) => {
						return(
							<tr
								onClick={(e) => handleClick(e, o.id)}
								key={i}
								className='border-b  hover:cursor-pointer hover:bg-amber-100'>
								<td className='pl-4 font-mono'>{o.id}</td>
								<td className='py-2'>{o.ordered_at}</td>
								<td className='py-2'>
									<p>{o.customer.name.length <= 20 ? o.customer.name : o.customer.name.substring(0, 20) + '...'}</p>
									<p>{o.customer.email.length <= 20 ? o.customer.email : o.customer.email.substring(0, 20) + '...'}</p>
								</td>
								<td className='py-2'>¥{o.total_amount}</td>
								<td className='py-2'>{o.statusTitle}</td>
							</tr>
						)
					}):''}
				</tbody>
			</table>
	</div>
	);
};

export default AdminOrdersIndex;