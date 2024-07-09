import { React, useContext, useEffect, useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { areaList } from '../../data';
import {
	createShipping,
	deleteShippingMethod,
	getShippingFees,
	getShippingMethod,
	updateShipping
} from '../../functions';
import { AdminToastContext } from '../../functions/context/ToastFunc';

const AdminProductForm = ({shippingId, setShippingId}) => {
	const [shippingMethod, setShippingMethod] = useState({});
	const [shippingFees, setShippingFees] = useState([]);
	const [shippingFeeIdx, setShippingFeeIdx] = useState(0);
	const context = useContext(AdminToastContext);
	const { showBoundary } = useErrorBoundary();

	const handleMethodInputChange = (e) => {
		const name =  e.target.name;
		var value = e.target.value;

		setShippingMethod({...shippingMethod, [name]: value});
	};

	const handleSizeChange = (e) => {
		setShippingFeeIdx(Number(e.target.value));
	}

	const handleAddSizeClick = () => {
		const newFee = {
			id: 0,
			method_id: shippingId,
			size: '新しいサイズ',
			min_n: 0,
			max_n: 0,
		}
		areaList.map((area) => newFee[area.method_name]);
		setShippingFeeIdx(shippingFees.length);
		setShippingFees([...shippingFees, newFee]);
	}

	const handleDeleteSizeClick = () => {
		if (shippingFees.length === 1) {
			window.alert('サイズを全て削除することはできません');
			return ;
		}
		setShippingFees(shippingFees.filter((fee, i) => i !== shippingFeeIdx));
		setShippingFeeIdx(shippingFeeIdx ? shippingFeeIdx - 1 : 0);
	}

	const handleFeesInputChange = (e) => {
		const name = e.target.name;
		const value = (name === 'size') ? e.target.value : Number(e.target.value);

		const shippingFeesData = shippingFees.map((fee, i) => {
			if (i === shippingFeeIdx) {
				if ((name === 'min_n' && i
							&& value <= shippingFees[shippingFeeIdx - 1].max_n)
						|| (name === 'max_n' && i < shippingFees.length - 1
							&& value >= shippingFees[shippingFeeIdx + 1].min_n)) {
					window.alert('下のサイズの最大値が上のサイズの最小値よりも小さくなるように設定してください');
				} else {
					fee[name] = value;
				}
			}
			return fee;
		})
		setShippingFees(shippingFeesData);
	}

	const handleSubmit = async (e) => {
		var res;
		e.preventDefault();
		if (shippingId) {
			try {
				res = await updateShipping({ method: shippingMethod, fees: shippingFees });
			} catch (err) {
				showBoundary(err);
			}
			if (res.status === 'success') {
				context.setMessage('配送方法を更新しました');
			}
		} else {
			try {
				res = await createShipping({ method: shippingMethod, fees: shippingFees })
			} catch (err) {
				showBoundary(err);
			}
			if (res.status === 'success') {
				setShippingId(res.method.id);
				context.setMessage('配送方法を追加しました');
			}
		}
	};

	const handleDelete = async () => {
		if (window.confirm('この配送方法を削除しますか？\n※この配送方法が設定されている商品の配送方法は「なし」に設定されます')) {
			try {
				await deleteShippingMethod(shippingId);
			} catch (err) {
				showBoundary(err);
			}
			context.setMessage('配送方法を削除しました');
			setShippingId(-1);
		}
	};

	useEffect(() => {
		const newShippingMethod = {
			id: 0,
			name: ''
		};
		const newShippingFees = [];
		for (let i = 0; i < 3; i ++) {
			const newShippingFee = {
				'method_id': shippingId,
				'size': 'サイズ' + (i + 1),
				'min_n': '',
				'max_n': '',
				'Hokkaido': '',
				'Tohoku': '',
				'Kanto': '',
				'Sinetsu': '',
				'Hokuriku': '',
				'Tokai': '',
				'Kinki': '',
				'Chugoku': '',
				'Shikoku': '',
				'Kyusyu': '',
				'Okinawa': '',
			};
			newShippingFees.push(newShippingFee);
		}
		const getData = async () => {
			var shippingMethodData;
			var shippingFeesData;
			try {
				shippingMethodData = shippingId ? await getShippingMethod(shippingId) : newShippingMethod;
			} catch (err) {
				showBoundary(err);
			}
			try {
				shippingFeesData = shippingId ? await getShippingFees(shippingId) : newShippingFees;
			} catch (err) {
				showBoundary(err);
			}
			setShippingMethod(shippingMethodData);
			setShippingFees(shippingFeesData);
		}
		getData();
	}, [shippingId]);

	return (
		<div className='px-4'>
			<button onClick={() => setShippingId(-1)}>
				&lt; <span className='text-sm hover:underline'>配送方法一覧に戻る</span>
			</button>

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
								<button onClick={handleAddSizeClick} className='ml-2 px-2 h-full text-sm border rounded hover:bg-stone-200'>サイズを追加</button>
								<button onClick={handleDeleteSizeClick} className='ml-2 px-2 h-full text-sm border rounded hover:border-amber-600 hover:bg-amber-600 hover:border-opacity-5 hover:bg-opacity-50'>このサイズを削除</button>
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
									min={shippingFeeIdx ? shippingFees[shippingFeeIdx - 1].max_n + 1 : 1}
									className='p-2 mr-2 w-20 border rounded invalid:border-amber-600'
									value={shippingFees[shippingFeeIdx].min_n}
									required />
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
										<p className='text-xs text-stone-600'>{area.prefectures}</p>
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
							type='button'
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

export default AdminProductForm;