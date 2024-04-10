import axios from 'axios';
import { React, useEffect, useState } from 'react';

const Products = () => {
	const [products, setProducts] = useState([]);

	useEffect(() => {
		const getProducts = async () => {
			await axios.get('/backend/products?col=id,name')
			.then((res) => {
				console.log(res.data);
				setProducts(res.data);
			})
		}
		getProducts();
	}, []);

	return (
		<div className='my-16'>
			<p className='py-20 sm:py-40 text-center text-2xl sm:text-4xl bg-amber-800 text-white'>商品一覧</p>
			<ul className='w-3/4 mx-auto my-20 grid sm:grid-cols-3 gap-4' >{
				products.map((p, i) => {
					return (
						<li key={i} className='bg-stone-200 hover:opacity-60'>
							<a href={'/products/' + p.id} className='aspect-square' >
								<img src='/images/sample_product.jpg' alt='goods' className='aspect-video object-cover' />
								<p className='p-2 text-sm font-mono' >{p.name}</p>
							</a>
						</li>
					);
				})
			}</ul>
		</div>
	);
};

export default Products;
