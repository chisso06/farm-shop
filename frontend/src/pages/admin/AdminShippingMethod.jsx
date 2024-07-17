import { React, useContext, useEffect, useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { useParams } from 'react-router-dom';
import { areaList } from '../../data';
import {
	createShipping,
	deleteShippingMethod,
	getShippingFees,
	getShippingMethod,
	updateShipping
} from '../../functions';
import { LoadingContext } from '../../functions/context/LoadingFunc';

const AdminShippingMethod = () => {
	const params = useParams();
	const shippingId = Number(params.method_id);
	const shippingFee = {
		id: 0,
		method_id: shippingId,
		size: 'サイズ1',
		min_n: 1,
		max_n: 5,
		Hokkaido: '',
		Tohoku: '',
		Kanto: '',
		Sinetsu: '',
		Hokuriku: '',
		Tokai: '',
		Kinki: '',
		Chugoku: '',
		Shikoku: '',
		Kyusyu: '',
		Okinawa: '',
	};
	const [shippingMethod, setShippingMethod] = useState({
		id: 0,
		name: ''
	});
	const [shippingFees, setShippingFees] = useState([shippingFee]);
	const [shippingFeeIdx, setShippingFeeIdx] = useState(0);
	const { showBoundary } = useErrorBoundary();
	const context = useContext(LoadingContext);

	const handleMethodInputChange = (e) => {
		e.preventDefault();
		const name =  e.target.name;
		var value = e.target.value;

		setShippingMethod({...shippingMethod, [name]: value});
	};

	const handleSizeChange = (e) => {
		e.preventDefault();
		setShippingFeeIdx(Number(e.target.value));
	}

	const handleAddSizeClick = (e) => {
		e.preventDefault();
		const newFee = shippingFee;
		newFee.size = '新しいサイズ';
		newFee.min_n = shippingFees[shippingFees.length - 1].max_n + 1;
		newFee.max_n = newFee.min_n + 1;
		// areaList.map((area) => newFee[area.method_name]);
		setShippingFeeIdx(shippingFees.length);
		setShippingFees([...shippingFees, newFee]);
	}

	const handleDeleteSizeClick = (e) => {
		e.preventDefault();
		if (shippingFees.length === 1) {
			window.alert('サイズを全て削除することはできません');
			return ;
		}
		if (shippingFeeIdx < shippingFees.length - 1)
			shippingFees[shippingFeeIdx + 1].min_n = shippingFees[shippingFeeIdx].min_n;
		setShippingFees(shippingFees.filter((fee, i) => i !== shippingFeeIdx));
		setShippingFeeIdx(shippingFeeIdx ? shippingFeeIdx - 1 : 0);
	}

	const handleFeesInputChange = (e) => {
		e.preventDefault();
		const name = e.target.name;
		const value = (name === 'size') ? e.target.value : Number(e.target.value);
		const shippingFeesData = shippingFees.map((fee, i) => {
			if (i === shippingFeeIdx) {
				fee[name] = value;
				if (i !== shippingFees.length - 1 && name === 'max_n')
					shippingFees[i + 1].min_n = value + 1;
			}
			return fee;
		})
		setShippingFees(shippingFeesData);
	}

	const handleSubmit = async (e) => {
		e.preventDefault();
		context.setLoading(true);
		// validation
		const validate_shippingFees = () => {
			var message = '';
			shippingFees.map((fee, i) => {
				if (message.length)
					return ;
				// 入力が空白
				for (var key in fee) {
					if (key !== 'id' && key !== 'method_id') {
						if (fee[key] === '')
							message = '全てのサイズの全ての項目を入力してください';
						else if (key !== 'size' && isNaN(fee[key]))
							message = '全てのサイズの個数の条件および送料は半角数字で入力する必要があります';
					}
				}
				if (message.length)
					return ;
				// 条件
				if (!fee.min_n || !fee.max_n)
					message = '全てのサイズの個数の条件を入力してください';
				else if (!i && fee.min_n !== 1)
					message = '一番下のサイズの個数の条件の最小値は1に設定してください';
				else if (fee.min_n > fee.max_n)
					message = 'サイズの個数の条件の最大値が最小値と同値以上になるように設定してください';
				else if (i !== shippingFees.length - 1 && fee.max_n + 1 !== shippingFees[i + 1].min_n)
					message = '上のサイズの個数の条件の最小値が下のサイズの個数の条件の最大値よりも1大きい値になるように設定してください';
				// サイズ名が重複していないか
				for (var fee_i = i + 1; fee_i < shippingFees.length; fee_i ++) {
					if (fee.size === shippingFees[fee_i].size) {
						message = 'サイズ名が重複しています';
						break ;
					}
				}
			});
			return (message);
		}
		const validation_msg = validate_shippingFees();
		if (validation_msg) {
			window.alert(validation_msg);
			context.setLoading(false);
			return ;
		}

		var res;
		if (shippingId) {
			try {
				res = await updateShipping({ method: shippingMethod, fees: shippingFees });
			} catch (err) {
				showBoundary(err);
			}
			window.alert('配送方法を更新しました');
		} else {
			try {
				res = await createShipping({ method: shippingMethod, fees: shippingFees });
			} catch (err) {
				showBoundary(err);
			}
			window.alert('配送方法を追加しました');
			window.location.href = `/admin/admin-shipping-methods/${res.method.id}`;
		}
		context.setLoading(false);
	};

	const handleDelete = async (e) => {
		e.preventDefault();
		context.setLoading(true);

		if (window.confirm('この配送方法を削除しますか？\n※この配送方法が設定されている商品の配送方法は「なし」に設定されます')) {
			try {
				await deleteShippingMethod(shippingId);
			} catch (err) {
				showBoundary(err);
			}
			window.alert('配送方法を削除しました');
			window.location.href = '/admin/admin-shipping-methods';
		}

		context.setLoading(false);
	};

	useEffect(() => {
		const getData = async () => {
			context.setLoading(true);

			var shippingMethodData;
			var shippingFeesData;
			try {
				shippingMethodData = await getShippingMethod(shippingId);
			} catch (err) {
				showBoundary(err);
			}
			if (!shippingMethodData) {
				context.setLoading(false);
				window.location.href = '/admin/admin-shipping-methods';
				return ;
			}
			try {
				shippingFeesData = await getShippingFees(shippingId);
			} catch (err) {
				showBoundary(err);
			}
			setShippingMethod(shippingMethodData);
			setShippingFees(shippingFeesData);

			context.setLoading(false);
		}
		if (shippingId)
			getData();
	}, []);

	return (
		<div className='px-4'>
			<a href='/admin/admin-shipping-methods'>
				&lt; <span className='text-sm hover:underline'>配送方法一覧に戻る</span>
			</a>

			<form onSubmit={handleSubmit}>
				<p className='my-6 font-mono text-xl font-bold'>配送方法追加・編集</p>
				<div className='mt-4'>
					<label>
						配送方法名
						<span className='text-amber-600'>*</span>
						<span className='text-xs text-stone-400'>（最大10文字）</span>
					</label>
					<input
						onChange={handleMethodInputChange}
						name='name'
						type='text'
						maxLength={10}
						className='w-full p-2 border rounded invalid:border-amber-600'
						value={shippingMethod.name}
						required />
				</div>
				<div className='mt-8'>
					<div>
						<label className='font-mono text-lg font-bold'>サイズ</label>
					</div>
					<div className='mt-4 h-10 flex'>
						<select
							onChange={handleSizeChange}
							className='p-2 w-1/2 h-full border rounded invalid:border-amber-600'
							value={shippingFeeIdx}>
							{shippingFees.map((fee, i) => {
								return <option key={i} value={i}>{fee.size}</option>
							})}
						</select>
						{shippingFees[shippingFeeIdx] ? 
							<div className='flex items-center h-full'>
								<button onClick={handleAddSizeClick} className='ml-2 px-2 h-full text-sm border rounded hover:bg-stone-200'>
									サイズを追加
								</button>
								<button onClick={handleDeleteSizeClick} className='ml-2 px-2 h-full text-sm border rounded hover:border-amber-600 hover:bg-amber-600 hover:border-opacity-5 hover:bg-opacity-50'>
									このサイズを削除
								</button>
							</div>
						:''}
					</div>
				</div>
				{shippingFees[shippingFeeIdx] ? 
					<div>
						<div className='mt-4 w-1/2 flex items-center'>
							<label className='w-32'>サイズ名<span className='text-amber-600'>*</span>：</label>
							<input
								onChange={handleFeesInputChange}
								name='size'
								type='text'
								className='p-2 w-full border rounded invalid:border-amber-600'
								value={shippingFees[shippingFeeIdx].size}
								required />
						</div>
						<div className='mt-4 w-1/2 flex items-center'>
							<label className='w-32'>条件<span className='text-amber-600'>*</span>：</label>
							<div className='w-full'>
								<input
									onChange={handleFeesInputChange}
									name='min_n'
									type='number'
									className='p-2 mr-2 w-20 border rounded invalid:border-amber-600 disabled'
									value={shippingFees[shippingFeeIdx].min_n}
									disabled />
								個 〜
								<input
									onChange={handleFeesInputChange}
									name='max_n'
									type='number'
									min={shippingFees[shippingFeeIdx].min_n}
									className='p-2 mx-2 w-20 border rounded invalid:border-amber-600'
									value={shippingFees[shippingFeeIdx].max_n}
									required />
								個
							</div>
						</div>
						<div className='mt-4 p-4 bg-stone-100 rounded'>
							{areaList.map((area, i) => { return (
								<div key={i} className='my-2 flex items-center'>
									<div className='mr-2 w-3/4 font-mono'>
										<label>{area.name}<span className='font-serif text-sm text-amber-600'>*</span></label>
										<p className='text-xs text-stone-600'>{area.prefectures.join(',')}</p>
									</div>
									<input
										onChange={handleFeesInputChange}
										name={area.method_name}
										type='number'
										min={0}
										className='p-2 w-1/4 border rounded invalid:border-amber-600'
										value={shippingFees[shippingFeeIdx][area.method_name]}
										required />
								</div>
							)})}
						</div>
					</div>
				: ''}
				<div className='px-40 my-16 justify-center'>
					<button
						type='submit'
						className='w-full mb-6 p-2 text-center text-white bg-amber-600 hover:bg-amber-500 rounded'>
						保存
					</button>
					{shippingId ?
						<button
							onClick={handleDelete}
							className='w-full p-2 text-center text-white bg-stone-300 hover:bg-stone-400 rounded'>
							この配送方法を削除する
						</button>
					:''}
				</div>
			</form>
		</div>
	);
}

export default AdminShippingMethod;