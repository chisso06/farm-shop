import { React, useState } from 'react';

const Header = ({pathname}) => {
	const [open, setOpen] = useState(false);
	const className = 'text-stone-400 hover:text-amber-600 rounded-md px-3 py-2 text-sm font-medium';

	const handleMenu = () => {
		if (open)
			setOpen(false);
		else
			setOpen(true);
	}

	return (
		<nav className='fixed top-0 left-0 right-0'>
		<div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
			<div className="relative flex h-16 items-center justify-between">
				<div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
					<button
						type="button"
						onClick={handleMenu}
						className="relative inline-flex items-center justify-center rounded-md p-2 text-stone-400"
						aria-controls="mobile-menu"
						aria-expanded="false"
					>
						<span className="absolute -inset-0.5"></span>
						<span className="sr-only">Open main menu</span>
						<svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
							<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
						</svg>
						<svg className="hidden h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
							<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				<div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
					<a href='/'>
					<div className="flex flex-shrink-0 items-center gap-2">
						<img className="h-8 w-auto" src="/logo.jpg" alt="ロゴ" />
						<p className='text-xl text-stone-900'>ひだまり農園</p>
					</div>
					</a>
					<div className="hidden sm:ml-6 sm:block">
						<div className="flex space-x-4">
							<a href="/" className={className}>HOME</a>
							<a href="/about" className={className}>ABOUT</a>
							{/* <a href="/blog" className={className}>BLOG</a> */}
							<a href="/products" className={className}>商品一覧</a>
							<a href="/cart" className={className}>カート</a>
							<a href="/faq" className={className}>よくあるご質問</a>
						</div>
					</div>
				</div>
			</div>
		</div>
			{open && 
				<div className="sm:hidden bg-white" id="mobile-menu">
					<div className="space-y-1 px-2 pb-3 pt-2">
						<a href="/" className={className + 'text-base block'}>HOME</a>
						<a href="/about" className={className + 'text-base block'}>ABOUT</a>
						{/* <a href="/blog" className={className + 'text-base block'}>BLOG</a> */}
						<a href="/products" className={className + 'text-base block'}>商品一覧</a>
						<a href="/cart" className={className + 'text-base block'}>カート</a>
						<a href="/faq" className={className + 'text-base block'}>よくあるご質問</a>
					</div>
				</div>
			}
		</nav>
	);
};

export default Header;