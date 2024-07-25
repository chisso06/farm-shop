import { React, useContext, useEffect, useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components';
import { createCart, getIndexBase64Images, imageSrc } from '../functions';
import { LoadingContext } from '../functions/context/LoadingFunc';

const Cart = () => {
  const [sum, setSum] = useState(0);
  const [cart, setCart] = useState([]);
  const [base64Images, setBase64Images] = useState([]);
	const { showBoundary } = useErrorBoundary();
	const context = useContext(LoadingContext);
	const navigate = useNavigate();

	const handleChange = (e, item_i) => {
		e.preventDefault();

		var value = Number(e.target.value);
		var cartListData = cart;
		const cartStorage = JSON.parse(localStorage.getItem('cart'));

		if (!cartStorage) {
			navigate('/cart');
			return ;
		}

		if (cart[item_i].subscription && value > 1) {
			window.alert('定期便の購入は1度につき1つまでです');
			value = 1;
		}
		if (value) {
			for (var i = 0; i < cart.length; i ++) {
				if ((cart[item_i].subscription || cart[i].subscription) && cart[i].number && cart[i].product_id !== cart[item_i].product_id) {
					window.alert('定期便の商品と他の商品を同時に購入することはできません');
					value = 0;
					break ;
				}
			}
		}

		cartListData[item_i].number = value;
		cartStorage[item_i].number = value;

		setCart([...cartListData]);
		localStorage.setItem('cart', JSON.stringify(cartStorage));
	}

	const handleTrash = (e, i) => {
		e.preventDefault();
		const cartListData = cart;
		const cartStorage = JSON.parse(localStorage.getItem('cart'));
		cartListData.splice(i, 1);
		cartStorage.splice(i, 1);
		setCart([...cartListData]);
		localStorage.setItem('cart', JSON.stringify(cartStorage));
	}

	const handleSubmit = () => {
		for (var i = 0; i < cart.length; i ++) {
			if (cart[i].subscription && (cart[i].number > 1 || i !== 0)) {
				window.alert('定期便の購入は1度につき1つまでです。\nまた、他の商品との同時購入はできません。');
				return ;
			}
		}
		navigate('/order-form');
	}

	useEffect(() => {
		const getData = async () => {
			context.setLoading(true);

			var cartListData;
			try {
				cartListData = await createCart(setCart);
			} catch (err) {
				showBoundary(err);
				return ;
			}
			if (!cartListData) {
				context.setLoading(false);
				return ;
			}

			var base64ImagesData;
			try {
				base64ImagesData = await getIndexBase64Images({ table: 'products', objects: cartListData });
			} catch (err) {
				showBoundary(err);
				return ;
			}
			setBase64Images(base64ImagesData);

			context.setLoading(false);
		}
		getData();
	}, []);

	useEffect(() => {
		var calcSum = 0;
		cart.map((item) => {
			calcSum += item.price * item.number;
		});
		setSum(calcSum);
	}, [cart]);

	return (
		<div className='w-3/4 my-16 mx-auto'>
			<p className='mt-32 mb-10 sm:mt-40 sm:mb-20 text-center text-xl sm:text-4xl'>
				カートに入っている商品
			</p>
			{ cart.length ?
				<div className='mx-auto'>
					{ cart.length ? cart.map((item, i) => {
						return (
							<div key={i} className='pr-2 py-4 flex border-b items-center'>
								<img
									src={imageSrc(base64Images[item.base64Images_idx])}
									alt='商品画像'
									className='w-16 sm:w-32 aspect-square object-cover' />
								<div className='w-full sm:flex pl-4 font-mono items-center'>
									<a
										href={'/products/' + item.product_id}
										className='h-full sm:w-3/5 hover:underline'>
										{item.name}
									</a>
									<div className='h-full sm:w-2/5 flex justify-end items-center'>
										<p className='h-full text-xl font-bold'>
											¥{item.price}
										</p>
										<p className='text-stone-400 font-normal text-base'>/</p>
										<p className='text-stone-400 font-normal text-base'>個</p>
										<p className='mx-1 h-full text-base font-normal items-center text-center'>×</p>
										<input
											value={item.number}
											min={0}
											max={item.stock}
											type='number'
											onChange={(e) => {handleChange(e, i)}}
											className='w-16 mx-2 p-2 border rounded invalid:text-amber-700 invalid:border-amber-600' />
										<button onClick={(e) => handleTrash(e, i)}>
											<Icon icon="trash" className='w-4 opacity-20 hover:opacity-40' />
										</button>
									</div>
								</div>
							</div>
						);
					}):''}
					<div className='w-60 mx-auto my-10'>
						<p className='mt-10 text-center text-2xl sm:text-3xl font-mono font-bold'>
							小計：{sum}円
						</p>
						<p className='pt-4 mb-8 text-center text-sm text-stone-600'>※送料は購入手続き時に計算されます</p>
						<button
							onClick={handleSubmit}
							className='w-60 p-2 inline-block text-center text-white bg-amber-600 hover:bg-amber-500 rounded'>
							お支払いにすすむ
						</button>
					</div>
				</div>
				: <p className='my-48 text-center'>現在、カートに入っている商品はありません。</p>
			}
		</div>
	);
};

export default Cart;
