import { React, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
	const [width, setWidth] = useState(960);
	const [settingItem, setSettingItem] = useState('');
	const settingItems = [
		'注文管理',
		'商品管理',
		'送料管理',
		'ブログ管理',
		'お知らせ管理'
	];
	const navigate = useNavigate();

	const handleClick = (item) => {
		setSettingItem(item);
	}

	const AdminMenu = () => {
		return (
			<div className=''>{
				settingItems.map((item, i) => {
					var className = 'w-full p-4 text-left border-b hover:bg-stone-300';
					if (item === settingItem)
						className += ' bg-stone-300';
					return (
						<button
							name={item}
							onClick={() => handleClick(item)}
							key={i}
							className={className}>
							{item}
						</button>
					);
				})
			}</div>
		);
	};

	useEffect(() => {
		console.log('sessionStorage: ', sessionStorage.getItem('session'));
		console.log('REACT_APP_ADMIN_PASSWORD: ', process.env.REACT_APP_ADMIN_PASSWORD);
		while (!sessionStorage.getItem('session')) {
			const password = window.prompt('パスワードを入力してください');
			console.log('password: ', password);
			if (password === process.env.REACT_APP_ADMIN_PASSWORD) {
				console.log('access: success');
				sessionStorage.setItem('session', true);
			}
		}
		const	checkSize = () => {
			setWidth(window.innerWidth);
		}
		window.addEventListener('resize', checkSize);
		checkSize();
		return () => window.removeEventListener('resize',	checkSize);
	}, [navigate]);

	useEffect(() => {
		if (width < 960) {
			window.confirm('画面が小さすぎます。幅が960px以上のpcでアクセスしてください。');
		} else {
			setSettingItem('注文管理');
		}
	}, [width]);

	return (
		<div className='mt-16'> {
			width >= 960 && sessionStorage.getItem('session') ?
			<div className='flex border-t'>
				<div className='min-h-screen w-1/4 border-r bg-stone-100'>
					<p className='w-full px-4 py-8 text-left border-b bg-white font-bold'>管理画面</p>
					<AdminMenu />
				</div>
				<div className='h-full w-3/4'></div>
			</div>
			:
			<div />
		}
		</div>
	)
}

export default AdminPage;
