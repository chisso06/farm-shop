import { React, useContext, useEffect, useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { getIndexBase64Images, getProducts } from '../functions';
import { LoadingContext } from '../functions/context/LoadingFunc';
import ProductsIndex from './ProductsIndex';

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
				base64ImagesData = await getIndexBase64Images({ table: 'products', objects: productsData });
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
			<ProductsIndex products={products} base64Images={base64Images} />
		</div>
	);
};

export default PopularItems;