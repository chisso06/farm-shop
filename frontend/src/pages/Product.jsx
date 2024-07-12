import { React, useContext, useEffect, useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../components';
import { areaList } from '../data';
import { getBase64Images, getProduct, getProductImages, getShippingFees, getShippingMethod, imageSrc } from '../functions';
import { LoadingContext } from '../functions/context/LoadingFunc';
import { ToastContext } from '../functions/context/ToastFunc';

const ProductImagesCarousel = ({images, base64Images}) => {
	const [imageIdx, setImageIdx] = useState(0);

	return (
		(images && images[imageIdx]) ? (
			<div className='relative z-0'>
				<img
					src={imageSrc(base64Images[images[imageIdx].base64Images_idx])}
					alt='商品画像'
					className='aspect-[3/2] object-contain bg-stone-200' />
				{imageIdx ? 
					<button onClick={() => setImageIdx(imageIdx - 1)} className="absolute w-10 h-10 top-1/2 left-4 -translate-y-1/2 bg-white rounded-full opacity-50 hover:opacity-80" data-carousel-prev>
						<Icon icon="circle-chevron-left" className="opacity-50 hover:opacity-80" />
					</button>
				: ''}
				{imageIdx < images.length - 1 ? 
					<button onClick={() => setImageIdx(imageIdx + 1)} className="absolute w-10 h-10 top-1/2 right-4 -translate-y-1/2 bg-white rounded-full opacity-50 hover:opacity-80" data-carousel-prev>
						<Icon icon="circle-chevron-right" className="opacity-50 hover:opacity-80" />
					</button>
				: ''}
			</div>
		) : ''
	)
}

const Product = () => {
	const params = useParams();
	const productId = Number(params.product_id);
	const navigate = useNavigate();
	const [product, setProduct] = useState({});
	const [images, setImages] = useState([]);
	const [base64Images, setBase64Images] = useState([]);
	const [shippingMethod, setShippingMethod] = useState({});
	const [shippingFees, setShippingFees] = useState([]);
	const [item, setItem] = useState({
		product_id: productId,
		number: 0,
	});
	const { showBoundary } = useErrorBoundary();
	const toast_context = useContext(ToastContext);
	const loading_context = useContext(LoadingContext);

	const handleChange = (e) => {
		e.preventDefault();
		const {name, value} = e.target;
		setItem({...item, [name]: Number(value) });
		if (Number(value) > 0) {
			document.getElementById("button").removeAttribute("disabled");
			document.getElementById("button").className = 'w-full p-2 mt-6 text-white bg-amber-600 hover:bg-amber-500 rounded';
		} else if (document.getElementById("button").disabled === false) {
			document.getElementById("button").setAttribute("disabled", true);
			document.getElementById("button").className = 'w-full p-2 mt-6 text-white bg-stone-400 rounded';
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		const cart = JSON.parse(localStorage.getItem('cart'));
		const i = cart.findIndex(({product_id}) => product_id === item.product_id);

		if ((i < 0 && product.stock < item.number)
			|| (i >= 0 && product.stock < cart[i].number + item.number))
			window.alert('在庫数を超えています。');
		else {
			if (i < 0)
				cart.push(item);
			else
				cart[i].number += item.number;
			localStorage.setItem('cart', JSON.stringify(cart));
			toast_context.setMessage('商品を買い物かごに追加しました');
		}
	};

	useEffect(() => {
		document.getElementById("button").setAttribute("disabled", true);
		if (!localStorage.getItem('cart'))
			localStorage.setItem('cart', JSON.stringify([]));

		const getData = async () => {
			loading_context.setLoading(true);

			var productData;
			try {
				productData = await getProduct(productId);
			} catch (err) {
				showBoundary(err);
			}
			if (productData) {
				var imagesData;
				var base64ImagesData;
				try {
					imagesData = await getProductImages(productId);
				} catch (err) {
					showBoundary(err);
				}
				try {
					base64ImagesData = await getBase64Images(imagesData);
				} catch (err) {
					showBoundary(err);
				}
				setProduct(productData);
				setImages(imagesData);
				setBase64Images(base64ImagesData);
			} else {
				toast_context.setMessage('商品が存在しません');
				navigate('/products');
			}

			if (productData.shipping_method) {
				var shippingMethodData;
				var shippingFeesData;
				try {
					shippingMethodData = await getShippingMethod(productData.shipping_method);
				} catch (err) {
					showBoundary(err);
				}
				try {
					shippingFeesData = await getShippingFees(productData.shipping_method);
				} catch (err) {
					showBoundary(err);
				}
				setShippingMethod(shippingMethodData);
				setShippingFees(shippingFeesData);
			}
			loading_context.setLoading(false);
		}
		getData();
	}, [productId]);

	const ShippingModal = () => {
		if (shippingFees.length) {
			return (
				<dialog id="modal" className="modal modal-bottom sm:modal-middle p-4 rounded-md">
					<div className="modal-box">
						<form method="dialog">
							<button className="btn btn-sm btn-ghost absolute right-4 top-4">✕</button>
						</form>
						<h3 className="font-bold text-lg">送料・配送方法について</h3>
						<p className="py-4">{shippingMethod.name}</p>
						<table className='text-sm'>
							<thead>
								<tr className='bg-stone-100 border'>
									<th>地域</th>
									{ shippingFees.map((m, i) => {
										return (<th key={i} className='px-2 text-center'>{m.size}</th>);
									})}
								</tr>
							</thead>
							<tbody>
								{areaList.map((area, i) => {return (
									<tr key={i} className='border'>
										<td>
											<p>{area.name}</p>
											<p className='text-xs'>{area.prefectures.join(',')}</p>
										</td>
										{ shippingFees.map((m, i) => {
											return (<td key={i} className='px-2 text-center'>¥{m[area.method_name]}</td>);
										})}
									</tr>
								)})}
							</tbody>
						</table>
					</div>
				</dialog>
			);
		} else {
			return <div />;
		}
	}

	return (
		<div className='w-3/4 my-16 mx-auto'>
			{product.shipping_method ? <ShippingModal /> : ''}
			<p className='mt-32 mb-10 sm:mt-40 sm:mb-20 text-center text-xl sm:text-4xl'>
				{product.name}
			</p>
			<div className='sm:flex gap-4'>
				<div className='sm:w-2/3'>
					<ProductImagesCarousel images={images} base64Images={base64Images} />
					<div className='my-10'>
						<p className='mb-4 text-2xl font-bold font-mono'>商品について</p>
						<p className='whitespace-pre-line'>{product.description}</p>
					</div>
				</div>
				<div className='sm:w-1/3'>
					<div className='p-4 font-mono border rounded'>
						<p>通常価格（税込）</p>
						<p className='text-3xl text-amber-600 font-bold'>¥{product.price}</p>
						{product.shipping_method ? 
							<button
								onClick={()=>document.getElementById('modal').showModal()}
								className="btn text-stone-500 text-sm">
								ⓘ<span className='hover:underline'>送料について</span>
							</button>
							:
							<p className='text-stone-500 text-sm'>送料なし</p>
						}
						<p className='text-sm'>在庫：{product.stock}</p>
						<div className='pt-10 flex items-center'>
							<p className='pr-4'>数量</p>
							<input
								name='number'
								onChange={handleChange}
								type='number'
								min='0'
								max={product.stock}
								className='w-20 p-2 border rounded' />
						</div>
						<button
							onClick={handleSubmit}
							id='button'
							className='w-full p-2 mt-6 text-white bg-stone-400 rounded'>
							カートに入れる
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Product;
