import { React, useContext, useEffect, useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { getIndexBase64Images, getProducts, imageSrc } from '../functions';
import { LoadingContext } from '../functions/context/LoadingFunc';

const PopularItems = () => {
	const [products, setProducts] = useState([]);
	const [base64Images, setBase64Images] = useState([]);
	const { showBoundary } = useErrorBoundary();
	const context = useContext(LoadingContext);

	useEffect(() => {
		const getData = async () => {
			context.setLoading(true);

			var productsData;
			var base64ImagesData;
			try {
				productsData = await getProducts(true, true);
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