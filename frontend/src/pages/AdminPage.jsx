import { React, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminOrders from './admin/AdminOrders';
import AdminProducts from './admin/AdminProducts';

const AdminPage = () => {
	const [width, setWidth] = useState(960);
	const [adminPage, setAdminPage] = useState('');
	const adminPages = [
		{
			name: 'admin-orders',
			title: '注文管理'
		},
		{
			name: 'admin-products',
			title: '商品管理'
		},
		{
			name: 'admin-shipping',
			title: '送料管理'
		},
		{
			name: 'admin-blog',
			title: 'ブログ管理'
		},
		{
			name: 'admin-news',
			title: 'お知らせ管理'
		},
	];
	const navigate = useNavigate();

	const handleClick = (name) => {
		setAdminPage(name);
	}

	const AdminMenu = () => {
		return (
			<div className=''>{
				adminPages.map((p, i) => {
					var className = 'w-full p-4 text-left border-b hover:bg-stone-300';
					if (p.name === adminPage)
						className += ' bg-stone-300';
					return (
						<button
							onClick={() => handleClick(p.name)}
							key={i}
							className={className}>
							{p.title}
						</button>
					);
				})
			}</div>
		);
	};

	const AdminContent = () => {
		switch(adminPage) {
			case 'admin-orders': 
				return <AdminOrders />
			case 'admin-products': 
				return <AdminProducts />;
			case 'admin-shipping': 
				return (<div>

				</div>);
			case 'admin-blog': 
				return (<div>

				</div>);
			case 'admin-news': 
				return (<div>

				</div>);
			default: 
				return <AdminOrders />;
		}
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
		} else if (!adminPage) {
			setAdminPage('admin-orders');
		}
	}, [width]);

	return (
		<div className='mt-16'> {
			width >= 960 && sessionStorage.getItem('session') ?
			<div className='flex'>
				<div className='min-h-screen w-1/4 border-r bg-stone-100'>
					<p className='w-full px-4 py-8 text-left border-b bg-white font-bold'>管理画面</p>
					<AdminMenu />
				</div>
				<div className='h-full w-3/4'>
					<AdminContent />
				</div>
			</div>
			:
			<div />
		}
		</div>
	)
}

export default AdminPage;
