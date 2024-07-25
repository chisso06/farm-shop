import { React, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { adminPagesList } from '../data';

const AdminPage = () => {
	const location = useLocation();
	const [width, setWidth] = useState(960);

	const AdminMenu = () => {
		return (
			<div className=''>
				{ adminPagesList.map((p, i) => {
					var className = 'w-full p-4 block text-left border-b hover:bg-stone-300';
					if ('/admin' + p.pathname === location.pathname
						|| (location.pathname === '/admin' && p.pathname === '/orders'))
						className += ' bg-stone-300';
					return (
						<a
							href={'/admin' + p.pathname}
							key={i}
							className={className}>
							{p.title}
						</a>
					);
				})}
			</div>
		);
	};

	useEffect(() => {
		while (!sessionStorage.getItem('session')) {
			const password = window.prompt('パスワードを入力してください');
			if (password === process.env.REACT_APP_ADMIN_PASSWORD) {
				sessionStorage.setItem('session', true);
			}
		}
		const checkSize = () => {
			setWidth(window.innerWidth);
		}
		window.addEventListener('resize', checkSize);
		checkSize();
		return () => {
			window.removeEventListener('resize', checkSize);
		};
	}, []);

	useEffect(() => {
		if (width < 960) {
			window.alert('画面が小さすぎます。幅が960px以上のpcでアクセスしてください。');
		}
	}, [width]);

	return (
		<div>{
			(width >= 960 && sessionStorage.getItem('session')) ?
			<div className='mt-16 flex'>
				<div className='min-h-screen w-1/5 border-r bg-stone-100'>
					<p className='w-full px-4 py-8 text-left border-b bg-white font-bold font-mono text-lg'>管理画面</p>
					<AdminMenu />
				</div>
				<div className='min-h-screen w-4/5 mt-14'>
					<Outlet />
				</div>
			</div>
			:
			<div className='h-screen' />
		}</div>
	)
}

export default AdminPage;
