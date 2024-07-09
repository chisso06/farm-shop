import { React, useEffect, useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';
import { areaList, prefectureList } from '../data';
import { createCart, getIndexBase64Images, getShippingFees, imageSrc } from '../functions';

const OrderForm = () => {
	const [orderId, setOrderId] = useState('');
	const [sum, setSum] = useState(0);
	const [shippingMethods, setShippingMethods] = useState([]);
	const [shippingFee, setShippingFee] = useState(0);
	const [cart, setCart] = useState([{}]);
	const [customerData, setCustomerData] = useState({
		email: '',
		phone: '',
		name: '',
		zipCode: '',
		prefecture: '',
		address: '',
		memo: ''
	});
	const [base64Images, setBase64Images] = useState([]);
	const navigate = useNavigate();
	const showBoundary = useErrorBoundary();

	const handleChange = (e) => {
		setCustomerData({...customerData, [e.target.id]: e.target.value});
	};

	const handleAreaChange = async (e) => {
		var shippingFeeCalc = 0;

		setCustomerData({...customerData, 'prefecture': e.target.value});

		await Promise.all(shippingMethods.map(async (method) => {
			const shippingFeesData = await getShippingFees(method.method_id);
			for (let i = 0; i < shippingFeesData.length - 1 && (method.number < shippingFeesData[i].min_n || shippingFeesData[i].max_n < method.number); i ++) {
				const area = areaList.find((area) => area.prefectures.find((p) => p === e.target.value));
				shippingFeeCalc += shippingFeesData[i][area.method_name];
			}
		})).catch((err) => showBoundary(err));
		setShippingFee(shippingFeeCalc);
	};

	useEffect(() => {
		var order_id = localStorage.getItem('order_id');

		if (!order_id) {
			order_id = crypto.randomUUID().substring(0, 8).toUpperCase();
			localStorage.setItem('order_id', order_id);
		}
		setOrderId(order_id);
		createCart(setCart);
	}, []);

	useEffect(() => {
		if (cart.length && Object.keys(cart[0]).length) {
			var sum_calc = 0;
			const shippingMethodList = [];

			cart.map((item) => {
				const i = shippingMethodList.findIndex(
					({method_id}) => method_id === item.shipping_method);
				if (i < 0)
					shippingMethodList.push({method_id: item.shipping_method, number: item.number});
				else
					shippingMethodList[i].number += item.number;
				sum_calc += item.price * item.number;
				return item;
			})
			setSum(sum_calc);
			setShippingMethods(shippingMethodList);

			const getData = async () => {
				var base64ImagesData;
				try {
					base64ImagesData = await getIndexBase64Images(cart);
				} catch (err) {
					showBoundary(err);
				}
				setBase64Images(base64ImagesData);
			}
			getData();
		}
	}, [cart]);

	useEffect(() => {
		if (!cart.length)
			navigate('/cart');
	}, [cart.length, navigate]);

	return (
		<div className='mt-32 mb-10 sm:mt-40 sm:mb-20'>
			<div className='w-3/4 mx-auto sm:flex sm:gap-2'>
				<div className='w-full sm:w-2/5 mb-10'>
					<div className='p-2 border rounded'>
						<a href='/cart'>&lt; <span className='text-sm hover:underline'>買い物かごに戻る</span></a>
						<ul className='p-2 font-mono'>{
							(cart.length && Object.keys(cart[0]).length) ? cart.map((item, i) => {
								return (<li key={i} className='pr-2 py-4 flex border-b'>
									<img
										src={imageSrc(base64Images[item.base64Images_idx])}
										alt='商品画像'
										className='w-16 h-16 aspect-square object-cover rounded' />
									<div className='w-full pl-4 items-center'>
										<a
											href={'/products/' + item.product_id}
											className='h-full hover:underline'>
											{item.name}
										</a>
										<div className='h-full flex justify-end items-center'>
											<p className='h-full font-bold'>
												¥{item.price}
												<span className='text-stone-400 font-normal text-base'>/個</span>
												<span className='mx-1 h-full text-base font-normal items-center text-center'>
													×{item.number}
												</span>
											</p>
										</div>
									</div>
								</li>);
							}):''
						}</ul>
						<div className='mt-6 px-2 font-mono'>
							<div className='flex'>
								<p className='w-full'>小計</p>
								<p className='w-full text-right'>¥{sum}</p>
							</div>
							<div className='flex'>
								<p className='w-full'>送料</p>
								<p className='w-full text-right'>¥{shippingFee}</p>
							</div>
							<div className='mt-2 pt-2 flex border-stone-700 border-t'>
								<p className='w-full text-xl font-bold'>合計</p>
								<p className='w-full text-xl font-bold text-right'>¥{sum + shippingFee}</p>
							</div>
						</div>
					</div>
				</div>
				<form action='/backend/create-checkout-session' method='POST' className='w-full sm:order-first sm:w-3/5'>
					<p className='mb-6 text-xl sm:text-3xl'>
						注文フォーム
					</p>
					<div className='mt-4'>
						<label>メールアドレス<span className='text-amber-600'>*</span></label>
						<input onChange={handleChange} id='email' type='email' className='w-full p-2 border rounded invalid:border-amber-600' value={customerData.email} required />
					</div>
					<p className='mt-6 text-lg sm:text-2xl'>配達</p>
					<div className='mt-4'>
						<label>氏名<span className='text-amber-600'>*</span></label>
						<input onChange={handleChange} id='name' type='text' className='w-full p-2 border rounded invalid:border-amber-600' value={customerData.name} required />
					</div>
					<div className='mt-4 sm:flex gap-2'>
						<div className='w-full'>
							<label>郵便番号（半角数字7桁）<span className='text-amber-600'>*</span></label>
							<input onChange={handleChange} id='zipCode' type='text' pattern="\d{7}" className='w-full p-2 border rounded invalid:border-amber-600' value={customerData.zipCode} required />
						</div>
						<div className='w-full'>
							<label>都道府県<span className='text-amber-600'>*</span></label>
							<select
								onChange={handleAreaChange}
								id='prefecture'
								className='w-full h-10 bg-gray-50 border rounded invalid:border-amber-600'
								value={customerData.prefecture}
								required>
								<option value="">選択してください</option>
								{prefectureList.map((p, i) => {
									return <option key={i} value={p}>{p}</option>
								})}
							</select>
						</div>
					</div>
					<div className='mt-4'>
						<label>市区町村<span className='text-amber-600'>*</span></label>
						<input onChange={handleChange} id='address' type='text' className='w-full p-2 border rounded invalid:border-amber-600' value={customerData.address} required />
					</div>
					<div className='mt-4'>
						<label>電話番号（半角数字11桁）<span className='text-amber-600'>*</span></label>
						<input onChange={handleChange} id='phone' type='tel' pattern="\d{11}" className='w-full p-2 border rounded invalid:border-amber-600' value={customerData.phone} required />
					</div>
					<p className='mt-6 text-lg sm:text-2xl'>備考欄</p>
					<textarea onChange={handleChange} id='memo' className='mt-4 h-40 w-full p-2 border rounded' />
					<input type="hidden" name='order_id' value={orderId} />
					<input type="hidden" name='cart' value={JSON.stringify(cart)} />
					<input type="hidden" name='customer' value={JSON.stringify(customerData)} />
					<button
						type='submit'
						className='w-full mt-6 p-2 text-center text-white bg-amber-600 hover:bg-amber-500 rounded'>
						決済へすすむ
					</button>
				</form>
			</div>
		</div>
	);
};

export default OrderForm;
