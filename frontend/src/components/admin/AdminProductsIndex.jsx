import { React, useEffect, useState } from 'react';
import { getIndexBase64Images, getProducts, imageSrc } from '../../functions';

const AdminProductsIndex = ({setProductId}) => {
	const [products, setProducts] = useState([]);
	const [base64Images, setBase64Images] = useState([]);

	useEffect(() => {
		const getData = async () => {
			const productsData = await getProducts();
			const base64ImagesData = await getIndexBase64Images(productsData);
			setProducts(productsData);
			setBase64Images(base64ImagesData);
		}
		getData();
	}, []);

	return (
		<div>
			<div className='p-4 flex justify-end'>
				<button
					onClick={() => setProductId(0)}
					className='w-40 p-2 text-center text-white font-mono font-bold bg-amber-600 font-mono hover:bg-amber-500 rounded'>
					+商品を作成する
				</button>
			</div>
			<table className='w-full'>
				<thead>
					<tr className='border-b font-mono'>
						<th className='pl-4 py-2 text-left'>商品名</th>
						<th className='py-2'>カテゴリー</th>
						<th className='py-2'>価格</th>
						<th className='py-2'>在庫</th>
						<th className='py-2 pr-4'>公開状態</th>
					</tr>
				</thead>
				<tbody>
					{products ? products.map((p, i) => {return (
						<tr onClick={() => {setProductId(p.id)}} key={i} className='border-b  hover:cursor-pointer hover:bg-amber-100'>
							<td className='pl-4 py-1 flex items-center'>
								<img
									src={imageSrc(base64Images[p.base64Images_idx])}
									alt='商品画像'
									className='w-12 mr-4 aspect-square object-cover rounded' />
								{p.name.length <= 25 ? p.name : p.name.substring(0, 24) + '...'}
							</td>
							<td className='py-1 text-center'>{p.category}</td>
							<td className='py-1 text-center'>¥{p.price}</td>
							<td className='py-1 text-center'>{p.stock}</td>
							<td className='py-1 pr-4 text-center'>
								{p.public_status ? '公開': '非公開'}
							</td>
						</tr>
					)}):''}
				</tbody>
			</table>
		</div>
	)
}

export default AdminProductsIndex;