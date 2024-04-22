import axios from 'axios';
import { React, useEffect, useState } from 'react';

const AdminProducts = () => {
	const [productId, setProductId] = useState(0);
	const [product, setProduct] = useState({});
	const [products, setProducts] = useState([]);
	const [shippingMethods, setShippingMethods] = useState([]);
	const categoryList = [
		'フィナンシェ', 'ケーキ', 'その他'
	];
	const newProduct = {
		id: -1,
		name: '',
		description: '',
		price: 0,
		stock: 0,
		category: '',
		shipping_method: 0,
		public_status: 0,
		popular_status: 0
	}

	const handleClick = async (p) => {
		if (p.id) {
			setProductId(p.id);
			setProduct(p);
			console.log(p);
			await axios.get('/backend/shipping')
				.then((res) => {setShippingMethods(res.data)})
		} else {
			setProductId(0);
			setProduct({});
		}
	};

	const handleChange = (e) => {
		const name = e.target.name === 'public_status_checkbox' ? 'public_status' : e.target.name;
		var value = e.target.value;

		if (e.target.type === 'checkbox') {
			value = Number(e.target.checked);
		}
		setProduct({
			...product,
			[name]: value
		});
		console.log(product.public_status);
	};

	useEffect(() => {
		const getProducts = async () => {
			await axios.get('/backend/products')
			.then((res) => {
				console.log(res.data);
				setProducts(res.data);
			});
		}
		getProducts();
	}, []);

	return (
		productId && product && shippingMethods.length ? 
		<div className='p-4'>
			<button onClick={() => handleClick({})}>
				&lt; <span className='text-sm hover:underline'>商品一覧に戻る</span>
			</button>
			<form action={'/backend/products/' + productId} method='POST'>
				<p className='my-6 font-mono text-xl font-bold'>商品追加・編集</p>
				<div className='mt-4'>
					<label>商品名<span className='text-amber-600'>*</span></label>
					<input
						onChange={handleChange}
						name='name'
						type='text'
						className='w-full p-2 border rounded invalid:border-amber-600'
						value={product.name}
						required />
				</div>
				<div className='mt-4'>
					<label>商品写真<span className='text-amber-600'>*</span></label>
					<div className='h-60 bg-stone-100 rounded'></div>
				</div>
				<div className='mt-4'>
					<label>商品説明<span className='text-amber-600'>*</span></label>
					<textarea
						onChange={handleChange}
						name='description'
						className='w-full h-96 p-2 border rounded invalid:border-amber-600'
						value={product.description}
						required />
				</div>
				<div className='mt-4 flex items-center'>
					<label className='mr-2 w-1/2'>価格<span className='text-amber-600'>*</span></label>
					<input
						onChange={handleChange}
						name='price'
						type='number'
						min={1}
						className='p-2 w-1/2 border rounded invalid:border-amber-600'
						value={product.price}
						required />
				</div>
				<div className='mt-4 flex items-center'>
					<label className='mr-2 w-1/2'>在庫<span className='text-amber-600'>*</span></label>
					<input
						onChange={handleChange}
						name='stock'
						type='number'
						min={0}
						className='p-2 w-1/2 border rounded invalid:border-amber-600'
						value={product.stock}
						required />
				</div>
				<div className='mt-4 flex items-center'>
					<label className='mr-2 w-1/2'>カテゴリー<span className='text-amber-600'>*</span></label>
					<select
						onChange={handleChange}
						name='category'
						className='p-2 w-1/2 h-10 border rounded invalid:border-amber-600'
						value={product.category ? product.category : ''}
						required>
						<option value=''>選択してください</option>
						{ categoryList.map((c, i) => {
							return <option key={i} value={c}>{c}</option>
						})}
					</select>
				</div>
				<div className='mt-4 flex items-center'>
					<label className='mr-2 w-1/2'>配送方法<span className='text-amber-600'>*</span></label>
					<select
						onChange={handleChange}
						name='shipping_method'
						className='p-2 w-1/2 h-10 border rounded invalid:border-amber-600'
						value={product.shipping_method ? product.shipping_method : ''}
						required>
						<option value=''>選択してください</option>
						{ shippingMethods.map((s, i) => {
							return <option key={i} value={s.id}>{s.name}</option>
						})}
					</select>
				</div>
				<div className='mt-4 flex items-center'>
					<label className='mr-2 w-1/2'>公開（優先度）</label>
					<input
						onChange={handleChange}
						name='public_status_checkbox'
						type='checkbox'
						value={Number(product.public_status)}
						className='w-4 h-4 mr-2 checked:bg-amber-600'
						checked={product.public_status} />
					<input
						onChange={handleChange}
						name='public_status'
						type='number'
						min={1}
						className='p-2 border rounded disabled:text-stone-300 invalid:border-amber-600'
						value={product.public_status ? product.public_status : ''}
						disabled={!product.public_status}
						required />
				</div>
				<div className='mt-4 flex items-center'>
					<label className='mr-2 w-1/2'>人気商品</label>
					<input
						onChange={handleChange}
						name='popular_status'
						type='checkbox'
						value={Number(product.popular_status)}
						className='w-4 h-4 text-amber-600 bg-stone-100 border-stone-300 rounded focus:ring-amber-500 focus:ring-2 before:text-amber-200'
						checked={product.popular_status} />
				</div>
				<div className='flex justify-center'>
					<button
						type='submit'
						className='w-3/5 my-12 p-2 text-center text-white bg-amber-600 hover:bg-amber-500 rounded'>
						保存
					</button>
				</div>
			</form>
		</div>
		:
		<div>
			<div className='p-4 flex justify-end'>
				<button
					onClick={() => handleClick(newProduct)}
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
					{products.map((p, i) => {return (
						<tr onClick={() => handleClick(p)} key={i} className='border-b  hover:cursor-pointer hover:bg-amber-100'>
							<td className='pl-4 py-1 flex items-center'>
								<img
									src={'/products/' + Number(p.image_id) + '.jpg'}
									alt='商品画像'
									className='w-12 mr-4 aspect-square object-cover rounded' />
								{p.name}
							</td>
							<td className='py-1 text-center'>{p.category}</td>
							<td className='py-1 text-center'>¥{p.price}</td>
							<td className='py-1 text-center'>{p.stock}</td>
							<td className='py-1 pr-4 text-center'>
								{p.public_status ? '公開': '非公開'}
							</td>
						</tr>
					)})}
				</tbody>
			</table>
		</div>
	)
}

export default AdminProducts;
