import { React } from 'react';
import { aboutContentsList } from '../data';

const AboutContents = () => {
	return (
		<div className='bg-stone-100'>{
			aboutContentsList.length ? aboutContentsList.map((content, i) => {
				return (
					<div key={i} className='sm:h-80 sm:grid sm:grid-cols-2'>
						{(Boolean)(!(i % 2) || window.matchMedia('(max-width: 640px)').matches) ?
							<img
							alt='aboutImage'
							className='h-60 sm:h-80 w-full object-cover'
							src={content.image} />
						: ''}
						<div className='p-10'>
							<p className='mb-10 text-center text-xl'>{content.title}</p>
							<p>{content.text}</p>
						</div>
						{(Boolean)((i % 2) && !window.matchMedia('(max-width: 640px)').matches) ?
							<img
							alt='aboutImage'
							className='h-60 sm:h-80 w-full object-cover'
							src={content.image} />
						: ''}
					</div>
				)
			}):''
		}</div>
	);
}

const About = () => {
	return (
		<div className='my-16 sm:mb-40'>
			<p className='py-20 sm:py-40 text-center text-2xl sm:text-4xl bg-lime-800 text-white'>ひだまり農園について</p>
			<AboutContents />
			<p className='my-10 sm:mt-20 text-center text-2xl sm:text-4xl text-black'>アクセス</p>
			<div className='w-3/4 sm:h-80 mx-auto sm:grid sm:grid-cols-2'>
				<div className='p-4 bg-stone-200'>
					<div className='mb-4 flex items-center'>
						<img src='logo.jpg' alt='ロゴ' className='h-14' />
						<p className='ml-4 text-xl text-stone-900'>ひだまり農園</p>
					</div>
					<div className='p-3 sm:flex items-center border-b border-black'>
						<p className='w-28 font-bold' >会社名</p>
						<p>ひだまり株式会社</p>
					</div>
					<div className='p-3 sm:flex items-center border-b border-black'>
						<p className='w-28 font-bold' >住所</p>
						<p>〒630-8215<br />奈良県奈良市 東向中町29</p>
					</div>
					<div className='p-3 sm:flex items-center border-b border-black'>
						<p className='w-28 font-bold' >電話番号</p>
						<p>090-1234-5678</p>
					</div>
					<div className='p-3 sm:flex items-center'>
						<p className='w-28 font-bold' >生産物</p>
						<p>米、野菜、米粉菓子</p>
					</div>
				</div>
				<iframe
					src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13123.318618293442!2d135.8275275!3d34.6842485!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60013a29d1dd2621%3A0x540d42181874f344!2z6L-R6YmE5aWI6Imv6aeF!5e0!3m2!1sja!2sjp!4v1698193943218!5m2!1sja!2sjp"
					className='w-full aspect-square sm:h-full bg-stone-300'
					allowfullscreen=""
					loading="lazy"
					referrerpolicy="no-referrer-when-downgrade"
					title='map'
				></iframe>
			</div>
		</div>
	);
};

export default About;