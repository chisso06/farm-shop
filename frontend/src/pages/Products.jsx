import { React, useEffect, useState } from 'react';
import { getIndexBase64Images, getProducts, imageSrc } from '../functions';
import { useErrorBoundary } from "react-error-boundary";

const Products = () => {
	const [products, setProducts] = useState([]);
	const [base64Images, setBase64Images] = useState([]);
	const { showBoundary } = useErrorBoundary();

	useEffect(() => {
		const getData = async () => {
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
		}
		getData();
	}, []);

	return (
		<div className='my-16'>
			<p className='py-20 sm:py-40 text-center text-2xl sm:text-4xl bg-amber-800 text-white'>商品一覧</p>
			<ul className='w-3/4 mx-auto my-20 grid sm:grid-cols-3 gap-4' >{
				products.length ? products.map((p, i) => {
					return (
						<li key={i} className='bg-stone-200 hover:opacity-60'>
							<a href={'/products/' + p.id} className='aspect-square' >
								<img
									src={imageSrc(base64Images[p.base64Images_idx])}
									alt='goods'
									className='aspect-video object-cover' />
								<p className='p-2 text-sm font-mono' >{p.name}</p>
							</a>
						</li>
					);
				}):''
			}</ul>
		</div>
	);
};

export default Products;
