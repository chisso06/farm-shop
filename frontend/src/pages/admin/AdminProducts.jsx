import { React, useContext, useEffect, useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';
import { getIndexBase64Images, getProducts, imageSrc } from '../../functions';
import { LoadingContext } from '../../functions/context/LoadingFunc';

const AdminProducts = () => {
	const [products, setProducts] = useState([]);
	const [base64Images, setBase64Images] = useState([]);
	const { showBoundary } = useErrorBoundary();
	const context = useContext(LoadingContext);
	const navigate = useNavigate();

	const handleClick = (e, product_id) => {
		e.preventDefault();
		navigate(`/admin/admin-products/${product_id}`);
	}

	useEffect(() => {
		const getData = async () => {
			context.setLoading(true);

			var productsData;
			var base64ImagesData;

			try {
				productsData = await getProducts();
			} catch (err) {
				showBoundary(err);
			}
			try {
				base64ImagesData = await getIndexBase64Images(productsData);
			} catch (err) {
				showBoundary(err);
			}
			setProducts(productsData);
			setBase64Images(base64ImagesData);
			context.setLoading(false);
		}
		getData();
	}, []);

	return (
		<div>
			<div className='px-4 pb-4 flex items-center'>
				<p className='w-1/2 font-mono text-2xl font-bold'>商品管理</p>
				<div className='w-1/2 flex justify-end'>
					<a
						href='/admin/admin-products/0'
						className='w-40 p-2 text-center text-white font-mono font-bold bg-amber-600 font-mono hover:bg-amber-500 rounded'>
						+商品を作成する
					</a>
				</div>
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
						<tr
							onClick={(e) => handleClick(e, p.id)}
							key={i}
							className='border-b  hover:cursor-pointer hover:bg-amber-100'>
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

export default AdminProducts;