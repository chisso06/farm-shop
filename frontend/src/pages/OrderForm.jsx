import { React, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from '../components';
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
	const [isVisible, setIsVisible] = useState(false);
	const navigate = useNavigate();

	const handleChange = (e) => {
		setCustomerData({...customerData, [e.target.id]: e.target.value});
	};

	const handleAreaChange = async (e) => {
		const areaList = [
			{method_name: 'Hokkaido', name: '北海道', prefectures: '北海道'},
			{method_name: 'Tohoku', name: '東北', prefectures: '青森県, 岩手県, 宮城県, 秋田県, 山形県, 福島県'},
			{method_name: 'Kanto', name: '関東', prefectures: '茨城県, 栃木県, 群馬県, 埼玉県, 千葉県, 東京都, 神奈川県, 山梨県'},
			{method_name: 'Sinetsu', name: '信越', prefectures: '新潟県, 長野県'},
			{method_name: 'Hokuriku', name: '北陸', prefectures: '富山県, 石川県, 福井県'},
			{method_name: 'Tokai', name: '東海', prefectures: '岐阜県, 静岡県, 愛知県, 三重県'},
			{method_name: 'Kinki', name: '近畿', prefectures: '滋賀県, 京都府, 大阪府, 兵庫県, 奈良県, 和歌山県'},
			{method_name: 'Chugoku', name: '中国', prefectures: '鳥取県, 島根県, 岡山県, 広島県, 山口県'},
			{method_name: 'Shikoku', name: '四国', prefectures: '徳島県, 香川県, 愛媛県, 高知県'},
			{method_name: 'Kyusyu', name: '九州', prefectures: '福岡県, 佐賀県, 長崎県, 熊本県, 大分県, 宮崎県, 鹿児島県'},
			{method_name: 'Okinawa', name: '沖縄', prefectures: '沖縄県'},
		];
		var shippingFeeCalc = 0;

		setCustomerData({...customerData, 'prefecture': e.target.value});

		await Promise.all(shippingMethods.map(async (method) => {
			const shippingFeesData = await getShippingFees(method.method_id);
			for (let i = 0; i < shippingFeesData.length - 1 && (method.number < shippingFeesData[i].min_n || shippingFeesData[i].max_n < method.number); i ++) {
				const area = areaList.find((area) => area.prefectures.find((p) => p === e.target.value));
				shippingFeeCalc += shippingFeesData[i][area.method_name];
			}
		}))
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
				const base64ImagesData = await getIndexBase64Images(cart);
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
			<Toast
				isVisible={isVisible}
				setIsVisible={setIsVisible}
				message={'在庫の上限を超えている商品があります。'} />
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
								<option value="北海道">北海道</option>
								<option value="青森県">青森県</option>
								<option value="岩手県">岩手県</option>
								<option value="宮城県">宮城県</option>
								<option value="秋田県">秋田県</option>
								<option value="山形県">山形県</option>
								<option value="福島県">福島県</option>
								<option value="茨城県">茨城県</option>
								<option value="栃木県">栃木県</option>
								<option value="群馬県">群馬県</option>
								<option value="埼玉県">埼玉県</option>
								<option value="千葉県">千葉県</option>
								<option value="東京都">東京都</option>
								<option value="神奈川県">神奈川県</option>
								<option value="新潟県">新潟県</option>
								<option value="富山県">富山県</option>
								<option value="石川県">石川県</option>
								<option value="福井県">福井県</option>
								<option value="山梨県">山梨県</option>
								<option value="長野県">長野県</option>
								<option value="岐阜県">岐阜県</option>
								<option value="静岡県">静岡県</option>
								<option value="愛知県">愛知県</option>
								<option value="三重県">三重県</option>
								<option value="滋賀県">滋賀県</option>
								<option value="京都府">京都府</option>
								<option value="大阪府">大阪府</option>
								<option value="兵庫県">兵庫県</option>
								<option value="奈良県">奈良県</option>
								<option value="和歌山県">和歌山県</option>
								<option value="鳥取県">鳥取県</option>
								<option value="島根県">島根県</option>
								<option value="岡山県">岡山県</option>
								<option value="広島県">広島県</option>
								<option value="山口県">山口県</option>
								<option value="徳島県">徳島県</option>
								<option value="香川県">香川県</option>
								<option value="愛媛県">愛媛県</option>
								<option value="高知県">高知県</option>
								<option value="福岡県">福岡県</option>
								<option value="佐賀県">佐賀県</option>
								<option value="長崎県">長崎県</option>
								<option value="熊本県">熊本県</option>
								<option value="大分県">大分県</option>
								<option value="宮崎県">宮崎県</option>
								<option value="鹿児島県">鹿児島県</option>
								<option value="沖縄県">沖縄県</option>
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
