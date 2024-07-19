import { React, useContext, useEffect, useState } from 'react';
import { useErrorBoundary } from "react-error-boundary";
import { ProductsIndex } from '../components';
import { categoryList } from '../data';
import { getIndexBase64Images, getProducts } from '../functions';
import { LoadingContext } from '../functions/context/LoadingFunc';

const Products = () => {
	const [products, setProducts] = useState([]);
	const [base64Images, setBase64Images] = useState([]);
	const [category, setCategory] = useState('');
	const { showBoundary } = useErrorBoundary();
	const loading_context = useContext(LoadingContext);

	const handleCategoryChange = (e) => {
		setCategory(e.target.value);
	};

	useEffect(() => {
		if (!localStorage.getItem('cart'))
			localStorage.setItem('cart', JSON.stringify([]));
		const getData = async () => {
			loading_context.setLoading(true);

			var productsData;
			var base64ImagesData;
			try {
				productsData = await getProducts(false, true);
			} catch (err) {
				showBoundary(err);
				return ;
			}
			try {
				base64ImagesData = await getIndexBase64Images({ table: 'products', objects: productsData });
			} catch (err) {
				showBoundary(err);
				return ;
			}
			setProducts(productsData);
			setBase64Images(base64ImagesData);
			loading_context.setLoading(false);
		}
		getData();
	}, []);

	return (
		<div className='my-16'>
			<p className='py-20 sm:py-40 text-center text-2xl sm:text-4xl bg-amber-800 text-white'>商品一覧</p>
			<div className='my-20 w-3/4 mx-auto'>
				<div className='mb-8 flex flex-row-reverse'>
					<select
						onChange={handleCategoryChange}
						name='category'
						className='p-2 w-60 h-10 border rounded invalid:border-amber-600'
						value={category}>
						<option value=''>すべてのカテゴリー</option>
						{categoryList.map((c, i) => {
							return <option key={i} value={c}>{c}</option>
						})}
					</select>
				</div>
				<ProductsIndex products={products} category={category} base64Images={base64Images} />
			</div>
		</div>
	);
};

export default Products;
