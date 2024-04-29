import { React, useEffect, useState } from 'react';
import { getShippingMethods } from '../../functions';

const AdminProductsIndex = ({setShippingId}) => {
	const [shippingMethods, setShippingMethods] = useState([]);

	useEffect(() => {
		const getData = async () => {
			const shippingMethodsData = await getShippingMethods();
			setShippingMethods(shippingMethodsData);
		}
		getData();
	}, []);

	return (
		<div>
			<div className='p-4 flex justify-end'>
				<button
					onClick={() => setShippingId(0)}
					className='w-40 p-2 text-center text-white font-mono font-bold bg-amber-600 font-mono hover:bg-amber-500 rounded'>
					+配送方法を追加
				</button>
			</div>
			<table className='w-full'>
				<thead>
					<tr className='border-b font-mono'>
						<th className='pl-4 py-2 text-left'>配送方法名</th>
					</tr>
				</thead>
				<tbody>
					{shippingMethods ? shippingMethods.map((shipping, i) => {return (
						<tr onClick={() => {setShippingId(shipping.id)}} key={i} className='border-b hover:cursor-pointer hover:bg-amber-100'>
							<td className='pl-4 py-1 text-left'>{shipping.name}</td>
						</tr>
					)}):''}
				</tbody>
			</table>
		</div>
	)
}

export default AdminProductsIndex;