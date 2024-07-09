import { React, useEffect, useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { getShippingMethods } from '../../functions';

const AdminProductsIndex = ({setShippingId}) => {
	const [shippingMethods, setShippingMethods] = useState([]);
	const { showBoundary } = useErrorBoundary();

	useEffect(() => {
		const getData = async () => {
			var shippingMethodsData;
			try {
				shippingMethodsData = await getShippingMethods();
			} catch (err) {
				showBoundary(err);
			}
			setShippingMethods(shippingMethodsData);
		}
		getData();
	}, []);

	return (
		<div>
			<div className='px-4 pb-4 flex'>
				<p className='w-1/2 font-mono text-2xl font-bold'>送料管理</p>
				<div className='w-1/2 flex justify-end'>
					<button
						onClick={() => setShippingId(0)}
						className='w-40 p-2 text-center text-white font-mono font-bold bg-amber-600 font-mono hover:bg-amber-500 rounded'>
						+配送方法を追加
					</button>
				</div>
			</div>
			<table className='w-full'>
				<thead>
					<tr className='border-b font-mono'>
						<th className='pl-4 py-2 text-left'>配送方法名</th>
					</tr>
				</thead>
				<tbody>
					{shippingMethods ? shippingMethods.map((shipping, i) => {
						return shipping.id ? 
							<tr onClick={() => {setShippingId(shipping.id)}} key={i} className='border-b hover:cursor-pointer hover:bg-amber-100'>
								<td className='pl-4 py-1 text-left'>{shipping.name}</td>
							</tr>
							:''
					}):''}
				</tbody>
			</table>
		</div>
	)
};

export default AdminProductsIndex;