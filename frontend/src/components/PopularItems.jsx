import { React, useEffect, useState } from 'react';
import { getIndexBase64Images, getProducts, imageSrc } from '../functions';

const PopularItems = () => {
	const [products, setProducts] = useState([]);
	const [base64Images, setBase64Images] = useState([]);

	useEffect(() => {
		const getData = async () => {
			const productsData = await getProducts(true);
			const base64ImagesData = await getIndexBase64Images(productsData);
			setProducts(productsData);
			setBase64Images(base64ImagesData);
		}
		getData();
	}, []);

	return (
		<div className='my-20 w-3/4 mx-auto'>
			<p className='mb-20 text-center text-4xl text-black'>人気商品</p>
			<div className='grid md:grid-cols-3 gap-5' >
				{products.length ? products.map((p, i) => {
					return (
						<a href={'/products/' + p.id} className='bg-black hover:opacity-60' >
							<img src={imageSrc(base64Images[p.base64Images_idx])} alt='goods' className='aspect-video sm:aspect-square object-cover' />
						</a>
					)
				}):''}
			</div>
		</div>
	);
};

export default PopularItems;